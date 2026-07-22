# iJewel3D Templates

Standalone HTML examples for integrating iJewel3D viewers and configurators into websites, product pages, and ecommerce experiences.

The templates are published through GitHub Pages and can be opened directly in a browser. Most examples require no build step: copy the HTML and its adjacent assets, replace the example file or project identifiers, and serve it from an HTTPS website.

For API references, integration guides, and platform documentation, visit the [official iJewel3D documentation](https://docs.ijewel3d.com).

## Wedding Band Builder

| Template | Description | Links |
| --- | --- | --- |
| Wedding Band Builder | Loads a complete Wedding Band project with the standard iJewel3D interface. | [View live](https://ijewel3d.github.io/iJewelTemplates/wedding-band/wedding-band.html) · [Source](wedding-band/wedding-band.html) |
| Default Viewer | Minimal `loadModelById` integration with the built-in Wedding Band controls. | [View live](https://ijewel3d.github.io/iJewelTemplates/wedding-band/wedding-band-default.html) · [Source](wedding-band/wedding-band-default.html) |
| Custom UI | Headless Wedding Band controller connected to a complete custom storefront interface. | [View live](https://ijewel3d.github.io/iJewelTemplates/wedding-band/custom-ui/index.html) · [Source](wedding-band/custom-ui/index.html) |
| iframe Integration | Host-page controls communicating with an iJewel3D embedded viewer through `postMessage`. | [View live](https://ijewel3d.github.io/iJewelTemplates/wedding-band/iframe-demo/index.html) · [Source](wedding-band/iframe-demo/index.html) |

## Ring Configurator

### Advanced examples

| Template | Description | Links |
| --- | --- | --- |
| Complex Configurator | Full multi-control ring configurator example. | [View live](https://ijewel3d.github.io/iJewelTemplates/ringconfigurator/advanced/ringbuilder-complex.html) · [Source](ringconfigurator/advanced/ringbuilder-complex.html) |
| Advanced Template v3 | Storefront-style ring builder with custom product controls. | [View live](https://ijewel3d.github.io/iJewelTemplates/ringconfigurator/advanced/template-v3.html) · [Source](ringconfigurator/advanced/template-v3.html) |
| Advanced Template v2 | Earlier modular version of the advanced ring builder. | [View live](https://ijewel3d.github.io/iJewelTemplates/ringconfigurator/advanced/template-v2.html) · [Source](ringconfigurator/advanced/template-v2.html) |
| Base Advanced Template | Baseline advanced ring builder implementation. | [View live](https://ijewel3d.github.io/iJewelTemplates/ringconfigurator/advanced/template.html) · [Source](ringconfigurator/advanced/template.html) |

### Simple examples

| Template | Description | Links |
| --- | --- | --- |
| Simple Ring Configurator | Minimal ring builder suitable as a starting integration. | [View live](https://ijewel3d.github.io/iJewelTemplates/ringconfigurator/simple/ring-configurator.html) · [Source](ringconfigurator/simple/ring-configurator.html) |
| Size and Shape Configurator | Adds size and shape controls to the basic ring example. | [View live](https://ijewel3d.github.io/iJewelTemplates/ringconfigurator/simple/configurator-with-size-shape.html) · [Source](ringconfigurator/simple/configurator-with-size-shape.html) |
| Stored Custom Configurator | Builds custom controls from the configurator data stored with a model. | [View live](https://ijewel3d.github.io/iJewelTemplates/ringconfigurator/simple/custom-stored-configurator.html) · [Source](ringconfigurator/simple/custom-stored-configurator.html) |

## Viewer and Virtual Try-On

| Template | Description | Links |
| --- | --- | --- |
| Virtual Try-On | Small example for loading a model and enabling camera-based try-on. | [View live](https://ijewel3d.github.io/iJewelTemplates/tryon/try-on.html) · [Source](tryon/try-on.html) |
| Viewer SDK | Viewer controls and virtual try-on configuration in one SDK example. | [View live](https://ijewel3d.github.io/iJewelTemplates/viewer-sdk/index.html) · [Source](viewer-sdk/index.html) |

## Using a Template

1. Open a live example and choose the closest starting point.
2. Copy its HTML together with any adjacent CSS, JavaScript, JSON, image, or icon assets.
3. Replace the example `fileId`, `instance`, project URL, and product-specific values with your own.
4. Pin the iJewel3D bundle version used by your production integration.
5. Test from an HTTPS origin. Camera-based try-on requires browser permission and a supported device.

See the [iJewel3D documentation](https://docs.ijewel3d.com) for complete setup instructions and API details.

For example, the standard Drive loader uses a file ID and instance name:

```js
ijewelViewer.loadModelById(
  'YOUR_FILE_ID',
  'YOUR_INSTANCE',
  document.getElementById('viewer'),
  viewerOptions,
);
```

## Repository Layout

```text
ringconfigurator/
  advanced/       Full storefront and complex configurator examples
  simple/         Minimal ring configurator integrations
tryon/            Standalone virtual try-on example
viewer-sdk/       Viewer SDK example
wedding-band/     Standard, custom UI, and iframe Wedding Band examples
```

## Notes

- The examples load iJewel3D bundles, projects, models, and other assets from hosted HTTPS endpoints, so an internet connection is required.
- Some templates intentionally use remote demo files. Replace those identifiers before using a template in production.
- Keep HTML files and their relative assets in the same folder structure when copying an example.
- The iframe example demonstrates a cross-origin `postMessage` integration. Restrict message origins to the expected production origin in your own application.

## License

See [LICENSE](LICENSE).
