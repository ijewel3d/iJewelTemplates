/* ════════════════════════════════════════════════════════════════════
 *  Virtual Try-On — Standalone WebGi Viewer
 *
 *  Builds a WebGi viewer from scratch and adds the try-on plugins to
 *  it. Use this shape when the models are your own hosted files rather
 *  than iJewel Drive documents — if they live in Drive, the Mini
 *  Viewer templates are far less code for the same result.
 *
 *  Flow:
 *    1. create a ViewerApp on the canvas
 *    2. add the base plugins, DiamondPlugin, RingTryonPlugin, TryonUIPlugin
 *    3. load an environment map, the .glb and its try-on .json
 *    4. gate the button on canRunVTO(), then wire start / stop / flip / finger
 *
 *  Docs: https://docs.ijewel3d.com/tryon/demo
 * ════════════════════════════════════════════════════════════════════ */


/* ══════════════════════════════════════════════════════════════════
 *  CONFIG — replace with your own model
 * ══════════════════════════════════════════════════════════════════ */

const CONFIG = {
  // The ring.
  model: 'https://playground.ijewel3d.com/assets/demo/tryon/demo_tryon.glb',

  // Its try-on placement, exported from the plugin's setup mode with
  // "Download Config". Rings of consistent size can share one file.
  tryonConfig: 'https://playground.ijewel3d.com/assets/demo/tryon/demo_tryon.json',

  // Lighting for the turntable view before try-on starts.
  environment: 'https://playground.ijewel3d.com/assets/lightmaps/gem/gem-2.exr',
};

// Finger indices understood by the plugin: 0 thumb … 4 pinky.
const FINGERS = [1, 2, 3, 4];  // skip the thumb in the rotation
const FINGER_NAMES = ['Thumb', 'Index', 'Middle', 'Ring', 'Pinky'];


/* ══════════════════════════════════════════════════════════════════
 *  PAGE STATE
 * ══════════════════════════════════════════════════════════════════ */

let tryonPlugin = null;
let fingerIndex = 3; // Finger.Ring


/* ══════════════════════════════════════════════════════════════════
 *  TINY HELPERS
 * ══════════════════════════════════════════════════════════════════ */

function $(id) {
  return document.getElementById(id);
}

function setStatus(state, label) {
  $('status-dot').dataset.state = state; // idle | go | err
  $('status-label').textContent = label;
}

function setHint(text) {
  $('tryon-hint').textContent = text;
}


/* ══════════════════════════════════════════════════════════════════
 *  VIEWER SETUP
 *
 *  ViewerApp, addBasePlugins and DiamondPlugin all come from the webgi
 *  bundle, which puts them on window. ij_vto is the separate try-on
 *  bundle. There are no license keys to install in either — access is
 *  authorised automatically against the domain you deploy on.
 * ══════════════════════════════════════════════════════════════════ */

async function createViewer() {
  const viewer = new ViewerApp({
    canvas: $('webgi-canvas'),
  });

  // Renders above the CSS pixel size for crisper edges on the ring.
  viewer.renderer.displayCanvasScaling = 1.5;

  await addBasePlugins(viewer, { interactionPrompt: false });
  await viewer.addPlugin(DiamondPlugin);

  return viewer;
}

async function addTryonPlugins(viewer) {
  // The try-on plugin comes from ij_vto, not from webgi.
  const tryon = await viewer.addPlugin(ij_vto.RingTryonPlugin);

  // The loading screen, hand prompt and error messages. Optional, but
  // without it a session starts with no feedback at all.
  await viewer.addPlugin(
    new ij_vto.TryonUIPlugin({
      loading: { title: 'Preparing your try-on', align: 'center' },
      handPrompt: { text: 'Show the back of your hand' },
    }),
  );

  return tryon;
}

async function loadModel(viewer) {
  // Pause rendering while the scene is assembled so the visitor never
  // sees a half-lit ring.
  viewer.renderEnabled = false;

  await viewer.setEnvironmentMap(CONFIG.environment);
  await viewer.load(CONFIG.model);
  await viewer.load(CONFIG.tryonConfig);

  viewer.renderEnabled = true;
}


/* ══════════════════════════════════════════════════════════════════
 *  CONTROLS
 * ══════════════════════════════════════════════════════════════════ */

function syncControls() {
  const running = Boolean(tryonPlugin?.running);

  $('tryon-toggle').disabled = false;
  $('tryon-label').textContent = running ? 'Exit try-on' : 'Try it on';
  $('session-controls').hidden = !running;

  setStatus(running ? 'go' : 'idle', running ? 'Try-on running' : 'Ready');
  setHint(
    running
      ? `Wearing it on the ${FINGER_NAMES[fingerIndex].toLowerCase()} finger.`
      : 'Uses your camera. Nothing is uploaded.',
  );
}

function wireToggleButton() {
  $('tryon-toggle').onclick = async () => {
    // Try-on cannot start on page load — the browser only prompts for
    // camera access in response to a real user gesture.
    $('tryon-toggle').disabled = true;

    if (tryonPlugin.running) {
      await tryonPlugin.stop();
    } else {
      setHint('Waiting for camera permission…');
      await tryonPlugin.start();
      tryonPlugin.finger = fingerIndex;
    }

    syncControls();
  };
}

function wireFlipButton() {
  // Front / rear camera. Only meaningful on devices with more than one.
  $('flip').onclick = () => tryonPlugin.running && tryonPlugin.flipCamera();
}

function wireFingerButton() {
  $('finger').onclick = () => {
    if (!tryonPlugin.running) return;

    const next = (FINGERS.indexOf(fingerIndex) + 1) % FINGERS.length;
    fingerIndex = FINGERS[next];
    tryonPlugin.finger = fingerIndex;

    syncControls();
  };
}

function wirePluginEvents() {
  tryonPlugin.addEventListener('stop', syncControls);

  tryonPlugin.addEventListener('error', ({ detail }) => {
    console.error('Try-on error', detail.reason, detail.error);
    setStatus('err', 'Try-on failed');
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
  wireFingerButton();
  wirePluginEvents();
  syncControls();
}


/* ══════════════════════════════════════════════════════════════════
 *  DEVICE SUPPORT
 *
 *  Try-on needs WebGL2 and a reasonably capable GPU. Check before
 *  showing an entry point, so nobody presses a button that cannot work.
 * ══════════════════════════════════════════════════════════════════ */

function deviceCanRunTryon() {
  const support = ij_vto.canRunVTO();

  if (!support.ok) {
    console.warn('Try-on unavailable', support.reason, support.details);
    $('tryon-toggle').hidden = true;
    setStatus('idle', 'Try-on unavailable');
    setHint('Try-on is not supported on this device.');
  }

  return support.ok;
}


/* ══════════════════════════════════════════════════════════════════
 *  INIT
 * ══════════════════════════════════════════════════════════════════ */

async function init() {
  const viewer = await createViewer();
  tryonPlugin = await addTryonPlugins(viewer);

  await loadModel(viewer);

  if (!deviceCanRunTryon()) return;

  wireControls();
}

init();
