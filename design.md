# FieldNorth — Design

Source of truth: the eight-page FieldNorth Premium Brief, approved 28 October 2026.

Single-page fictional contractor portfolio. Outdoor editorial scale meets architectural precision. Full-bleed dark machine hero, warm ivory editorial sections, signature dark landscape interaction and intentional dark closing wordmark.

## Brand & Colors

One token set, consumed per platform:

- **Web & desktop**: CSS variables in `packages/web/src/web/styles.css` (desktop loads the web UI).
- **Mobile**: `Colors.light` / `Colors.dark` in `packages/mobile/constants/theme.ts`, read via `useColors()`; `userInterfaceStyle: "automatic"` follows the system light/dark setting.

| Token | Light | Dark | Use |
|-------|-------|------|-----|
| primary | #F2BB3F | #F2BB3F | Actions |
| background | #F3F0E8 | #14251D | Section surfaces |
| card | #E9E7DE | #101914 | Selective panels |
| foreground | #1B2922 | #F3F0E8 | Text |
| mutedForeground | #59665D | #B7C1B8 | Secondary text |
| border | #D5D8CB | #39483D | Hairlines |
| destructive | #9F3025 | #FFB9AC | Errors |

## Typography

Locally hosted variable Manrope, 400–800. Heavy, close-tracked headlines, calm readable body. System monospace short numbered labels. Maximum 1280px content, 64px desktop and 20px mobile gutters. Thin rules, spacious asymmetric layouts; no repeated rounded-card grid.

## Pages & Screens

Web-only page composed through pages/index.tsx. Anchors: top, services, potential, scenarios, process, area, faqs, estimate. Desktop left service selector/right photo and copy; asymmetric gallery; large single-photo planning overlay; fine-rule process; local schematic region; accordion; three-view estimate planner.

## Key User Flows

1. General estimate CTA scrolls without inventing a service. Service CTA preselects its own service while preserving unfinished property details.
2. Work → property → demo preview. Inline validation, sample fill, Back, Edit and full reset. No data transmission or persistence.
3. Native dialogs for gallery and mobile menu: Escape, containment, focus return. Native range divider supports pointer/touch/keyboard. Reduced-motion override for all 150–280ms transitions.

## Architecture

- React and native CSS/SVG only. No application API calls; no new database routes or schema. Preserve managed backend scaffolding and attribution.
- Generated illustrative loader; verified free-license Unsplash meadow and Florida woodland access photographs. All local, optimized WebP and local font. Never label them as client jobs.
- Purposeful responsive re-composition for 360/390/768/1024/1440. Minimum 16px mobile body, 44px controls, safe hero contrast and mobile machine crop.

## Opening revision — 28 October 2026

Follow the supplied one-page hero-motion brief without changing content or composition. Replace the grouped fade with overlapping CSS transform/opacity entrances: photo 0–1100ms (scale 1.035→1), headline groups 60–600 / 140–680 / 220–760ms (20px), copy 330–830ms (12px), both buttons 420–920ms (12px). Smooth ease-out; base styles remain fully visible and motion is enabled only under `prefers-reduced-motion: no-preference`. No loading gate, scroll effect, storage, library, new assets or backend changes. Preserve natural wrapping, image crop and header dimensions.

## Cinematic motion refinement — current direction

Supersedes the 1100ms entrance above. Published inspection confirmed it runs, but aggressive ease-out, 80ms line staggering and a photo that arrived mid-animation make it easy to miss. Preload the existing responsive hero photo from HTML (without blocking content). Photo scale 1.08→1 over 1800ms, slower ease-out. Masked headline lines reveal from 110% Y at 120 / 360 / 600ms for 700ms each; copy 1000–1500ms; CTAs 1300–1800ms. Preserve original layout and natural wrapping. Smooth 260ms button/arrow effects and 650ms subtle image zoom on fine-pointer gallery/service hover, with keyboard gallery focus support. Reduced motion removes entrance, hover transforms and transitions. No entrance replay on in-page actions, scroll-triggered hiding, storage or new dependencies.
