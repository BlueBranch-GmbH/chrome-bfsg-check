import axe from 'axe-core';
// Precompiled at build time, see build/axe-locale-plugin.ts.
import axeDe from 'virtual:axe-locale/de';
import type { Impact, Locale, Outcome, RuleResult, ScanNode, ScanOptions, Target } from '../shared/types';
import { MAX_NODES_PER_RULE } from '../shared/types';
import { isInViewport, resolveTarget } from './dom';
import { HOST_ID } from './overlay';

export const axeVersion = axe.version;

/**
 * Configures axe-core in the current frame. Called in every frame before the
 * scan, because each frame runs its own axe-core instance and translations
 * are configured per instance.
 */
export function configureAxe(locale: Locale): void {
  axe.reset();
  axe.configure({
    // The extension injects axe-core into cross-origin frames as well, so the
    // instances must be allowed to talk to each other.
    allowedOrigins: ['<unsafe_all_origins>'],
    ...(locale === 'de' ? { locale: axeDe } : {}),
  });
}

export function tagsFor(options: ScanOptions): string[] {
  const tags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];
  if (options.standard === 'wcag22aa') tags.push('wcag22a', 'wcag22aa');
  if (options.bestPractices) tags.push('best-practice');
  return tags;
}

function convertNode(node: axe.NodeResult): ScanNode {
  const target = node.target as unknown as Target;
  let inViewport: boolean | null = null;
  if (target.length === 1) {
    const el = resolveTarget(target);
    inViewport = el ? isInViewport(el) : null;
  }
  return {
    target,
    html: node.html.length > 300 ? `${node.html.slice(0, 300)}…` : node.html,
    summary: node.failureSummary ?? undefined,
    inViewport,
  };
}

function convertResult(result: axe.Result, outcome: Outcome): RuleResult {
  return {
    id: result.id,
    source: 'axe',
    outcome,
    impact: (result.impact as Impact | null | undefined) ?? null,
    tags: result.tags,
    help: result.help,
    description: result.description,
    helpUrl: result.helpUrl,
    nodes: outcome === 'pass' ? [] : result.nodes.slice(0, MAX_NODES_PER_RULE).map(convertNode),
    nodeCount: result.nodes.length,
  };
}

export async function runAxe(options: ScanOptions): Promise<RuleResult[]> {
  // Leave out the extension's own overlay (highlights, tab order badges).
  const context = document.getElementById(HOST_ID) ? { exclude: [[`#${HOST_ID}`]] } : document;
  const results = await axe.run(context as axe.ElementContext, {
    runOnly: { type: 'tag', values: tagsFor(options) },
    // Only violations and incomplete results carry all nodes; passes are just counted.
    resultTypes: ['violations', 'incomplete'],
    iframes: true,
    frameWaitTime: 3000,
    selectors: true,
    ancestry: false,
    xpath: false,
    elementRef: false,
  });

  return [
    ...results.violations.map((r) => convertResult(r, 'violation')),
    ...results.incomplete.map((r) => convertResult(r, 'review')),
    ...results.passes.map((r) => convertResult(r, 'pass')),
  ];
}
