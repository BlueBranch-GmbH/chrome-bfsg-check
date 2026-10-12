import { describe, expect, it } from 'vitest';
import { buildCsv, buildHtmlReport, targetToString } from '../src/panel/report';
import type { ScanResult } from '../src/shared/types';

const result: ScanResult = {
  url: 'https://example.de/',
  title: 'Beispiel <Shop>',
  scannedAt: Date.UTC(2026, 9, 12, 10, 0),
  durationMs: 900,
  engine: { name: 'axe-core', version: '4.13.0' },
  options: { locale: 'de', standard: 'wcag21aa', bestPractices: true },
  viewport: { width: 1280, height: 800 },
  rules: [
    {
      id: 'image-alt',
      source: 'axe',
      outcome: 'violation',
      impact: 'critical',
      tags: ['wcag2a', 'wcag111'],
      help: 'Bilder müssen Alternativtext haben',
      description: '',
      nodes: [{ target: ['img.hero'], html: '<img src="a.jpg" class="hero">', inViewport: true }],
      nodeCount: 1,
    },
  ],
  structure: { title: '', lang: 'de', headings: [], landmarks: [] },
  perf: {
    metrics: { ttfb: 100, fcp: 500, lcp: 1200, cls: 0.01, inp: null, domContentLoaded: 600, load: 900, blockingTime: 0, longFrames: 0 },
    lcpElement: null,
    navigation: { type: 'navigate', protocol: 'h2', fromCache: false, hiddenDuringLoad: false },
    resources: {
      total: { count: 1, transfer: 1000, decoded: 2000 },
      byKind: {
        document: { count: 1, transfer: 1000, decoded: 2000 },
        script: { count: 0, transfer: 0, decoded: 0 },
        stylesheet: { count: 0, transfer: 0, decoded: 0 },
        image: { count: 0, transfer: 0, decoded: 0 },
        font: { count: 0, transfer: 0, decoded: 0 },
        media: { count: 0, transfer: 0, decoded: 0 },
        fetch: { count: 0, transfer: 0, decoded: 0 },
        other: { count: 0, transfer: 0, decoded: 0 },
      },
      unknownSize: 0,
      thirdPartyCount: 0,
      thirdPartyOrigins: [],
    },
    domSize: 100,
    hints: [],
  },
};

describe('report', () => {
  it('formats targets including iframes and shadow DOM', () => {
    expect(targetToString(['iframe#a', ['my-el', 'button']])).toBe('iframe#a | my-el >>> button');
  });

  it('builds a CSV with quoted cells and a BOM', () => {
    const csv = buildCsv(result, 'de');
    expect(csv.startsWith('﻿')).toBe(true);
    expect(csv).toContain('violation;critical;image-alt;Bilder ohne Alternativtext;1.1.1;9.1.1.1;img.hero;"<img src=""a.jpg"" class=""hero"">";true');
  });

  it('escapes HTML in the report', () => {
    const html = buildHtmlReport(result, {}, 'de');
    expect(html).toContain('Beispiel &lt;Shop&gt;');
    expect(html).not.toContain('<Shop>');
    expect(html).toContain('<html lang="de">');
  });
});

describe('report credit', () => {
  it('links to bluebranch without tracking parameters', () => {
    const html = buildHtmlReport(result, {}, 'en');
    expect(html).toContain('<a href="https://www.bluebranch.de/">BlueBranch</a>');
    expect(html).not.toContain('utm_');
  });
});
