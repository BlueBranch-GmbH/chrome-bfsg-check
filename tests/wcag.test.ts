import { describe, expect, it } from 'vitest';
import { compareCriteria, criteriaOf, criterionFromTag, enClause } from '../src/shared/wcag';

describe('wcag', () => {
  it('maps axe-core tags to success criteria', () => {
    expect(criterionFromTag('wcag111')).toBe('1.1.1');
    expect(criterionFromTag('wcag1412')).toBe('1.4.12');
    expect(criterionFromTag('wcag258')).toBe('2.5.8');
    expect(criterionFromTag('wcag21aa')).toBeNull();
    expect(criterionFromTag('best-practice')).toBeNull();
  });

  it('collects all criteria of a rule', () => {
    expect(criteriaOf(['cat.aria', 'wcag2a', 'wcag244', 'wcag412'])).toEqual(['2.4.4', '4.1.2']);
  });

  it('builds EN 301 549 clauses and sorts numerically', () => {
    expect(enClause('1.4.3')).toBe('9.1.4.3');
    expect(['1.4.10', '1.4.3', '1.1.1'].sort(compareCriteria)).toEqual(['1.1.1', '1.4.3', '1.4.10']);
  });
});
