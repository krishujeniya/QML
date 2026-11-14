# QML frontend modernization

## Gate 1: Understand

**Objective:** Replace the hand-authored static pages with a maintainable Vite + React learning site while preserving GitHub Pages deployment and complete in-site access to the repository README.

**Accepted deliverables:** Keep `/QML/`, `/QML/learn.html`, and `/QML/library.html`; render every README heading and TOC-only entry inside the site; retain curated source notes and all interactive labs; use the established black/green palette; add CI build, type, content-integrity, and browser checks; deploy from Actions.

**Acceptance criteria:**

- Vite emits a static `dist/` suitable for the `/QML/` project Pages base.
- Existing URLs continue to open their corresponding React pages.
- All README chapters, 226 table-of-contents rows, headings, source links, and image references remain browsable, with missing source bodies labeled clearly.
- Duplicate legacy anchors resolve to unique in-site route IDs without losing aliases.
- Book controls work as idealized simulations and state their limits.
- Keyboard focus, reduced motion, and narrow screens are supported.
- GitHub Actions runs install, typecheck, tests, build, browser smoke checks, then deploys only after they pass.

## Gate 2: Analyze and scope

**Repository:** Static GitHub Pages project on `main`; current root HTML pages fetch/parse `README.md` in the browser and use imperative scripts. The root Pages workflow validates links then uploads the whole repository.

**Decision:** Use Vite + React instead of Next.js. This site needs static assets and client-side educational interactions, not a server runtime. Vite's `/QML/` base directly matches the project Pages URL and supports multiple HTML inputs, preserving existing page paths.

**Scope boundary:** `index.html`, `learn.html`, `library.html`, `src/`, `public/`, `assets/reference-media/`, `docs/site-architecture.md`, `docs/adr/ADR-001-vite-react-github-pages.md`, package/Vite/TypeScript configuration, `.gitignore`, `.github/workflows/pages.yml`, and this milestone's `.agents/state/` records.

**Risk:** README parsing must preserve nested image links, explicit anchors, TOC-only topics, and duplicate anchors. Vite build output must not break Pages subpath assets. Dependency resolution and all machine verification are CI-only. Changes are reversible through Git.

**Scope score:** Files 4/4, cross-references 3/4, risk 2/4, novelty 4/4, verification 3/4, reversibility 1/4; **17/24 (major)**. Strategy: one maker, independent read-only research and review, independent checker. Gate process: full.

**Permissions:** Read the current pages, README, assets, workflow, and relevant official Vite/React/Markdown docs. Write only within the scope boundary above. Run static inspection and `git diff --check` locally; run dependency resolution, tests, type checks, browser checks, and builds only in GitHub Actions. Network access is limited to official docs and the requested GitHub repository/Actions.

## Gate 3: Plan

1. Add Vite + React + TypeScript with three HTML entry points and a `/QML/` base.
2. Import README and contribution source at build time; create a typed index for headings, TOC entries, aliases, links, and image references.
3. Replace imperative pages with shared navigation, a course home, book/lab components, and searchable in-site topic/reference pages.
4. Preserve idealized state-vector, measurement, Bell-pair, and toy-classifier labs; keep the CSS-rendered 3D Bloch sphere and reduced-motion fallback.
5. Move preserved reference media into the Vite public tree; keep legacy URLs and verification files working.
6. Make Actions install from a committed lockfile, run type/content/unit/browser checks and build, then upload only `dist/` for Pages. Bootstrap the initial lockfile as a CI artifact because local dependency resolution is prohibited.
7. Run `git diff --check`, obtain independent review, commit/push to `main`, and monitor Actions for the pushed SHA.

**Verification commands (Actions only):** `npm ci`, `npm run check`, `npm run test:e2e`, `npm run build`; then Pages link validation and deployment.

**Authorization:** The operator explicitly requested implementation and push in this thread. This authorizes the selected static-site architecture and the requested deploy after CI verification.

## Gate 4: Implement

- Added the Vite + React + TypeScript three-entry site, README source index, searchable topic/reference routes, curated book lessons, and idealized interactive labs.
- Preserved `/QML/`, `/QML/learn.html`, `/QML/library.html`, referenced figures, site verification file, and README topic aliases.
- Added route/content/math checks and Playwright smoke coverage to Actions. Dependency resolution and all executable verification remain CI-only.
- Independent review found and corrected Playwright navigation paths that omitted `/QML/` under the configured base URL.
- Follow-up accessibility review changed topic scroll behavior to `auto` when reduced motion is requested.
- Static security scan passed with no matching secrets. The README index and route behavior remain source-inspection claims until Actions runs the checked-in assertions.
- The lockfile is bootstrapped by the first Actions run and uploaded as `qml-package-lock`; it must be committed before the final repeat run.
- Current status: implementation staged for CI; no build, test, lint, typecheck, or browser suite has run locally.
