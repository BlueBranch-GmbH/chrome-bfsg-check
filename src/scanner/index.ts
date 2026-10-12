import type { Locale, ScanOptions, ScanResult, ScannerApi } from '../shared/types';
import { axeVersion, configureAxe, runAxe } from './axe';
import { runCustomChecks } from './checks';
import { clearHighlight, getTools, highlight, setTool } from './overlay';
import { measurePerformance } from './perf';
import { collectStructure } from './structure';

let preparedLocale: Locale | null = null;

function prepare(locale: Locale): void {
  if (preparedLocale === locale) return;
  configureAxe(locale);
  preparedLocale = locale;
}

async function scan(options: ScanOptions): Promise<ScanResult> {
  const started = performance.now();
  prepare(options.locale);
  // Measure first: running axe-core itself causes long frames.
  const perf = await measurePerformance();
  const axeRules = await runAxe(options);
  const customRules = runCustomChecks(document);
  return {
    url: location.href,
    title: document.title,
    scannedAt: Date.now(),
    durationMs: Math.round(performance.now() - started),
    engine: { name: 'axe-core', version: axeVersion },
    options,
    viewport: { width: window.innerWidth, height: window.innerHeight },
    rules: [...axeRules, ...customRules],
    structure: collectStructure(document),
    perf,
  };
}

export function createScannerApi(): ScannerApi {
  return {
    version: axeVersion,
    prepare,
    scan,
    highlight,
    clearHighlight,
    setTool,
    getTools,
  };
}
