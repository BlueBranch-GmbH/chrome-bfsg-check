import { criteriaOf } from './wcag';
import type { Impact, RuleResult } from './types';

export const IMPACT_ORDER: Impact[] = ['critical', 'serious', 'moderate', 'minor'];

export type TrafficLight = 'red' | 'yellow' | 'green';

export interface Summary {
  light: TrafficLight;
  /** WCAG violations (rules), the part that matters for BFSG conformance. */
  violations: number;
  /** Affected elements across all WCAG violations. */
  affectedNodes: number;
  /** Rules (WCAG or custom) that need a human decision. */
  review: number;
  /** Best-practice violations: recommended, but not required by WCAG. */
  recommendations: number;
  passes: number;
  byImpact: Record<Impact, number>;
}

/** True if the rule maps to a WCAG success criterion (as opposed to best practice). */
export function isWcagRule(rule: Pick<RuleResult, 'tags'>): boolean {
  return criteriaOf(rule.tags).length > 0;
}

export function impactRank(impact: Impact | null): number {
  return impact ? IMPACT_ORDER.indexOf(impact) : IMPACT_ORDER.length;
}

/** Most severe first, then most affected elements. */
export function compareRules(a: RuleResult, b: RuleResult): number {
  return impactRank(a.impact) - impactRank(b.impact) || b.nodeCount - a.nodeCount || a.id.localeCompare(b.id);
}

export function summarize(rules: RuleResult[]): Summary {
  const byImpact: Record<Impact, number> = { critical: 0, serious: 0, moderate: 0, minor: 0 };
  let violations = 0;
  let affectedNodes = 0;
  let review = 0;
  let recommendations = 0;
  let passes = 0;

  for (const rule of rules) {
    if (rule.outcome === 'pass') {
      passes += 1;
    } else if (rule.outcome === 'review') {
      review += 1;
    } else if (isWcagRule(rule)) {
      violations += 1;
      affectedNodes += rule.nodeCount;
      if (rule.impact) byImpact[rule.impact] += 1;
    } else {
      recommendations += 1;
    }
  }

  const light: TrafficLight =
    byImpact.critical + byImpact.serious > 0 ? 'red' : violations > 0 || review > 0 ? 'yellow' : 'green';

  return { light, violations, affectedNodes, review, recommendations, passes, byImpact };
}
