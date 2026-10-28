 # FieldNorth asset register

All served images, fonts and SVGs are local in `packages/web/public/`. None are hotlinked. Every scene is illustrative, not a claimed FieldNorth completed job. Sources were checked on 28 October 2026. Stock photographs are not asserted to depict a fictional business property or a real clearing outcome.

| Local filename(s), under public/ | Purpose | Origin | Known usage status |
|---|---|---|---|
| `images/forestry-loader-concept.png` | Original generated equipment illustration, retained as an editable/source asset; not referenced by the live page | Generated with Runable image tooling, `openai/gpt-image-2.5-flare`; custom Central Florida-style tracked loader/drum mulcher prompt | AI-generated illustrative concept. No third-party photographic license or exclusive rights claimed. Not a real job photograph. |
| `images/forestry-loader-concept-{720,1280,1920}.webp` | Desktop hero, Forestry Mulching service and Vegetation management scenario | Optimized derivatives of the generated image above | Same illustrative/generated status. Natural machinery proportions were visually reviewed; not an engineering reference. |
| `images/forestry-loader-mobile.webp` | Deliberate mobile crop retaining the loader and drum attachment | Crop of the generated original above, converted to WebP | Same generated illustrative status. |
| `images/open-meadow-{720,1280,1920}.webp` | Land Clearing service, Open-lot planning gallery | Ben Marler, Unsplash: https://unsplash.com/photos/a-large-tree-sitting-in-the-middle-of-a-lush-green-field-YsOzHlK0LUA — image `photo-1695462935702-05bb400b81ba` | Source photo page explicitly displayed **Free to use under the Unsplash License**. Downloaded from its image CDN then saved locally. General landscape photograph, no Central Florida location claim. |
| `images/property-access-{720,1280,1920}.webp` | Brush Removal service, Property access gallery and single-photo Land Potential canvas | Mark Thomas, Unsplash: https://unsplash.com/photos/a-dirt-road-winds-through-a-sun-dappled-forest-s7s4ouzUkSg — image `photo-1776943970580-f31028e8b583` | Source page explicitly displayed **Free to use under the Unsplash License**. Photo caption identifies Cypress Creek Preserve, Florida; that is source context only, not a FieldNorth address/job. Locally optimized derivatives. |
| `images/central-florida-schematic.svg` | Sample-region illustration for Orange, Seminole, Lake and Osceola | Original local SVG authored for this website | Schematic portfolio concept, not accurate geographic boundaries or actual coverage. No map API, geographic measurements or address. |
| `images/fieldnorth-icon.svg` | Browser favicon | Original local SVG authored for this website | Fictional FieldNorth mark. No real contractor logo copied. |
| `images/fieldnorth-social.jpg` | Local social-preview image, referenced in metadata | Composite of generated hero with original typographic treatment | Same generated illustrative status. Uses system DejaVu Sans in rasterized preview only; no extra font request at runtime. |
| `fonts/manrope-latin-variable.woff2` | Locally hosted 400–800 Latin variable font | Google Fonts Manrope v23: `https://fonts.gstatic.com/s/manrope/v23/xn7gYHE41ni1AdIRggexSg.woff2` | SIL Open Font License 1.1. License copied locally as `fonts/OFL.txt` from Google Fonts’ Manrope repository. |
| `fonts/OFL.txt` | Required font license notice | https://github.com/google/fonts/blob/main/ofl/manrope/OFL.txt | Retained with the font. |
| `runable.js` | Required platform pageview analytics asset | Unmodified Runable managed template | Platform-provided script retained. External collector dependency documented in README; not a photograph or portfolio asset. |
| `favicon.ico`, `og-image.png` | Unused starter assets retained from managed template | Runable template | Not referenced by FieldNorth metadata. No independent license/ownership assertion. |

Responsive WebP variants are sized to 720, 1280 and 1920 pixels wide. The production asset optimizer may recompress originals and the mobile crop; the build output, not source-file size, is the deployment payload.

## License guidance

Unsplash license: https://unsplash.com/license. It grants free download, modification and use of Unsplash photographs, including commercial use, subject to its conditions (e.g. no compiling a competing image service or selling unmodified images). Attribution is not required by that license, but photographer/source credits are provided here. No additional model/property release or trademark clearance is asserted. Recheck applicable rights for any future real-client deployment.

Lucide interface icons come from the existing `lucide-react` package (ISC license in the dependency distribution), not remote image files. The local planning shapes and topographic CSS lines are original interface artwork. No stock images are represented as Before/After pairs.