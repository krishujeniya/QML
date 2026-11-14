# QML learning site architecture

## Stack and deployment

The site uses Vite, React, and TypeScript as a static multi-page application. GitHub Pages serves the repository at `/QML/`; `vite.config.ts` owns this base path. `index.html`, `learn.html`, and `library.html` remain independent build inputs so existing URLs continue to work. Actions uploads only the generated `dist/` directory after type, content, unit, browser, and build checks pass.

Vite is chosen over Next.js because this site has no server-side data or runtime requirement. Its route state is either one of the three static documents or a fragment inside the README library, so it does not need server rewrites or a Next.js server. This also avoids static-export constraints around dynamic routes and server-only features.

## Source and trust boundaries

- `README.md` is the source for the broad community index. It is imported at build time, indexed into chapter/topic/reference records, and rendered as sanitized Markdown. Inherited descriptions remain labeled as unreviewed; an entry in the library is not an endorsement or fact check.
- TOC entries without matching body text remain discoverable and say that the source has no lesson body.
- Duplicate legacy anchors receive unique route IDs; the original anchors are retained as aliases.
- Curated lessons are separate from README content and link to the sources used for their explanations.
- The book's circuit and measurement demos are idealized educational simulations, not hardware or advantage claims.

## Source layout

```text
src/
  components/          navigation, diagrams, labs, markdown renderer
  data/                README index and curated lesson notes
  pages/               home, book, topic library
  quantum/             simulator math
  styles/              site tokens, layout, reading and lab styles
scripts/
  verify-dist.mjs      checks required generated routes and public assets
.github/workflows/
  pages.yml            installs, checks, browser smoke tests, and deploys dist
public/
  assets/reference-media/  preserved repository figures
  assets/images/            site icon
  googlea76a740b003523ce.html  Pages-served site verification token
```

The library uses stable topic fragments so chapter links can be shared without requiring GitHub Pages fallback routing. README source is bundled into the site rather than fetched at runtime, so the library does not depend on an extra request or a raw Markdown response from Pages.
