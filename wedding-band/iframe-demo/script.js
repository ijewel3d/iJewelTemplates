/* ════════════════════════════════════════════════════════════════════
 *  Wedding Band Builder — iframe Demo
 *
 *  Demonstrates the postMessage bridge between a host page and a
 *  hosted WBB viewer iframe at:
 *     https://ijewel3d.com/{instance}/files/{fileId}/embedded
 *
 *  fileId is the unique ID of the published Wedding Band project. Find it in
 *  Drive through Share and copy the value between /files/ and /view.
 *  instance is the Drive basename: normally "drive", or the basename supplied
 *  to enterprise accounts. The demo URL below uses "demo-weur".
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

const DEFAULT_VIEWER_URL =
  'https://ijewel3d.com/demo-weur/files/WsF9jzAESde9Jij21ef8cA/embedded'
  + '?hideWbbUi=true&showUiButtons=true&isAutoplay=true';

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

  state.iframe.src = url;

  try {
    const parsed = new URL(url);
    state.iframeOrigin = parsed.origin;
  } catch {
    state.iframeOrigin = '*';
  }

  logEvent('out', 'iframe.src', { url });
}

function resetState() {
  state.ready = false;
  state.pending.forEach(({ reject, timer }) => {
    clearTimeout(timer);
    reject(new Error('iframe reloaded'));
  });
  state.pending.clear();
  state.requestId = 0;

  $('profile-opts').innerHTML  = '<div class="muted-hint">Waiting for ready…</div>';
  $('metal-opts').innerHTML    = '<div class="muted-hint">Waiting for ready…</div>';
  $('finish-opts').innerHTML   = '<div class="muted-hint">Waiting for ready…</div>';
  $('setting-opts').innerHTML  = '<div class="muted-hint">Waiting for ready…</div>';
  $('price-value').textContent = '—';
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
  if (event.source !== state.iframe.contentWindow) return;
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
    case 'diamonds:changed': return onDiamondsChanged(data);
    case 'engraving:changed':return onEngravingChanged(data);
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
  if (!data || data.slot !== 1) return;
  $('metal-value').textContent  = data.metal  || '—';
  $('finish-value').textContent = data.finish || '—';
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

function onViewerError(data) {
  setStatus('error', (data && data.message) || 'Viewer error');
}


/* ══════════════════════════════════════════════════════════════════
 *  CATALOG LOAD — fetch lists from the viewer once it is ready
 * ══════════════════════════════════════════════════════════════════ */

async function populateCatalogs() {
  const [profiles, metals, finishes, settingTypes] = await Promise.all([
    query('getAvailableProfiles'),
    query('getAvailableMetals'),
    query('getAvailableFinishes'),
    query('getAvailableSettingTypes'),
  ]);

  buildProfileOptions(profiles || []);
  buildMetalOptions(metals || []);
  buildFinishOptions(finishes || []);
  buildSettingOptions(settingTypes || []);
}

async function refreshSnapshot() {
  try {
    const snap = await query('getSnapshot');
    if (!snap) return;
    applySnapshot(snap);
  } catch (err) {
    /* snapshot is best-effort; controls still work via events */
  }
}

function applySnapshot(snap) {
  if (snap.profile) {
    $('profile-value').textContent = snap.profile.name || '—';
    $$('#profile-opts .opt').forEach((btn, index) => {
      btn.classList.toggle('active', index === snap.profile.index);
    });
  }

  if (snap.materials && Array.isArray(snap.materials.slots)) {
    const slot1 = snap.materials.slots.find((s) => s.slot === 1);
    if (slot1) {
      $('metal-value').textContent  = slot1.metal  || '—';
      $('finish-value').textContent = slot1.finish || '—';
      highlightChipByLabel('#metal-opts',  slot1.metal);
      highlightChipByLabel('#finish-opts', slot1.finish);
    }
  }

  if (snap.dimensions && snap.dimensions.widthMm != null) {
    const mult = snap.dimensions.widthMm;
    $('width-slider').value      = mult;
    $('width-value').textContent = '×' + mult.toFixed(2);
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

function buildMetalOptions(metals) {
  const host = $('metal-opts');
  host.innerHTML = '';
  if (!metals.length) {
    host.innerHTML = '<div class="muted-hint">No metals returned</div>';
    return;
  }

  metals.forEach((metal) => {
    const btn = makeChip(metal.name, () => {
      setActive(host, btn);
      $('metal-value').textContent = metal.name;

      const currentFinish = $('finish-value').textContent;
      const finish = (currentFinish && currentFinish !== '—') ? currentFinish : 'Polished';
      send('setMaterial', [1, metal.id || metal.name, finish]);
    });
    host.appendChild(btn);
  });
}

function buildFinishOptions(finishes) {
  const host = $('finish-opts');
  host.innerHTML = '';
  if (!finishes.length) {
    host.innerHTML = '<div class="muted-hint">No finishes returned</div>';
    return;
  }

  finishes.forEach((finish) => {
    const btn = makeChip(finish.name, () => {
      setActive(host, btn);
      $('finish-value').textContent = finish.name;

      const currentMetal = $('metal-value').textContent;
      const metal = (currentMetal && currentMetal !== '—') ? currentMetal : 'Yellow';
      send('setMaterial', [1, metal, finish.id || finish.name]);
    });
    host.appendChild(btn);
  });
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
      const config = await query('exportConfig');
      logEvent('rep', 'exportConfig (cart payload)', { result: config });
      console.log('[cart] config:', config);
    } catch (err) {
      logEvent('err', 'exportConfig failed', { message: err.message });
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
