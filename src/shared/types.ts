/**
 * Data structures exchanged between the scanner (runs inside the inspected
 * page) and the side panel. Everything here must survive structured cloning,
 * so only plain objects, arrays, strings, numbers, booleans and null.
 */

export type Locale = 'de' | 'en';
export type Impact = 'critical' | 'serious' | 'moderate' | 'minor';
export type Outcome = 'violation' | 'review' | 'pass';
export type Standard = 'wcag21aa' | 'wcag22aa';

/**
 * Path to an element. Each entry addresses one document: all but the last
 * entry point at an iframe. An entry that is itself an array walks into
 * shadow roots (same format as axe-core).
 */
export type Target = Array<string | string[]>;

export interface ScanOptions {
  locale: Locale;
  standard: Standard;
  bestPractices: boolean;
}

export interface ScanNode {
  target: Target;
  html: string;
  /** axe-core failure summary, already in the requested locale. */
  summary?: string;
  /** Whether the element is (at least partially) inside the viewport. `null` if unknown, e.g. inside an iframe. */
  inViewport: boolean | null;
  /** Extra values for custom checks, e.g. the link text that was flagged. */
  data?: Record<string, string | number>;
}

export interface RuleResult {
  id: string;
  source: 'axe' | 'bfsg';
  outcome: Outcome;
  impact: Impact | null;
  tags: string[];
  /** Short rule title from axe-core (localized). Empty for custom checks, the panel has its own texts. */
  help: string;
  description: string;
  helpUrl?: string;
  /** At most MAX_NODES_PER_RULE nodes; see nodeCount for the real number. */
  nodes: ScanNode[];
  nodeCount: number;
}

export interface HeadingInfo {
  level: number;
  text: string;
  target: Target;
}

export interface LandmarkInfo {
  role: string;
  label: string;
  target: Target;
}

export interface StructureInfo {
  title: string;
  lang: string;
  headings: HeadingInfo[];
  landmarks: LandmarkInfo[];
}

export type ResourceKind = 'document' | 'script' | 'stylesheet' | 'image' | 'font' | 'media' | 'fetch' | 'other';

export interface ResourceBucket {
  count: number;
  /** Bytes over the network (0 for cached or cross-origin resources without Timing-Allow-Origin). */
  transfer: number;
  /** Uncompressed size, same restrictions as transfer. */
  decoded: number;
}

export interface PerfItem {
  target?: Target;
  url?: string;
  html?: string;
  data?: Record<string, string | number>;
}

export type PerfHintId =
  | 'render-blocking'
  | 'oversized-images'
  | 'missing-dimensions'
  | 'offscreen-not-lazy'
  | 'lazy-lcp'
  | 'legacy-image-format'
  | 'font-display'
  | 'uncompressed'
  | 'large-resources'
  | 'large-dom'
  | 'many-third-party';

export interface PerfHint {
  id: PerfHintId;
  severity: 'high' | 'medium' | 'low';
  /** Estimated savings in bytes, if it can be estimated. */
  savings?: number;
  items: PerfItem[];
  itemCount: number;
}

export interface PerfMetrics {
  ttfb: number | null;
  fcp: number | null;
  lcp: number | null;
  cls: number | null;
  inp: number | null;
  domContentLoaded: number | null;
  load: number | null;
  /** Sum of blocking time of long animation frames (similar to Lighthouse TBT, but over the whole visit). */
  blockingTime: number | null;
  longFrames: number | null;
}

export interface PerfReport {
  metrics: PerfMetrics;
  lcpElement: PerfItem | null;
  navigation: {
    type: string;
    protocol: string;
    /** True if the main document came from the HTTP cache. */
    fromCache: boolean;
    /** True if the page was loaded while the tab was hidden; paint metrics are unreliable then. */
    hiddenDuringLoad: boolean;
  };
  resources: {
    total: ResourceBucket;
    byKind: Record<ResourceKind, ResourceBucket>;
    /** Resources whose size the browser does not reveal (cross-origin without Timing-Allow-Origin). */
    unknownSize: number;
    thirdPartyCount: number;
    thirdPartyOrigins: string[];
  };
  domSize: number;
  hints: PerfHint[];
}

export interface ScanResult {
  url: string;
  title: string;
  scannedAt: number;
  durationMs: number;
  engine: { name: 'axe-core'; version: string };
  options: ScanOptions;
  viewport: { width: number; height: number };
  rules: RuleResult[];
  structure: StructureInfo;
  perf: PerfReport;
}

export interface HighlightResult {
  found: boolean;
  visible: boolean;
}

export interface ToolState {
  tabOrder: boolean;
  textSpacing: boolean;
  grayscale: boolean;
}

/** Public API the scanner script installs on `globalThis.__bfsgCheck` inside the page. */
export interface ScannerApi {
  version: string;
  prepare(locale: Locale): void;
  scan(options: ScanOptions): Promise<ScanResult>;
  highlight(target: Target, label: string): HighlightResult;
  clearHighlight(): void;
  setTool(tool: keyof ToolState, enabled: boolean): number | null;
  getTools(): ToolState;
}

export const MAX_NODES_PER_RULE = 50;
