# FieldNorth — cinematic motion refinement

## Outcome and publication status

The updated preview has a coordinated **1.8-second entrance**, masked line-by-line headline reveals, later CTA entry, smoother hover feedback and subtle gallery/service-photo zoom interactions. Existing design, content, responsive dimensions, attribution and estimate-demo behavior remain intact. No library, generated media, storage or backend changes.

**Published revision is now verified after the user published it.** Fresh headless Chrome contexts and full reloads with network cache disabled confirmed `https://fieldno-zfawbud.runable.site/` serves HTTP 200 and the new `index-b9t0d1cH.css`. The actual live computed animations are 1800ms for the photo, 700ms masked headlines at 120/360/600ms, and 500ms CTA entry starting at 1300ms. Earlier inspections before publication served the previous release; those records are retained as historical evidence.

## Why the previous entrance was easy to miss

- It was **present and running** in the published page, not a missing stylesheet/animation rule. With explicit no-preference motion, all six animation starts were recorded on desktop and mobile initial loads and full reloads.
- The old photo zoom was just **3.5%**, using an aggressive ease-out. In the first measured cold loads, the image became ready around **526ms desktop / 440ms mobile** after hero observation, at scales **1.00467 / 1.00377**. Less than 0.5% visible zoom remained. These are specific observations, not a general network benchmark.
- Headline starts were only **80ms apart**, so the short opacity/movement reveals largely overlapped rather than reading as three distinct beats.
- The hero image originally began loading from the React-rendered picture. Responsive HTML preloads now start the correct photo earlier, without gating text on image or font readiness.
- Reduced motion intentionally disables entrance animation. This was verified on the published page too; I did not inspect the user's personal browser/OS preference. In-page navigation and hot updates are not full reloads and should not replay a once-per-load entrance.

## New motion

| Element | Start → finish | Treatment |
|---|---|---|
| Existing hero photo | 0–1800ms | Scale 1.08 → 1, cropped within the existing hero |
| Clear the land. | 120–820ms | Masked 110% upward reveal with opacity |
| Make room for | 360–1060ms | Same reveal, separate beat |
| what’s next. | 600–1300ms | Same reveal, amber styling retained |
| Supporting copy | 1000–1500ms | 12px upward fade |
| Both CTAs | 1300–1800ms | 12px upward fade after the headline sequence |

Easing: `cubic-bezier(0.2, 0.65, 0.3, 1)`. The entrance uses only transform/opacity; the line mask is static. No preloader, interstitial, forced delay, scroll lock or load-state storage. The existing keyboard-focus escape immediately reveals the CTA group. It remains pointer-accessible throughout.

Hover refinements: button lift and arrow travel 2px over 260ms; gallery image zoom 1.045 and service-photo zoom 1.035 over 650ms, with unchanged clipping containers. Gallery keyboard focus gets the same image feedback. Fine-pointer hover is restricted to capable devices, avoiding sticky touch zoom. Reduced motion removes movement/transitions but keeps color/focus feedback and complete content.

## Changed files

- `packages/web/src/web/components/fieldnorth-site.tsx`: inner spans for masked headline motion.
- `packages/web/src/web/fieldnorth.css`: new timing/easing, reveal mask, subtle zoom and hover refinements, reduced-motion safeguards.
- `packages/web/index.html`: responsive hero-photo preload, matching the existing picture's mobile/desktop sources.
- `tests/opening.py`: revised 1800ms timing and sampled-state assertions.
- `tests/hover_motion.py`: new actual-clock pointer/keyboard/reduced-motion/touch-emulation tests.
- `tests/published_motion.py`: actual full-load/reload recording and frame/style capture, without pausing animation. Requires Playwright ffmpeg for screen recording.
- `tests/results/`: actual JSON results and browser screenshots/recordings. Final opening/hover/acceptance JSONs target the clean no-env production build.
- `design.md`, `task.md`, `CHECKS.md`, `MOTION-REFINEMENT.md`: current direction and faithful status. Not added to website content.

## What actually passed

- `bun run lint`: **0 warnings / 0 errors**.
- `bun run build:web`: passed TypeScript and production compilation in the managed project. JS **512.51kB / 160.37kB gzip**, CSS **53.13kB / 11.57kB gzip**.
- Same web-only build in the existing clean reproduction directory without `.env`: passed. JS **275.46kB / 95.25kB gzip**, same CSS; static operation remains backend-independent.
- `tests/opening.py`, `tests/hover_motion.py`, and `tests/acceptance.py` passed against **both** production outputs, served by files-only local HTTP servers.
- Opening assertions: exact timing/easing, start/450/1500/1800ms transforms and opacity, purposeful line order and later buttons, one entrance on real-clock load/reload, no replay on hash/service/form changes, immediate reduced-motion states, clickable CTAs, direct section-link positioning, no image/font gate or storage.
- Stable entrance geometry/no horizontal overflow at **360, 390, 768, 1440px**. Existing functional suite also passed at **1024px**. Desktop midpoint and mobile final composition screenshots reviewed.
- Actual-clock hover tests: both image zooms reach the intended scale and return smoothly; container dimensions stay unchanged; button/arrow movement works; keyboard gallery focus works; reduced-motion hover movement is absent; coarse-pointer touch emulation has no sticky hover zoom.
- Existing interaction suite: navigation, mobile-menu focus containment/Escape, all service preselection flows, all gallery dialogs, keyboard/pointer/emulated-touch planning divider, FAQ, validation, preview/Edit/reset and form privacy. No browser page errors or application API requests/form persistence.
- Unpaused local production initial-load/full-reload screen recordings at **1440px and 390px**, plus **1440px reduced motion**. The photo was ready in the first sampled local motion frame at scale 1.08; all six entrance starts occurred once per normal-motion load; reduced-motion loads had none. This is not a published-network performance comparison.
- Earlier published-page observations before the user published the revision showed the old release. **Post-publication verification now confirms the revised entrance** on the actual public URL; details below distinguish this from local tests.

## Post-publication verification

After the user confirmed publication, `tests/published_motion.py` was run on the actual public URL with label `published-confirmed`. Six unpaused screen/frame recordings were captured and independently validated: initial navigation and full reload at **1440×1000** and **390×844** with motion allowed, plus initial navigation and full reload at **1440×1000** with reduced motion. Browser network cache was disabled throughout.

- New stylesheet fingerprint confirmed on all six loads, not inferred from a local build.
- Photo was loaded in the first sampled normal-motion frame at scale **1.08**, visibly zoomed out during the sequence, and reached scale **1** at completion.
- All three headline reveals progressed in order, with intermediate frames showing the first line ahead of the second while CTAs remained hidden; buttons entered afterward and reached opacity 1.
- Exactly **six entrance animation starts per normal-motion document load**: one photo, three headline lines, copy and CTA group. Full reload replayed the entrance once.
- Reduced-motion loads had **zero entrance starts**, no line transforms, and immediate headline/button opacity 1.
- All loads returned HTTP 200; no browser page errors or local/session storage entries were recorded.
- An additional live desktop smoke test passed Services navigation, Forestry Mulching preselection, sample estimate preview and return to top through the header wordmark. Entrance-start count stayed at six: those in-page actions did not replay it.
- The actual live midpoint screenshot was visually reviewed. No CSS animation was paused or manually rewound for these published-page checks.

Evidence: `tests/results/published-confirmed.json`, `published-validation.json`, `published-interactions.json`, corresponding `.webm` screen recordings and `published-cinematic-midpoint.png`. Historical pre-publication observations remain in `published-before.json` and `published-after.json`; local actual-clock observations are in `production-cinematic.json`.

**Additional issue found, not changed in this verification-only turn:** at 1440×1000, the retained Runable badge intercepted the pointer click on the footer's “Back to top” link. Header-wordmark navigation worked. The initial additional-test selector also matched both footer links and was corrected; the badge interception is a genuine layout overlap, not an entrance failure. No new implementation or publishing cycle was started for this unrelated fix.

Physical iOS/Android devices, Safari, Firefox, screen readers and throttled/Lighthouse performance were not tested. Existing non-blocking Vite config-loader/Node deprecation warnings remain, as does the managed >500kB chunk warning; clean build has no large-chunk warning. No Hostinger deployment or real lead delivery was performed.