/* ════════════════════════════════════════════════════════════════════
 *  Wedding Band Builder — iframe Demo
 *
 *  Demonstrates the postMessage bridge between a host page and a
 *  WBB viewer iframe. The default points to the repository's own
 *  mini-viewer template; the URL field can target any compatible hosted
 *  viewer that exposes the same Wedding Band postMessage API.
 *
 *  fileId is the unique ID of the published Wedding Band project. Find it in
 *  Drive through Share and copy the value between /files/ and /view.
 *  The embedded mini-viewer still loads the published project from the shared
 *  Drive instance, without depending on the Drive application's page shell.
 *
 *  https://docs.ijewel3d.com/viewer/tutorial-embed-drive.html#find-the-model-id
 *  https://docs.ijewel3d.com/wedding-band-builder/integration-iframe.html
 *
 *  Wire protocol (see ijewel3d-docs/wedding-band-builder/integration-iframe.md):
 *
 *    Command   host   → iframe   { id, method, args }
 *    Reply     iframe → host     { id, result }       success
 *                                { id, error: {…} }   failure
 *    Event     iframe → host     { event, data }      no id
 * ════════════════════════════════════════════════════════════════════ */


/* ══════════════════════════════════════════════════════════════════
 *  CONFIG
 * ══════════════════════════════════════════════════════════════════ */

const DEFAULT_VIEWER_URL = new URL(
  '../wedding-band-default.html?hideWbbUi=true&showUiButtons=true&isAutoplay=true',
  window.location.href,
).href;

const REPLY_TIMEOUT_MS = 8000;
const MAX_LOG_ENTRIES  = 200;


/* ══════════════════════════════════════════════════════════════════
 *  TINY HELPERS
 * ══════════════════════════════════════════════════════════════════ */

function $(id) {
  return document.getElementById(id);
}

function $$(selector, root) {
  return Array.from((root || document).querySelectorAll(selector));
}

function debounce(fn, ms) {
  let handle = null;
  return function debounced(...args) {
    clearTimeout(handle);
    handle = setTimeout(() => fn(...args), ms);
  };
}

function setActive(container, targetEl) {
  $$('.opt', container).forEach((btn) => btn.classList.remove('active'));
  if (targetEl) targetEl.classList.add('active');
}

function formatDollars(value) {
  if (value == null) return '—';
  return '$' + Math.round(value).toLocaleString();
}


/* ══════════════════════════════════════════════════════════════════
 *  APP STATE
 *  Single module-scope object so every builder/handler can read it.
 * ══════════════════════════════════════════════════════════════════ */

const state = {
  iframe:        null,        // the <iframe> element
  iframeOrigin:  '*',          // origin to target with postMessage
  requestId:     0,            // monotonic for { id } correlation
  pending:       new Map(),    // id → { resolve, reject, timer }
  ready:         false,
  activeBand:    'her',
  iconCache:     {},           // optional iconUrl cache from manifest
  materials:     [],           // schema-v2 band material catalog
  featureCatalogs: { inlay: [], overlay: [], sleeve: [] },
  materialRef:   { base: '', variant: '', finish: '' },
  readyProbeTimer: null,
};


/* ══════════════════════════════════════════════════════════════════
 *  BOOT
 * ══════════════════════════════════════════════════════════════════ */

function init() {
  state.iframe = $('viewer-iframe');

  buildUrlBar();
  buildBandSwitch();
  buildWidthSlider();
  buildEngravingInput();
  buildCartButton();
  buildLogPanel();

  window.addEventListener('message', handleIncomingMessage);
  state.iframe.addEventListener('load', () => probeReady());

  loadIframe(DEFAULT_VIEWER_URL);
}


/* ══════════════════════════════════════════════════════════════════
 *  URL BAR — lets the user point the demo at any hosted file
 * ══════════════════════════════════════════════════════════════════ */

function buildUrlBar() {
  $('iframe-url').value = DEFAULT_VIEWER_URL;

  $('iframe-load').addEventListener('click', () => {
    const url = $('iframe-url').value.trim();
    if (!url) return;
    loadIframe(url);
  });

  $('iframe-url').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') $('iframe-load').click();
  });
}

function loadIframe(url) {
  resetState();
  setStatus('idle', 'Loading iframe…');

  try {
    const parsed = new URL(url, window.location.href);
    state.iframe.src = parsed.href;
    state.iframeOrigin = (
      parsed.protocol === 'file:' || parsed.origin === 'null'
    ) ? '*' : parsed.origin;
  } catch {
    state.iframe.src = url;
    state.iframeOrigin = '*';
  }

  logEvent('out', 'iframe.src', { url });
}

function resetState() {
  state.ready = false;
  clearTimeout(state.readyProbeTimer);
  state.readyProbeTimer = null;
  state.materials = [];
  state.featureCatalogs = { inlay: [], overlay: [], sleeve: [] };
  state.materialRef = { base: '', variant: '', finish: '' };
  state.pending.forEach(({ reject, timer }) => {
    clearTimeout(timer);
    reject(new Error('iframe reloaded'));
  });
  state.pending.clear();
  state.requestId = 0;

  $('profile-opts').innerHTML  = '<div class="muted-hint">Waiting for ready…</div>';
  $('metal-opts').innerHTML    = '<div class="muted-hint">Waiting for ready…</div>';
  $('variant-opts').innerHTML  = '';
  $('finish-opts').innerHTML   = '<div class="muted-hint">Waiting for ready…</div>';
  $('inlay-opts').innerHTML    = '';
  $('overlay-opts').innerHTML  = '';
  $('sleeve-opts').innerHTML   = '';
  $('setting-opts').innerHTML  = '<div class="muted-hint">Waiting for ready…</div>';
  $('price-value').textContent = '—';
  [
    'height-card', 'ring-size-card', 'edge-card', 'partition-card',
    'diamond-detail-card', 'division-card', 'sep-groove-card',
    'design-grooves-card', 'engraving-detail-card', 'rings-card',
    'variant-card', 'outside-card', 'sleeve-card',
  ].forEach((id) => { $(id).hidden = true; });
}

/* The plugin's `ready` event is intentionally one-shot. An iframe can finish
 * booting quickly enough for that event to cross the boundary before a host
 * listener is attached (or after a cached reload replaced the old window).
 * Probe a harmless public method as a race-safe handshake; once it replies,
 * the normal catalog and snapshot startup path can run. */
async function probeReady(attempt = 0) {
  if (state.ready) return;

  try {
    await query('getAvailableProfiles', [], 2500);
    await onReady();
  } catch (error) {
    if (state.ready) return;
    if (attempt >= 23) {
      setStatus('error', 'Viewer did not expose the Wedding Band API');
      logEvent('err', 'ready probe failed', { message: error.message });
      return;
    }
    state.readyProbeTimer = setTimeout(() => probeReady(attempt + 1), 500);
  }
}

function setStatus(kind, label) {
  const dot = $('status-dot');
  dot.classList.remove('ready', 'error');
  if (kind === 'ready') dot.classList.add('ready');
  if (kind === 'error') dot.classList.add('error');
  $('status-label').textContent = label;
}


/* ══════════════════════════════════════════════════════════════════
 *  POSTMESSAGE — send / query helpers
 *
 *    send(method, args)   fire and forget
 *    query(method, args)  Promise<result>
 * ══════════════════════════════════════════════════════════════════ */

function nextRequestId() {
  state.requestId += 1;
  return 'req-' + state.requestId;
}

function send(method, args) {
  const id      = nextRequestId();
  const payload = { id, method, args: args || [] };

  logEvent('out', method, payload);

  state.iframe.contentWindow.postMessage(payload, state.iframeOrigin);
  return id;
}

function query(method, args, timeoutMs) {
  return new Promise((resolve, reject) => {
    const id      = nextRequestId();
    const payload = { id, method, args: args || [] };

    const timer = setTimeout(() => {
      state.pending.delete(id);
      reject(new Error('timeout waiting for ' + method));
    }, timeoutMs || REPLY_TIMEOUT_MS);

    state.pending.set(id, { resolve, reject, timer });

    logEvent('out', method, payload);
    state.iframe.contentWindow.postMessage(payload, state.iframeOrigin);
  });
}

/* ══════════════════════════════════════════════════════════════════
 *  INCOMING MESSAGE ROUTER
 *  Three shapes are handled:
 *    { event, data }        →  event from viewer
 *    { id, result }         →  reply to a query
 *    { id, error: {…} }     →  reply with error
 * ══════════════════════════════════════════════════════════════════ */

function handleIncomingMessage(event) {
  const sourceMatches = event.source === state.iframe.contentWindow;
  const originMatches = state.iframeOrigin !== '*' && event.origin === state.iframeOrigin;
  const localFileMatches = (
    state.iframeOrigin === '*'
    && event.origin === 'null'
    && state.iframe.src.startsWith('file:')
  );
  if (!sourceMatches && !originMatches && !localFileMatches) return;
  if (state.iframeOrigin !== '*' && event.origin !== state.iframeOrigin) return;

  const data = event.data;
  if (!data || typeof data !== 'object') return;

  if (data.event) {
    logEvent('in', data.event, data);
    handleViewerEvent(data.event, data.data);
    return;
  }

  if (data.id && state.pending.has(data.id)) {
    const pending = state.pending.get(data.id);
    state.pending.delete(data.id);
    clearTimeout(pending.timer);

    if (data.error) {
      logEvent('err', 'reply:error', data);
      pending.reject(new Error(data.error.message || 'iframe error'));
    } else {
      logEvent('rep', 'reply', data);
      pending.resolve(data.result);
    }
  }
}


/* ══════════════════════════════════════════════════════════════════
 *  VIEWER EVENT HANDLERS
 * ══════════════════════════════════════════════════════════════════ */

function handleViewerEvent(name, data) {
  switch (name) {
    case 'ready':            return onReady();
    case 'price:updated':    return onPriceUpdated(data);
    case 'band:switched':    return onBandSwitched(data);
    case 'profile:changed':  return onProfileChanged(data);
    case 'material:changed': return onMaterialChanged(data);
    case 'partition:changed':return refreshSnapshot();
    case 'path:changed':     return refreshOutsideFeatures();
    case 'inlays:changed':
    case 'overlays:changed':
    case 'sleeve:changed':   return refreshOutsideFeatures();
    case 'diamonds:changed': return onDiamondsChanged(data);
    case 'engraving:changed':return onEngravingChanged(data);
    case 'rings:changed':    return onRingsChanged(data);
    case 'compatibility:resolved':
    case 'validation:warning':
      return onViewerWarning(data);
    case 'error':            return onViewerError(data);
    default:                 return;
  }
}

async function onReady() {
  if (state.ready) return;
  state.ready = true;
  setStatus('ready', 'Connected · listening');

  try {
    await populateCatalogs();
    await populateOptionalCards();
    await refreshSnapshot();
  } catch (err) {
    setStatus('error', 'Catalog load failed: ' + err.message);
  }
}

function onPriceUpdated(data) {
  if (!data || !data.pricing) return;
  if (data.bandName && data.bandName !== state.activeBand) return;
  $('price-value').textContent = formatDollars(data.pricing.totalUsd);
}

function onBandSwitched(data) {
  if (!data || !data.to) return;
  state.activeBand = data.to;
  $('band-value').textContent = capitalize(data.to);
  $$('#band-switch button').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.band === data.to);
  });
  refreshSnapshot();
}

function onProfileChanged(data) {
  if (!data) return;
  $('profile-value').textContent = data.profileName || '—';
}

function onMaterialChanged(data) {
  if (!data) return;
  if (data.slot === 1) refreshSnapshot();
  else refreshOutsideFeatures();
}

function onDiamondsChanged(data) {
  if (!data) return;
  $('setting-value').textContent = data.settingType || 'None';
}

function onEngravingChanged(data) {
  if (!data) return;
  const text = data.text || '';
  $('engrave-input').value = text;
  $('engrave-count').textContent = text.length + '/30';
}

async function onRingsChanged() {
  try {
    const rings = await query('getRings');
    if (Array.isArray(rings) && rings.length) {
      renderRingChips(rings);
      $('rings-card').hidden = false;
    }
  } catch (err) {
    /* Older viewer build — nothing to refresh. */
  }
}

function onViewerWarning(data) {
  if (data && data.message) setStatus('ready', data.message);
}

function onViewerError(data) {
  setStatus('error', (data && data.message) || 'Viewer error');
}


/* ══════════════════════════════════════════════════════════════════
 *  CATALOG LOAD — fetch lists from the viewer once it is ready
 * ══════════════════════════════════════════════════════════════════ */

async function populateCatalogs() {
  const [profiles, materials, settingTypes, inlays, overlays, sleeves] = await Promise.all([
    query('getAvailableProfiles'),
    query('getAvailableMaterials', ['band']),
    query('getAvailableSettingTypes'),
    query('getAvailableMaterials', ['inlay']),
    query('getAvailableMaterials', ['overlay']),
    query('getAvailableMaterials', ['sleeve']),
  ]);

  state.materials = materials || [];
  state.featureCatalogs = {
    inlay: inlays || [],
    overlay: overlays || [],
    sleeve: sleeves || [],
  };

  buildProfileOptions(profiles || []);
  buildMetalOptions(state.materials);
  buildFeatureOptions();
  buildSettingOptions(settingTypes || []);
}

async function refreshSnapshot() {
  try {
    const [snap, raw] = await Promise.all([
      query('getSnapshot'),
      query('getRawState'),
    ]);
    if (!snap) return;
    applySnapshot(snap);
    await refreshMaterialControls(raw || {});
    await refreshOutsideFeatures(snap.materials);
  } catch (err) {
    /* snapshot is best-effort; controls still work via events */
  }
}

function applySnapshot(snap) {
  if (snap.bandName) {
    state.activeBand = snap.bandName;
    $('band-value').textContent = capitalize(snap.bandName);
    $$('#band-switch button').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.band === snap.bandName);
    });
  }

  if (snap.profile) {
    $('profile-value').textContent = snap.profile.name || '—';
    $$('#profile-opts .opt').forEach((btn, index) => {
      btn.classList.toggle('active', index === snap.profile.index);
    });
  }

  if (snap.materials && Array.isArray(snap.materials.slots)) {
    const slot1 = snap.materials.slots.find((entry) => entry.slot === 1);
    if (slot1) {
      state.materialRef.base = slot1.metal || state.materialRef.base;
      state.materialRef.finish = slot1.finish || '';
    }
  }

  if (snap.dimensions && snap.dimensions.widthMm != null) {
    const mult = snap.dimensions.widthMm;
    $('width-slider').value      = mult;
    $('width-value').textContent = '×' + mult.toFixed(2);
  }

  if (snap.dimensions && snap.dimensions.heightMm != null && !$('height-card').hidden) {
    $('height-slider').value = snap.dimensions.heightMm;
    $('height-value').textContent = '×' + Number(snap.dimensions.heightMm).toFixed(2);
  }

  if (snap.dimensions && snap.dimensions.radiusMm != null && !$('ring-size-card').hidden) {
    $('ring-size-slider').value = snap.dimensions.radiusMm;
    $('ring-size-value').textContent = formatRingSize(snap.dimensions.radiusMm);
  }

  if (snap.materials && !$('partition-card').hidden) {
    const partition = snap.materials.partition;
    if (partition != null) {
      $('partition-value').textContent = partition + ' Color';
      $$('#partition-opts .opt').forEach((btn) => {
        btn.classList.toggle('active', Number((btn.textContent || '').match(/\d+/)?.[0]) === partition);
      });
    }
  }

  if (snap.edge && !$('edge-card').hidden) {
    const edge = snap.edge;
    $('edge-value').textContent = edge.type || 'None';
    $$('#edge-opts .opt').forEach((btn) => {
      btn.classList.toggle('active', (btn.textContent || '').trim() === edge.type);
    });
  }

  if (snap.diamonds && snap.diamonds.settingType) {
    $('setting-value').textContent = snap.diamonds.settingType;
    highlightChipByLabel('#setting-opts', snap.diamonds.settingType);
  } else {
    $('setting-value').textContent = 'None';
  }

  if (snap.engraving && typeof snap.engraving.text === 'string') {
    $('engrave-input').value       = snap.engraving.text;
    $('engrave-count').textContent = snap.engraving.text.length + '/30';
  }

  if (snap.pricing && snap.pricing.totalUsd != null) {
    $('price-value').textContent = formatDollars(snap.pricing.totalUsd);
  }

  if (snap.bandName) {
    state.activeBand = snap.bandName;
    $('band-value').textContent = capitalize(snap.bandName);
    $$('#band-switch button').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.band === snap.bandName);
    });
  }
}

function highlightChipByLabel(selector, label) {
  if (!label) return;
  const want = label.toLowerCase();
  $$(selector + ' .opt').forEach((btn) => {
    const text = (btn.textContent || '').trim().toLowerCase();
    btn.classList.toggle('active', text === want);
  });
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/* ══════════════════════════════════════════════════════════════════
 *  CONTROL BUILDERS — one per host-page card
 * ══════════════════════════════════════════════════════════════════ */

function buildProfileOptions(profiles) {
  const host = $('profile-opts');
  host.innerHTML = '';
  if (!profiles.length) {
    host.innerHTML = '<div class="muted-hint">No profiles returned</div>';
    return;
  }

  profiles.forEach((profile) => {
    const btn = makeChip(profile.name || `Profile ${profile.index}`, () => {
      setActive(host, btn);
      $('profile-value').textContent = profile.name;
      send('setProfile', [profile.index]);
    });
    host.appendChild(btn);
  });
}

function materialById(base) {
  return state.materials.find((material) =>
    String(material.id).toLowerCase() === String(base).toLowerCase()
  );
}

async function supportedFinishes(material, variantId) {
  if (!material) return [];
  const finishes = await query('getAvailableFinishesFor', [material.id]);
  const variants = material.variants || [];
  const variant = variants.find((entry) => entry.id === variantId) || variants[0];
  if (!variant || !variant.files) return [];
  return (finishes || []).filter((finish) => variant.files[finish.id]);
}

async function resolveMaterialRef(material, requestedVariant, requestedFinish) {
  const variants = material.variants || [];
  const variant = variants.find((entry) => entry.id === requestedVariant)
    || variants.find((entry) => entry.id === material.defaultVariant)
    || variants[0];
  const finishes = await supportedFinishes(material, variant && variant.id);
  const finish = finishes.find((entry) => entry.id === requestedFinish)
    || finishes.find((entry) => entry.id === material.defaultFinish)
    || finishes[0];

  return {
    base: material.id,
    variant: variant && variant.id,
    finish: finish && finish.id,
  };
}

async function applyMaterialRef(ref) {
  await query('setMaterialRef', [1, ref]);
  await refreshSnapshot();
}

function buildMetalOptions(materials) {
  const host = $('metal-opts');
  host.innerHTML = '';
  if (!materials.length) {
    host.innerHTML = '<div class="muted-hint">No band materials returned</div>';
    return;
  }

  materials.forEach((material) => {
    const btn = makeChip(material.name, async () => {
      const ref = await resolveMaterialRef(material, undefined, state.materialRef.finish);
      await applyMaterialRef(ref);
    });
    btn.dataset.optionId = material.id;
    host.appendChild(btn);
  });
}

async function refreshMaterialControls(raw) {
  const base = (raw.metals && raw.metals[0]) || state.materialRef.base;
  const material = materialById(base) || state.materials[0];
  if (!material) return;

  const requestedVariant = (raw.variants && raw.variants[0])
    || state.materialRef.variant
    || material.defaultVariant;
  const requestedFinish = (raw.surfaces && raw.surfaces[0])
    || state.materialRef.finish;
  const ref = await resolveMaterialRef(material, requestedVariant, requestedFinish);
  state.materialRef = ref;

  $('metal-value').textContent = material.name;
  $$('#metal-opts .opt').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.optionId === ref.base);
  });

  buildVariantOptions(material, ref);
  await buildFinishOptions(material, ref);
}

function buildVariantOptions(material, ref) {
  const host = $('variant-opts');
  const variants = material.variants || [];
  host.innerHTML = '';
  $('variant-card').hidden = variants.length < 2;
  $('variant-value').textContent =
    (variants.find((entry) => entry.id === ref.variant) || {}).name || ref.variant || 'Default';

  variants.forEach((variant) => {
    const btn = makeChip(variant.name, async () => {
      const next = await resolveMaterialRef(material, variant.id, ref.finish);
      await applyMaterialRef(next);
    });
    btn.dataset.optionId = variant.id;
    btn.classList.toggle('active', variant.id === ref.variant);
    host.appendChild(btn);
  });
}

async function buildFinishOptions(material, ref) {
  const host = $('finish-opts');
  const finishes = await supportedFinishes(material, ref.variant);
  host.innerHTML = '';
  $('finish-value').textContent =
    (finishes.find((entry) => entry.id === ref.finish) || {}).name || ref.finish || 'None';

  if (!finishes.length) {
    host.innerHTML = '<div class="muted-hint">This material has no surface-finish axis.</div>';
    return;
  }

  finishes.forEach((finish) => {
    const btn = makeChip(finish.name, async () => {
      await applyMaterialRef({
        base: ref.base,
        variant: ref.variant || undefined,
        finish: finish.id,
      });
    });
    btn.dataset.optionId = finish.id;
    btn.classList.toggle('active', finish.id === ref.finish);
    host.appendChild(btn);
  });
}


function featureDefaultRef(material) {
  const variants = material.variants || [];
  const variant = variants.find((entry) => entry.id === material.defaultVariant) || variants[0];
  const finish = variant && variant.files
    ? Object.keys(variant.files).find((id) => id === material.defaultFinish)
      || Object.keys(variant.files)[0]
    : undefined;
  return {
    base: material.id,
    variant: variant && variant.id,
    finish,
  };
}

function buildFeatureMaterialChips(hostId, usage, apply) {
  const host = $(hostId);
  const materials = state.featureCatalogs[usage] || [];
  host.innerHTML = '';

  materials.forEach((material) => {
    const btn = makeChip(material.name, async () => {
      await apply(featureDefaultRef(material));
      await refreshOutsideFeatures();
    });
    btn.dataset.optionId = material.id;
    host.appendChild(btn);
  });

  return materials.length > 0;
}

function buildFeatureOptions() {
  const hasInlays = buildFeatureMaterialChips('inlay-opts', 'inlay', async (ref) => {
    await query('setInlay', [
      0,
      {
        centerZ: 0, widthMm: 1, metal: ref.base,
        variant: ref.variant, finish: ref.finish,
      },
    ]);
  });

  const hasOverlays = buildFeatureMaterialChips('overlay-opts', 'overlay', async (ref) => {
    await query('setOverlay', ['left', {
      widthMm: 0.8, metal: ref.base, variant: ref.variant,
      finish: ref.finish, rimCoverage: 1,
    }]);
  });

  const hasSleeves = buildFeatureMaterialChips('sleeve-opts', 'sleeve', async (ref) => {
    await query('setSleeve', [{
      enabled: true, metal: ref.base, variant: ref.variant,
      finish: ref.finish, full: true,
    }]);
  });

  const clearOutside = makeChip('Clear Outside', async () => {
    await query('setOutsideFeatures', [{ inlays: [], overlays: [] }]);
    await refreshOutsideFeatures();
  });
  $('outside-actions').replaceChildren(clearOutside);

  const clearSleeve = makeChip('Remove Sleeve', async () => {
    const [inlays, overlays] = await Promise.all([
      query('getInlays'),
      query('getOverlays'),
    ]);
    await query('setOutsideFeatures', [{ inlays, overlays, sleeve: null }]);
    await refreshOutsideFeatures();
  });
  $('sleeve-opts').appendChild(clearSleeve);

  $('outside-card').hidden = !(hasInlays || hasOverlays);
  $('sleeve-card').hidden = !hasSleeves;
}

async function refreshOutsideFeatures(materialSnapshot) {
  try {
    const [available, inlays, overlays, sleeve] = await Promise.all([
      query('areOutsideFeaturesAvailable'),
      materialSnapshot && materialSnapshot.inlays
        ? Promise.resolve(materialSnapshot.inlays)
        : query('getInlays'),
      materialSnapshot && materialSnapshot.overlays
        ? Promise.resolve(materialSnapshot.overlays)
        : query('getOverlays'),
      materialSnapshot && Object.prototype.hasOwnProperty.call(materialSnapshot, 'sleeve')
        ? Promise.resolve(materialSnapshot.sleeve)
        : query('getSleeve'),
    ]);

    $('outside-value').textContent =
      `${(inlays || []).length} inlay${(inlays || []).length === 1 ? '' : 's'} · ${(overlays || []).length} overlay${(overlays || []).length === 1 ? '' : 's'}`;
    $('sleeve-value').textContent = sleeve && sleeve.enabled
      ? capitalize(sleeve.metal)
      : 'Off';

    const activeInlay = inlays && inlays[0] && inlays[0].metal;
    const leftOverlay = (overlays || []).find((entry) => entry.side === 'left');
    $$('#inlay-opts .opt').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.optionId === activeInlay);
      btn.disabled = !available;
    });
    $$('#overlay-opts .opt').forEach((btn) => {
      btn.classList.toggle('active',
        btn.dataset.optionId === (leftOverlay && leftOverlay.metal));
      btn.disabled = !available;
    });
    $$('#outside-actions .opt').forEach((btn) => { btn.disabled = !available; });
    $$('#sleeve-opts .opt').forEach((btn) => {
      if (btn.dataset.optionId) {
        btn.disabled = !available;
        btn.classList.toggle('active',
          btn.dataset.optionId === (sleeve && sleeve.enabled && sleeve.metal));
      }
    });
  } catch (err) {
    $('outside-card').hidden = true;
    $('sleeve-card').hidden = true;
  }
}


function buildSettingOptions(settingTypes) {
  const host = $('setting-opts');
  host.innerHTML = '';
  if (!settingTypes.length) {
    host.innerHTML = '<div class="muted-hint">No setting types returned</div>';
    return;
  }

  settingTypes.forEach((setting) => {
    const id    = setting.id   || setting;
    const label = setting.name || (id === 'none' ? 'None' : id);

    const btn = makeChip(label, () => {
      setActive(host, btn);
      $('setting-value').textContent = label;

      if (id === 'none') {
        send('setDiamonds', [null]);
      } else {
        send('setDiamonds', [{ settingType: id }]);
      }
    });
    host.appendChild(btn);
  });
}

function makeChip(label, onClick) {
  const btn = document.createElement('button');
  btn.type        = 'button';
  btn.className   = 'opt';
  btn.textContent = label;
  btn.addEventListener('click', onClick);
  return btn;
}


/* ══════════════════════════════════════════════════════════════════
 *  NEWER WBB API — optional cards
 *
 *  Color boundary, separation groove, and ring compilation
 *  only exist on newer builds of the embedded viewer. Each card starts
 *  hidden and is revealed only if its query comes back with data, so
 *  this page still works unchanged against an older hosted embed.
 * ══════════════════════════════════════════════════════════════════ */

async function populateOptionalCards() {
  await Promise.all([
    buildHeightCard(),
    buildRingSizeCard(),
    buildEdgeCard(),
    buildPartitionCard(),
    buildDiamondDetailCard(),
    buildDivisionCard(),
    buildSeparationGrooveCard(),
    buildDesignGroovesCard(),
    buildEngravingDetailCard(),
    buildRingsCard(),
  ]);
}

/** Reveal a card only when the viewer answered with usable data. */
async function tryOptionalCard(cardId, load) {
  try {
    const revealed = await load();
    if (revealed) $(cardId).hidden = false;
  } catch (err) {
    /* Older viewer build — leave the card hidden. */
  }
}

function buildDivisionCard() {
  return tryOptionalCard('division-card', async () => {
    const divisions = await query('getAvailableDivisionTypes');
    if (!Array.isArray(divisions) || !divisions.length) return false;

    const host = $('division-opts');
    host.innerHTML = '';

    divisions.forEach((division) => {
      const btn = makeChip(division.name || division.id, () => {
        setActive(host, btn);
        $('division-value').textContent = division.name || division.id;
        send('setDivision', [division.id]);
      });
      host.appendChild(btn);
    });

    const current = await query('getDivision');
    if (current) {
      $('division-value').textContent = current.name || current.type || current.id || '—';
      highlightChipByLabel('#division-opts', current.name);
    }
    return true;
  });
}

function buildHeightCard() {
  return tryOptionalCard('height-card', async () => {
    const dimensions = await query('getDimensions');
    if (!dimensions || dimensions.heightMm == null) return false;

    const slider = $('height-slider');
    const setHeight = debounce((value) => send('setHeightMultiplier', [value]), 80);
    slider.value = dimensions.heightMm;
    $('height-value').textContent = '×' + Number(dimensions.heightMm).toFixed(2);
    slider.oninput = (event) => {
      const value = Number(event.target.value);
      $('height-value').textContent = '×' + value.toFixed(2);
      setHeight(value);
    };
    return true;
  });
}

function buildRingSizeCard() {
  return tryOptionalCard('ring-size-card', async () => {
    const dimensions = await query('getDimensions');
    if (!dimensions || dimensions.radiusMm == null) return false;

    const slider = $('ring-size-slider');
    const setSize = debounce((value) => send('setRingSize', [value]), 80);
    slider.value = dimensions.radiusMm;
    $('ring-size-value').textContent = formatRingSize(dimensions.radiusMm);
    slider.oninput = (event) => {
      const value = Number(event.target.value);
      $('ring-size-value').textContent = formatRingSize(value);
      setSize(value);
    };
    return true;
  });
}

function formatRingSize(radiusMm) {
  const diameterMm = Number(radiusMm) * 2;
  return diameterMm.toFixed(1) + ' mm Ø';
}

function buildEdgeCard() {
  return tryOptionalCard('edge-card', async () => {
    const [types, sides] = await Promise.all([
      query('getAvailableEdgeTypes'), query('getAvailableEdgeSides'),
    ]);
    if (!Array.isArray(types) || !types.length) return false;

    const host = $('edge-opts');
    const sideHost = $('edge-side-opts');
    host.innerHTML = '';
    sideHost.innerHTML = '';
    let selectedSide = Array.isArray(sides) && sides[0] ? (sides[0].id || sides[0].name || sides[0]) : 'Both';

    (sides || []).forEach((side) => {
      const id = side.id || side.name || side;
      const button = makeChip(side.name || id, () => {
        selectedSide = id;
        setActive(sideHost, button);
      });
      sideHost.appendChild(button);
    });

    types.forEach((type) => {
      const id = type.id || type.name || type;
      const label = type.name || id;
      const button = makeChip(label, () => {
        setActive(host, button);
        $('edge-value').textContent = label;
        send('setEdge', [id, selectedSide]);
      });
      host.appendChild(button);
    });
    return true;
  });
}

function buildPartitionCard() {
  return tryOptionalCard('partition-card', async () => {
    const partitions = await query('getAvailablePartitions');
    if (!Array.isArray(partitions) || !partitions.length) return false;

    const host = $('partition-opts');
    host.innerHTML = '';
    partitions.forEach((partition, index) => {
      const label = partition.name || partition;
      const value = partition.id || (String(label).match(/\d+/) || [index + 1])[0];
      const button = makeChip(label, () => {
        setActive(host, button);
        $('partition-value').textContent = label;
        send('setPartition', [Number(value)]);
      });
      host.appendChild(button);
    });
    return true;
  });
}

function buildDiamondDetailCard() {
  return tryOptionalCard('diamond-detail-card', async () => {
    const [spans, spacings, limits] = await Promise.all([
      query('getAvailableDiamondSpans'),
      query('getAvailableDiamondSpacings'),
      query('getLimits'),
    ]);
    if ((!Array.isArray(spans) || !spans.length) && (!Array.isArray(spacings) || !spacings.length)) return false;

    buildDiamondPatchChips('diamond-span-opts', spans || [], 'span');
    buildDiamondPatchChips('diamond-spacing-opts', spacings || [], 'spacing');
    const size = $('diamond-size-slider');
    const range = limits && limits.stoneSize;
    if (range) {
      size.min = range.min;
      size.max = range.max;
      size.step = range.step || 0.05;
    }
    const setSize = debounce((value) => send('setDiamonds', [{ stoneSize: value }]), 80);
    size.oninput = (event) => {
      const value = Number(event.target.value);
      $('diamond-size-value').textContent = value.toFixed(2) + ' mm';
      setSize(value);
    };
    $('diamond-size-value').textContent = Number(size.value).toFixed(2) + ' mm';
    return true;
  });
}

function buildDiamondPatchChips(hostId, items, property) {
  const host = $(hostId);
  host.innerHTML = '';
  items.forEach((item) => {
    const id = item.id != null ? item.id : (item.value != null ? item.value : item);
    const label = item.name || String(id);
    const button = makeChip(label, () => {
      setActive(host, button);
      send('setDiamonds', [{ [property]: id }]);
    });
    host.appendChild(button);
  });
}

function buildSeparationGrooveCard() {
  return tryOptionalCard('sep-groove-card', async () => {
    const groove = await query('getSeparationGroove');
    if (!groove) return false;

    const host = $('sep-groove-opts');
    host.innerHTML = '';

    const onBtn  = makeChip('On',  () => applySeparationGroove(true));
    const offBtn = makeChip('Off', () => applySeparationGroove(false));
    host.appendChild(onBtn);
    host.appendChild(offBtn);

    function applySeparationGroove(enabled) {
      setActive(host, enabled ? onBtn : offBtn);
      $('sep-groove-value').textContent = enabled ? 'On' : 'Off';
      send('setSeparationGroove', [{ enabled: enabled }]);
    }

    setActive(host, groove.enabled ? onBtn : offBtn);
    $('sep-groove-value').textContent = groove.enabled ? 'On' : 'Off';
    return true;
  });
}

function buildDesignGroovesCard() {
  return tryOptionalCard('design-grooves-card', async () => {
    // A successful getter is the feature check: an empty array is still a
    // valid, editable design-groove collection.
    await query('getDesignGrooves');
    const host = $('design-grooves-opts');
    host.innerHTML = '';
    const add = makeChip('Add Groove', () => send('addDesignGroove'));
    const clear = makeChip('Clear', () => send('clearDesignGrooves'));
    host.append(add, clear);
    return true;
  });
}

function buildEngravingDetailCard() {
  return tryOptionalCard('engraving-detail-card', async () => {
    const [snapshot, fonts] = await Promise.all([
      query('getSnapshot'), query('getEngravingFonts'),
    ]);
    if (!snapshot || !snapshot.engraving) return false;
    if (!Array.isArray(fonts) || !fonts.length) return false;

    const host = $('engraving-font-opts');
    host.innerHTML = '';
    fonts.forEach((font) => {
      const id = font.id || font.name || font;
      const label = font.name || id;
      const button = makeChip(label, async () => {
        setActive(host, button);
        const snapshot = await query('getSnapshot');
        const text = snapshot && snapshot.engraving && snapshot.engraving.text;
        send('setEngraving', [text || null, id]);
      });
      host.appendChild(button);
    });

    const size = $('engraving-size-slider');
    size.min = '4';
    size.max = '72';
    size.step = '1';
    const setSize = debounce(async (value) => {
      const snapshot = await query('getSnapshot');
      const current = snapshot && snapshot.engraving;
      send('setEngraving', [
        (current && current.text) || null,
        current && current.font,
        value,
      ]);
    }, 120);
    size.oninput = (event) => {
      const value = Number(event.target.value);
      $('engraving-size-value').textContent = Math.round(value) + ' px';
      setSize(value);
    };
    $('engraving-size-value').textContent = Math.round(Number(size.value)) + ' px';
    return true;
  });
}

function buildRingsCard() {
  return tryOptionalCard('rings-card', async () => {
    const rings = await query('getRings');
    if (!Array.isArray(rings) || !rings.length) return false;

    renderRingChips(rings);
    return true;
  });
}

/** One chip per ring in the compilation; clicking focuses that ring. */
function renderRingChips(rings) {
  const host = $('rings-opts');
  host.innerHTML = '';

  $('rings-value').textContent = rings.length + ' in compilation';

  rings.forEach((ring) => {
    const btn = makeChip(ring.name || ring.id, () => {
      setActive(host, btn);
      send('focusRing', [ring.id]);
    });
    host.appendChild(btn);
  });
}

/* ══════════════════════════════════════════════════════════════════
 *  BAND SWITCH
 * ══════════════════════════════════════════════════════════════════ */

function buildBandSwitch() {
  $$('#band-switch button').forEach((btn) => {
    btn.addEventListener('click', () => {
      const band = btn.dataset.band;
      $$('#band-switch button').forEach((other) => other.classList.remove('active'));
      btn.classList.add('active');
      state.activeBand = band;
      $('band-value').textContent = capitalize(band);
      send('switchBand', [band]);
    });
  });
}


/* ══════════════════════════════════════════════════════════════════
 *  WIDTH SLIDER  — sends setWidth on every change, debounced
 * ══════════════════════════════════════════════════════════════════ */

function buildWidthSlider() {
  const slider = $('width-slider');
  const label  = $('width-value');

  const sendWidth = debounce((value) => {
    send('setWidth', [value]);
  }, 80);

  slider.addEventListener('input', (event) => {
    const value = parseFloat(event.target.value);
    label.textContent = '×' + value.toFixed(2);
    sendWidth(value);
  });

  label.textContent = '×' + parseFloat(slider.value).toFixed(2);
}


/* ══════════════════════════════════════════════════════════════════
 *  ENGRAVING INPUT  — debounced setEngraving
 * ══════════════════════════════════════════════════════════════════ */

function buildEngravingInput() {
  const input = $('engrave-input');
  const count = $('engrave-count');

  const sendEngraving = debounce((text) => {
    send('setEngraving', [text || null]);
  }, 180);

  input.addEventListener('input', (event) => {
    const text = event.target.value;
    count.textContent = text.length + '/30';
    sendEngraving(text.trim());
  });
}


/* ══════════════════════════════════════════════════════════════════
 *  ADD TO CART  — pulls the full config out of the iframe and logs
 * ══════════════════════════════════════════════════════════════════ */

function buildCartButton() {
  $('cart-btn').addEventListener('click', async () => {
    if (!state.ready) return;
    try {
      const [stateJson, summary, price] = await Promise.all([
        query('toJSON'),
        query('exportConfig'),
        query('getPrice'),
      ]);
      const payload = { state: stateJson, summary, price };
      logEvent('rep', 'toJSON (cart payload)', { result: payload });
      console.log('[cart] complete payload:', payload);
    } catch (err) {
      logEvent('err', 'toJSON failed', { message: err.message });
    }
  });
}


/* ══════════════════════════════════════════════════════════════════
 *  EVENT LOG  — visual record of every postMessage in/out
 * ══════════════════════════════════════════════════════════════════ */

function buildLogPanel() {
  $('log-clear').addEventListener('click', (event) => {
    event.preventDefault();
    $('log-list').innerHTML = '';
  });
}

function logEvent(direction, label, payload) {
  const list = $('log-list');
  const li   = document.createElement('li');

  const klass = (
    direction === 'out' ? 'log-out' :
    direction === 'in'  ? 'log-in'  :
    direction === 'rep' ? 'log-rep' : 'log-err'
  );
  li.className = klass;

  const tag = document.createElement('span');
  tag.className   = 'log-tag';
  tag.textContent = direction === 'out' ? '→ send'
                   : direction === 'in'  ? '← event'
                   : direction === 'rep' ? '← reply'
                   : '✗ error';
  li.appendChild(tag);

  const body = document.createElement('span');
  body.className = 'log-body';
  body.textContent = label + '  ' + safeStringify(payload);
  li.appendChild(body);

  list.appendChild(li);

  while (list.childElementCount > MAX_LOG_ENTRIES) {
    list.removeChild(list.firstChild);
  }

  list.scrollTop = list.scrollHeight;
}

function safeStringify(value) {
  try {
    const json = JSON.stringify(value);
    return json.length > 220 ? json.slice(0, 220) + '…' : json;
  } catch {
    return String(value);
  }
}


/* ══════════════════════════════════════════════════════════════════
 *  GO
 * ══════════════════════════════════════════════════════════════════ */

init();
