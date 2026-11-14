# QML Vite + React learning site walkthrough

## Delivered

- Migrated the three existing URLs to a Vite + React + TypeScript multi-page app under the `/QML/` Pages base.
- Indexed the full repository README into in-site chapter, topic, TOC-only, link, and image routes. Original README text remains labeled as unreviewed; curated lessons include their own source links.
- Added the black and green field-manual design, responsive navigation, a searchable library, a guided book, and interactive state, measurement, Bell-pair, and toy-classifier labs.
- Preserved the README figures and Pages verification document in the public asset tree.
- Committed `package-lock.json`, and configured Actions for `npm ci`, lint, typecheck, README/math tests, build integrity, Playwright checks, evidence screenshots, and Pages deployment.

## Verification evidence

- Source revision verified: `6ce168605248871bb29f81bb138f16e969fdd375`.
- GitHub Actions run: [43582477133](https://github.com/krishujeniya/QML/actions/runs/43582477133), completed successfully on 2026-11-14.
- Passed steps: committed-lockfile install, ESLint, TypeScript app and config checks, README index and quantum math tests, Vite production build, generated asset verification, Chromium setup, all three Playwright scenarios, Pages artifact upload, and deploy-pages.
- Screenshot evidence: Actions artifact `qml-ui-evidence`; home desktop/mobile, topic page, book desktop/mobile, labs, and mobile library screenshots were captured and visually reviewed.
- The independent checker reviewed this source revision and reported no remaining concrete blockers.
- Deployment configuration reports [https://krishujeniya.github.io/QML/](https://krishujeniya.github.io/QML/) from `main`.
- Static secret scan passed. `git diff --check` passed. No dependency installation, build, lint, typecheck, unit test, or browser test ran locally.

## CI notices

Actions completed with warnings that several upstream actions target Node.js 20 and were forced onto Node.js 24, and that `ubuntu-latest` will migrate to Ubuntu 26. These did not fail this run.

## Architecture decision

The site uses Vite + React rather than Next.js because the repository needs static output, three preserved HTML entry points, and client-side labs, with no server runtime. The `/QML/` base and multi-page build map directly to GitHub Pages. See [ADR-001](../../../docs/adr/ADR-001-vite-react-github-pages.md).
