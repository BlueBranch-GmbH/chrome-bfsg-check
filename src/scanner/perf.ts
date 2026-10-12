import type { PerfHint, PerfItem, PerfMetrics, PerfReport, ResourceBucket, ResourceKind } from '../shared/types';
import { isRendered, outerHtmlSnippet, targetOf } from './dom';

/**
 * Local performance measurement. Uses only the browser's own Performance APIs,
 * nothing leaves the page. The values describe the visit in this browser, so
 * cache, device and network influence them.
 */

const MAX_ITEMS = 20;

/** Reads entries the browser has buffered since the page started loading. */
function bufferedEntries<T extends PerformanceEntry>(type: string, extra: Record<string, unknown> = {}): Promise<T[]> {
  return new Promise((resolve) => {
    if (typeof PerformanceObserver === 'undefined' || !PerformanceObserver.supportedEntryTypes?.includes(type)) {
      resolve([]);
      return;
    }
    const entries: T[] = [];
    const observer = new PerformanceObserver((list) => entries.push(...(list.getEntries() as T[])));
    try {
      observer.observe({ type, buffered: true, ...extra } as PerformanceObserverInit);
    } catch {
      resolve([]);
      return;
    }
    setTimeout(() => {
      entries.push(...(observer.takeRecords() as T[]));
      observer.disconnect();
      resolve(entries);
    }, 60);
  });
}

interface LayoutShift extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}

interface LcpEntry extends PerformanceEntry {
  element: Element | null;
  url: string;
}

interface EventTiming extends PerformanceEntry {
  interactionId?: number;
}

interface LongAnimationFrame extends PerformanceEntry {
  blockingDuration: number;
}

/** Cumulative Layout Shift with session windows (max 5 s, gaps below 1 s), as in web-vitals. */
export function computeCls(shifts: Array<Pick<LayoutShift, 'value' | 'hadRecentInput' | 'startTime'>>): number {
  let max = 0;
  let current = 0;
  let first = 0;
  let last = 0;
  for (const shift of shifts) {
    if (shift.hadRecentInput) continue;
    if (current > 0 && shift.startTime - last < 1000 && shift.startTime - first < 5000) {
      current += shift.value;
    } else {
      current = shift.value;
      first = shift.startTime;
    }
    last = shift.startTime;
    max = Math.max(max, current);
  }
  return Math.round(max * 1000) / 1000;
}

/** Interaction to Next Paint, approximated like web-vitals: worst interaction, skipping one per 50 interactions. */
export function computeInp(events: Array<Pick<EventTiming, 'interactionId' | 'duration'>>): number | null {
  const byInteraction = new Map<number, number>();
  for (const event of events) {
    if (!event.interactionId) continue;
    byInteraction.set(event.interactionId, Math.max(byInteraction.get(event.interactionId) ?? 0, event.duration));
  }
  if (byInteraction.size === 0) return null;
  const sorted = [...byInteraction.values()].sort((a, b) => b - a);
  return sorted[Math.min(sorted.length - 1, Math.floor(byInteraction.size / 50))];
}

function emptyBucket(): ResourceBucket {
  return { count: 0, transfer: 0, decoded: 0 };
}

export function resourceKind(entry: Pick<PerformanceResourceTiming, 'initiatorType' | 'name'>): ResourceKind {
  const path = entry.name.split(/[?#]/)[0].toLowerCase();
  if (/\.(woff2?|ttf|otf|eot)$/.test(path)) return 'font';
  if (/\.(css)$/.test(path)) return 'stylesheet';
  if (/\.(m?js)$/.test(path)) return 'script';
  if (/\.(png|jpe?g|gif|webp|avif|svg|ico|bmp)$/.test(path)) return 'image';
  if (/\.(mp4|webm|ogg|mp3|wav|m4a|m3u8)$/.test(path)) return 'media';
  switch (entry.initiatorType) {
    case 'script':
      return 'script';
    case 'link':
    case 'css':
      return 'stylesheet';
    case 'img':
    case 'image':
      return 'image';
    case 'video':
    case 'audio':
      return 'media';
    case 'fetch':
    case 'xmlhttprequest':
    case 'beacon':
      return 'fetch';
    default:
      return 'other';
  }
}

/** "www.shop.example.co.uk" → "example.co.uk"-ish. Good enough to tell first from third party. */
export function siteOf(hostname: string): string {
  const parts = hostname.split('.');
  if (parts.length <= 2) return hostname;
  const secondLevel = parts[parts.length - 2];
  const takeThree = secondLevel.length <= 3 && parts[parts.length - 1].length === 2;
  return parts.slice(takeThree ? -3 : -2).join('.');
}

function shortUrl(url: string): string {
  return url.length > 160 ? `${url.slice(0, 160)}…` : url;
}

function hint(id: PerfHint['id'], severity: PerfHint['severity'], items: PerfItem[], savings?: number): PerfHint | null {
  if (items.length === 0) return null;
  return { id, severity, items: items.slice(0, MAX_ITEMS), itemCount: items.length, ...(savings ? { savings } : {}) };
}

function elementItem(el: Element, data?: PerfItem['data']): PerfItem {
  return { target: targetOf(el), html: outerHtmlSnippet(el), data };
}

export async function measurePerformance(): Promise<PerfReport> {
  const [lcpEntries, shifts, events, frames] = await Promise.all([
    bufferedEntries<LcpEntry>('largest-contentful-paint'),
    bufferedEntries<LayoutShift>('layout-shift'),
    bufferedEntries<EventTiming>('event', { durationThreshold: 16 }),
    bufferedEntries<LongAnimationFrame>('long-animation-frame'),
  ]);

  const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
  const activationStart = (nav as unknown as { activationStart?: number } | undefined)?.activationStart ?? 0;
  const relative = (time: number | undefined | null): number | null =>
    time === undefined || time === null || time <= 0 ? null : Math.max(0, Math.round(time - activationStart));

  const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
  const lcp = lcpEntries[lcpEntries.length - 1];

  const metrics: PerfMetrics = {
    ttfb: nav ? relative(nav.responseStart) : null,
    fcp: fcpEntry ? relative(fcpEntry.startTime) : null,
    lcp: lcp ? relative(lcp.startTime) : null,
    cls: PerformanceObserver.supportedEntryTypes?.includes('layout-shift') ? computeCls(shifts) : null,
    inp: computeInp(events),
    domContentLoaded: nav ? relative(nav.domContentLoadedEventEnd) : null,
    load: nav ? relative(nav.loadEventEnd) : null,
    blockingTime: PerformanceObserver.supportedEntryTypes?.includes('long-animation-frame')
      ? Math.round(frames.reduce((sum, frame) => sum + (frame.blockingDuration ?? 0), 0))
      : null,
    longFrames: PerformanceObserver.supportedEntryTypes?.includes('long-animation-frame') ? frames.length : null,
  };

  const lcpElement = lcp?.element?.isConnected ? elementItem(lcp.element, lcp.url ? { url: shortUrl(lcp.url) } : undefined) : null;

  // Resources
  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  const kinds: ResourceKind[] = ['document', 'script', 'stylesheet', 'image', 'font', 'media', 'fetch', 'other'];
  const byKind = Object.fromEntries(kinds.map((kind) => [kind, emptyBucket()])) as Record<ResourceKind, ResourceBucket>;
  const total = emptyBucket();
  let unknownSize = 0;
  const pageSite = siteOf(location.hostname);
  const thirdPartyOrigins = new Set<string>();
  let thirdPartyCount = 0;

  const add = (bucket: ResourceBucket, transfer: number, decoded: number) => {
    bucket.count += 1;
    bucket.transfer += transfer;
    bucket.decoded += decoded;
  };

  if (nav) {
    add(byKind.document, nav.transferSize, nav.decodedBodySize);
    add(total, nav.transferSize, nav.decodedBodySize);
  }

  const uncompressed: PerfItem[] = [];
  const large: PerfItem[] = [];
  const legacyImages: PerfItem[] = [];
  let legacySavings = 0;
  let uncompressedSavings = 0;

  for (const entry of resources) {
    const kind = resourceKind(entry);
    add(byKind[kind], entry.transferSize, entry.decodedBodySize);
    add(total, entry.transferSize, entry.decodedBodySize);
    if (entry.decodedBodySize === 0 && entry.transferSize === 0 && entry.encodedBodySize === 0) unknownSize += 1;

    let url: URL | null = null;
    try {
      url = new URL(entry.name);
    } catch {
      /* ignore data: and invalid URLs */
    }
    if (url && /^https?:$/.test(url.protocol) && siteOf(url.hostname) !== pageSite) {
      thirdPartyCount += 1;
      thirdPartyOrigins.add(url.origin);
    }

    const textual = kind === 'script' || kind === 'stylesheet' || kind === 'fetch' || kind === 'document';
    if (textual && entry.decodedBodySize > 20_000 && entry.encodedBodySize > 0 && entry.encodedBodySize >= entry.decodedBodySize * 0.95) {
      uncompressed.push({ url: shortUrl(entry.name), data: { size: entry.decodedBodySize } });
      uncompressedSavings += Math.round(entry.decodedBodySize * 0.7);
    }
    const size = entry.encodedBodySize || entry.transferSize;
    if (size > 500_000) large.push({ url: shortUrl(entry.name), data: { size, kind } });
    if (kind === 'image' && /\.(jpe?g|png|gif|bmp)$/i.test(entry.name.split(/[?#]/)[0]) && size > 100_000) {
      legacyImages.push({ url: shortUrl(entry.name), data: { size } });
      legacySavings += Math.round(size * 0.3);
    }
  }

  const renderBlocking = resources
    .filter((entry) => (entry as PerformanceResourceTiming & { renderBlockingStatus?: string }).renderBlockingStatus === 'blocking')
    .map((entry) => ({ url: shortUrl(entry.name), data: { size: entry.transferSize, duration: Math.round(entry.duration) } }));

  // Images in the DOM
  const oversized: PerfItem[] = [];
  const missingDimensions: PerfItem[] = [];
  const offscreenEager: PerfItem[] = [];
  let oversizedSavings = 0;
  const dpr = window.devicePixelRatio || 1;
  const sizeOf = (src: string) => {
    const entry = performance.getEntriesByName(src)[0] as PerformanceResourceTiming | undefined;
    return entry ? entry.encodedBodySize || entry.transferSize : 0;
  };

  document.querySelectorAll('img').forEach((img) => {
    if (!img.complete || img.naturalWidth === 0 || !isRendered(img)) return;
    const rect = img.getBoundingClientRect();
    const src = img.currentSrc || img.src;
    if (!src.endsWith('.svg') && rect.width > 0 && rect.height > 0) {
      const needed = rect.width * dpr * rect.height * dpr;
      const actual = img.naturalWidth * img.naturalHeight;
      if (actual > needed * 2.25 && actual - needed > 100_000) {
        const bytes = sizeOf(src);
        oversized.push(
          elementItem(img, {
            natural: `${img.naturalWidth}×${img.naturalHeight}`,
            displayed: `${Math.round(rect.width)}×${Math.round(rect.height)}`,
            ...(bytes ? { size: bytes } : {}),
          }),
        );
        if (bytes) oversizedSavings += Math.round(bytes * (1 - needed / actual));
      }
    }
    const style = getComputedStyle(img);
    const hasDimensions = (img.hasAttribute('width') && img.hasAttribute('height')) || style.aspectRatio !== 'auto';
    if (!hasDimensions && style.position !== 'absolute' && style.position !== 'fixed') missingDimensions.push(elementItem(img));
    const top = rect.top + window.scrollY;
    if (img.loading !== 'lazy' && top > window.innerHeight * 1.5 && rect.width * rect.height > 2500) offscreenEager.push(elementItem(img));
  });

  const lazyLcp = lcp?.element instanceof HTMLImageElement && lcp.element.loading === 'lazy' ? [elementItem(lcp.element)] : [];

  const fontItems: PerfItem[] = [];
  if (document.fonts) {
    const seen = new Set<string>();
    document.fonts.forEach((face) => {
      if (face.status !== 'loaded' || (face.display !== 'auto' && face.display !== 'block')) return;
      const key = `${face.family} ${face.weight} ${face.style}`;
      if (seen.has(key)) return;
      seen.add(key);
      fontItems.push({ data: { family: face.family.replace(/["']/g, ''), weight: face.weight, style: face.style, display: face.display } });
    });
  }

  const domSize = document.getElementsByTagName('*').length;

  const hints = [
    hint('render-blocking', renderBlocking.length > 3 ? 'high' : 'medium', renderBlocking),
    hint('lazy-lcp', 'high', lazyLcp),
    hint('oversized-images', oversizedSavings > 200_000 ? 'high' : 'medium', oversized, oversizedSavings),
    hint('legacy-image-format', legacySavings > 200_000 ? 'medium' : 'low', legacyImages, legacySavings),
    hint('offscreen-not-lazy', 'medium', offscreenEager),
    hint('missing-dimensions', 'medium', missingDimensions),
    hint('uncompressed', 'high', uncompressed, uncompressedSavings),
    hint('large-resources', 'medium', large),
    hint('font-display', 'low', fontItems),
    domSize > 1400 ? hint('large-dom', domSize > 3000 ? 'high' : 'medium', [{ data: { count: domSize } }]) : null,
    thirdPartyOrigins.size > 10
      ? hint('many-third-party', 'medium', [...thirdPartyOrigins].map((origin) => ({ url: origin })))
      : null,
  ].filter((h): h is PerfHint => h !== null);

  const order = { high: 0, medium: 1, low: 2 };
  hints.sort((a, b) => order[a.severity] - order[b.severity]);

  return {
    metrics,
    lcpElement,
    navigation: {
      type: nav?.type ?? 'unknown',
      protocol: nav?.nextHopProtocol ?? '',
      fromCache: nav ? nav.transferSize === 0 && nav.decodedBodySize > 0 : false,
      hiddenDuringLoad: performance
        .getEntriesByType('visibility-state')
        .some((entry) => entry.name === 'hidden' && entry.startTime <= (lcp?.startTime ?? nav?.loadEventEnd ?? 0)),
    },
    resources: {
      total,
      byKind,
      unknownSize,
      thirdPartyCount,
      thirdPartyOrigins: [...thirdPartyOrigins].slice(0, 50),
    },
    domSize,
    hints,
  };
}
