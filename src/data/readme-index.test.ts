import { describe, expect, it } from 'vitest';
import README from '../../README.md?raw';
import { buildReadmeIndex } from './readme-index';

describe('repository README learning index', () => {
  const index = buildReadmeIndex(README);

  it('keeps all table-of-contents rows and source headings addressable', () => {
    expect(index.tocCount).toBe(226);
    expect(index.headingCount).toBeGreaterThan(100);
    expect(index.chapters.length).toBeGreaterThan(10);
    expect(index.topicEntries.length).toBeGreaterThan(100);
    expect(index.chapters.length + index.topicEntries.length).toBeGreaterThanOrEqual(index.tocCount);
  });

  it('retains TOC-only items and duplicate legacy anchors as route aliases', () => {
    expect(index.topicEntries.some((entry) => entry.kind === 'toc')).toBe(true);
    const duplicate = index.topicEntries.filter((entry) => entry.aliases.includes('quantumconsolidatedresearchpapers'));
    expect(duplicate.length).toBeGreaterThanOrEqual(2);
    expect(new Set(duplicate.map((entry) => entry.id)).size).toBe(duplicate.length);
    expect(index.aliases.get('quantumconsolidatedresearchpapers')).toBe(duplicate[0].id);
  });

  it('indexes link destinations and image sources independently', () => {
    expect(index.references.length).toBeGreaterThan(250);
    expect(index.imageCount).toBeGreaterThanOrEqual(50);
    expect(index.references.some((reference) => reference.kind === 'link')).toBe(true);
    expect(index.references.some((reference) => reference.kind === 'image')).toBe(true);
    expect(index.referenceEntries.length).toBe(index.references.length);
  });
});
