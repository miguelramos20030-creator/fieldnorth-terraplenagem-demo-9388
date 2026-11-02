# FieldNorth — Design

## Planning section correction

Only `#planejamento`: licensed Ann Perkas/Pexels 15493828 empty dry plot with visible dirt access, no foreground machinery. Dedicated local responsive 3:2 WebP crop; both states share one unchanged image. Keep that full crop and a matching 1200×800 SVG coordinate system at every width so markings cannot drift. Draw the work polygon within the open fenced parcel and trace the horizontal dirt track as it curves uphill at right; labels avoid the access. Preserve Portuguese toggle labels/disclaimer, hero and every other section.

## Hero poster alignment

Replace only the hero poster with an optimized 1280×720 WebP extracted from frame zero of the existing local loop. Image cover/70% center matches the video, including static fallback. Update only the hero alt and its preload; no video, content, control or layout changes.

## Hero working-footage correction — current

Only `#inicio` changes. Keep all existing copy, palette, geometry, poster and secondary interactions. Desktop (768px+, hover/fine pointer) gets local licensed working excavator footage after window load, two painted frames and 250ms; mobile/touch, reduced-motion and save-data keep the poster without mounting/requesting video. Native muted/inline looping video, no audio, 7.208s/720p/24fps/1.363MB source (0.722MB production). Retain four-second CSS entrance; returning flag affects entrance duration only. Add a 44px pause/play control beside replay. Replay scrolls instantly to the hero, restarts entrance and resets media to zero. Offscreen/tab-hidden pauses preserve manual pause. Decode/load/autoplay failure leaves the immediate poster and all navigation usable. This supersedes previous no-video statements only for this desktop hero.

## Brazilian revision — 2 November 2026 (current)

The supplied seven-page Brazilian revision supersedes the English concept below. Keep the existing managed web stack, analytics and badge absence. No API/database changes or publishing. Recoverable source snapshot: `/home/user/fieldnorth-before-br.tar.gz` (excludes credentials and dependencies).

- All visitor-facing copy and metadata: pt-BR, exact supplied strings. Fictional Cascavel/Toledo earthworks concept, not a record of jobs.
- Forest #14251d, ivory #f3f0e8, amber #f2bb3f; local Manrope with 400/700 styling. Oversized readable hero, asymmetrical photography, warm services, dark machinery, editorial applications, photo planning overlay and local in-memory planner.
- Inspected LaMomentum reference on 2 November: cinematic photographic background, oversized contrast-heavy headings. Borrow visual principles, not metrics/testimonials or its multiple videos.
- Photography fallback: licensed Pexels images, no video/download/player, no invented continuous machine movement. Responsive local WebP hero, high priority, all secondary photos lazy and dimensioned. Existing legacy assets remain recoverable but unused in new page.
- First visit: four-second transform-only framing, brand movement/amber line, supporting marks and final scroll indicator. Text/nav/CTAs never hidden. Return entrance 800ms; replay lightweight effects only. A non-personal session flag stores only opening preference; planner data remains in memory. Reduced-motion/save-data removes decorative movement. Once-only IntersectionObserver reveals, 22px/700ms; hover/focus photo feedback.
- Native fragment links + single scroll-margin offset. Mobile dialog closes synchronously before native anchor default. Keyboard dialogs restore focus; photo/overlay toggle uses native pressed buttons; planner supports multiple services, optional machine and no personal data, local summary/copy/reset.
- Verify 320/390/768/1440, production files-only paths, interaction/motion/media failure, three mobile and three desktop cold-cache Lighthouse runs and size budgets. Physical devices and field INP remain explicitly unverified.

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
