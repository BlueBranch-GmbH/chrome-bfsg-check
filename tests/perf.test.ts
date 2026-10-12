import { describe, expect, it } from 'vitest';
import { computeCls, computeInp, resourceKind, siteOf } from '../src/scanner/perf';

describe('performance helpers', () => {
  it('computes CLS with session windows', () => {
    const shifts = [
      { value: 0.05, hadRecentInput: false, startTime: 100 },
      { value: 0.05, hadRecentInput: false, startTime: 600 },
      { value: 0.5, hadRecentInput: true, startTime: 700 },
      // New window after a gap of more than 1 s
      { value: 0.02, hadRecentInput: false, startTime: 3000 },
    ];
    expect(computeCls(shifts)).toBe(0.1);
    expect(computeCls([])).toBe(0);
  });

  it('approximates INP from the worst interaction', () => {
    expect(computeInp([])).toBeNull();
    expect(
      computeInp([
        { interactionId: 1, duration: 40 },
        { interactionId: 1, duration: 120 },
        { interactionId: 2, duration: 80 },
        { interactionId: 0, duration: 900 },
      ]),
    ).toBe(120);
  });

  it('classifies resources', () => {
    expect(resourceKind({ name: 'https://a.de/x.woff2', initiatorType: 'css' })).toBe('font');
    expect(resourceKind({ name: 'https://a.de/app.js?v=1', initiatorType: 'script' })).toBe('script');
    expect(resourceKind({ name: 'https://a.de/api/data', initiatorType: 'fetch' })).toBe('fetch');
    expect(resourceKind({ name: 'https://a.de/hero', initiatorType: 'img' })).toBe('image');
  });

  it('derives the site of a hostname', () => {
    expect(siteOf('www.example.de')).toBe('example.de');
    expect(siteOf('cdn.shop.example.co.uk')).toBe('example.co.uk');
    expect(siteOf('localhost')).toBe('localhost');
  });
});
