# FieldNorth Land Clearing

A complete, single-page fictional contractor website concept by Miguel Filipe Web, implemented from the eight-page premium brief. React, TypeScript, native CSS and lightweight local SVGs on Runable’s managed Bun/Vite monorepo. No product database, authentication, integrations or submission destination have been added.

## Reproduce the web-only build

Package manager: **Bun 1.4.4** (the runtime actually used and recorded in the root `packageManager`), with committed `bun.lock`. The web workspace is **`@template/web`**, located at **`packages/web`**. Run from the project root:

```sh
bun install --filter @template/web --frozen-lockfile
bun run build:web
```

`build:web` invokes only the web workspace’s build: frontend/config TypeScript checks followed by `vite build`. It does not build Expo or Electron. Production output is **`packages/web/dist/`**. Vite uses `base: "/"`; deploy the contents of this directory to a **domain root**, not a subdirectory. No API server, database, environment secrets or Runable account session is needed to use the built page or its interactions.

Alternatively, from `packages/web`, run `bun run build`. Do **not** run the root `bun run build` for this deployment: that template command builds every workspace.

## Preview the static output

After building, from the root:

```sh
python3 -m http.server 8080 --bind 127.0.0.1 --directory packages/web/dist
```

Open `http://127.0.0.1:8080/`. This serves files only and proves the site does not depend on the template API. A modern browser and HTTP hosting are required; opening `index.html` with `file://` is not supported for module scripts.

For editing in Runable, `bun run dev` starts the managed web service on its assigned port **4200**, as defined in `__ports.cjs` / `.runable/ports.json`. Never change that port. Deployment controls in Runable remain platform-managed.

## Implementation

- Anchors: `top`, `services`, `scenarios`, `potential`, `process`, `area`, `faqs`, `estimate`.
- Service showcase with keyboard-operable selection, image/copy transitions and exact service-to-planner preselection.
- Three illustrative photo scenarios, accessible modal lightboxes and a mobile navigation dialog with explicit focus containment, Escape and focus return.
- **Photo / Planning concept** mode: one Florida woodland photograph with an illustrative overlay for area to open, access route and trees to keep. No unrelated-image Before/After claim. The range divider supports pointer, emulated touch and keyboard.
- Three-view planner: work, property, demo request preview. Required-field/email validation, sample project, Back, Edit and complete reset.
- All planner data exists only in component memory. No fetch, endpoint, email, logging, cookie, web storage or database receives form values. All sample requests clearly state **No request was sent**. Refresh clears the state.
- Responsive layouts for the five brief widths, reduced-motion support, local variable font and local responsive WebP images.
- Descriptive title, `noindex,follow`, local social-preview image and favicon. No invented LocalBusiness schema, business proof or contact information.

Content is in `src/web/components/fieldnorth-content.ts`; the page is composed by `src/web/components/fieldnorth-site.tsx`, and the planner lives in `src/web/components/estimate-planner.tsx` (paths relative to `packages/web`). Design decisions live in `design.md`. See `ASSETS.md` for image/font origin and usage status.

## Remaining platform dependencies

The required Runable attribution badge is retained. The unchanged analytics plugin injects the locally served **`/runable.js`**, which can send a generic pageview to **`https://r.lilstts.com/events`**. This optional collector is an external platform dependency, **not an application backend**. Core functionality is tested with all external network access blocked. No form values are passed to the script; an active-analytics privacy test also captures its payloads and checks for sentinel form values. The `data-private` attributes are descriptive, not a substitute for this privacy verification.

The template QueryClient provider and backend scaffolding remain intact but are not called by this frontend. Development-only AgentFeedback is preserved for the Runable preview; it is absent from production when built in production mode. A source export without provisioned environment values uses the public `fieldnorth-portfolio` identifier only to avoid the template’s localhost diagnostics overlay; the real platform application identifier takes precedence. There is no telemetry-free claim for the platform itself.

## Verification

See `CHECKS.md` and `tests/results/acceptance.json` for actual results and limitations. `tests/acceptance.py` exercises the built website using Python Playwright and local Chrome against a files-only server. Run with:

```sh
python3 -m http.server 4500 --bind 127.0.0.1 --directory packages/web/dist
# In another terminal (requires Python playwright + Google Chrome):
python3 tests/acceptance.py
```

The editable source archive excludes credentials, `node_modules`, build caches and test screenshots. The static archive contains only ready-to-host `dist` contents. Neither archive includes a real lead-delivery integration.
