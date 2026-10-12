import type { PerfMetrics } from './types';

export type Rating = 'good' | 'needs-improvement' | 'poor';

/** Thresholds from web.dev (Core Web Vitals and supporting metrics). */
export const THRESHOLDS: Partial<Record<keyof PerfMetrics, [number, number]>> = {
  ttfb: [800, 1800],
  fcp: [1800, 3000],
  lcp: [2500, 4000],
  cls: [0.1, 0.25],
  inp: [200, 500],
  blockingTime: [200, 600],
};

export function rate(metric: keyof PerfMetrics, value: number | null): Rating | null {
  const threshold = THRESHOLDS[metric];
  if (value === null || !threshold) return null;
  if (value <= threshold[0]) return 'good';
  if (value <= threshold[1]) return 'needs-improvement';
  return 'poor';
}
