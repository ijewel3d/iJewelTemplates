/* ════════════════════════════════════════════════════════════════════
 *  Virtual Try-On — Custom UI
 *
 *  Loads a Drive model with the Mini Viewer, keeps the viewer's own
 *  try-on button hidden, and drives RingTryonPlugin from this page's
 *  interface instead.
 *
 *  Flow:
 *    1. 'ijewel-file-data'    → the Drive file, carrying tryonConfig
 *    2. 'ijewel-viewer-ready' → the viewer instance
 *    3. gate on tryonConfig.enabled and canRunVTO()
 *    4. add RingTryonPlugin + TryonUIPlugin, apply the editor placement
 *    5. wire this page's buttons to start / stop / flip / finger
 *
 *  Prerequisite: the model must have try-on enabled and saved in the
 *  editor (TryOn Settings tab -> Enable AR -> fit -> Save). Step 3
 *  bails out otherwise, which is why the button can stay hidden even
 *  though every line here ran.
 *
 *  Docs: https://docs.ijewel3d.com/tryon/mini-viewer
 * ════════════════════════════════════════════════════════════════════ */


/* ══════════════════════════════════════════════════════════════════
 *  CONFIG — replace with your own model
 * ══════════════════════════════════════════════════════════════════ */

const CONFIG = {
  // Drive file ID: right-click the model -> Share, then copy the value
  // between /files/ and /view in the link.
  fileId: 'V_F5uknHREmYQZTrP9ZwDA',

  // Your Drive instance / basename.
  instance: 'drive-weur-1',

  // Which finger the session opens on. Accepts a name or an index
  // (0 thumb … 4 pinky).
  defaultFinger: 'ring',
};


/* ══════════════════════════════════════════════════════════════════
 *  PAGE STATE
 * ══════════════════════════════════════════════════════════════════ */

let driveFile = null;   // set by 'ijewel-file-data'
let tryonPlugin = null; // set once the plugin is added
let currentFinger = CONFIG.defaultFinger;


/* ══════════════════════════════════════════════════════════════════
 *  TINY HELPERS
 * ══════════════════════════════════════════════════════════════════ */

function $(id) {
  return document.getElementById(id);
}

function $$(selector) {
  return Array.from(document.querySelectorAll(selector));
}

function setStatus(state, label) {
  $('status-dot').dataset.state = state; // idle | go | err
  $('status-label').textContent = label;
}

function setHint(text) {
  $('tryon-hint').textContent = text;
}


/* ══════════════════════════════════════════════════════════════════
 *  READING THE EDITOR'S TRY-ON SETTINGS
 *
 *  The placement authored in the editor travels with the model as a
 *  tryonConfig block. It can sit on the file itself, or be inherited
 *  from the folder the file lives in, and either field may arrive as
 *  a JSON string rather than an object.
 * ══════════════════════════════════════════════════════════════════ */

function parseConfig(value) {
  if (!value) return {};
  return typeof value === 'string' ? JSON.parse(value) : value;
}

function readTryonConfig(file) {
  const own = parseConfig(file?.config);
  const inherited = parseConfig(file?.defaultConfig);
  return own.tryonConfig ?? inherited.tryonConfig;
}


/* ══════════════════════════════════════════════════════════════════
 *  PLUGIN SETUP
 * ══════════════════════════════════════════════════════════════════ */

async function addTryonPlugins(viewer, tryonConfig) {
  // preload starts fetching the hand-tracking model and WASM now
  // rather than when the visitor presses the button, which makes
  // start() feel near-instant. Pass { preload: false } to defer it.
  const tryon = await viewer.addPlugin(ij_vto.RingTryonPlugin, { preload: true });

  // Apply the size, position, rotation and render settings authored
  // in the editor. Override any of them afterwards if you need to.
  tryon.fromJSON({ ...tryonConfig, type: ij_vto.RingTryonPlugin.PluginType });

  // The loading screen, hand prompt and error messages. Everything
  // here is optional — drop the argument for iJewel's defaults.
  await viewer.addPlugin(
    new ij_vto.TryonUIPlugin({
      loading: {
        title: 'Preparing your try-on',
        subText: null,
        align: 'center',
      },
      handPrompt: {
        text: 'Show the back of your hand',
      },
    }),
  );

  return tryon;
}


/* ══════════════════════════════════════════════════════════════════
 *  CONTROLS — this page's own try-on interface
 * ══════════════════════════════════════════════════════════════════ */

function syncControls() {
  const running = Boolean(tryonPlugin?.running);

  $('tryon-toggle').disabled = false;
  $('tryon-label').textContent = running ? 'Exit try-on' : 'Try it on';
  $('session-controls').hidden = !running;

  setStatus(running ? 'go' : 'idle', running ? 'Try-on running' : 'Ready');
  setHint(running ? 'Point the back of your hand at the camera.' : 'Uses your camera. Nothing is uploaded.');
}

function wireToggleButton() {
  $('tryon-toggle').onclick = async () => {
    $('tryon-toggle').disabled = true;

    if (tryonPlugin.running) {
      await tryonPlugin.stop();
    } else {
      setHint('Waiting for camera permission…');
      await tryonPlugin.start();

      // The finger can only be set once a session is running — before
      // start() there is no hand to place the ring on, and the setter
      // quietly does nothing.
      tryonPlugin.finger = currentFinger;
    }

    syncControls();
  };
}

function wireFlipButton() {
  $('flip').onclick = () => tryonPlugin.flipCamera();
}

function wireFingerPicker() {
  $$('.finger').forEach((button) => {
    button.classList.toggle('active', button.dataset.finger === currentFinger);

    button.onclick = () => {
      $$('.finger').forEach((other) => other.classList.remove('active'));
      button.classList.add('active');

      currentFinger = button.dataset.finger;

      // Accepts 'thumb' | 'index' | 'middle' | 'ring' | 'pinky', or the
      // matching index 0–4.
      tryonPlugin.finger = currentFinger;
    };
  });
}

function wirePluginEvents() {
  // Fired when the session ends, including when it ends on its own.
  tryonPlugin.addEventListener('stop', syncControls);

  tryonPlugin.addEventListener('error', ({ detail }) => {
    console.error('Try-on error', detail.reason, detail.error);
    setStatus('err', 'Try-on failed');
    // Camera failures arrive with isCameraError: true and a reason such
    // as 'permissionDenied' or 'notFoundError'. Everything else comes
    // through as 'startupFailed'.
    setHint(
      detail.reason === 'permissionDenied'
        ? 'Camera access was blocked. Allow it in your browser settings and try again.'
        : detail.isCameraError
          ? 'Your camera could not be started. Check that nothing else is using it.'
          : 'Something went wrong starting try-on. Please try again.',
    );
    $('tryon-toggle').disabled = false;
  });
}

function wireControls() {
  wireToggleButton();
  wireFlipButton();
  wireFingerPicker();
  wirePluginEvents();
  syncControls();
}


/* ══════════════════════════════════════════════════════════════════
 *  VIEWER LIFECYCLE
 * ══════════════════════════════════════════════════════════════════ */

function watchFileData() {
  window.addEventListener(
    'ijewel-file-data',
    ({ detail }) => {
      driveFile = detail.iJewelFileData;
    },
    { once: true },
  );
}

function watchViewerReady() {
  window.addEventListener(
    'ijewel-viewer-ready',
    async ({ detail }) => {
      const viewer = detail.viewer;

      // ── Gate 1: was try-on enabled for this model in the editor? ──
      const tryonConfig = readTryonConfig(driveFile);
      if (!tryonConfig?.enabled) {
        console.warn('This model has no try-on configuration. Enable it in the editor and save.');
        hideTryonEntryPoint('Try-on is not available for this piece.');
        return;
      }

      // ── Gate 2: can this device actually run try-on? ──────────────
      const support = ij_vto.canRunVTO();
      if (!support.ok) {
        console.warn('Try-on unavailable', support.reason, support.details);
        hideTryonEntryPoint('Try-on is not supported on this device.');
        return;
      }

      tryonPlugin = await addTryonPlugins(viewer, tryonConfig);
      wireControls();
    },
    { once: true },
  );
}

function hideTryonEntryPoint(message) {
  $('tryon-toggle').hidden = true;
  setStatus('idle', 'Try-on unavailable');
  setHint(message);
}

function loadViewer() {
  ijewelViewer.loadModelById(
    CONFIG.fileId,
    CONFIG.instance,
    document.getElementById('viewer'),
    {
      // Keep the viewer's own try-on button out of the way — the
      // button in the product panel is the only entry point.
      hideTryOn: true,
      showCard: false,
    },
  );
}


/* ══════════════════════════════════════════════════════════════════
 *  INIT — listeners first, so no event fires before we listen
 * ══════════════════════════════════════════════════════════════════ */

function init() {
  watchFileData();
  watchViewerReady();
  loadViewer();
}

init();
