# FieldNorth — opening animation update

Implemented from the attached 28 October 2026 PDF in the existing project. The current content, typography, header, responsive crop, sections, attribution, dependencies and estimate demo remain intact.

## Changed files

- `packages/web/src/web/components/fieldnorth-site.tsx`: three stable headline groups, preserving amber emphasis and natural wrapping; one initial fragment-position correction after React mounts. No animation lifecycle state or storage.
- `packages/web/src/web/fieldnorth.css`: replaced the single grouped hero fade with six overlapping CSS animations, enabled only when motion is allowed. Keyboard focus makes the CTA group immediately visible.
- `tests/opening.py`: new repeatable production-browser checks for timing, transforms, opacity, layout, reduced motion, early CTA access, load/reload, direct links and no replay.
- `tests/results/opening.json` and `tests/results/acceptance.json`: actual passing results from the latest clean production build.
- `design.md`, `task.md`, `CHECKS.md`, `OPENING-UPDATE.md`: design decision, progress and verified handoff notes. These instructions are not rendered on the website.

## Implemented timing

| Element | Start → finish | Movement |
|---|---|---|
| Existing local hero photo | 0–1100ms | Scale 1.035 → 1 |
| Clear the land. | 60–600ms | Opacity 0 → 1; Y 20px → 0 |
| Make room for | 140–680ms | Opacity 0 → 1; Y 20px → 0 |
| what’s next. | 220–760ms | Opacity 0 → 1; Y 20px → 0 |
| Supporting copy | 330–830ms | Opacity 0 → 1; Y 12px → 0 |
| Both buttons together | 420–920ms | Opacity 0 → 1; Y 12px → 0 |

All use `cubic-bezier(0.22, 1, 0.36, 1)`. Only transforms and opacity are animated. Base CSS presents the complete hero; reduced motion disables the entrance. No preloader, overlay, scroll lock, font/image gate, new library, video or generated imagery.

## Actual verification

- `bun run lint`: passed, 0 warnings / 0 errors.
- `bun run build:web`: passed with frontend and Vite-config TypeScript checks. Managed bundle: JS 512.13kB / 160.34kB gzip; CSS 52.32kB / 11.46kB gzip.
- Web-only build in the existing clean reproduction directory, with no `.env`: passed. Clean static bundle: JS 275.27kB / 95.24kB gzip; same CSS. This output is in the revised static archive, suitable for the documented root-domain static hosting setup. No Hostinger deployment was performed.
- `python tests/opening.py`: passed against managed and clean production outputs served by files-only HTTP servers. Exact delays/durations/easing verified; sampled start, 450ms and 1100ms styles. Real-clock load/reload and no replay on navigation, services and planner actions passed.
- `python tests/acceptance.py`: passed against both latest production variants. Navigation, mobile-menu keyboard containment/Escape, all three service preselection flows, all gallery dialogs, keyboard/pointer/emulated-touch planning divider, FAQ, validation, estimate preview/Edit/reset and form privacy remain working.
- 360, 390, 768 and 1440px: stable layout dimensions throughout the entrance, immediate final reduced-motion states, and direct Services/Estimate links retain the existing CSS anchor offsets. Existing acceptance also covered 1024px without horizontal overflow.
- Both hero CTAs were hit-tested and pointer-clicked at the entrance's fully transparent initial state. Keyboard focus immediately reveals the button group.
- Blocking local image/font loads did not block the text entrance. No entrance-related storage or body scroll lock; no browser page errors.
- Desktop and requested mobile/tablet opening screenshots visually reviewed for final composition; desktop midpoint also reviewed. The preview uses normal live CSS timing, not the test's paused timeline.

## Warnings and unverified checks

Existing template warnings remain: future Vite native-loader compatibility and Node `module.register()` deprecation. The managed build also retains its >500kB chunk warning; the clean static build does not. None are build failures.

Tests used headless desktop Chrome and emulated viewport/touch settings, not physical iOS/Android devices. Safari, Firefox, screen readers, Lighthouse/throttled performance, production-domain publishing and actual Hostinger hosting were not tested. No real lead submission is enabled or claimed.

Reload the preview at the top to see the opening again. If the system/browser requests reduced motion, the final hero is deliberately shown immediately.