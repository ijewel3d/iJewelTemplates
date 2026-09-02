# Configurator Try-On test

Verifies the public Try-On documentation for a Ring Configurator project
against the shipped Mini Viewer `0.6.18` bundle.

It follows two documented paths end to end:

1. **Using Ring Configurator → Option 4: Fully Self-Hosted Project.**
   `project.json` is a real Ring Configurator project with a calibrated
   `tryonConfig` at the top level. It goes straight to
   `new ijewelViewer.Viewer()`. No Drive call happens at runtime.
2. **Viewer Class → Configurator Try-On Helpers.**
   `getConfiguratorTryonRingChoices()`, `tryon.fromJSON()`,
   `prepareConfiguratorTryon()` and `tryon.start()`, driven by a custom button.

## Run it

```sh
python3 -m http.server 8777 --bind 127.0.0.1
```

Then open <http://127.0.0.1:8777/>. The panel reports every check.

Append `?hideTryOn=1` to load the control case, with the Try-On button hidden.

## Run the checks without a browser window

`run-tests.mjs` drives the page with Playwright and compares both loads. It
needs `playwright` on the module path, so run it from a folder that has it:

```sh
cd ../../ijewel-mono && node ../html-testing/configurator-tryon/run-tests.mjs
```

It asserts three things a single load cannot:

- the control bar gains exactly one button when Try-On is enabled;
- `prepareConfiguratorTryon()` isolates the ring and `restore()` rebuilds the
  scene, including the model-root scale;
- a `start()` that fails with no camera still restores the configurator.

## Notes

- Try-On itself needs a camera and HTTPS or localhost. The headless run cannot
  enter AR. It verifies setup, teardown and the failure path instead.
- The viewer control buttons carry no `title` or `aria-label`, so the Try-On
  button cannot be found by name. The runner counts buttons across both loads
  instead.
