import { Icon } from './Icons';

const base = import.meta.env.BASE_URL;

export function SiteHeader({ current }: { current: 'home' | 'learn' | 'library' }) {
  return (
    <header className="site-header">
      <div className="header-inner">
        <a className="wordmark" href={`${base}index.html`} aria-label="QML field manual home">
          <span className="wordmark-symbol">Q</span><span>ML</span><i>FIELD MANUAL</i>
        </a>
        <nav className="primary-nav" aria-label="Main navigation">
          <a href={`${base}index.html`} aria-current={current === 'home' ? 'page' : undefined}>Field guide</a>
          <a href={`${base}learn.html`} aria-current={current === 'learn' ? 'page' : undefined}>Book & labs</a>
          <a href={`${base}library.html`} aria-current={current === 'library' ? 'page' : undefined}>Topic library</a>
        </nav>
        <a className="source-link" href="https://github.com/krishujeniya/QML" target="_blank" rel="noreferrer">
          <span>Source</span><Icon name="arrow" />
        </a>
      </div>
    </header>
  );
}
