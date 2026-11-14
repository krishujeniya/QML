import Markdown, { defaultUrlTransform, type Components } from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import type { ReadmeIndex } from '../data/readme-index';

const base = import.meta.env.BASE_URL;

function markdownUrl(url: string, key: string, index: ReadmeIndex): string {
  if (key === 'href' && url.startsWith('#')) {
    const alias = decodeURIComponent(url.slice(1));
    const entryId = index.aliases.get(alias);
    return entryId ? `${base}library.html#topic/${encodeURIComponent(entryId)}` : url;
  }
  if (key === 'src' && /^https?:\/\/github\.com\/[^/]+\/[^/]+\/blob\//.test(url)) {
    return url.replace('github.com/', 'raw.githubusercontent.com/').replace('/blob/', '/');
  }
  if (key === 'src' && !/^(https?:|data:|\/\/)/i.test(url)) {
    const parts = url.replace(/^\.\//, '').split('/').map((part) => encodeURIComponent(decodeURIComponent(part)));
    return `${base}assets/reference-media/${parts.at(-1)}`;
  }
  if (key === 'href' && !/^(?:https?:|mailto:|tel:|data:|\/\/|\/)/i.test(url)) {
    const path = url.split('/').map((part) => encodeURIComponent(part)).join('/');
    return `https://github.com/krishujeniya/QML/blob/main/${path}`;
  }
  return defaultUrlTransform(url);
}

export function MarkdownContent({ source, index, className = '' }: { source: string; index: ReadmeIndex; className?: string }) {
  const components: Components = {
    a: ({ node, href, children, ...props }) => {
      void node;
      const external = /^https?:\/\//i.test(href ?? '');
      return <a href={href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined} {...props}>{children}</a>;
    },
    img: ({ node, alt, src, ...props }) => {
      void node;
      return <img src={src} alt={alt ?? ''} loading="lazy" {...props}/>;
    },
  };
  return (
    <div className={`markdown-content ${className}`}>
      <Markdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
        components={components}
        urlTransform={(url, key) => markdownUrl(url, key, index)}
      >
        {source}
      </Markdown>
    </div>
  );
}
