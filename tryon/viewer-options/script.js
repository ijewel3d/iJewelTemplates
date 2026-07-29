/* ════════════════════════════════════════════════════════════════════
 *  Virtual Try-On — Mini Viewer Options
 *
 *  The smallest possible try-on integration: load a Drive model with
 *  the Mini Viewer and turn on its built-in try-on button.
 *
 *  Everything else — asking for the camera, downloading the try-on
 *  library, the loading screen, the "show your hand" prompt and the
 *  error states — is handled by the viewer.
 *
 *  Prerequisite: the model must have try-on enabled and saved in the
 *  editor (TryOn Settings tab -> Enable AR -> fit -> Save). Without
 *  that the button stays hidden no matter what this file does.
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

  // Optional: pin the try-on library version instead of tracking the
  // viewer's bundled default. Drop this line to always get the default.
  tryonPath: 'https://releases.ijewel3d.com/libs/web-vto/0.2.9/web-vto.js',
};


/* ══════════════════════════════════════════════════════════════════
 *  VIEWER
 * ══════════════════════════════════════════════════════════════════ */

function loadViewer() {
  ijewelViewer.loadModelById(
    CONFIG.fileId,
    CONFIG.instance,
    document.getElementById('viewer'),
    {
      // ── The one option that matters ───────────────────────────────
      // Defaults to true, which hides the try-on button entirely.
      hideTryOn: false,
      tryonPath: CONFIG.tryonPath,

      // ── Ordinary viewer chrome, nothing to do with try-on ─────────
      showCard: false,
      showUiButtons: true,
      showConfigurator: true,
    },
  );
}


/* ══════════════════════════════════════════════════════════════════
 *  OPTIONAL — react to the viewer becoming available
 * ══════════════════════════════════════════════════════════════════ */

function watchViewerReady() {
  window.addEventListener(
    'ijewel-viewer-ready',
    ({ detail }) => {
      console.log('Mini Viewer ready', detail.viewer);
    },
    { once: true },
  );
}


/* ══════════════════════════════════════════════════════════════════
 *  INIT
 * ══════════════════════════════════════════════════════════════════ */

function init() {
  watchViewerReady();
  loadViewer();
}

init();
