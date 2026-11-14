import { useEffect, useMemo, useState } from 'react';
import { curatedLessons } from '../data/curated-lessons';
import type { CuratedLesson } from '../data/curated-lessons';
import type { ReadmeEntry, ReadmeIndex } from '../data/readme-index';
import { MarkdownContent } from '../components/MarkdownContent';
import { Icon } from '../components/Icons';
import { SiteHeader } from '../components/SiteHeader';

type LibraryFilter = 'topics' | 'references' | 'images';
const base = import.meta.env.BASE_URL;

function currentRoute(): string | undefined {
  const match = window.location.hash.match(/^#topic\/(.+)$/);
  if (!match) return undefined;
  try { return decodeURIComponent(match[1]); } catch { return undefined; }
}

function entryHref(id: string) {
  return `#topic/${encodeURIComponent(id)}`;
}

function referenceImageUrl(url: string) {
  if (/^https?:\/\/github\.com\/[^/]+\/[^/]+\/blob\//.test(url)) {
    return url.replace('github.com/', 'raw.githubusercontent.com/').replace('/blob/', '/');
  }
  if (!/^(https?:|data:|\/\/)/i.test(url)) {
    const file = url.split('/').at(-1) ?? url;
    let decoded = file;
    try { decoded = decodeURIComponent(file); } catch { /* Keep malformed source text visible as an unavailable figure. */ }
    return `${base}assets/reference-media/${encodeURIComponent(decoded)}`;
  }
  return url;
}

function labelFor(entry: ReadmeEntry) {
  if (entry.kind === 'chapter') return 'README CHAPTER';
  if (entry.kind === 'toc') return 'TOC ENTRY · SOURCE BODY NOT FOUND';
  if (entry.kind === 'overview') return 'SOURCE OVERVIEW';
  if (entry.kind === 'reference') return 'README LINK · UNREVIEWED';
  return 'README HEADING · UNREVIEWED';
}

export function LibraryPage({ index, source }: { index: ReadmeIndex; source: string }) {
  const [route, setRoute] = useState(currentRoute);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<LibraryFilter>('topics');
  const [mobileOutlineOpen, setMobileOutlineOpen] = useState(false);
  const allPages = useMemo(() => [...index.entries, ...index.referenceEntries], [index]);
  const current = allPages.find((entry) => entry.id === (route ? index.aliases.get(route) ?? route : undefined));
  const normalized = query.trim().toLowerCase();
  const searchable = filter === 'topics'
    ? [...index.entries.filter((entry) => entry.kind !== 'overview'), index.entries[0]]
    : index.referenceEntries.filter((entry) => filter === 'images' ? entry.references[0]?.kind === 'image' : entry.references[0]?.kind === 'link');
  const visible = normalized ? searchable.filter((entry) => `${entry.title} ${entry.sectionTitle} ${entry.excerpt} ${entry.body}`.toLowerCase().includes(normalized)) : searchable;
  const lesson = current ? curatedLessons[current.id] : undefined;

  useEffect(() => {
    const updateRoute = () => setRoute(currentRoute());
    window.addEventListener('hashchange', updateRoute);
    return () => window.removeEventListener('hashchange', updateRoute);
  }, []);

  useEffect(() => {
    document.title = current ? `${current.title} — QML Field Manual` : 'Topic Library — QML Field Manual';
    if (current) {
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
      document.getElementById('library-reading')?.focus({ preventScroll: true });
    }
  }, [current]);

  const visibleByChapter = (chapter: ReadmeEntry) => visible.filter((entry) => entry.sectionId === chapter.id && entry.kind !== 'chapter');

  return (
    <>
      <SiteHeader current="library"/>
      <main className="library-shell shell">
        <aside className={`library-sidebar ${mobileOutlineOpen ? 'outline-open' : ''}`}>
          <div className="library-sidebar-top"><span className="eyebrow">REPOSITORY FIELD INDEX</span><button className="outline-toggle" aria-expanded={mobileOutlineOpen} onClick={() => setMobileOutlineOpen((open) => !open)}>{mobileOutlineOpen ? 'Close outline' : 'Open outline'}</button></div>
          <label className="library-search"><Icon name="search"/><span className="visually-hidden">Search README chapters, topics, and references</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search the source index"/></label>
          <div className="library-filters" role="group" aria-label="Filter source index">
            {([['topics', 'Topics'], ['references', 'Links'], ['images', 'Figures']] as const).map(([value, title]) => <button key={value} aria-pressed={filter === value} onClick={() => setFilter(value)}>{title}<span>{value === 'topics' ? index.headingCount + index.tocCount - 1 : value === 'images' ? index.references.filter((item) => item.kind === 'image').length : index.references.filter((item) => item.kind === 'link').length}</span></button>)}
          </div>
          <nav className="library-outline" aria-label="README sections">
            {filter === 'topics' ? <>
              {index.chapters.map((chapter) => {
                const children = visibleByChapter(chapter);
                if (normalized && !visible.some((entry) => entry.id === chapter.id) && !children.length) return null;
                return <details key={chapter.id} open={!!normalized || chapter.id === current?.sectionId}>
                  <summary><span>{chapter.title}</span><small>{children.length}</small></summary>
                  <a className="outline-chapter" href={entryHref(chapter.id)} aria-current={current?.id === chapter.id ? 'page' : undefined}>Chapter overview</a>
                  {children.map((entry) => <a className="outline-topic" key={entry.id} href={entryHref(entry.id)} aria-current={current?.id === entry.id ? 'page' : undefined}>{entry.title}</a>)}
                </details>;
              })}
              <a className="outline-overview" href={entryHref('overview')}>README introduction</a>
            </> : visible.slice(0, 120).map((entry) => <a className="outline-reference" key={entry.id} href={entryHref(entry.id)}><span>{entry.title}</span><small>line {entry.line}</small></a>)}
          </nav>
          <div className="source-stamp"><span>INDEXED FROM</span><strong>README.md</strong><span>{index.headingCount} headings · {index.references.length} references</span></div>
        </aside>

        <section className="library-reading" id="library-reading" tabIndex={-1}>
          {current ? <TopicReading entry={current} index={index} lesson={lesson} allEntries={index.entries}/> : <LibraryIndex index={index} source={source} entries={visible} filter={filter} query={query}/>}
        </section>
      </main>
      <footer className="site-footer"><div className="shell"><span>README ENTRIES ARE SOURCE MATERIAL · CURATED NOTES CARRY THEIR OWN SOURCES</span><a href={`${base}learn.html`}>Continue the book <Icon name="arrow"/></a></div></footer>
    </>
  );
}

function LibraryIndex({ index, source, entries, filter, query }: { index: ReadmeIndex; source: string; entries: ReadmeEntry[]; filter: LibraryFilter; query: string }) {
  if (filter !== 'topics') {
    return <>
      <div className="reading-meta"><a href={`${base}index.html`}>Field guide</a><span>/</span><span>Source references</span></div>
      <span className="chapter-label">{filter === 'images' ? 'FIGURE INDEX' : 'REFERENCE INDEX'}</span>
      <h1>{filter === 'images' ? 'Every image in the README' : 'Every linked source'}</h1>
      <p className="reading-deck">These destinations are collected from the original README. They have not been independently reviewed. Open a record to see where it appears in the source.</p>
      <div className="reference-grid">{entries.map((entry) => <a className="reference-card" key={entry.id} href={entryHref(entry.id)}><span className="reference-kind">{entry.references[0]?.kind === 'image' ? 'IMAGE REFERENCE' : 'LINKED SOURCE'}</span><strong>{entry.title}</strong><small>{entry.excerpt}</small></a>)}</div>
      {!entries.length && <p className="empty-state">No source records match “{query}”. Clear the search to browse all references.</p>}
      <p className="source-disclaimer">Reference count: {filter === 'images' ? index.imageCount : index.externalUrlCount} unique destinations from README.md.</p>
    </>;
  }

  const topicCount = index.topicEntries.length;
  return <>
    <div className="reading-meta"><a href={`${base}index.html`}>Field guide</a><span>/</span><span>README library</span></div>
    <span className="chapter-label">THE COMPLETE REPOSITORY INDEX</span>
    <h1>{query ? `Search results for “${query}”` : 'Explore quantum machine learning'}</h1>
    <p className="reading-deck">All source chapters, subtopics, links, and figures are listed here. Open any entry for an in-site reading page. Inherited claims remain marked as unreviewed.</p>
    <div className="library-coverage"><div><strong>{index.headingCount}</strong><span>source headings</span></div><div><strong>{index.tocCount}</strong><span>contents rows</span></div><div><strong>{topicCount}</strong><span>topic routes</span></div><div><strong>{index.references.length}</strong><span>reference routes</span></div></div>
    {!query && <details className="readme-overview"><summary>Original README introduction and figures</summary><MarkdownContent source={index.overview} index={index}/></details>}
    {query ? <div className="topic-tile-grid">{entries.map((entry) => <TopicTile key={entry.id} entry={entry}/>)}</div> : index.chapters.map((chapter) => {
      const children = index.topicEntries.filter((entry) => entry.sectionId === chapter.id);
      return <section className="chapter-index-section" key={chapter.id}><div className="chapter-index-heading"><span>{String(chapter.line ?? '').padStart(3, '0')}</span><h2>{chapter.title}</h2><a href={entryHref(chapter.id)} aria-label={`Open chapter: ${chapter.title}`}><Icon name="arrow"/></a></div><div className="topic-tile-grid">{children.map((entry) => <TopicTile key={entry.id} entry={entry}/>)}</div></section>;
    })}
    {!entries.length && query && <p className="empty-state">No README entries match this search.</p>}
    <details className="readme-complete"><summary>Read the full README source in one page</summary><MarkdownContent source={source} index={index}/></details>
  </>;
}

function TopicTile({ entry }: { entry: ReadmeEntry }) {
  return <a className="topic-tile" href={entryHref(entry.id)}><span>{labelFor(entry)}</span><strong>{entry.title}</strong><small>{entry.excerpt || (entry.kind === 'toc' ? 'Listed in the source index; explanatory text is not present in the README.' : 'Open this source chapter.')}</small><Icon name="arrow"/></a>;
}

function TopicReading({ entry, index, lesson, allEntries }: { entry: ReadmeEntry; index: ReadmeIndex; lesson?: CuratedLesson; allEntries: ReadmeEntry[] }) {
  const related = allEntries.filter((item) => item.sectionId === entry.sectionId && item.id !== entry.id && item.kind !== 'chapter' && item.kind !== 'overview').slice(0, 8);
  const reference = entry.kind === 'reference' ? entry.references[0] : undefined;
  return <>
    <div className="reading-meta"><a href={`${base}library.html`}>README library</a><span>/</span><span>{entry.sectionTitle}</span></div>
    <span className="chapter-label">{reference?.kind === 'image' ? 'README IMAGE REFERENCE' : labelFor(entry)}</span>
    <h1>{entry.title}</h1>
    <p className="reading-deck">{lesson?.intro ?? (entry.kind === 'toc' ? 'This subtopic appears in the README table of contents, but no matching lesson body is present in the source.' : entry.kind === 'reference' ? `Linked from the original README at line ${entry.line}. This reference has not been independently reviewed.` : 'This is source material from the repository README. It has not been independently reviewed or rewritten as a verified lesson.')}</p>
    {lesson && <section className="curated-note"><span className="curated-label"><Icon name="check"/> CURATED NOTE · SOURCE LINKS INCLUDED</span>{lesson.sections.map(([heading, body]) => <div key={heading}><h2>{heading}</h2><p>{body}</p></div>)}<div className="curated-source-list"><h3>Sources for this note</h3><ul>{lesson.sources.map(([title, url]) => <li key={url}><a href={url} target="_blank" rel="noopener noreferrer">{title}</a></li>)}</ul></div></section>}
    {entry.kind === 'toc' ? <div className="missing-source"><span className="eyebrow">SOURCE GAP</span><p>No explanatory body or direct source was found for this table-of-contents entry. It is kept here so the original index remains complete.</p></div> : entry.kind === 'reference' ? <div className="reference-destination"><span className="eyebrow">ORIGINAL DESTINATION · README LINE {entry.line}</span><a href={reference?.url} target="_blank" rel="noopener noreferrer">{reference?.url}<Icon name="arrow"/></a>{reference?.kind === 'image' && <img src={referenceImageUrl(reference.url)} alt={reference.title} loading="lazy"/>}</div> : entry.body && <details className="original-source" open><summary>{entry.kind === 'overview' ? 'Original README introduction' : 'Original README text · unreviewed'}</summary><MarkdownContent source={entry.body} index={index}/></details>}
    {entry.references.length > 0 && <section className="topic-references"><h2>References in this entry</h2><div className="reference-grid">{entry.references.map((item) => <a className="reference-card" key={item.id} href={item.url} target="_blank" rel="noopener noreferrer"><span className="reference-kind">{item.kind === 'image' ? 'IMAGE' : 'SOURCE'} · README LINE {item.line}</span><strong>{item.title}</strong><small>{item.url}</small></a>)}</div></section>}
    {related.length > 0 && <section className="related-topics"><h2>More in {entry.sectionTitle}</h2><div className="topic-tile-grid">{related.map((item) => <TopicTile key={item.id} entry={item}/>)}</div></section>}
    <div className="reading-actions"><a className="button button-quiet" href={`${base}library.html`}>← All topics</a>{entry.sectionId !== entry.id && <a className="text-link" href={entryHref(entry.sectionId)}>Chapter overview <Icon name="arrow"/></a>}</div>
  </>;
}
