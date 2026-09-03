/* ==========================================================================
   Ring Configurator Try-On Test
   --------------------------------------------------------------------------
   Follows the public documentation end to end:

     1. "Using Ring Configurator → Option 4: Fully Self-Hosted Project"
        A complete project object with tryonConfig at the top level goes to
        new ijewelViewer.Viewer(). The standard Try-On button then works.

     2. "Viewer Class → Configurator Try-On Helpers"
        getConfiguratorTryonRingChoices() lists the rings, tryon.fromJSON()
        applies the saved fit, prepareConfiguratorTryon() prepares the ring,
        and tryon.start() opens the camera.

   Every documented claim is asserted in recordCheck() so the page reports
   what the docs promise against what the bundle actually does.
   ========================================================================== */

const PROJECT_URL = "./project.json";

let viewerApp;      // the WebGi ViewerApp
let tryonSession;   // the handle returned by prepareConfiguratorTryon()
let tryonConfig;    // the saved fit, read from the project

const logEl = document.getElementById("log");
const checksEl = document.getElementById("checks");
const choicesEl = document.getElementById("ring-choices");
const tryonButton = document.getElementById("tryon-button");
const restoreButton = document.getElementById("restore-button");


/* --- Reporting ------------------------------------------------------------ */

function log(message) {
    const time = new Date().toISOString().slice(11, 19);
    logEl.textContent += `[${time}] ${message}\n`;
    logEl.scrollTop = logEl.scrollHeight;
    console.log("[tryon-test]", message);
}

function recordCheck(label, passed) {
    const item = document.createElement("li");
    item.className = passed ? "pass" : "fail";
    item.textContent = label;
    checksEl.appendChild(item);
    log(`${passed ? "PASS" : "FAIL"} — ${label}`);
    return passed;
}


/* --- Boot ----------------------------------------------------------------- */

// Register listeners before loading so no startup event is missed.
window.addEventListener("ijewel-viewer-ready", ({ detail }) => {
    viewerApp = detail.viewer;
    log("ijewel-viewer-ready fired.");
});

window.addEventListener("ijewel-scene-ready", ({ detail }) => {
    log(`ijewel-scene-ready fired with sceneReady=${detail.sceneReady}.`);
    onSceneReady();
});

async function start() {
    log("Fetching the self-hosted project.");
    const response = await fetch(PROJECT_URL);
    if (!response.ok) throw new Error(`project.json failed: ${response.status}`);

    const project = await response.json();
    tryonConfig = project.tryonConfig;

    recordCheck("Project carries a top-level tryonConfig", Boolean(tryonConfig));
    recordCheck("tryonConfig.enabled is true", tryonConfig?.enabled === true);
    recordCheck(
        "Project has RingConfigurator components, and no model file",
        project.plugins?.RingConfigurator?.components?.length > 0 && !project.model,
    );

    // The runner flips this to compare the control bar with and without Try-On.
    const hideTryOn = new URLSearchParams(location.search).get("hideTryOn") === "1";

    log(`Creating the viewer with hideTryOn=${hideTryOn}.`);
    new ijewelViewer.Viewer(document.getElementById("viewer"), project, {
        showConfigurator: true,
        showCard: false,
        showUiButtons: true,
        hideTryOn,
    });
}


/* --- Scene ready: the documented helper flow ------------------------------ */

function onSceneReady() {
    checkExports();
    const choices = readRingChoices();
    countViewerButtons();

    if (choices.length) {
        tryonButton.disabled = false;
        restoreButton.disabled = false;
    }

    runSessionRestoreCheck(choices);
}

function checkExports() {
    recordCheck(
        "getConfiguratorTryonRingChoices is on window.ijewelViewer",
        typeof ijewelViewer.getConfiguratorTryonRingChoices === "function",
    );
    recordCheck(
        "prepareConfiguratorTryon is on window.ijewelViewer",
        typeof ijewelViewer.prepareConfiguratorTryon === "function",
    );
    recordCheck(
        "ij_vto.RingTryonPlugin is available",
        typeof ij_vto?.RingTryonPlugin === "function",
    );
    recordCheck(
        "ij_vto.canRunVTO() returns { ok, details }",
        typeof ij_vto?.canRunVTO === "function"
            && "ok" in ij_vto.canRunVTO()
            && "details" in ij_vto.canRunVTO(),
    );
}

function readRingChoices() {
    const choices = ijewelViewer.getConfiguratorTryonRingChoices(viewerApp);

    recordCheck(
        "getConfiguratorTryonRingChoices returns at least one ring",
        Array.isArray(choices) && choices.length > 0,
    );
    recordCheck(
        "Every choice has a string id and label",
        choices.every((c) => typeof c.id === "string" && typeof c.label === "string"),
    );

    renderRingChoices(choices);
    return choices;
}

function renderRingChoices(choices) {
    if (!choices.length) {
        choicesEl.textContent = "No configurator rings found.";
        return;
    }

    choicesEl.innerHTML = "";
    choices.forEach((choice) => {
        const row = document.createElement("div");
        row.className = "choice";
        row.innerHTML = `${choice.label}<b>${choice.id}</b>`;
        choicesEl.appendChild(row);
    });
}

/**
 * The viewer draws its control bar into a shadow root, and every control is an
 * icon button with no accessible name. So the Try-On button cannot be found by
 * name. Count the buttons instead, and let the runner load the page twice —
 * once with hideTryOn false, once with true — and compare.
 */
function countViewerButtons() {
    const buttons = [];
    const walk = (root, depth = 0) => {
        if (depth > 8) return;
        for (const el of root.querySelectorAll("*")) {
            if (el.shadowRoot) walk(el.shadowRoot, depth + 1);
            if (el.tagName === "BUTTON") buttons.push(el);
        }
    };
    walk(document.getElementById("viewer"));

    window.__viewerButtonCount = buttons.length;
    recordCheck(`Viewer renders ${buttons.length} control buttons`, buttons.length > 0);
}


/* --- Prepare and restore without a camera --------------------------------- */

/**
 * prepareConfiguratorTryon() isolates the assembled ring, then restore() puts
 * the whole configurator back. Both run without a camera, so this check is
 * safe to run automatically.
 */
function runSessionRestoreCheck(choices) {
    if (!choices.length) return;

    const modelRoot = viewerApp.scene.modelRoot;
    const before = modelRoot.children.length;
    const scaleBefore = modelRoot.scale.toArray().join(",");

    const probe = ijewelViewer.prepareConfiguratorTryon(viewerApp, { probe: true });
    const during = modelRoot.children.length;

    probe.restore();
    const after = modelRoot.children.length;
    const scaleAfter = modelRoot.scale.toArray().join(",");

    recordCheck(
        `Prepare isolates the ring (children ${before} → ${during})`,
        during <= before,
    );
    recordCheck(
        `restore() puts every child back (children ${after} of ${before})`,
        after === before,
    );
    recordCheck("restore() puts the model-root scale back", scaleAfter === scaleBefore);

    probe.restore();
    recordCheck("restore() is idempotent on a second call", modelRoot.children.length === before);

    // An unknown ring id must be rejected, not silently swapped.
    let threw = false;
    try {
        ijewelViewer.prepareConfiguratorTryon(viewerApp, { probe: true }, { ringId: "no-such-ring" });
    } catch (error) {
        threw = error instanceof RangeError;
    }
    recordCheck("An unknown ringId throws RangeError", threw);
}


/* --- Custom Try-On button ------------------------------------------------- */

async function startConfiguratorTryon() {
    const tryon = await viewerApp.getOrAddPlugin(ij_vto.RingTryonPlugin);

    const ringChoices = ijewelViewer.getConfiguratorTryonRingChoices(viewerApp);
    const selectedRing = ringChoices[0];
    if (!selectedRing) throw new Error("No configurator ring is available.");

    log(`Applying the saved fit, then preparing "${selectedRing.label}".`);

    await tryon.fromJSON({
        ...tryonConfig,
        type: ij_vto.RingTryonPlugin.PluginType,
    });

    tryonSession = ijewelViewer.prepareConfiguratorTryon(viewerApp, tryon, {
        ringId: selectedRing.id,
    });

    try {
        await tryon.start();
        log(`Try-On started. running=${tryon.running}`);
    } catch (error) {
        tryonSession.restore();
        tryonSession = undefined;
        throw error;
    }
}

tryonButton.addEventListener("click", () => {
    startConfiguratorTryon().catch((error) => {
        log(`Try-On did not start: ${error.message}`);
    });
});

restoreButton.addEventListener("click", () => {
    tryonSession?.restore();
    tryonSession = undefined;
    log("Session restored by the page.");
});


/* --- Go ------------------------------------------------------------------- */

start().catch((error) => {
    recordCheck(`Startup failed: ${error.message}`, false);
});
