import { describe, expect, it } from 'vitest';
import { summarize } from '../src/shared/summary';
import type { RuleResult } from '../src/shared/types';

function rule(partial: Partial<RuleResult>): RuleResult {
  return { id: 'x', source: 'axe', outcome: 'violation', impact: 'minor', tags: [], help: '', description: '', nodes: [], nodeCount: 1, ...partial };
}

describe('summarize', () => {
  it('is red when there are serious WCAG violations', () => {
    const summary = summarize([rule({ impact: 'serious', tags: ['wcag2aa', 'wcag143'], nodeCount: 4 })]);
    expect(summary.light).toBe('red');
    expect(summary.violations).toBe(1);
    expect(summary.affectedNodes).toBe(4);
  });

  it('counts best-practice violations as recommendations, not violations', () => {
    const summary = summarize([rule({ impact: 'serious', tags: ['best-practice'] })]);
    expect(summary.violations).toBe(0);
    expect(summary.recommendations).toBe(1);
    expect(summary.light).toBe('green');
  });

  it('is yellow when only review items exist', () => {
    const summary = summarize([rule({ outcome: 'review', tags: ['wcag2aa', 'wcag143'] }), rule({ outcome: 'pass' })]);
    expect(summary.light).toBe('yellow');
    expect(summary.review).toBe(1);
    expect(summary.passes).toBe(1);
  });
});
