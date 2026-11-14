# ADR-001: Use Vite and React for the QML learning site

- Status: Accepted
- Date: 2026-11-14
- Decision owners: QML repository maintainers

## Context

QML is hosted as a static GitHub Pages project at `/QML/`. It has three established document URLs, a large README that must be navigable in-site, locally stored figures, and interactive educational examples. It does not need a server runtime or server-side data loading.

The implementation needs a build-time content index and the ability to emit multiple HTML documents while keeping the existing URLs. All dependency resolution and verification run in GitHub Actions under this repository's CI-only rule.

## Decision

Use Vite, React, and TypeScript as a static multi-page application. Configure `/QML/` as Vite's base and retain `index.html`, `learn.html`, and `library.html` as separate build inputs. Bundle the repository README at build time, render it through the sanitized Markdown pipeline, and keep topic routes as fragments within `library.html`.

## Alternatives considered

- **Next.js static export:** It can emit a static site, but this project does not need its server-oriented route or data features. Its export mode imposes additional constraints on server-dependent features and dynamic routes without solving a current requirement.
- **Keep imperative static pages:** This preserves the current output but leaves the README index, navigation, and interactive labs coupled to page-specific DOM scripts.

## Consequences

- GitHub Pages continues serving the three existing page paths from `dist/`.
- No server rewrites are required for topic navigation.
- README text is available without a runtime network request and can be checked for heading, TOC, link, and image coverage in CI.
- Vite, React, and Markdown dependencies must be pinned through a committed npm lockfile before normal CI uses `npm ci`.
- The Markdown content remains source material; inherited claims are labeled unreviewed and curated explanations carry their own source links.
- The labs are idealized educational simulations and must not imply hardware execution or quantum advantage.

## References

- [Vite static deployment guide](https://vite.dev/guide/static-deploy)
- [Vite multi-page build guide](https://vite.dev/guide/build)
- [Next.js static export guide](https://nextjs.org/docs/app/guides/static-exports)
