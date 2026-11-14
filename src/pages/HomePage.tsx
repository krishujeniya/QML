import { useState } from 'react';
import type { ReadmeIndex } from '../data/readme-index';
import { Icon } from '../components/Icons';
import { SiteHeader } from '../components/SiteHeader';

const base = import.meta.env.BASE_URL;

export function HomePage({ index }: { index: ReadmeIndex }) {
  const [query, setQuery] = useState('');
  const normalized = query.trim().toLowerCase();
  const matches = normalized
    ? index.topicEntries.filter((entry) => `${entry.title} ${entry.sectionTitle} ${entry.excerpt}`.toLowerCase().includes(normalized)).slice(0, 5)
    : [];
  return (
    <>
      <SiteHeader current="home"/>
      <main className="home-main">
        <section className="home-hero shell">
          <div className="hero-copy">
            <div className="eyebrow"><span className="status-dot"/> Quantum machine learning · field manual 01</div>
            <h1>Learn the quantum side of <em>learning.</em></h1>
            <p className="hero-lede">A guided route from qubits and circuits to machine-learning models, with source notes, working simulations, and the assumptions kept in view.</p>
            <div className="hero-actions"><a className="button button-primary" href={`${base}learn.html`}>Open the book <Icon name="arrow"/></a><a className="text-link" href={`${base}library.html`}>Browse all README topics</a></div>
            <div className="home-search-wrap">
              <label className="search-box"><Icon name="search"/><span className="visually-hidden">Search lessons and topics</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a topic, algorithm, or source"/></label>
              {matches.length > 0 && <nav className="search-results" aria-label="Topic suggestions">{matches.map((entry) => <a key={entry.id} href={`${base}library.html#topic/${encodeURIComponent(entry.id)}`}><span><strong>{entry.title}</strong><small>{entry.sectionTitle}</small></span><Icon name="arrow"/></a>)}</nav>}
            </div>
          </div>
          <div className="hero-visual" role="img" aria-label="A three-dimensional orbital diagram representing quantum states">
            <div className="orbital orbital-one"/><div className="orbital orbital-two"/><div className="orbital orbital-three"/>
            <div className="orbital-core"><span>ψ</span><small>STATE</small></div>
            <i className="orbit-node node-a"/><i className="orbit-node node-b"/><i className="orbit-node node-c"/>
            <span className="diagram-caption">STATE SPACE · 2ⁿ AMPLITUDES</span>
          </div>
          <div className="hero-index"><span>READING MAP</span><b>01—06</b><span>FOUNDATIONS TO EVIDENCE</span></div>
        </section>

        <section className="home-section shell" aria-labelledby="start-title">
          <div className="section-heading"><div><span className="eyebrow">Begin with a clear route</span><h2 id="start-title">Build the mental model first.</h2></div><p>Quantum machine learning draws on several fields. Start with the pieces that make the algorithms readable.</p></div>
          <div className="path-grid">
            {[
              ['01', 'Mathematics', 'Vectors, complex numbers, probability, and linear algebra.', 'states'],
              ['02', 'Quantum information', 'States, gates, measurement, registers, and entanglement.', 'circuits'],
              ['03', 'Classical machine learning', 'Models, objectives, generalization, and fair baselines.', 'model'],
              ['04', 'Quantum learning methods', 'Feature maps, kernels, variational circuits, and optimization.', 'model'],
            ].map(([number, title, text, destination]) => <a className="path-step" key={number} href={`${base}learn.html#${destination}`}><span className="path-number">{number}</span><div><h3>{title}</h3><p>{text}</p></div><Icon name="arrow"/></a>)}
          </div>
        </section>

        <section className="index-band" aria-label="README library contents"><div className="shell index-band-inner"><div><span className="eyebrow">One searchable source library</span><h2>Explore the full repository README.</h2><p>Chapters, subtopics, references, and figures open as in-site reading pages. Unreviewed source text is labeled as such.</p><a className="button button-quiet" href={`${base}library.html`}>Open the topic library <Icon name="arrow"/></a></div><div className="library-stats"><div><strong>{index.headingCount}</strong><span>source headings</span></div><div><strong>{index.tocCount}</strong><span>contents entries</span></div><div><strong>{index.externalUrlCount}</strong><span>source links</span></div><div><strong>{index.imageCount}</strong><span>image references</span></div></div></div></section>

        <section className="home-section shell evidence-section"><div className="evidence-mark"><Icon name="layers"/></div><div><span className="eyebrow">Read claims with the model</span><h2>A quantum formulation is not a speedup result.</h2><p>For each method, ask what task it solves, how data reaches the circuit, how many measurements are needed, and which classical baseline was used. The labs here explain small ideal circuits; they do not model hardware or establish an advantage.</p></div><a className="text-link" href={`${base}learn.html#evidence`}>Read the evidence checklist <Icon name="arrow"/></a></section>
      </main>
      <footer className="site-footer"><div className="shell"><span>QML FIELD MANUAL · SOURCE CONTENT IS PRESERVED WITH PROVENANCE</span><a href="https://github.com/krishujeniya/QML/blob/main/docs/CONTRIBUTING.md" target="_blank" rel="noreferrer">Contribute <Icon name="arrow"/></a></div></footer>
    </>
  );
}
