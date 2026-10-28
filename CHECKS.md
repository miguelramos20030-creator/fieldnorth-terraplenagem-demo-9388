 # FieldNorth verification and handoff

Verified on 28 October 2026 using Bun **1.4.4**, Vite **8.3.5**, TypeScript and local Google Chrome with Python Playwright. Checks target actual production `packages/web/dist` outputs served by Python’s files-only HTTP server, not the application API. The full suite passed both for the managed-environment build and for a clean source-archive extraction with **no `.env` file**, using the documented filtered install and web-only build commands. Raw browser results for the clean export are in `tests/results/acceptance.json`.

## Passed

| Brief acceptance item | Actual verification |
|---|---|
| Local images and font resolve | All 16 non-placeholder image/font/license files in their output folders returned HTTP 200 and nonempty content. Rendered images had nonzero natural dimensions; `document.fonts.check('16px Manrope')` returned true. |
| Navigation and sticky-header offsets | All six main section destinations checked against header geometry at 360, 390, 768, 1024 and 1440px. All anchor targets exist. Mobile anchor closes the menu. |
| Service showcase and CTA context | All three tabs update selected state, title and image context. Every service CTA, including Land Clearing, selects its exact planner radio. |
| Signature divider | Native range passed ArrowRight, pointer drag and Chrome CDP emulated-touch drag; the touch test moved it from near center to 84%. A single photograph underlies both sides. |
| Gallery | All three photo buttons open the correct image/caption. Close button and Escape work. Explicit Tab containment and opener focus return checked. |
| Mobile menu | Open/close state, repeated Tab containment, Escape, focus return and Land Potential anchor navigation checked at 390px. |
| FAQ | First answer begins open and can close. Enter activation and all five expanded answer states checked. |
| Required fields and email | Missing service, four missing required property fields and malformed email show specific errors and focus the first invalid control. |
| Planner flow | Sample fill, chosen-service preservation, all sample values, Continue, Back, preview, Edit and full reset checked. Re-entering through another service CTA changes work without erasing details. Sample defaults to Forestry Mulching only when no service was selected. |
| Honest completion | Preview explicitly reads Demo preview complete and No request was sent. No monetary quote or sent-success state. |
| Form privacy | No application API requests; no matching sample or sentinel form values in captured outgoing payloads. An additional non-automated-hostname test activated the retained platform collector, captured its pageview requests without sending them externally, and found no form values. No cookies, localStorage or sessionStorage entries. Reload clears chosen service/state. |
| Responsive layout | Production screenshots generated for all five specified widths. `scrollWidth` and body width matched viewport width at every width, without horizontal overflow. Opening compositions reviewed across all five widths; service/gallery/land-potential/planner compositions also visually reviewed in desktop and mobile crops. |
| Reduced motion | Functional testing ran with `prefers-reduced-motion: reduce`; content and interactions remained available. CSS disables smooth scrolling, animations and transitions for that preference. |
| Build and static operation | `bun install --filter @template/web --frozen-lockfile`, `bun run lint` and `bun run build:web` succeeded. Frontend/config TypeScript checks pass. Production operated with `/api/**` and all external network access blocked, in a fresh browser context without a Runable account. No browser page errors. |
| Fictional-project metadata | One H1, descriptive title, `noindex,follow`, local social image and favicon. No LocalBusiness schema, invented contact details, testimonials, legal-page dead links or job metrics. |

## Original-release measured loading observations

Fresh Chrome sessions against the uncompressed Python static server, after initial network idle at the top of the page:

- **Clean static export, 390 × 844:** 655,615 bytes of same-origin resources (about **0.66 MB**), excluding HTML and network headers.
- **Clean static export, 1440 × 1000:** 1,526,929 bytes (about **1.53 MB**) with eagerly loaded hero and browser-prefetched native lazy images. This is near, slightly above, the brief’s approximate 1.5 MB target; no speed score is claimed.
- The clean build reports **274.97 kB JS / 95.17 kB gzip**, and **51.57 kB CSS / 11.31 kB gzip**. The test server does not compress responses. Real hosting compression/cache behavior has not been measured.
- The managed-environment build includes additional platform-configured bundle content: **511.78 kB JS / 160.25 kB gzip**. Its measured initial resources were **0.89 MB mobile / 1.76 MB desktop**. The provided ready-to-host static ZIP uses the clean, independently reproduced output, not this heavier managed-environment variant.
- Below-the-fold photography uses responsive local WebP, native lazy loading and reserved image dimensions. Source PNG is retained but is not loaded by the visitor experience.

## Non-blocking build warnings

The managed Vite configuration currently emits advisory warnings about future native config-loader support (`__dirname`, extensionless imports) and Node’s `module.register()` deprecation. The managed-environment variant also reports a minified JS chunk exceeding 500 kB; the clean static export does not. These are warnings, not build failures; required template plugin plumbing is retained.

## Limitations / not tested

- Real iOS/Android hardware touch, Safari, Firefox and assistive-technology/screen-reader sessions were not tested. Touch was emulated in Chrome.
- No Lighthouse/WebPageTest speed score, throttled-network benchmark, live-domain deployment or social-crawler fetch was performed.
- No real email or lead submission is supported or claimed. That would require a separately configured and tested destination plus suitable privacy/compliance work for a real business.
- Required platform attribution and pageview analytics remain. The external collector is documented separately in README; its availability is not required for site functionality.
- Photography is illustrative. Generated equipment is not a verified operational or engineering depiction. Unsplash rights were checked against the source pages; no additional property/model release is asserted.

## Previous opening-animation revision — 28 October 2026

The coordinated 1100ms entrance is implemented and verified. `OPENING-UPDATE.md` lists changed files, exact timing and actual revision checks. New `tests/opening.py` and existing `tests/acceptance.py` both passed against the latest managed and clean no-env production outputs. Clean results overwrite `tests/results/opening.json` and `tests/results/acceptance.json`.

Latest `bun run lint` passed with zero warnings/errors; both web-only builds passed. Clean JS is now 275.27kB / 95.24kB gzip; managed JS 512.13kB / 160.34kB gzip; CSS 52.32kB / 11.46kB gzip in both. Original-release loading measurements above are historical, not fresh revision benchmarks. Existing warning and unverified-device/browser limitations still apply.

Opening checks cover exact timing/ease-out, 0/450/1100ms transforms and opacity, stable 360/390/768/1440px layouts, immediate reduced-motion final states, clickable early CTAs, initial load/reload, direct Services/Estimate fragments, no interaction replay and no image/font loading gate. Existing full acceptance again verified all five responsive widths and menu/services/gallery/divider/planner functionality and privacy.

## Current cinematic refinement

See `MOTION-REFINEMENT.md` for the new 1800ms sequence and exact observed publication status. Latest opening, hover-motion and full acceptance suites passed against managed and clean no-env production outputs. Unpaused local production initial load/full reload was recorded and its six records validated, at 1440/390px plus 1440px reduced motion. Clean latest JSONs replace opening/hover/acceptance results.

Latest managed build: JS 512.51kB / 160.37kB gzip; clean build JS 275.46kB / 95.25kB gzip; CSS 53.13kB / 11.57kB gzip in both. Lint zero warnings/errors; both builds passed. Existing template warnings remain non-blocking.

Earlier published-page inspections before platform publication served the previous 1100ms CSS. **After the user published the revision, the actual public URL was verified** to serve `index-b9t0d1cH.css`, the 1800ms photo, staggered 700ms masked headline reveals and later CTAs. Six unpaused public initial-load/full-reload captures with cache disabled passed independent validation at 1440/390px normal motion and 1440px reduced motion. Exactly six starts per normal load, zero under reduced motion; all reached final states. Evidence: published-confirmed.json, published-validation.json and screen recordings.

Additional live Services/preselection/estimate preview/header-wordmark navigation smoke test passed without entrance replay. Footer “Back to top” pointer activation was blocked by the Runable badge overlap at 1440×1000, recorded in published-interactions.json and not changed in this verification-only turn. No physical-device, Safari/Firefox, screen-reader or throttled speed test was performed.