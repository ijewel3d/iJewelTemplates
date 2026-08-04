/* ════════════════════════════════════════════════════════════════════
 *  Wedding Band Builder — Custom UI
 *
 *  Drives the WBB headless controller API via mini-viewer.
 *
 *  Docs:
 *    ijewel3d-docs/wedding-band-builder/api-reference.md
 *    ijewel3d-docs/wedding-band-builder/headless-api.md
 * ════════════════════════════════════════════════════════════════════ */


/* ══════════════════════════════════════════════════════════════════
 *  CONFIG
 * ══════════════════════════════════════════════════════════════════ */

// The project you host. Everything the configurator offers comes from this
// file: the catalog, the opening state, and the scene it renders in.
// Edit it in place, or point this at your own copy.
const PROJECT_URL = './wedding_band_project.json';

const VIEWER_OPTIONS = {
  showCard:         false,
  showSwitchNode:   false,
  showUiButtons:    false,
  showConfigurator: false,
  showZoomButtons:  false,
  enableZoom:       true,
  hideWbbUi:        true,   // hide built-in WBB panel
};


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

function showToast(message, kind) {
  const el = $('toast');
  el.textContent = message;
  el.className   = 'show ' + (kind || '');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => { el.className = ''; }, 2400);
}

function setActive(container, targetEl) {
  $$('.opt', container).forEach((btn) => btn.classList.remove('active'));
  targetEl.classList.add('active');
}


/* ══════════════════════════════════════════════════════════════════
 *  APP STATE
 *  Populated inside init(). Kept at module scope so every builder
 *  function has access without prop-drilling.
 * ══════════════════════════════════════════════════════════════════ */

const state = {
  api:              null,    // WBB controller
  manifest:         null,    // project.plugins.WeddingBandBuilder (raw)
  activeSlot:       1,       // material slot currently being edited
  toggleInside:     null,    // toggle element with ._set()
  toggleSplit:      null,
  toggleWavy:       null,
  toggleWavySplit:  null,
  bandNames:        [],      // all bands registered with the controller
  prices:           {},      // { [bandName]: PriceBreakdown | null }
  sizeSystem:       'EU',    // US | EU | UK
};


/* ══════════════════════════════════════════════════════════════════
 *  BOOT SEQUENCE
 * ══════════════════════════════════════════════════════════════════ */

async function init() {
  const project = await loadProject();

  await bootViewer(project);

  state.api      = await waitForController();
  state.manifest = project.plugins.WeddingBandBuilder;

  window.wbb = state.api; // handy in console

  // Profile tab
  buildProfileOptions();
  buildEdgeOptions();

  // Dimensions tab
  buildDimensionSliders();
  buildRingSizeSlider();

  // Material tab
  buildPartitionOptions();
  buildSlotTabs();
  buildMetalOptions();
  buildFinishOptions();
  buildMaterialToggles();
  buildDivisionSection();

  // Diamond tab
  buildSettingOptions();
  buildDiamondSpanOptions();
  buildDiamondSpacingOptions();
  buildDiamondPositionSnaps();
  buildDiamondInputs();
  buildDiamondTypeExtras();
  buildFreeStoneEditor();
  buildSmoothSeatsToggle();
  buildSideStoneSection();

  // Grooves tab
  buildGrooveToggles();
  buildWavySliders();
  buildSeparationGrooveEditor();
  buildDesignGrooveEditor();

  // Engraving tab
  buildEngravingInputs();
  buildSymbolGrid();

  // Rings tab
  buildRingsSection();

  // Theme tab
  buildThemeSection();

  // Shell
  buildTabs();
  buildBandSwitch();
  // buildPosesBar();
  buildExportImportButtons();
  buildCtaButton();
  buildSpecSheetButton();

  // Price-bar state (per-band)
  state.bandNames = typeof state.api.getBandNames === 'function'
    ? state.api.getBandNames()
    : ['her', 'his'];
  state.bandNames.forEach((name) => {
    state.prices[name] = state.api.getPrice(name) || null;
  });
  renderPriceBar();

  subscribeToEvents();

  syncUIFromSnapshot();
  $('loading').classList.add('hidden');
}


/* ══════════════════════════════════════════════════════════════════
 *  STEP 1 — LOAD + PATCH PROJECT JSON
 * ══════════════════════════════════════════════════════════════════ */

async function loadProject() {
  const response = await fetch(PROJECT_URL);
  const project  = await response.json();

  // Headless: disable built-in plugin UI so our panel runs solo.
  project.plugins.WeddingBandBuilder.showUI = false;

  // Match existing template convention: scale model up on small screens.
  const isMobile = window.matchMedia('(max-width: 900px)').matches;
  if (isMobile && project.plugins.WeddingBandBuilder.defaults) {
    const current = project.plugins.WeddingBandBuilder.defaults.rootScale ?? 0.1;
    project.plugins.WeddingBandBuilder.defaults.rootScale = current * 1.2;
  }

  return project;
}


/* ══════════════════════════════════════════════════════════════════
 *  STEP 2 — BOOT VIEWER
 * ══════════════════════════════════════════════════════════════════ */

function waitForMiniViewerGlobal(timeoutMs) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      if (window.ijewelViewer && window.ijewelViewer.Viewer) {
        resolve();
        return;
      }
      if (Date.now() - start > timeoutMs) {
        reject(new Error('mini-viewer IIFE bundle did not become available in time'));
        return;
      }
      setTimeout(check, 50);
    };
    check();
  });
}

async function bootViewer(project) {
  try {
    await waitForMiniViewerGlobal(15000);
  } catch (err) {
    $('loading').innerHTML =
      '<div style="color:red;padding:20px;font-family:monospace">'
      + 'mini-viewer IIFE bundle failed to load.'
      + '</div>';
    throw err;
  }

  new window.ijewelViewer.Viewer($('root'), project, VIEWER_OPTIONS);
}


/* ══════════════════════════════════════════════════════════════════
 *  STEP 3 — WAIT FOR PLUGIN CONTROLLER
 *  mini-viewer fires `ijewel-viewer-ready` once the Viewer instance
 *  is up; the WBB plugin's `.controller` may lag a few ms behind.
 * ══════════════════════════════════════════════════════════════════ */

function waitForController() {
  return new Promise((resolve, reject) => {
    window.addEventListener('ijewel-viewer-ready', (event) => {
      const viewer = event.detail.viewer;

      let attempts = 0;
      const check = () => {
        const plugin = viewer.getPluginByType('WeddingBandBuilder');
        if (plugin && plugin.controller) {
          resolve(plugin.controller);
          return;
        }
        attempts += 1;
        if (attempts > 120) {
          reject(new Error('WBB controller did not initialise in 12s'));
          return;
        }
        setTimeout(check, 500);
      };

      check();
    }, { once: true });
  });
}


/* ══════════════════════════════════════════════════════════════════
 *  HELPER — create a styled <button class="opt"> with optional icon
 * ══════════════════════════════════════════════════════════════════ */

function createOptionButton(options) {
  const { label, iconUrl, swatchUrl, extraClass, onClick } = options;

  const btn = document.createElement('button');
  btn.className = 'opt ' + (extraClass || '');

  if (swatchUrl) {
    const dot = document.createElement('span');
    dot.className = 'swatch-dot';
    dot.style.backgroundImage = `url(${swatchUrl})`;
    btn.appendChild(dot);
  } else if (iconUrl) {
    const img = document.createElement('img');
    img.src      = iconUrl;
    img.alt      = label || '';
    img.loading  = 'lazy';
    img.decoding = 'async';
    btn.appendChild(img);
  }

  if (label) {
    const span = document.createElement('span');
    span.className   = 'opt-lbl';
    span.textContent = label;
    btn.appendChild(span);
  }

  btn.addEventListener('click', onClick);
  return btn;
}


/* ══════════════════════════════════════════════════════════════════
 *  PROFILE
 * ══════════════════════════════════════════════════════════════════ */

function buildProfileOptions() {
  const host     = $('profile-opts');
  const profiles = state.api.getAvailableProfiles();
  const manifest = state.manifest.profiles || [];

  profiles.forEach((profile) => {
    const manifestEntry = manifest[profile.index] || {};
    const iconUrl       = manifestEntry.iconUrl || profile.thumbnail;

    const btn = createOptionButton({
      label:   profile.name,
      iconUrl: iconUrl,
      onClick: async () => {
        try {
          await state.api.setProfile(profile.index);
          setActive(host, btn);
          $('profile-value').textContent = profile.name;
        } catch (err) {
          showToast('Profile failed: ' + err.message, 'err');
        }
      },
    });

    host.appendChild(btn);
  });
}


/* ══════════════════════════════════════════════════════════════════
 *  PARTITION (number of color zones)
 * ══════════════════════════════════════════════════════════════════ */

function buildPartitionOptions() {
  const host       = $('partition-opts');
  const partitions = state.api.getAvailablePartitions();
  const cutIcons   = (state.manifest.icons && state.manifest.icons.cuts) || {};

  partitions.forEach((label, index) => {
    const key      = String(index + 1);
    const iconUrl  = cutIcons[key];

    const btn = createOptionButton({
      label:   label,
      iconUrl: iconUrl,
      onClick: () => {
        const numColors = label.match(/\d/) ? parseInt(label, 10) : (index + 1);
        state.api.setPartition(numColors);
        $('partition-value').textContent = label;
        setActive(host, btn);
        syncSlotTabsForPartition(numColors);
        renderDivisionOptions();
      },
    });

    host.appendChild(btn);
  });
}


/* ══════════════════════════════════════════════════════════════════
 *  EDGE TYPE + SIDE
 * ══════════════════════════════════════════════════════════════════ */

function buildEdgeOptions() {
  const host      = $('edge-opts');
  const edgeTypes = state.api.getAvailableEdgeTypes();

  edgeTypes.forEach((edgeType) => {
    const btn = createOptionButton({
      label: edgeType.name,
      extraClass: 'text-opt',
      onClick: () => {
        state.api.setEdge(edgeType.id);
        $('edge-value').textContent = edgeType.name;
        $('edge-value').dataset.value = edgeType.id;
        setActive(host, btn);

        // Show/hide edge side field
        const showSide = edgeType.id !== 'None';
        $('edge-side-field').style.display = showSide ? 'block' : 'none';
      },
    });
    btn.dataset.optionId = edgeType.id;
    host.appendChild(btn);
  });

  // Build edge side options dynamically
  const sideHost = $('edge-side-opts');
  const sides = state.api.getAvailableEdgeSides();

  sides.forEach((side) => {
    const btn = createOptionButton({
      label: side.name,
      extraClass: 'text-opt',
      onClick: () => {
        setActive(sideHost, btn);
        const edgeType = $('edge-value').dataset.value;
        if (edgeType && edgeType !== 'None' && edgeType !== '—') {
          state.api.setEdge(edgeType, side.id);
        }
      },
    });
    btn.dataset.optionId = side.id;
    if (side.id === 'Both') btn.classList.add('active');
    sideHost.appendChild(btn);
  });
}


/* ══════════════════════════════════════════════════════════════════
 *  MATERIAL — slot tabs, metal, finish
 * ══════════════════════════════════════════════════════════════════ */

function buildSlotTabs() {
  $$('#slot-tabs button').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (btn.disabled) return;

      $$('#slot-tabs button').forEach((other) => other.classList.remove('active'));
      btn.classList.add('active');
      state.activeSlot = parseInt(btn.dataset.slot, 10);
      syncMaterialUIForActiveSlot();
    });
  });
}

function syncSlotTabsForPartition(partitionCount) {
  $$('#slot-tabs button').forEach((btn, index) => {
    const slotNumber = index + 1;
    btn.disabled     = slotNumber > partitionCount;

    if (slotNumber > partitionCount && btn.classList.contains('active')) {
      btn.classList.remove('active');
      $('slot-tabs').querySelector('button[data-slot="1"]').classList.add('active');
      state.activeSlot = 1;
    }
  });
  syncMaterialUIForActiveSlot();
}

function capitalize(str) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function buildMetalOptions() {
  const host   = $('metal-opts');
  host.innerHTML = '';

  const metals = state.api.getAvailableMetals();

  metals.forEach((metal) => {
    const btn = createOptionButton({
      label:     metal.name,
      swatchUrl: metal.iconUrl || metal.thumbnail,
      onClick: () => {
        const currentFinish = getCurrentFinishForSlot();
        const fallback      = state.api.getAvailableFinishes()[0];
        const finishId      = currentFinish || (fallback && fallback.id) || 'Polished';

        state.api.setMaterial(state.activeSlot, capitalize(metal.id), capitalize(finishId));
        $('metal-value').textContent = metal.name;
        setActive(host, btn);
      },
    });
    host.appendChild(btn);
  });
}

function buildFinishOptions() {
  const host     = $('finish-opts');
  host.innerHTML = '';

  const finishes = state.api.getAvailableFinishes();

  finishes.forEach((finish) => {
    const btn = createOptionButton({
      label:     finish.name,
      swatchUrl: finish.iconUrl || finish.thumbnail,
      onClick: () => {
        const currentMetal = getCurrentMetalForSlot();
        const fallback     = state.api.getAvailableMetals()[0];
        const metalId      = currentMetal || (fallback && fallback.id) || 'Yellow';

        state.api.setMaterial(state.activeSlot, capitalize(metalId), capitalize(finish.id));
        $('finish-value').textContent = finish.name;
        setActive(host, btn);
      },
    });
    host.appendChild(btn);
  });
}


function getCurrentMetalForSlot() {
  const materials = state.api.getMaterials();
  if (!materials || !materials.slots) return null;
  const slot = materials.slots.find((s) => s.slot === state.activeSlot);
  return slot ? slot.metal : null;
}

function getCurrentFinishForSlot() {
  const materials = state.api.getMaterials();
  if (!materials || !materials.slots) return null;
  const slot = materials.slots.find((s) => s.slot === state.activeSlot);
  return slot ? slot.finish : null;
}

function syncMaterialUIForActiveSlot() {
  const materials = state.api.getMaterials();
  if (!materials || !materials.slots) return;

  const slot = materials.slots.find((s) => s.slot === state.activeSlot);
  if (!slot) return;

  $('metal-value').textContent  = slot.metal  || '—';
  $('finish-value').textContent = slot.finish || '—';

  $$('#metal-opts .opt').forEach((btn) => {
    const labelEl = btn.querySelector('.opt-lbl');
    const label   = (labelEl && labelEl.textContent) || '';
    const matches = label.toLowerCase().includes((slot.metal || '').toLowerCase());
    btn.classList.toggle('active', matches);
  });

  $$('#finish-opts .opt').forEach((btn) => {
    const labelEl = btn.querySelector('.opt-lbl');
    const label   = ((labelEl && labelEl.textContent) || '').toLowerCase();
    const matches = label === (slot.finish || '').toLowerCase();
    btn.classList.toggle('active', matches);
  });
}


/* ══════════════════════════════════════════════════════════════════
 *  MATERIAL — toggles (inside polish / split-at-groove / wavy)
 * ══════════════════════════════════════════════════════════════════ */

function makeToggle(el, initial, onChange) {
  let isOn = !!initial;

  function render() {
    el.classList.toggle('on', isOn);
  }

  el.addEventListener('click', () => {
    isOn = !isOn;
    render();
    onChange(isOn);
  });

  el._set = (value) => { isOn = !!value; render(); };

  render();
  return el;
}

function buildMaterialToggles() {
  state.toggleInside = makeToggle(
    $('toggle-inside'),
    true,
    (on) => state.api.setInsidePolished(on),
  );

  state.toggleSplit = makeToggle(
    $('toggle-split'),
    true,
    (on) => state.api.setSplitAtGroove(on),
  );
}


/* ══════════════════════════════════════════════════════════════════
 *  GROOVES — wavy toggle + wavy split
 * ══════════════════════════════════════════════════════════════════ */

function buildGrooveToggles() {
  state.toggleWavy = makeToggle(
    $('toggle-wavy'),
    false,
    (on) => {
      $('wavy-field').style.display = on ? 'block' : 'none';
      $('wavy-hint').style.display = on ? 'none' : 'flex';
      const frequency = parseInt($('wavy-freq').value, 10);
      const amplitude = parseFloat($('wavy-amp').value);
      const wavySplit = state.toggleWavySplit ? state.toggleWavySplit.classList.contains('on') : false;
      state.api.setWavyGrooves(on, frequency, amplitude, wavySplit);

      // Disable diamond position when wavy is enabled
      const posSection = $('position-section');
      const posHint = $('position-disabled-hint');
      if (posSection) posSection.style.opacity = on ? '0.4' : '1';
      if (posSection) posSection.style.pointerEvents = on ? 'none' : 'auto';
      if (posHint) posHint.style.display = on ? 'flex' : 'none';
    },
  );

  state.toggleWavySplit = makeToggle(
    $('toggle-wavy-split'),
    false,
    (on) => {
      const isWavyOn = state.toggleWavy.classList.contains('on');
      if (!isWavyOn) return;
      const frequency = parseInt($('wavy-freq').value, 10);
      const amplitude = parseFloat($('wavy-amp').value);
      state.api.setWavyGrooves(true, frequency, amplitude, on);
    },
  );
}

function buildWavySliders() {
  const applyWavy = debounce(() => {
    const isOn      = state.toggleWavy.classList.contains('on');
    const frequency = parseInt($('wavy-freq').value, 10);
    const amplitude = parseFloat($('wavy-amp').value);
    const wavySplit = state.toggleWavySplit ? state.toggleWavySplit.classList.contains('on') : false;
    state.api.setWavyGrooves(isOn, frequency, amplitude, wavySplit);
  }, 60);

  $('wavy-freq').addEventListener('input', (event) => {
    $('wavy-freq-value').textContent = event.target.value;
    applyWavy();
  });

  $('wavy-amp').addEventListener('input', (event) => {
    const value = parseFloat(event.target.value);
    $('wavy-amp-value').textContent = value.toFixed(2);
    applyWavy();
  });
}


/* ══════════════════════════════════════════════════════════════════
 *  DIAMONDS — setting type chips
 * ══════════════════════════════════════════════════════════════════ */

function buildSettingOptions() {
  const host          = $('setting-opts');
  const settingTypes  = state.api.getAvailableSettingTypes();
  const designIcons   = (state.manifest.icons && state.manifest.icons.design) || {};

  settingTypes.forEach((settingType) => {
    const btn = createOptionButton({
      label:   settingType.name,
      iconUrl: designIcons[settingType.iconKey] || '',
      onClick: () => applyDiamondSetting(settingType.id, settingType.name, btn),
    });

    btn.dataset.optionId = settingType.id;
    host.appendChild(btn);
  });
}

function applyDiamondSetting(settingType, settingName, btn) {
  setActive($('setting-opts'), btn);
  $('setting-value').textContent = settingName;

  if (settingType === 'none') {
    state.api.setDiamonds(null);
    $('diamond-extra').style.display = 'none';
    $('diamond-hint').style.display = 'flex';
    updateDiamondTypeFieldVisibility('none');
    return;
  }

  $('diamond-extra').style.display = 'block';
  $('diamond-hint').style.display = 'none';

  state.api.setDiamonds({ settingType: settingType });
  updateDiamondTypeFieldVisibility(settingType);
}

/* Diamond span, spacing, and position snap option builders */

function buildDiamondSpanOptions() {
  const host = $('span-opts');
  const spans = state.api.getAvailableDiamondSpans();

  spans.forEach((span) => {
    const btn = createOptionButton({
      label: span.name,
      extraClass: 'text-opt',
      onClick: () => {
        setActive(host, btn);
        $('span-value').textContent = span.name;

        const updates = { span: span.id };
        if (span.id === 'custom') {
          $('count-field').style.display = 'block';
          $('computed-count-field').style.display = 'none';
          updates.count = parseInt($('count-slider').value, 10) || 1;
        } else {
          $('count-field').style.display = 'none';
          $('computed-count-field').style.display = 'block';
          updates.count = 0;
        }
        state.api.setDiamonds(updates);
      },
    });
    btn.dataset.optionId = span.id;
    if (span.id === 'full') btn.classList.add('active');
    host.appendChild(btn);
  });
}

function buildDiamondSpacingOptions() {
  const host = $('spacing-opts');
  const spacings = state.api.getAvailableDiamondSpacings()
    .filter((spacing) => typeof spacing.value === 'number');

  spacings.forEach((spacing) => {
    const btn = createOptionButton({
      label: spacing.name,
      extraClass: 'text-opt',
      onClick: () => {
        setActive(host, btn);
        $('spacing-value').textContent = spacing.name;
        state.api.setDiamonds({ spacing: spacing.id });
      },
    });
    btn.dataset.optionId = spacing.id;
    if (spacing.id === 'touching') btn.classList.add('active');
    host.appendChild(btn);
  });
}

function buildDiamondPositionSnaps() {
  const host = $('position-snap-opts');
  const snaps = [
    { key: '-1', label: 'Left' },
    { key: '0',  label: 'Center' },
    { key: '1',  label: 'Right' },
  ];

  snaps.forEach((snap) => {
    const btn = createOptionButton({
      label: snap.label,
      extraClass: 'text-opt',
      onClick: () => {
        setActive(host, btn);
        const val = Number(snap.key);
        $('position-slider').value = val;
        $('position-value').textContent = snap.label;
        $('position-snap-value').textContent = snap.label;
        state.api.setDiamonds({ position: val });
      },
    });
    if (snap.key === '0') btn.classList.add('active');
    host.appendChild(btn);
  });
}


/* ══════════════════════════════════════════════════════════════════
 *  DIAMONDS — count, stone size, position sliders
 * ══════════════════════════════════════════════════════════════════ */

function buildDiamondInputs() {
  $('count-slider').addEventListener('input', (event) => {
    $('count-value').textContent = event.target.value;
    state.api.setDiamonds({ count: parseInt(event.target.value, 10) });
  });

  $('stone-slider').addEventListener('input', (event) => {
    const value = parseFloat(event.target.value);
    $('stone-value').textContent = value.toFixed(2);
    state.api.setDiamonds({ stoneSize: value });
  });

  const applyPosition = debounce((val) => {
    state.api.setDiamonds({ position: val });
  }, 60);

  $('position-slider').addEventListener('input', (event) => {
    const value = parseFloat(event.target.value);
    const label = value <= -0.9 ? 'Left' : value >= 0.9 ? 'Right' : Math.abs(value) < 0.05 ? 'Center' : `${(value * 100).toFixed(0)}%`;
    $('position-value').textContent = label;
    $('position-snap-value').textContent = label;
    applyPosition(value);
  });
}


/* ══════════════════════════════════════════════════════════════════
 *  ENGRAVING
 * ══════════════════════════════════════════════════════════════════ */

function buildEngravingInputs() {
  const apply = debounce(() => {
    const text     = $('engrave-input').value.trim();
    const font     = $('font-select').value;
    const fontSize = parseInt($('font-size-slider').value, 10);
    const rotation = parseInt($('engrave-rotation-slider').value, 10) / 100;

    state.api.setEngraving(text || null, font, fontSize, undefined, rotation);
  }, 120);

  $('engrave-input').addEventListener('input', (event) => {
    $('engrave-count').textContent = `${event.target.value.length}/30`;
    apply();
  });

  $('font-select').addEventListener('change', apply);

  $('font-size-slider').addEventListener('input', (event) => {
    $('font-size-value').textContent = event.target.value;
    apply();
  });

  $('engrave-rotation-slider').addEventListener('input', (event) => {
    const raw = parseInt(event.target.value, 10);
    const degrees = Math.round(raw * 180 / (Math.PI * 100));
    $('engrave-rotation-value').textContent = `${degrees}°`;
    apply();
  });
}

function buildSymbolGrid() {
  const SYMBOLS = [
    { char: '\u2665', title: 'Heart' },
    { char: '\u221E', title: 'Infinity' },
    { char: '\u2605', title: 'Star' },
    { char: '\u2662', title: 'Diamond' },
    { char: '\u2640', title: 'Venus' },
    { char: '\u2642', title: 'Mars' },
    { char: '\u266B', title: 'Music' },
    { char: '\u2764', title: 'Solid Heart' },
    { char: '\u262F', title: 'Yin Yang' },
    { char: '\u2737', title: 'Flower' },
    { char: '\u2600', title: 'Sun' },
    { char: '\u263E', title: 'Moon' },
    { char: '\u2746', title: 'Snowflake' },
    { char: '\u270C', title: 'Peace' },
    { char: '\u2713', title: 'Check' },
    { char: '\u2661', title: 'Heart Outline' },
  ];

  const grid = $('symbol-grid');
  SYMBOLS.forEach((s) => {
    const btn = document.createElement('button');
    btn.className = 'symbol-btn';
    btn.title = s.title;
    btn.textContent = s.char;
    btn.addEventListener('click', () => {
      const input = $('engrave-input');
      input.value += s.char;
      $('engrave-count').textContent = `${input.value.length}/30`;
      const font = $('font-select').value;
      const fontSize = parseInt($('font-size-slider').value, 10);
      state.api.setEngraving(input.value, font, fontSize);
    });
    grid.appendChild(btn);
  });
}


/* ══════════════════════════════════════════════════════════════════
 *  TAPE RULER — reusable helper
 *  Manages pointer-drag on a .tape-wrap, snaps to a step, updates the
 *  clip width and label, and calls onChange with the new value.
 *  Returns a `sync(value)` callback so snapshot sync can push values
 *  back without firing onChange.
 * ══════════════════════════════════════════════════════════════════ */

function setupTapeRuler(opts) {
  const { wrap, clip, ruler, label, min, max, step, rulerUrl, formatLabel, onChange } = opts;

  if (rulerUrl && ruler) ruler.src = rulerUrl;

  const MIN_PCT = 3;
  let current = opts.value != null ? opts.value : min;

  function render(value) {
    const ratio   = max > min ? (value - min) / (max - min) : 0;
    const clamped = Math.max(0, Math.min(1, ratio));
    const pct     = MIN_PCT + clamped * (100 - MIN_PCT);
    clip.style.width = pct + '%';
    if (label) label.textContent = formatLabel ? formatLabel(value) : value.toFixed(2);
  }

  render(current);

  const applyChange = debounce((val) => onChange(val), 40);

  let dragging = false;

  function onDown(event) {
    dragging = true;
    wrap.classList.add('dragging');
    onMove(event);
    event.preventDefault();
  }

  function onMove(event) {
    if (!dragging) return;
    const clientX = ('touches' in event) ? event.touches[0].clientX : event.clientX;
    const rect    = wrap.getBoundingClientRect();
    if (rect.width === 0) return;
    const ratio   = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const raw     = min + ratio * (max - min);
    const stepped = step ? Math.round(raw / step) * step : raw;
    const next    = Math.max(min, Math.min(max, stepped));
    current = next;
    render(next);
    applyChange(next);
  }

  function onUp() {
    dragging = false;
    wrap.classList.remove('dragging');
  }

  wrap.addEventListener('mousedown',  onDown);
  wrap.addEventListener('touchstart', onDown, { passive: false });
  window.addEventListener('mousemove', onMove);
  window.addEventListener('touchmove', onMove, { passive: true });
  window.addEventListener('mouseup',   onUp);
  window.addEventListener('touchend',  onUp);

  return {
    sync(value) { current = value; render(value); },
  };
}


/* ══════════════════════════════════════════════════════════════════
 *  DIMENSIONS — width + thickness tape rulers
 * ══════════════════════════════════════════════════════════════════ */

const WIDTH_MIN  = 0.5;
const WIDTH_MAX  = 2.0;
const HEIGHT_MIN = 0.5;
const HEIGHT_MAX = 1.5;

function buildDimensionSliders() {
  const rulerUrl =
    (state.manifest.icons && state.manifest.icons.design && state.manifest.icons.design.ruler)
    || '';

  const raw = typeof state.api.getRawProfileDimensions === 'function'
    ? state.api.getRawProfileDimensions()
    : { widthMm: 0, heightMm: 0 };

  state.tapeWidth = setupTapeRuler({
    wrap:      $('width-tape'),
    clip:      $('width-clip'),
    ruler:     $('width-ruler'),
    label:     $('width-value'),
    min:       WIDTH_MIN,
    max:       WIDTH_MAX,
    step:      raw.widthMm > 0 ? 0.5 / raw.widthMm : 0.05,
    rulerUrl:  rulerUrl,
    formatLabel: (mult) => {
      const mm = raw.widthMm > 0 ? (raw.widthMm * mult).toFixed(2) + ' mm' : `×${mult.toFixed(2)}`;
      return mm;
    },
    onChange:  (val) => state.api.setWidth(val),
  });

  state.tapeHeight = setupTapeRuler({
    wrap:      $('height-tape'),
    clip:      $('height-clip'),
    ruler:     $('height-ruler'),
    label:     $('height-value'),
    min:       HEIGHT_MIN,
    max:       HEIGHT_MAX,
    step:      raw.heightMm > 0 ? 0.25 / raw.heightMm : 0.05,
    rulerUrl:  rulerUrl,
    formatLabel: (mult) => {
      const mm = raw.heightMm > 0 ? (raw.heightMm * mult).toFixed(2) + ' mm' : `×${mult.toFixed(2)}`;
      return mm;
    },
    onChange:  (val) => state.api.setHeight(val),
  });
}


/* ══════════════════════════════════════════════════════════════════
 *  RING SIZE — tape-ruler slider (mirrors mini-viewer's WBB)
 *  Snaps to standard jeweler sizes (US/EU/UK) and drives the
 *  controller with a radius value in mm.
 * ══════════════════════════════════════════════════════════════════ */

const RING_SIZES = [
  { us: 3,    radiusMm: 7.02,  eu: 44, uk: 'F' },
  { us: 3.5,  radiusMm: 7.22,  eu: 45, uk: 'G' },
  { us: 4,    radiusMm: 7.43,  eu: 47, uk: 'H' },
  { us: 4.5,  radiusMm: 7.64,  eu: 48, uk: 'I' },
  { us: 5,    radiusMm: 7.85,  eu: 49, uk: 'J½' },
  { us: 5.5,  radiusMm: 8.05,  eu: 50, uk: 'K' },
  { us: 6,    radiusMm: 8.26,  eu: 52, uk: 'L½' },
  { us: 6.5,  radiusMm: 8.46,  eu: 53, uk: 'M' },
  { us: 7,    radiusMm: 8.67,  eu: 54, uk: 'N½' },
  { us: 7.5,  radiusMm: 8.87,  eu: 56, uk: 'O' },
  { us: 8,    radiusMm: 9.10,  eu: 57, uk: 'P½' },
  { us: 8.5,  radiusMm: 9.27,  eu: 58, uk: 'Q' },
  { us: 9,    radiusMm: 9.45,  eu: 59, uk: 'R½' },
  { us: 9.5,  radiusMm: 9.68,  eu: 61, uk: 'S' },
  { us: 10,   radiusMm: 9.92,  eu: 62, uk: 'T½' },
  { us: 10.5, radiusMm: 10.13, eu: 64, uk: 'U½' },
  { us: 11,   radiusMm: 10.34, eu: 65, uk: 'V½' },
  { us: 11.5, radiusMm: 10.54, eu: 66, uk: 'W' },
  { us: 12,   radiusMm: 10.74, eu: 67, uk: 'X½' },
  { us: 12.5, radiusMm: 10.95, eu: 68, uk: 'Y' },
  { us: 13,   radiusMm: 11.16, eu: 69, uk: 'Z' },
];

const RING_RADIUS_MIN = RING_SIZES[0].radiusMm;
const RING_RADIUS_MAX = RING_SIZES[RING_SIZES.length - 1].radiusMm;
const TAPE_MIN_PCT    = 3;

function findClosestRingSize(radiusMm) {
  let best = RING_SIZES[0];
  let minDist = Math.abs(radiusMm - best.radiusMm);
  for (const entry of RING_SIZES) {
    const dist = Math.abs(radiusMm - entry.radiusMm);
    if (dist < minDist) { best = entry; minDist = dist; }
  }
  return best;
}

function formatRingSizeLabel(entry, system) {
  if (system === 'US') return String(entry.us);
  if (system === 'EU') return String(entry.eu);
  return entry.uk;
}

function formatRingMeasurement(radiusMm, system) {
  const diamMm = radiusMm * 2;
  if (system === 'US') return (diamMm / 25.4).toFixed(2) + ' in';
  return diamMm.toFixed(1) + ' mm';
}

function buildRingSizeSlider() {
  const wrap       = $('ring-size-tape');
  const clip       = $('ring-size-clip');
  const ruler      = $('ring-size-ruler');
  const valueLabel = $('ring-size-value');

  const rulerUrl =
    (state.manifest.icons && state.manifest.icons.design && state.manifest.icons.design.ruler)
    || '';
  if (rulerUrl) ruler.src = rulerUrl;

  state.sizeSystem = 'EU';

  $$('#size-system-toggle button').forEach((btn) => {
    btn.addEventListener('click', () => {
      $$('#size-system-toggle button').forEach((o) => o.classList.remove('active'));
      btn.classList.add('active');
      state.sizeSystem = btn.dataset.sys;
      refreshLabel();
    });
  });

  function refreshLabel() {
    const dims = state.api.getDimensions();
    if (!dims) return;
    const entry = findClosestRingSize(dims.radiusMm);
    valueLabel.textContent =
      formatRingSizeLabel(entry, state.sizeSystem) + ' · ' +
      formatRingMeasurement(dims.radiusMm, state.sizeSystem);
  }

  function setVisual(radiusMm) {
    const ratio   = (radiusMm - RING_RADIUS_MIN) / (RING_RADIUS_MAX - RING_RADIUS_MIN);
    const clamped = Math.max(0, Math.min(1, ratio));
    const pct     = TAPE_MIN_PCT + clamped * (100 - TAPE_MIN_PCT);
    clip.style.width = pct + '%';
  }

  const applyRingSize = debounce((radiusMm) => {
    if (typeof state.api.setRingSize === 'function') {
      state.api.setRingSize(radiusMm);
    }
  }, 40);

  let dragging = false;

  function onDown(event) {
    dragging = true;
    wrap.classList.add('dragging');
    onMove(event);
    event.preventDefault();
  }

  function onMove(event) {
    if (!dragging) return;
    const clientX = ('touches' in event) ? event.touches[0].clientX : event.clientX;
    const rect    = wrap.getBoundingClientRect();
    if (rect.width === 0) return;
    const ratio   = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const rawR    = RING_RADIUS_MIN + ratio * (RING_RADIUS_MAX - RING_RADIUS_MIN);
    const snapped = findClosestRingSize(rawR).radiusMm;
    setVisual(snapped);
    valueLabel.textContent =
      formatRingSizeLabel(findClosestRingSize(snapped), state.sizeSystem) + ' · ' +
      formatRingMeasurement(snapped, state.sizeSystem);
    applyRingSize(snapped);
  }

  function onUp() {
    dragging = false;
    wrap.classList.remove('dragging');
  }

  wrap.addEventListener('mousedown',  onDown);
  wrap.addEventListener('touchstart', onDown, { passive: false });
  window.addEventListener('mousemove', onMove);
  window.addEventListener('touchmove', onMove, { passive: true });
  window.addEventListener('mouseup',   onUp);
  window.addEventListener('touchend',  onUp);

  // Expose for snapshot sync
  state._syncRingSizeTape = () => {
    const dims = state.api.getDimensions();
    if (!dims) return;
    setVisual(dims.radiusMm);
    refreshLabel();
  };
}


/* ══════════════════════════════════════════════════════════════════
 *  TABS (top of panel)
 * ══════════════════════════════════════════════════════════════════ */

function buildTabs() {
  $$('#tabs .tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      $$('#tabs .tab').forEach((other) => other.classList.remove('active'));
      tab.classList.add('active');

      const paneName = tab.dataset.tab;
      $$('.tab-pane').forEach((pane) => {
        pane.classList.toggle('active', pane.dataset.pane === paneName);
      });

      // The tab strip scrolls horizontally once every section is present,
      // so pull the tab the user just picked fully into view.
      tab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    });
  });
}


/* ══════════════════════════════════════════════════════════════════
 *  BAND SWITCH (Her / His)
 * ══════════════════════════════════════════════════════════════════ */

function buildBandSwitch() {
  $$('#band-switch button').forEach((btn) => {
    btn.addEventListener('click', () => {
      $$('#band-switch button').forEach((other) => other.classList.remove('active'));
      btn.classList.add('active');
      state.api.switchBand(btn.dataset.band);
    });
  });
}


/* ══════════════════════════════════════════════════════════════════
 *  POSES BAR (over the 3D stage)
 * ══════════════════════════════════════════════════════════════════ */

/*  The WBB controller does not natively expose pose switching (no setPose,
 *  no pose:changed emitter from write methods). This builder keeps the bar
 *  visible with cosmetic active-state toggling so the UI slot stays in
 *  place for future wiring — it intentionally does NOT reach into private
 *  plugin internals. */
function buildPosesBar() {
  const host      = $('poses-bar');
  const poseIcons = (state.manifest.icons && state.manifest.icons.poses) || {};
  const order     = ['default', 'crossed', 'stacked', 'nested'];

  order.forEach((poseKey, poseIndex) => {
    const iconUrl = poseIcons[poseKey];
    if (!iconUrl) return;

    const btn = document.createElement('button');
    btn.className = 'pose' + (poseIndex === 0 ? ' active' : '');
    btn.title     = poseKey[0].toUpperCase() + poseKey.slice(1);
    btn.innerHTML = `<img src="${iconUrl}" alt="${poseKey}" loading="lazy" decoding="async">`;

    btn.addEventListener('click', () => {
      $$('.pose', host).forEach((other) => other.classList.remove('active'));
      btn.classList.add('active');
    });

    host.appendChild(btn);
  });
}


/* ══════════════════════════════════════════════════════════════════
 *  EXPORT / IMPORT / CTA
 * ══════════════════════════════════════════════════════════════════ */

function buildExportImportButtons() {
  $('export-btn').addEventListener('click', () => {
    const config = state.api.exportConfig();
    const blob   = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });

    const a = document.createElement('a');
    a.href     = URL.createObjectURL(blob);
    a.download = 'wedding-band-config.json';
    a.click();
    URL.revokeObjectURL(a.href);

    showToast('Configuration exported');
  });

  $('import-btn').addEventListener('click', () => {
    const input  = document.createElement('input');
    input.type   = 'file';
    input.accept = '.json';

    input.onchange = async () => {
      const file = input.files && input.files[0];
      if (!file) return;

      try {
        const text = await file.text();
        const data = JSON.parse(text);
        await state.api.importConfig(data);
        showToast('Configuration imported');
        syncUIFromSnapshot();
      } catch (err) {
        showToast('Import failed: ' + err.message, 'err');
      }
    };

    input.click();
  });
}

function buildCtaButton() {
  $('cta-btn').addEventListener('click', () => {
    const config = state.api.exportConfig();
    console.log('[cart] adding configuration:', config);
    showToast('Added to cart (logged to console)');
  });
}


/* ══════════════════════════════════════════════════════════════════
 *  SPEC SHEET
 *  Opens a printable summary of the current band configuration in a
 *  new tab. Built from the data returned by
 *  controller.getSpecSheetData(bandName) — no external package needed.
 * ══════════════════════════════════════════════════════════════════ */

function buildSpecSheetButton() {
  $('spec-btn').addEventListener('click', () => {
    try {
      const html     = renderSpecSheetHtml(state.bandNames);
      const win      = window.open('', '_blank');
      if (!win) { showToast('Popup blocked', 'err'); return; }
      win.document.write(html);
      win.document.close();
    } catch (err) {
      console.error('[spec] failed:', err);
      showToast('Spec sheet failed: ' + err.message, 'err');
    }
  });
}

function renderSpecSheetHtml(bandNames) {
  const displayTitle = bandNames.map(b => displayBandName(b)).join(' & ');
  const ref          = `WBB-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-001`;
  const today        = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });

  const sheetsHtml = bandNames.map(bandName => {
    const { snapshot, price, diamondSizeInfo, actualDimsMm } =
      state.api.getSpecSheetData(bandName);

    const displayBand = displayBandName(snapshot.bandName);

    const widthMm   = (actualDimsMm && actualDimsMm.widthMm)  ?? snapshot.dimensions.widthMm;
    const heightMm  = (actualDimsMm && actualDimsMm.heightMm) ?? snapshot.dimensions.heightMm;
    const ringSize  = findClosestRingSize(snapshot.dimensions.radiusMm);

    const metalsHtml = snapshot.materials.slots.map((slot) =>
      `<li><strong>${slot.metal}</strong> — ${slot.finish}</li>`
    ).join('');

    const edgeHtml = (snapshot.edge && snapshot.edge.type && snapshot.edge.type !== 'None')
      ? `<section><h3>Edge</h3><p>${snapshot.edge.type} · ${snapshot.edge.side}</p></section>`
      : '';

    let diamondsHtml = '';
    if (snapshot.diamonds && snapshot.diamonds.count > 0) {
      const carats = diamondSizeInfo ? diamondSizeInfo.carats.toFixed(3) : '—';
      const diaMm  = diamondSizeInfo ? diamondSizeInfo.diameterMm.toFixed(2) : '—';
      const total  = price && price.diamonds ? price.diamonds.totalCarats.toFixed(3) : '—';
      diamondsHtml = `
        <section>
          <h3>Diamonds</h3>
          <ul>
            <li><strong>Setting:</strong> ${snapshot.diamonds.settingType}</li>
            <li><strong>Span:</strong> ${snapshot.diamonds.span}</li>
            <li><strong>Count:</strong> ${snapshot.diamonds.count}</li>
            <li><strong>Stone:</strong> ${diaMm} mm (${carats} ct)</li>
            <li><strong>Total:</strong> ${total} ct</li>
          </ul>
        </section>`;
    }

    const engravingHtml = (snapshot.engraving && snapshot.engraving.text)
      ? `<section>
           <h3>Engraving</h3>
           <p class="engrave">“${snapshot.engraving.text}” <span class="muted">· ${snapshot.engraving.font}</span></p>
         </section>`
      : '';

    const priceRow = (label, amount) =>
      `<tr><td>${label}</td><td class="num">$${amount.toFixed(2)}</td></tr>`;

    let pricingHtml = '';
    if (price) {
      const rows = [];
      rows.push(priceRow(`${price.metalPrice.name} (${price.weightGrams.toFixed(2)} g)`, price.metalPrice.totalUsd));
      if (price.makingCharge && price.makingCharge.totalUsd > 0) {
        rows.push(priceRow('Making charge', price.makingCharge.totalUsd));
      }
      if (price.diamonds) {
        rows.push(priceRow(`Diamonds (${price.diamonds.count} · ${price.diamonds.totalCarats.toFixed(3)} ct)`, price.diamonds.totalUsd));
      }
      if (price.settingCost) {
        rows.push(priceRow(`Setting (${price.settingCost.count})`, price.settingCost.totalUsd));
      }
      if (price.finishSurcharge) {
        rows.push(priceRow(`${price.finishSurcharge.name} finish`, price.finishSurcharge.totalUsd));
      }
      if (price.markupMultiplier && price.markupMultiplier !== 1) {
        rows.push(priceRow(`Markup (×${price.markupMultiplier.toFixed(2)})`,
          price.totalBeforeRounding != null
            ? price.totalBeforeRounding - price.subtotalUsd
            : 0));
      }
      pricingHtml = `
        <section>
          <h3>Pricing</h3>
          <table class="price-table">
            <tbody>${rows.join('')}</tbody>
            <tfoot>
              <tr class="total"><td>Total</td><td class="num">$${price.totalUsd.toFixed(2)}</td></tr>
            </tfoot>
          </table>
        </section>`;
    }

    return `
<div class="sheet">
  <header>
    <div>
      <h1>${displayBand} <em>Ring</em></h1>
      <div class="muted" style="font-size:12px;letter-spacing:.08em;margin-top:4px;">Wedding Band · Custom Specification</div>
    </div>
    <div class="meta">
      <div>${ref}</div>
      <div>${today}</div>
    </div>
  </header>

  <div class="grid">
    <section>
      <h3>Profile</h3>
      <p>${snapshot.profile.name}</p>
    </section>

    <section>
      <h3>Dimensions</h3>
      <div class="dims">
        <div><strong>Width</strong> ${widthMm.toFixed(2)} mm</div>
        <div><strong>Thickness</strong> ${heightMm.toFixed(2)} mm</div>
        <div><strong>Inner Ø</strong> ${(snapshot.dimensions.radiusMm * 2).toFixed(2)} mm</div>
        <div><strong>Ring Size</strong> US ${ringSize.us} · EU ${ringSize.eu} · UK ${ringSize.uk}</div>
      </div>
    </section>
  </div>

  <section>
    <h3>Metals · ${snapshot.materials.partition}-color</h3>
    <ul>${metalsHtml}</ul>
  </section>

  ${edgeHtml}
  ${diamondsHtml}
  ${engravingHtml}
  ${pricingHtml}
</div>`;
  }).join('<div class="sheet-divider"></div>');

  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8" />
<title>Spec Sheet · ${displayTitle}</title>
<style>
  :root { --accent: #8b6f3a; --ink: #1a1a1a; --muted: #7a7470; --line: #e4dfd8; }
  * { box-sizing: border-box; }
  body { font-family: 'Inter', system-ui, sans-serif; background: #faf9f6; color: var(--ink); padding: 40px 24px; }
  .sheet { max-width: 820px; margin: 0 auto 40px; background: #fff; border: 1px solid var(--line); padding: 40px 48px; }
  .sheet:last-child { margin-bottom: 0; }
  .sheet-divider { display: none; }
  header { display: flex; justify-content: space-between; align-items: baseline; border-bottom: 2px solid var(--accent); padding-bottom: 16px; margin-bottom: 28px; }
  h1 { font-family: 'Cormorant Garamond', serif; font-size: 32px; font-weight: 500; }
  h1 em { color: var(--accent); font-style: italic; }
  header .meta { text-align: right; font-size: 11px; letter-spacing: .12em; text-transform: uppercase; color: var(--muted); line-height: 1.8; }
  section { margin-bottom: 22px; }
  h3 { font-size: 11px; letter-spacing: .18em; text-transform: uppercase; color: var(--accent); margin-bottom: 8px; }
  ul { list-style: none; padding: 0; font-size: 13px; line-height: 1.8; }
  p { font-size: 13px; line-height: 1.7; }
  .muted { color: var(--muted); }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 22px 40px; }
  .dims { font-size: 13px; line-height: 1.9; }
  .dims strong { display: inline-block; min-width: 110px; color: var(--muted); font-weight: 500; }
  .engrave { font-family: 'Cormorant Garamond', serif; font-size: 18px; }
  .price-table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .price-table td { padding: 7px 0; border-bottom: 1px dashed var(--line); }
  .price-table .num { text-align: right; font-variant-numeric: tabular-nums; }
  .price-table tfoot .total td { border-top: 2px solid var(--ink); border-bottom: 0; padding-top: 10px; font-family: 'Cormorant Garamond', serif; font-size: 18px; font-weight: 600; }
  .toolbar { position: fixed; top: 16px; right: 16px; display: flex; gap: 8px; }
  .toolbar button { padding: 8px 14px; background: var(--ink); color: #fff; border: 0; border-radius: 6px; cursor: pointer; font-size: 12px; letter-spacing: .08em; text-transform: uppercase; }
  @media print { .toolbar { display: none; } body { background: #fff; padding: 0; } .sheet { border: 0; padding: 0; margin-bottom: 40px; } .sheet-divider { display: block; border-top: 2px dashed var(--line); margin: 40px 0; } }
</style>
</head><body>
<div class="toolbar">
  <button onclick="window.print()">Print / Save PDF</button>
</div>
${sheetsHtml}
</body></html>`;
}




/* ══════════════════════════════════════════════════════════════════
 *  MATERIAL — color boundary (division) + segment widths
 * ══════════════════════════════════════════════════════════════════ */

function buildDivisionSection() {
  renderDivisionOptions();

  const applyParams = debounce(() => {
    const frequency = parseInt($('division-freq-slider').value, 10);
    const amplitude = parseFloat($('division-amp-slider').value);
    state.api.setDivisionParams({ frequency, amplitude });
  }, 60);

  $('division-freq-slider').addEventListener('input', (event) => {
    $('division-freq-value').textContent = event.target.value;
    applyParams();
  });

  $('division-amp-slider').addEventListener('input', (event) => {
    const value = parseFloat(event.target.value);
    $('division-amp-value').textContent = value.toFixed(2);
    applyParams();
  });
}

function renderDivisionOptions() {
  const host  = $('division-opts');
  const types = state.api.getAvailableDivisionTypes();
  host.innerHTML = '';

  if (types.length < 2) {
    $('division-field').style.display = 'none';
    $('division-params-field').style.display = 'none';
    $('segment-widths-field').style.display = 'none';
    return;
  }

  $('division-field').style.display = 'block';

  types.forEach((division) => {
    const btn = createOptionButton({
      label: division.name,
      iconUrl: division.iconUrl,
      extraClass: division.iconUrl ? '' : 'text-opt',
      onClick: async () => {
        try {
          await state.api.setDivision(division.id);
          syncDivisionSection();
        } catch (err) {
          showToast('Division failed: ' + err.message, 'err');
        }
      },
    });
    btn.dataset.optionId = division.id;
    host.appendChild(btn);
  });

  syncDivisionSection();
}

function syncDivisionSection() {
  if (!$('division-opts').children.length) return;

  const current = state.api.getDivision();

  $('division-value').textContent =
    (state.api.getAvailableDivisionTypes().find((t) => t.id === current.division) || {}).name
    || current.division;

  $$('#division-opts .opt').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.optionId === current.division);
  });

  const showFreq = current.division === 'wavy';
  const showAmp  = current.division === 'wavy' || current.division === 'diagonal';
  $('division-freq-row').style.display     = showFreq ? 'block' : 'none';
  $('division-amp-row').style.display      = showAmp  ? 'block' : 'none';
  $('division-params-field').style.display = (showFreq || showAmp) ? 'block' : 'none';

  $('division-freq-slider').value      = current.frequency;
  $('division-freq-value').textContent = current.frequency;
  $('division-amp-slider').value       = current.amplitude;
  $('division-amp-value').textContent  = current.amplitude.toFixed(2);

  renderSegmentWidths();
}

function renderSegmentWidths() {
  const host   = $('segment-widths-list');
  const widths = typeof state.api.getSegmentWidthsMm === 'function'
    ? state.api.getSegmentWidthsMm()
    : [];

  if (widths.length < 2) {
    $('segment-widths-field').style.display = 'none';
    return;
  }

  $('segment-widths-field').style.display = 'block';
  host.innerHTML = '';
  const total = widths.reduce((sum, mm) => sum + mm, 0);

  widths.forEach((mm, index) => {
    const row = document.createElement('div');
    row.className = 'field';
    row.innerHTML =
      '<div class="field-head">'
      + `<span class="field-label">Zone ${index + 1}</span>`
      + `<span class="field-value">${mm.toFixed(2)} mm</span>`
      + '</div>'
      + `<input type="range" class="slider" min="0.2" max="${Math.max(total - 0.2, 0.4).toFixed(2)}" step="0.05" value="${mm.toFixed(2)}">`;

    const slider   = row.querySelector('input');
    const valueLbl = row.querySelector('.field-value');

    slider.addEventListener('input', () => {
      valueLbl.textContent = parseFloat(slider.value).toFixed(2) + ' mm';
    });

    slider.addEventListener('change', async () => {
      const next = widths.map((w, i) => (i === index ? parseFloat(slider.value) : w));
      await state.api.setSegmentWidthsMm(next);
      renderSegmentWidths();
    });

    host.appendChild(row);
  });
}


/* ══════════════════════════════════════════════════════════════════
 *  DIAMONDS — type-specific fields (position angle / bridge width / eye)
 * ══════════════════════════════════════════════════════════════════ */

const POSITION_ANGLE_SETTINGS = ['Cross Bezel', 'Cross Channel', 'Cross Around', 'Tension', 'Tension Diagonal', 'Eye'];
const BRIDGE_WIDTH_SETTINGS   = ['Tension', 'Tension Diagonal'];

const debouncedSetDiamonds = debounce((patch) => state.api.setDiamonds(patch), 60);

function buildDiamondTypeExtras() {
  const limits = state.api.getLimits();

  $('position-angle-slider').min = limits.positionAngle.min;
  $('position-angle-slider').max = limits.positionAngle.max;
  $('position-angle-slider').addEventListener('input', (event) => {
    const value = parseFloat(event.target.value);
    $('position-angle-value').textContent = Math.round(value) + '°';
    debouncedSetDiamonds({ positionAngle: value });
  });

  $('bridge-width-slider').min  = limits.bridgeWidth.min;
  $('bridge-width-slider').max  = limits.bridgeWidth.max;
  $('bridge-width-slider').step = limits.bridgeWidth.step || 0.05;
  $('bridge-width-slider').addEventListener('input', (event) => {
    const value = parseFloat(event.target.value);
    $('bridge-width-value').textContent = value.toFixed(2) + ' mm';
    debouncedSetDiamonds({ bridgeWidth: value });
  });

  const host = $('eye-orient-opts');
  state.api.getAvailableEyeOrientations().forEach((option) => {
    const btn = createOptionButton({
      label: option.name,
      extraClass: 'text-opt',
      onClick: () => {
        setActive(host, btn);
        state.api.setDiamonds({ eyeOrient: option.value });
      },
    });
    btn.dataset.optionId = String(option.value);
    host.appendChild(btn);
  });
}

function updateDiamondTypeFieldVisibility(settingType) {
  const showPositionAngle = POSITION_ANGLE_SETTINGS.includes(settingType);
  const showBridgeWidth   = BRIDGE_WIDTH_SETTINGS.includes(settingType);
  const showEyeOrient     = settingType === 'Eye';
  const isFree            = settingType === 'Free';

  $('position-angle-field').style.display = showPositionAngle ? 'block' : 'none';
  $('bridge-width-field').style.display   = showBridgeWidth ? 'block' : 'none';
  $('eye-orient-field').style.display     = showEyeOrient ? 'block' : 'none';

  $('span-field').style.display       = isFree ? 'none' : 'block';
  $('spacing-field').style.display    = isFree ? 'none' : 'block';
  $('stone-size-field').style.display = isFree ? 'none' : 'block';
  $('position-section').style.display = isFree ? 'none' : 'block';
  if (isFree) {
    $('count-field').style.display          = 'none';
    $('computed-count-field').style.display = 'none';
  }

  $('free-stones-field').style.display = isFree ? 'block' : 'none';
  if (isFree) renderFreeStones();
}


/* ══════════════════════════════════════════════════════════════════
 *  DIAMONDS — free stone placement (Free setting)
 * ══════════════════════════════════════════════════════════════════ */

function buildFreeStoneEditor() {
  const presetHost = $('free-preset-opts');
  state.api.getFreeStonePresetOptions().forEach((preset) => {
    const btn = createOptionButton({
      label:      preset.name,
      iconUrl:    preset.iconUrl,
      extraClass: preset.iconUrl ? '' : 'text-opt',
      onClick: () => {
        state.api.applyFreeStonePreset(preset.id);
        renderFreeStones();
      },
    });
    presetHost.appendChild(btn);
  });

  $('free-add-btn').addEventListener('click', () => {
    state.api.addFreeStone();
    renderFreeStones();
  });

  $('free-clear-btn').addEventListener('click', () => {
    state.api.clearFreeStones();
    renderFreeStones();
  });
}

function renderFreeStones() {
  const host   = $('free-stones-list');
  const stones = state.api.getFreeStones();
  const limits = state.api.getLimits();

  $('free-stones-count').textContent = stones.length;
  host.innerHTML = '';

  const FIELD_LABEL = { angleDeg: 'Angle', offset: 'Offset', size: 'Size' };

  stones.forEach((stone, index) => {
    const card = document.createElement('div');
    card.className = 'mini-card';
    card.innerHTML =
      '<div class="mini-card-row">'
      + `<span class="mini-card-title">Stone ${index + 1}</span>`
      + '<div class="mini-card-actions"><button data-action="remove" title="Remove">×</button></div>'
      + '</div>'
      + '<div class="mini-card-body">'
      + `<div><span class="mini-card-sub-label">Angle ${Math.round(stone.angleDeg)}°</span>`
      + `<input type="range" class="slider" data-field="angleDeg" min="0" max="360" step="1" value="${stone.angleDeg}"></div>`
      + `<div><span class="mini-card-sub-label">Offset ${stone.offset.toFixed(2)}</span>`
      + `<input type="range" class="slider" data-field="offset" min="${limits.freeStoneOffset.min}" max="${limits.freeStoneOffset.max}" step="0.05" value="${stone.offset}"></div>`
      + `<div><span class="mini-card-sub-label">Size ${stone.size.toFixed(2)}</span>`
      + `<input type="range" class="slider" data-field="size" min="${limits.stoneSize.min}" max="${limits.stoneSize.max}" step="0.05" value="${stone.size}"></div>`
      + '</div>';

    card.querySelector('[data-action="remove"]').addEventListener('click', () => {
      state.api.removeFreeStone(index);
      renderFreeStones();
    });

    card.querySelectorAll('input[type="range"]').forEach((slider) => {
      const field  = slider.dataset.field;
      const subLbl = slider.previousElementSibling;
      const apply  = debounce((value) => state.api.updateFreeStone(index, { [field]: value }), 60);

      slider.addEventListener('input', () => {
        const value = parseFloat(slider.value);
        const shown = field === 'angleDeg' ? Math.round(value) + '°' : value.toFixed(2);
        subLbl.textContent = `${FIELD_LABEL[field]} ${shown}`;
        apply(value);
      });
    });

    host.appendChild(card);
  });
}


/* ══════════════════════════════════════════════════════════════════
 *  DIAMONDS — smooth seats
 * ══════════════════════════════════════════════════════════════════ */

function buildSmoothSeatsToggle() {
  state.toggleSmoothSeats = makeToggle(
    $('toggle-smooth-seats'),
    false,
    (on) => state.api.setSmoothSeats(on),
  );
}


/* ══════════════════════════════════════════════════════════════════
 *  DIAMONDS — side stone settings (independent of the top setting)
 * ══════════════════════════════════════════════════════════════════ */

function buildSideStoneSection() {
  const host = $('side-setting-opts');
  state.api.getAvailableSideSettingOptions().forEach((option) => {
    const btn = createOptionButton({
      label: option.name,
      extraClass: 'text-opt',
      onClick: () => {
        setActive(host, btn);
        $('side-setting-value').textContent = option.name;
        state.api.setSideSetting(option.id);
        $('side-stones-extra').style.display = option.id === 'none' ? 'none' : 'block';
        if (option.id !== 'none') syncSideStonePanels();
      },
    });
    btn.dataset.optionId = option.id;
    host.appendChild(btn);
  });

  const sidesHost = $('side-sides-opts');
  [['left', 'Left'], ['right', 'Right'], ['both', 'Both']].forEach(([id, label]) => {
    const btn = createOptionButton({
      label,
      extraClass: 'text-opt',
      onClick: () => {
        setActive(sidesHost, btn);
        state.api.setSideBezelSides(id);
        syncSideStonePanels();
      },
    });
    btn.dataset.optionId = id;
    sidesHost.appendChild(btn);
  });

  buildSideBezelPanel('left');
  buildSideBezelPanel('right');

  $('side-copy-btn').addEventListener('click', () => {
    state.api.copySideBezelSide('left');
    syncSideStonePanels();
  });
}

function buildSideBezelPanel(side) {
  const spanHost    = $(`side-${side}-span-opts`);
  const spacingHost = $(`side-${side}-spacing-opts`);
  const slider       = $(`side-${side}-stone-slider`);
  const valueLbl     = $(`side-${side}-stone-value`);

  state.api.getAvailableDiamondSpans()
    .filter((span) => span.id !== 'custom')
    .forEach((span) => {
      const btn = createOptionButton({
        label: span.name,
        extraClass: 'text-opt',
        onClick: () => {
          setActive(spanHost, btn);
          state.api.setSideBezelSide(side, { span: span.id });
        },
      });
      btn.dataset.optionId = span.id;
      spanHost.appendChild(btn);
    });

  state.api.getAvailableDiamondSpacings()
    .filter((spacing) => typeof spacing.value === 'number')
    .forEach((spacing) => {
      const btn = createOptionButton({
        label: spacing.name,
        extraClass: 'text-opt',
        onClick: () => {
          setActive(spacingHost, btn);
          state.api.setSideBezelSide(side, { spacing: spacing.id });
        },
      });
      btn.dataset.optionId = spacing.id;
      spacingHost.appendChild(btn);
    });

  const applyStoneSize = debounce((value) => state.api.setSideBezelSide(side, { stoneSize: value }), 60);
  slider.addEventListener('input', (event) => {
    const value = parseFloat(event.target.value);
    valueLbl.textContent = value.toFixed(2);
    applyStoneSize(value);
  });
}

function syncSideStoneSection() {
  const setting = state.api.getSideSetting();
  const option   = state.api.getAvailableSideSettingOptions().find((o) => o.id === setting);

  $('side-setting-value').textContent = option ? option.name : (setting === 'none' ? 'None' : setting);

  $$('#side-setting-opts .opt').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.optionId === setting);
  });

  $('side-stones-extra').style.display = setting === 'none' ? 'none' : 'block';
  if (setting === 'none') return;

  syncSideStonePanels();
}

function syncSideStonePanels() {
  const bezel = state.api.getSideBezel();

  $$('#side-sides-opts .opt').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.optionId === bezel.sides);
  });

  $('side-left-panel').style.display  = (bezel.sides === 'left'  || bezel.sides === 'both') ? 'block' : 'none';
  $('side-right-panel').style.display = (bezel.sides === 'right' || bezel.sides === 'both') ? 'block' : 'none';

  syncSideBezelPanelValues('left', bezel.left);
  syncSideBezelPanelValues('right', bezel.right);
}

function syncSideBezelPanelValues(side, cfg) {
  $$(`#side-${side}-span-opts .opt`).forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.optionId === cfg.span);
  });
  $$(`#side-${side}-spacing-opts .opt`).forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.optionId === cfg.spacing);
  });
  $(`side-${side}-stone-slider`).value      = cfg.stoneSize;
  $(`side-${side}-stone-value`).textContent = cfg.stoneSize.toFixed(2);
}


/* ══════════════════════════════════════════════════════════════════
 *  GROOVES — separation joint (material-boundary groove)
 * ══════════════════════════════════════════════════════════════════ */

function buildSeparationGrooveEditor() {
  const limits = state.api.getLimits();

  state.toggleSepGroove = makeToggle(
    $('toggle-sep-groove'),
    false,
    async (on) => {
      $('sep-groove-field').style.display = on ? 'block' : 'none';
      await state.api.setSeparationGroove({ enabled: on });
      renderSeparationBoundaries();
    },
  );

  const typeHost = $('sep-type-opts');
  state.api.getAvailableGrooveTypes().forEach((type) => {
    const btn = createOptionButton({
      label: type.name,
      iconUrl: type.iconUrl,
      extraClass: type.iconUrl ? '' : 'text-opt',
      onClick: () => {
        setActive(typeHost, btn);
        state.api.setSeparationGroove({ type: type.id });
      },
    });
    btn.dataset.optionId = type.id;
    typeHost.appendChild(btn);
  });

  $('sep-width-slider').min  = limits.grooveWidth.min;
  $('sep-width-slider').max  = limits.grooveWidth.max;
  $('sep-width-slider').step = limits.grooveWidth.step || 0.01;
  const applyWidth = debounce((value) => state.api.setSeparationGroove({ width: value }), 60);
  $('sep-width-slider').addEventListener('input', (event) => {
    const value = parseFloat(event.target.value);
    $('sep-width-value').textContent = value.toFixed(2) + ' mm';
    applyWidth(value);
  });

  $('sep-depth-slider').min  = limits.grooveDepth.min;
  $('sep-depth-slider').max  = limits.grooveDepth.max;
  $('sep-depth-slider').step = limits.grooveDepth.step || 0.01;
  const applyDepth = debounce((value) => state.api.setSeparationGroove({ depth: value }), 60);
  $('sep-depth-slider').addEventListener('input', (event) => {
    const value = parseFloat(event.target.value);
    $('sep-depth-value').textContent = value.toFixed(2) + ' mm';
    applyDepth(value);
  });

  $('sep-angle-slider').min = limits.grooveAngle.min;
  $('sep-angle-slider').max = limits.grooveAngle.max;
  const applyAngle = debounce((value) => state.api.setSeparationGroove({ angle: value }), 60);
  $('sep-angle-slider').addEventListener('input', (event) => {
    const value = parseFloat(event.target.value);
    $('sep-angle-value').textContent = Math.round(value) + '°';
    applyAngle(value);
  });

  const finishHost = $('sep-finish-opts');
  state.api.getAvailableGrooveFinishes().forEach((finish) => {
    const btn = createOptionButton({
      label: finish.name,
      extraClass: 'text-opt',
      onClick: () => {
        setActive(finishHost, btn);
        state.api.setSeparationGroove({ finish: finish.id });
      },
    });
    btn.dataset.optionId = finish.id;
    finishHost.appendChild(btn);
  });
}

function renderSeparationBoundaries() {
  const host      = $('sep-boundary-opts');
  const materials = state.api.getMaterials();
  const partition = materials ? materials.partition : 1;
  const count     = Math.max(partition - 1, 0);
  const groove    = state.api.getSeparationGroove();

  host.innerHTML = '';
  if (count === 0) return;

  for (let i = 0; i < count; i += 1) {
    const isOn = groove.boundaries[i] !== false;
    const btn = createOptionButton({
      label: `Joint ${i + 1}`,
      extraClass: 'text-opt' + (isOn ? ' active' : ''),
      onClick: () => {
        const boundaries = state.api.getSeparationGroove().boundaries.slice();
        while (boundaries.length < count) boundaries.push(true);
        boundaries[i] = !btn.classList.contains('active');
        btn.classList.toggle('active');
        state.api.setSeparationGroove({ boundaries });
      },
    });
    host.appendChild(btn);
  }
}

function syncSeparationGrooveSection() {
  const groove = state.api.getSeparationGroove();

  if (state.toggleSepGroove) state.toggleSepGroove._set(groove.enabled);
  $('sep-groove-field').style.display = groove.enabled ? 'block' : 'none';

  $$('#sep-type-opts .opt').forEach((btn) => btn.classList.toggle('active', btn.dataset.optionId === groove.type));
  $('sep-width-slider').value      = groove.width;
  $('sep-width-value').textContent = groove.width.toFixed(2) + ' mm';
  $('sep-depth-slider').value      = groove.depth;
  $('sep-depth-value').textContent = groove.depth.toFixed(2) + ' mm';
  $('sep-angle-slider').value      = groove.angle;
  $('sep-angle-value').textContent = Math.round(groove.angle) + '°';
  $$('#sep-finish-opts .opt').forEach((btn) => btn.classList.toggle('active', btn.dataset.optionId === groove.finish));

  renderSeparationBoundaries();
}


/* ══════════════════════════════════════════════════════════════════
 *  GROOVES — design grooves (freely placed decorative grooves)
 * ══════════════════════════════════════════════════════════════════ */

function buildDesignGrooveEditor() {
  $('design-groove-add-btn').addEventListener('click', () => {
    state.api.addDesignGroove();
    renderDesignGrooves();
  });

  $('design-groove-clear-btn').addEventListener('click', () => {
    state.api.clearDesignGrooves();
    renderDesignGrooves();
  });
}

function renderDesignGrooves() {
  const host       = $('design-groove-list');
  const grooves    = state.api.getDesignGrooves();
  const limits     = state.api.getLimits();
  const types      = state.api.getAvailableGrooveTypes();
  const directions = state.api.getAvailableGrooveDirections();
  const finishes   = state.api.getAvailableGrooveFinishes();

  $('design-groove-count').textContent = grooves.length;
  host.innerHTML = '';

  const SLIDER_LABEL = { position: 'Position', positionAngle: 'Position Angle', width: 'Width', depth: 'Depth' };

  grooves.forEach((groove, index) => {
    const card = document.createElement('div');
    card.className = 'mini-card';

    const optionsHtml = (list, selected) => list.map((entry) =>
      `<option value="${entry.id}"${entry.id === selected ? ' selected' : ''}>${entry.name}</option>`).join('');

    const isHorizontal = groove.orientation === 'horizontal';

    card.innerHTML =
      '<div class="mini-card-row">'
      + `<span class="mini-card-title">Groove ${index + 1}</span>`
      + '<div class="mini-card-actions"><button data-action="remove" title="Remove">×</button></div>'
      + '</div>'
      + '<div class="mini-card-body">'
      + `<select class="select-input" data-field="type">${optionsHtml(types, groove.type)}</select>`
      + `<select class="select-input" data-field="orientation">${optionsHtml(directions, groove.orientation)}</select>`
      + `<div data-role="position-row"><span class="mini-card-sub-label">Position ${groove.position.toFixed(2)} mm</span>`
      + `<input type="range" class="slider" data-field="position" min="-3" max="3" step="0.05" value="${groove.position}"></div>`
      + `<div data-role="angle-row" style="display:${isHorizontal ? 'block' : 'none'}"><span class="mini-card-sub-label">Position Angle ${Math.round(groove.positionAngle || 0)}°</span>`
      + `<input type="range" class="slider" data-field="positionAngle" min="${limits.positionAngle.min}" max="${limits.positionAngle.max}" step="1" value="${groove.positionAngle || 0}"></div>`
      + `<span class="mini-card-sub-label">Width ${groove.width.toFixed(2)} mm</span>`
      + `<input type="range" class="slider" data-field="width" min="${limits.grooveWidth.min}" max="${limits.grooveWidth.max}" step="0.01" value="${groove.width}">`
      + `<span class="mini-card-sub-label">Depth ${groove.depth.toFixed(2)} mm</span>`
      + `<input type="range" class="slider" data-field="depth" min="${limits.grooveDepth.min}" max="${limits.grooveDepth.max}" step="0.01" value="${groove.depth}">`
      + `<select class="select-input" data-field="finish">${optionsHtml(finishes, groove.finish)}</select>`
      + '</div>';

    card.querySelector('[data-action="remove"]').addEventListener('click', () => {
      state.api.removeDesignGroove(index);
      renderDesignGrooves();
    });

    card.querySelector('[data-field="type"]').addEventListener('change', (event) => {
      state.api.updateDesignGroove(index, { type: event.target.value });
    });

    card.querySelector('[data-field="orientation"]').addEventListener('change', (event) => {
      state.api.updateDesignGroove(index, { orientation: event.target.value });
      renderDesignGrooves();
    });

    card.querySelector('[data-field="finish"]').addEventListener('change', (event) => {
      state.api.updateDesignGroove(index, { finish: event.target.value });
    });

    ['position', 'positionAngle', 'width', 'depth'].forEach((field) => {
      const slider = card.querySelector(`[data-field="${field}"]`);
      if (!slider) return;
      const label = slider.previousElementSibling;
      const apply = debounce((value) => state.api.updateDesignGroove(index, { [field]: value }), 60);
      slider.addEventListener('input', () => {
        const value  = parseFloat(slider.value);
        const suffix = field === 'positionAngle' ? '°' : ' mm';
        const shown  = field === 'positionAngle' ? Math.round(value) : value.toFixed(2);
        label.textContent = `${SLIDER_LABEL[field]} ${shown}${suffix}`;
        apply(value);
      });
    });

    host.appendChild(card);
  });
}


/* ══════════════════════════════════════════════════════════════════
 *  RINGS — compilation (add / remove / reorder / metal / visibility)
 * ══════════════════════════════════════════════════════════════════ */

function buildRingsSection() {
  renderRingCatalog('engagement', $('engagement-catalog-opts'));
  renderRingCatalog('memoire', $('memoire-catalog-opts'));
  renderRings();
}

function renderRingCatalog(type, host) {
  const catalog = state.api.getRingCatalog(type);
  host.innerHTML = '';

  catalog.forEach((entry) => {
    const btn = createOptionButton({
      label:   entry.name,
      iconUrl: entry.thumbnail,
      onClick: async () => {
        try {
          await state.api.addRing(type, entry.id);
          renderRings();
        } catch (err) {
          showToast('Add ring failed: ' + err.message, 'err');
        }
      },
    });
    host.appendChild(btn);
  });
}

function renderRings() {
  const host   = $('rings-list');
  const rings  = state.api.getRings();
  const metals = state.api.getAvailableMetals();

  host.innerHTML = '';

  rings.forEach((ring) => {
    const card = document.createElement('div');
    card.className = 'mini-card';

    const isWedding = ring.type === 'wedding';
    const canRemove = !isWedding || rings.filter((r) => r.type === 'wedding').length > 1;

    const metalSwatches = isWedding ? '' : metals.map((metal) =>
      `<button class="opt sq" data-metal="${metal.id}" style="width:32px;height:32px;padding:2px" title="${metal.name}">`
      + `<span class="swatch-dot" style="width:100%;height:100%;background-image:url(${metal.iconUrl || metal.thumbnail || ''})"></span>`
      + '</button>').join('');

    card.innerHTML =
      '<div class="mini-card-row">'
      + `<span class="mini-card-title">${ring.name}</span>`
      + `<span class="mini-card-badge">${ring.type}</span>`
      + '</div>'
      + '<div class="mini-card-actions" style="margin-top:8px">'
      + '<button data-action="focus" title="Focus">◎</button>'
      + '<button data-action="left" title="Move left">←</button>'
      + '<button data-action="right" title="Move right">→</button>'
      + `<button data-action="visible" title="Show/Hide">${ring.visible === false ? '☐' : '☑'}</button>`
      + '<button data-action="rename" title="Rename">✎</button>'
      + `<button data-action="remove" title="Remove"${canRemove ? '' : ' disabled'}>×</button>`
      + '</div>'
      + (metalSwatches ? `<div class="mini-card-body"><div class="opt-row">${metalSwatches}</div></div>` : '');

    card.querySelector('[data-action="focus"]').addEventListener('click', () => state.api.focusRing(ring.id));
    card.querySelector('[data-action="left"]').addEventListener('click', () => { state.api.moveRing(ring.id, 'left'); renderRings(); });
    card.querySelector('[data-action="right"]').addEventListener('click', () => { state.api.moveRing(ring.id, 'right'); renderRings(); });
    card.querySelector('[data-action="visible"]').addEventListener('click', () => {
      state.api.setRingVisible(ring.id, ring.visible === false);
      renderRings();
    });
    card.querySelector('[data-action="rename"]').addEventListener('click', () => {
      const next = window.prompt('Rename ring', ring.name);
      if (next && next.trim()) {
        state.api.renameRing(ring.id, next.trim());
        renderRings();
      }
    });
    card.querySelector('[data-action="remove"]').addEventListener('click', () => {
      if (!canRemove) return;
      state.api.removeRing(ring.id);
      renderRings();
    });

    card.querySelectorAll('[data-metal]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        await state.api.setRingMetal(ring.id, btn.dataset.metal);
      });
    });

    host.appendChild(card);
  });
}


/* ══════════════════════════════════════════════════════════════════
 *  THEME
 * ══════════════════════════════════════════════════════════════════ */

const THEME_SWATCH_COLORS = {
  'default':        '#1a1a1a',
  'luxury-gold':    '#8B7355',
  'modern-minimal': '#000000',
  'dark':           '#E0D5C5',
  'rose-elegant':   '#9E7B70',
  'coral-modern':   '#E04E5E',
  'fresh-teal':     '#5ABFBF',
  'minimal-blue':   '#0071E3',
  'warm-beige':     '#6B9AC4',
  'ijewel':         '#6E73F2',
  'classic-gold':   '#B8860B',
};

function buildThemeSection() {
  const host = $('theme-opts');

  state.api.getAvailableThemes().forEach((name) => {
    const btn = document.createElement('button');
    btn.className = 'theme-swatch';
    btn.dataset.optionId = name;
    btn.innerHTML =
      `<span class="theme-swatch-dot" style="background:${THEME_SWATCH_COLORS[name] || '#999'}"></span>`
      + `<span class="theme-swatch-lbl">${formatThemeName(name)}</span>`;
    btn.addEventListener('click', () => applyTheme(name));
    host.appendChild(btn);
  });

  $('theme-cycle-btn').addEventListener('click', () => {
    const next = state.api.cycleTheme();
    syncThemeSection(next);
  });

  syncThemeSection('default');
}

function formatThemeName(id) {
  return id.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function applyTheme(name) {
  state.api.setTheme(name);
  syncThemeSection(name);
  applyThemeToHostPage();
}

function applyThemeToHostPage() {
  const vars = state.api.getThemeCSSVariables();
  const root = document.documentElement.style;
  if (vars['--rb-color-primary'])    root.setProperty('--accent', vars['--rb-color-primary']);
  if (vars['--rb-color-text'])       root.setProperty('--ink', vars['--rb-color-text']);
  if (vars['--rb-color-background']) root.setProperty('--bg', vars['--rb-color-background']);
  if (vars['--rb-color-surface'])    root.setProperty('--surface', vars['--rb-color-surface']);
  if (vars['--rb-color-border'])     root.setProperty('--line', vars['--rb-color-border']);
}

function syncThemeSection(name) {
  $('theme-value').textContent = formatThemeName(name);
  $$('#theme-opts .theme-swatch').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.optionId === name);
  });
}


/* ══════════════════════════════════════════════════════════════════
 *  SYNC UI FROM CONTROLLER SNAPSHOT
 *  Called on boot and after every import / band switch.
 * ══════════════════════════════════════════════════════════════════ */

function syncUIFromSnapshot() {
  const snap = state.api.getSnapshot();
  if (!snap) return;

  syncProfileSection(snap);
  syncDimensionSection(snap);
  syncPartitionAndMaterial(snap);
  syncEdgeSection(snap);
  syncDiamondSection(snap);
  syncEngravingSection(snap);
  syncGroovesSection();

  syncSideStoneSection();
  syncSeparationGrooveSection();
  renderDesignGrooves();
  if (state.toggleSmoothSeats) state.toggleSmoothSeats._set(state.api.getSmoothSeats());

  syncMaterialUIForActiveSlot();

  // Refresh all band prices from the controller (not just snap.pricing,
  // which is only the active band).
  if (state.bandNames && state.bandNames.length) {
    state.bandNames.forEach((name) => {
      state.prices[name] = state.api.getPrice(name) || null;
    });
    renderPriceBar();
  }
}

function syncProfileSection(snap) {
  const profile = snap.profile;
  $('profile-value').textContent = (profile && profile.name) || '—';

  $$('#profile-opts .opt').forEach((btn, index) => {
    btn.classList.toggle('active', profile && index === profile.index);
  });
}

function syncDimensionSection(snap) {
  const dims = snap.dimensions || {};

  const widthMult  = dims.widthMm  != null ? dims.widthMm  : 1;
  const heightMult = dims.heightMm != null ? dims.heightMm : 1;
  const radiusMm   = dims.radiusMm != null ? dims.radiusMm : 10;

  $('width-value').textContent  = `×${widthMult.toFixed(2)}`;
  $('height-value').textContent = `×${heightMult.toFixed(2)}`;

  $('dim-w').textContent = widthMult.toFixed(2);
  $('dim-h').textContent = heightMult.toFixed(2);
  $('dim-r').textContent = radiusMm.toFixed(2) + ' mm';

  if (state.tapeWidth  && dims.widthMm  != null) state.tapeWidth.sync(dims.widthMm);
  if (state.tapeHeight && dims.heightMm != null) state.tapeHeight.sync(dims.heightMm);
  if (state._syncRingSizeTape) state._syncRingSizeTape();
}

function syncPartitionAndMaterial(snap) {
  const materials    = snap.materials || {};
  const partitions   = state.api.getAvailablePartitions();
  const currentIndex = (materials.partition || 1) - 1;

  $('partition-value').textContent = partitions[currentIndex] || '—';

  $$('#partition-opts .opt').forEach((btn, index) => {
    btn.classList.toggle('active', index + 1 === materials.partition);
  });

  syncSlotTabsForPartition(materials.partition || 1);

  if (materials.insidePolished != null && state.toggleInside) {
    state.toggleInside._set(materials.insidePolished);
  }
  if (materials.splitAtGroove != null && state.toggleSplit) {
    state.toggleSplit._set(materials.splitAtGroove);
  }

  renderDivisionOptions();
}

function syncEdgeSection(snap) {
  const edge = snap.edge || {};
  const edgeType = state.api.getAvailableEdgeTypes().find((option) => option.id === edge.type);
  $('edge-value').textContent = edgeType ? edgeType.name : (edge.type || 'None');
  $('edge-value').dataset.value = edge.type || 'None';

  $$('#edge-opts .opt').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.optionId === (edge.type || 'None'));
  });

  // Show/hide edge side field
  const showSide = edge.type && edge.type !== 'None';
  $('edge-side-field').style.display = showSide ? 'block' : 'none';

  $$('#edge-side-opts .opt').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.optionId === (edge.side || 'Both'));
  });

}

function syncDiamondSection(snap) {
  const diamonds = snap.diamonds;

  if (!diamonds) {
    $('setting-value').textContent   = 'None';
    $('diamond-extra').style.display = 'none';
    $('diamond-hint').style.display = 'flex';
    $$('#setting-opts .opt').forEach((btn, index) => btn.classList.toggle('active', index === 0));
    updateDiamondTypeFieldVisibility('none');
    return;
  }

  const settingType = state.api.getAvailableSettingTypes()
    .find((option) => option.id === diamonds.settingType);
  $('setting-value').textContent   = settingType ? settingType.name : diamonds.settingType;
  $('diamond-extra').style.display = 'block';
  $('diamond-hint').style.display = 'none';

  $$('#setting-opts .opt').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.optionId === diamonds.settingType);
  });

  // Sync span
  if (diamonds.span) {
    const span = state.api.getAvailableDiamondSpans()
      .find((option) => option.id === diamonds.span);
    $('span-value').textContent = span ? span.name : diamonds.span;
    $$('#span-opts .opt').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.optionId === diamonds.span);
    });
    if (diamonds.span === 'custom') {
      $('count-field').style.display = 'block';
      $('computed-count-field').style.display = 'none';
    } else {
      $('count-field').style.display = 'none';
      $('computed-count-field').style.display = 'block';
    }
  }

  // Sync spacing
  if (diamonds.spacing) {
    const spacing = state.api.getAvailableDiamondSpacings()
      .find((option) => option.id === diamonds.spacing);
    $('spacing-value').textContent = spacing ? spacing.name : diamonds.spacing;
    $$('#spacing-opts .opt').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.optionId === diamonds.spacing);
    });
  }

  const count     = diamonds.count     != null ? diamonds.count     : 0;
  const stoneSize = diamonds.stoneSize != null ? diamonds.stoneSize : 1.5;
  const position  = diamonds.position  != null ? diamonds.position  : 0;

  $('count-slider').value             = Math.max(count, 1);
  $('count-value').textContent        = count;
  $('computed-count-value').textContent = count;
  $('stone-slider').value             = stoneSize;
  $('stone-value').textContent        = stoneSize.toFixed(2);
  $('position-slider').value          = position;
  const posLabel = position <= -0.9 ? 'Left' : position >= 0.9 ? 'Right' : Math.abs(position) < 0.05 ? 'Center' : `${(position * 100).toFixed(0)}%`;
  $('position-value').textContent     = posLabel;
  $('position-snap-value').textContent = posLabel;

  updateDiamondTypeFieldVisibility(diamonds.settingType);

  const diamondRawState = state.api.getRawState();
  if (diamondRawState) {
    if (diamondRawState.diamondPositionAngle != null) {
      $('position-angle-slider').value      = diamondRawState.diamondPositionAngle;
      $('position-angle-value').textContent = Math.round(diamondRawState.diamondPositionAngle) + '°';
    }
    if (diamondRawState.tensionBridgeWidth != null) {
      $('bridge-width-slider').value      = diamondRawState.tensionBridgeWidth;
      $('bridge-width-value').textContent = diamondRawState.tensionBridgeWidth.toFixed(2) + ' mm';
    }
    if (diamondRawState.eyeOrientDeg != null) {
      $$('#eye-orient-opts .opt').forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.optionId === String(diamondRawState.eyeOrientDeg));
      });
    }
  }
}

function syncEngravingSection(snap) {
  const engraving = snap.engraving;
  const text      = (engraving && engraving.text) || '';

  $('engrave-input').value         = text;
  $('engrave-count').textContent   = `${text.length}/30`;

  if (engraving && engraving.font) {
    $('font-select').value = engraving.font;
  }

  const rawState = state.api.getRawState();
  if (!rawState) return;

  const fontSize = rawState.engravingFontSize ?? 80;
  $('font-size-slider').value      = fontSize;
  $('font-size-value').textContent = fontSize;

  const rotation = rawState.engravingRotation ?? Math.PI / 12;
  const raw      = Math.round(rotation * 100);
  $('engrave-rotation-slider').value      = raw;
  $('engrave-rotation-value').textContent = `${Math.round(raw * 180 / (Math.PI * 100))}°`;
}

function syncGroovesSection() {
  const rawState = state.api.getRawState();
  if (!rawState) return;

  const wavyOn = rawState.wavyGrooves || false;
  if (state.toggleWavy) state.toggleWavy._set(wavyOn);
  $('wavy-field').style.display = wavyOn ? 'block' : 'none';
  $('wavy-hint').style.display = wavyOn ? 'none' : 'flex';

  if (rawState.wavyFrequency != null) {
    $('wavy-freq').value = rawState.wavyFrequency;
    $('wavy-freq-value').textContent = rawState.wavyFrequency;
  }
  if (rawState.wavyAmplitude != null) {
    $('wavy-amp').value = rawState.wavyAmplitude;
    $('wavy-amp-value').textContent = rawState.wavyAmplitude.toFixed(2);
  }
  if (state.toggleWavySplit && rawState.wavySplit != null) {
    state.toggleWavySplit._set(rawState.wavySplit);
  }

  // Disable diamond position when wavy is on
  const posSection = $('position-section');
  const posHint = $('position-disabled-hint');
  if (posSection) posSection.style.opacity = wavyOn ? '0.4' : '1';
  if (posSection) posSection.style.pointerEvents = wavyOn ? 'none' : 'auto';
  if (posHint) posHint.style.display = wavyOn ? 'flex' : 'none';
}


/* ══════════════════════════════════════════════════════════════════
 *  PRICE DISPLAY — per-band breakdown + total
 *  state.prices keeps a per-band PriceBreakdown so every render uses
 *  the latest values for both Her and His, not just the active band.
 * ══════════════════════════════════════════════════════════════════ */

function displayBandName(name) {
  return name ? name.charAt(0).toUpperCase() + name.slice(1) : '';
}

function formatDollars(value) {
  return '$' + Math.round(value).toLocaleString();
}

function buildPriceDetail(pricing) {
  if (!pricing) return '—';
  const parts = [];
  parts.push(`${pricing.weightGrams.toFixed(1)}g · metal ${formatDollars(pricing.metalPrice.totalUsd)}`);
  if (pricing.makingCharge && pricing.makingCharge.totalUsd > 0) {
    parts.push(`making ${formatDollars(pricing.makingCharge.totalUsd)}`);
  }
  if (pricing.diamonds && pricing.diamonds.count > 0) {
    parts.push(`${pricing.diamonds.count} dia ${formatDollars(pricing.diamonds.totalUsd)}`);
  }
  if (pricing.settingCost && pricing.settingCost.totalUsd > 0) {
    parts.push(`setting ${formatDollars(pricing.settingCost.totalUsd)}`);
  }
  if (pricing.finishSurcharge && pricing.finishSurcharge.totalUsd > 0) {
    parts.push(`${pricing.finishSurcharge.name} ${formatDollars(pricing.finishSurcharge.totalUsd)}`);
  }
  return parts.join(' · ');
}

function renderPriceBar() {
  const host    = $('price-lines');
  const names   = state.bandNames || [];
  const prices  = state.prices || {};

  host.innerHTML = '';

  let total = 0;
  let anyPrice = false;

  names.forEach((name) => {
    const pricing = prices[name] || null;
    if (pricing) { total += pricing.totalUsd; anyPrice = true; }

    const line = document.createElement('div');
    line.className = 'price-line';
    line.innerHTML =
      `<span class="price-line-label">${displayBandName(name)}</span>` +
      `<span class="price-line-detail">${buildPriceDetail(pricing)}</span>` +
      `<span class="price-line-amount">${pricing ? formatDollars(pricing.totalUsd) : '—'}</span>`;
    host.appendChild(line);
  });

  const totalRow = $('price-total-row');
  if (names.length > 1) {
    totalRow.hidden = false;
    $('price-total').textContent = anyPrice ? formatDollars(total) : '—';
  } else {
    totalRow.hidden = true;
  }
}


/* ══════════════════════════════════════════════════════════════════
 *  EVENTS (from the controller)
 * ══════════════════════════════════════════════════════════════════ */

function subscribeToEvents() {
  const events = state.api.events;
  if (!events || typeof events.on !== 'function') return;

  events.on('band:switched',  () => syncUIFromSnapshot());
  events.on('build:started',  () => $('build-badge').classList.add('show'));
  events.on('build:complete', () => $('build-badge').classList.remove('show'));

  events.on('price:updated', (data) => {
    if (data && data.bandName) {
      state.prices[data.bandName] = data.pricing || null;
    }
    renderPriceBar();
  });

  events.on('dimensions:changed', () => {
    const dims = state.api.getDimensions();
    if (!dims) return;
    $('dim-w').textContent = dims.widthMm.toFixed(2)  + ' mm';
    $('dim-h').textContent = dims.heightMm.toFixed(2) + ' mm';
    $('dim-r').textContent = dims.radiusMm.toFixed(2) + ' mm';
  });

  events.on('validation:warning', (data) => {
    showToast(
      `${data.field}: clamped to ${data.corrected} (sent ${data.provided})`,
      'warn',
    );
  });

  events.on('rings:changed', () => renderRings());

  events.on('material:changed', () => syncDivisionSection());

  events.on('compatibility:resolved', (data) => {
    if (data && data.message) showToast(data.message, 'warn');
  });

  events.on('error', (data) => {
    showToast(data.message || 'Unknown error', 'err');
  });
}


/* ══════════════════════════════════════════════════════════════════
 *  GO
 * ══════════════════════════════════════════════════════════════════ */

init().catch((err) => {
  console.error('[custom-ui] init failed:', err);
  showToast('Init failed: ' + err.message, 'err');
});
