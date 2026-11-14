import { unified } from 'unified';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';

export type EntryKind = 'overview' | 'chapter' | 'topic' | 'toc' | 'reference';

export interface SourceReference {
  id: string;
  title: string;
  url: string;
  kind: 'link' | 'image';
  line: number;
  sectionId: string;
  topicId?: string;
}

export interface ReadmeEntry {
  id: string;
  title: string;
  kind: EntryKind;
  sectionId: string;
  sectionTitle: string;
  level: number;
  line?: number;
  body: string;
  excerpt: string;
  aliases: readonly string[];
  parentId?: string;
  tocDepth?: number;
  tocOrder?: number;
  references: readonly SourceReference[];
}

export interface ReadmeIndex {
  documentTitle: string;
  overview: string;
  entries: ReadonlyArray<ReadmeEntry>;
  chapters: ReadonlyArray<ReadmeEntry>;
  topicEntries: ReadonlyArray<ReadmeEntry>;
  referenceEntries: ReadonlyArray<ReadmeEntry>;
  references: ReadonlyArray<SourceReference>;
  aliases: ReadonlyMap<string, string>;
  tocCount: number;
  headingCount: number;
  imageCount: number;
  externalUrlCount: number;
}

interface MarkdownNode {
  type: string;
  value?: string;
  url?: string;
  alt?: string;
  identifier?: string;
  children?: MarkdownNode[];
  position?: { start: { line: number } };
}

interface RawHeading {
  id: string;
  title: string;
  level: number;
  lineIndex: number;
  line: number;
  body: string;
  aliases: string[];
  sectionId: string;
  sectionTitle: string;
  parentId?: string;
}

interface TocRow {
  title: string;
  anchor: string;
  depth: number;
  order: number;
  line: number;
}

const slug = (value: string) =>
  value
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'topic';

const textOf = (node: MarkdownNode): string =>
  node.children?.map(textOf).join('') ?? node.value ?? node.alt ?? '';

function tableOfContents(lines: string[]): { start: number; end: number; rows: TocRow[] } {
  const start = lines.findIndex((line) => line.includes('<!-- MarkdownTOC'));
  const end = start < 0 ? -1 : lines.findIndex((line, index) => index > start && line.includes('<!-- /MarkdownTOC -->'));
  if (start < 0 || end < 0) return { start: -1, end: -1, rows: [] };

  const rows: TocRow[] = [];
  for (let index = start + 1; index < end; index += 1) {
    const match = lines[index].match(/^(\s*)[-*+]\s+\[([^\]]+)\]\(#([^)]+)\)/);
    if (!match) continue;
    const indentation = match[1].replace(/\t/g, '    ').length;
    rows.push({ title: match[2].trim(), anchor: match[3].trim(), depth: Math.floor(indentation / 4), order: rows.length, line: index + 1 });
  }
  return { start, end, rows };
}

function sourceHeadings(lines: string[], tocStart: number, tocEnd: number): RawHeading[] {
  const headings: Array<{ title: string; level: number; lineIndex: number; line: number; anchor: string }> = [];
  let fence: { character: string; length: number } | undefined;
  for (let index = 0; index < lines.length; index += 1) {
    if (tocStart >= 0 && index >= tocStart && index <= tocEnd) continue;
    const line = lines[index];
    const fenceMatch = line.match(/^\s{0,3}(`{3,}|~{3,})/);
    if (fenceMatch) {
      const marker = fenceMatch[1];
      if (!fence) fence = { character: marker[0], length: marker.length };
      else if (marker[0] === fence.character && marker.length >= fence.length) fence = undefined;
      continue;
    }
    if (fence) continue;

    const match = line.match(/^#{1,6}[\t ]+(.+?)\s*#*\s*$/);
    if (!match) continue;
    const level = line.match(/^#+/)?.[0].length ?? 1;
    const anchor = lines[index - 1]?.trim().match(/^<a\s+name=["']([^"']+)["']\s*><\/a>$/i)?.[1] ?? '';
    headings.push({ title: match[1].replace(/\s+#+\s*$/, '').trim(), level, lineIndex: index, line: index + 1, anchor });
  }

  const counts = new Map<string, number>();
  const records: RawHeading[] = [];
  let currentSection: RawHeading | undefined;
  for (const [index, heading] of headings.entries()) {
    const base = slug(heading.anchor || heading.title);
    const count = (counts.get(base) ?? 0) + 1;
    counts.set(base, count);
    const id = count === 1 ? base : `${base}--${count}`;
    const section = heading.level === 2 ? undefined : currentSection;
    const parent = [...records].reverse().find((item) => item.level < heading.level && item.level > 2);
    const next = headings.slice(index + 1).find((item) => item.level <= heading.level);
    const bodyLines = lines.slice(heading.lineIndex + 1, next?.lineIndex ?? lines.length);
    const record: RawHeading = {
      id,
      title: heading.title,
      level: heading.level,
      lineIndex: heading.lineIndex,
      line: heading.line,
      body: bodyLines.join('\n').trim(),
      aliases: [...new Set([heading.anchor, slug(heading.title)].filter(Boolean))],
      sectionId: section?.id ?? id,
      sectionTitle: section?.title ?? heading.title,
      parentId: parent?.id,
    };
    records.push(record);
    if (heading.level === 2) currentSection = record;
  }
  return records;
}

function collectReferences(source: string, entries: RawHeading[]): SourceReference[] {
  const tree = unified().use(remarkParse).use(remarkGfm).parse(source) as unknown as MarkdownNode;
  const lines = source.split(/\r?\n/);
  const found: SourceReference[] = [];
  const add = (url: string | undefined, title: string, kind: 'link' | 'image', line: number) => {
    if (!url || url.startsWith('#')) return;
    const external = /^https?:\/\//i.test(url);
    const localImage = kind === 'image' && !/^[a-z][a-z\d+.-]*:/i.test(url);
    const localDocument = kind === 'link' && /^(?:\/|\.\.?\/)/.test(url);
    if (!external && !localImage && !localDocument) return;
    const sourceEntry = [...entries].reverse().find((entry) => entry.line <= line);
    found.push({
      id: `ref-${found.length + 1}`,
      title: title.trim() || (kind === 'image' ? 'README image' : 'Linked reference'),
      url: url.replace(/[.,;]+$/, ''),
      kind,
      line,
      sectionId: sourceEntry?.sectionId ?? 'overview',
      topicId: sourceEntry?.id,
    });
  };
  const walk = (node: MarkdownNode) => {
    const line = node.position?.start.line ?? 1;
    if (node.type === 'link' || node.type === 'linkReference') add(node.url, textOf(node), 'link', line);
    if (node.type === 'image' || node.type === 'imageReference') add(node.url, node.alt ?? 'README image', 'image', line);
    if (node.type === 'html' && node.value) {
      for (const match of node.value.matchAll(/\b(href|src)=["']([^"']+)["']/gi)) {
        const attribute = match[1].toLowerCase();
        const label = node.value.match(/<img\b[^>]*alt=["']([^"']*)["']/i)?.[1] ?? '';
        add(match[2], label || (attribute === 'src' ? 'README image' : 'Linked HTML reference'), attribute === 'src' ? 'image' : 'link', line);
      }
    }
    node.children?.forEach(walk);
  };
  walk(tree);

  for (let index = 0; index < lines.length; index += 1) {
    for (const match of lines[index].matchAll(/https?:\/\/[^\s<>"')\]]+/g)) {
      const url = match[0].replace(/[.,;]+$/, '');
      if (!found.some((reference) => reference.url === url && reference.line === index + 1)) {
        add(url, 'Linked reference', 'link', index + 1);
      }
    }
  }

  const unique = new Map<string, SourceReference>();
  for (const reference of found) {
    const key = `${reference.kind}:${reference.url}`;
    if (!unique.has(key)) unique.set(key, { ...reference, id: `ref-${unique.size + 1}` });
  }
  return [...unique.values()];
}

export function buildReadmeIndex(source: string): ReadmeIndex {
  const lines = source.split(/\r?\n/);
  const toc = tableOfContents(lines);
  const headings = sourceHeadings(lines, toc.start, toc.end);
  const contentHeadings = headings.filter((heading) => !(heading.level === 2 && heading.title.toLowerCase() === 'table of contents'));
  const headingByAlias = new Map<string, RawHeading[]>();
  for (const heading of contentHeadings) {
    for (const alias of heading.aliases) {
      const values = headingByAlias.get(alias) ?? [];
      values.push(heading);
      headingByAlias.set(alias, values);
    }
  }

  const tocOnly: RawHeading[] = [];
  const matchedHeadingIds = new Set<string>();
  const tocAliases = new Map<string, string[]>();
  let activeSection: RawHeading | undefined;
  for (const row of toc.rows) {
    const candidates = headingByAlias.get(row.anchor) ?? headingByAlias.get(slug(row.title)) ?? [];
    const match = candidates.find((candidate) => !matchedHeadingIds.has(candidate.id) && (row.depth === 0 ? candidate.level === 2 : candidate.level > 2));
    if (row.depth === 0) activeSection = match;
    if (match) {
      matchedHeadingIds.add(match.id);
      tocAliases.set(match.id, [...(tocAliases.get(match.id) ?? []), row.anchor]);
      continue;
    }
    const base = `toc-${slug(row.anchor || row.title)}`;
    let id = base;
    let suffix = 2;
    while (headings.some((heading) => heading.id === id) || tocOnly.some((entry) => entry.id === id)) id = `${base}--${suffix++}`;
    const section = row.depth === 0 ? undefined : activeSection;
    const placeholder: RawHeading = {
      id,
      title: row.title,
      level: 2 + row.depth,
      lineIndex: -1,
      line: row.line,
      body: '',
      aliases: [row.anchor],
      sectionId: section?.id ?? id,
      sectionTitle: section?.title ?? row.title,
      parentId: section?.id,
    };
    tocOnly.push(placeholder);
    if (row.depth === 0) activeSection = placeholder;
  }

  const references = collectReferences(source, headings);
  const headingEntries: ReadmeEntry[] = contentHeadings.map((heading) => ({
    id: heading.id,
    title: heading.title,
    kind: heading.level === 2 ? 'chapter' : 'topic',
    sectionId: heading.level === 2 ? heading.id : heading.sectionId,
    sectionTitle: heading.level === 2 ? heading.title : heading.sectionTitle,
    level: heading.level,
    line: heading.line,
    body: heading.body,
    excerpt: heading.body.replace(/[#>*_`\[\]!()]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 320),
    aliases: [...new Set([...heading.aliases, ...(tocAliases.get(heading.id) ?? [])])],
    parentId: heading.parentId,
    references: references.filter((item) => item.topicId === heading.id),
  }));
  const placeholders: ReadmeEntry[] = tocOnly.map((entry) => ({
    id: entry.id,
    title: entry.title,
    kind: 'toc',
    sectionId: entry.sectionId,
    sectionTitle: entry.sectionTitle,
    level: entry.level,
    body: '',
    excerpt: 'Listed in the original README table of contents; no matching lesson body was found.',
    aliases: entry.aliases,
    parentId: entry.parentId,
    tocDepth: entry.level - 2,
    references: [],
  }));
  const byLine = [...headingEntries, ...placeholders].sort((left, right) => {
    if (left.line !== right.line) return (left.line ?? Number.MAX_SAFE_INTEGER) - (right.line ?? Number.MAX_SAFE_INTEGER);
    return left.id.localeCompare(right.id);
  });
  const refEntries: ReadmeEntry[] = references.map((reference) => ({
    id: reference.id,
    title: reference.title,
    kind: 'reference',
    sectionId: reference.sectionId,
    sectionTitle: headings.find((heading) => heading.sectionId === reference.sectionId)?.sectionTitle ?? 'README references',
    level: 7,
    line: reference.line,
    body: `[${reference.title}](${reference.url})`,
    excerpt: reference.url,
    aliases: [],
    parentId: reference.topicId,
    references: [reference],
  }));
  const firstChapter = headings.find((heading) => heading.level === 2);
  const introEnd = toc.start >= 0 ? toc.start : (firstChapter?.lineIndex ?? lines.length);
  const overview = lines.slice(0, introEnd).join('\n').trim();
  const overviewEntry: ReadmeEntry = {
    id: 'overview',
    title: 'README introduction',
    kind: 'overview',
    sectionId: 'overview',
    sectionTitle: 'Introduction',
    level: 1,
    body: overview,
    excerpt: 'The opening summary and figures from the original repository README.',
    aliases: [],
    references: references.filter((item) => item.sectionId === 'overview'),
  };
  const aliases = new Map<string, string>();
  for (const entry of [...headingEntries, ...placeholders]) {
    for (const alias of entry.aliases) if (!aliases.has(alias)) aliases.set(alias, entry.id);
  }

  return {
    documentTitle: lines.find((line) => /^#\s+/.test(line))?.replace(/^#\s+/, '').trim() ?? 'Quantum machine learning field guide',
    overview,
    entries: [overviewEntry, ...byLine],
    chapters: byLine.filter((entry) => entry.kind === 'chapter'),
    topicEntries: byLine.filter((entry) => entry.kind === 'topic' || entry.kind === 'toc'),
    referenceEntries: refEntries,
    references,
    aliases,
    tocCount: toc.rows.length,
    headingCount: headings.length + 1,
    imageCount: references.filter((reference) => reference.kind === 'image').length,
    externalUrlCount: new Set(references.filter((reference) => /^https?:\/\//i.test(reference.url)).map((reference) => reference.url)).size,
  };
}
