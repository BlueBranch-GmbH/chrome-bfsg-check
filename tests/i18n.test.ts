import { describe, expect, it } from 'vitest';
import { RULE_TEXTS } from '../src/shared/rule-texts';
import { CHECKLIST } from '../src/shared/checklist';
import { translate } from '../src/panel/i18n';
import de from '../src/panel/i18n/de';
import en from '../src/panel/i18n/en';

function keys(value: object, prefix = ''): string[] {
  return Object.entries(value).flatMap(([key, child]) =>
    typeof child === 'object' && child !== null ? keys(child, `${prefix}${key}.`) : [`${prefix}${key}`],
  );
}

describe('translations', () => {
  it('has the same keys in German and English', () => {
    expect(keys(en).sort()).toEqual(keys(de).sort());
  });

  it('replaces parameters and picks plural forms', () => {
    expect(translate('de', 'simple.elements', { count: 1 })).toBe('1 Element');
    expect(translate('de', 'simple.elements', { count: 3 })).toBe('3 Elemente');
    expect(translate('en', 'checklist.progress', { done: 2, total: 5 })).toBe('2 of 5 done');
  });

  it('has complete rule texts in both languages', () => {
    for (const [id, copy] of Object.entries(RULE_TEXTS)) {
      for (const lang of ['de', 'en'] as const) {
        expect(copy[lang].title, `${id} ${lang}`).not.toBe('');
        expect(copy[lang].why, `${id} ${lang}`).not.toBe('');
        expect(copy[lang].fix, `${id} ${lang}`).not.toBe('');
      }
      expect(Boolean(copy.de.passTitle)).toBe(Boolean(copy.en.passTitle));
    }
  });

  it('has complete checklist texts', () => {
    for (const item of CHECKLIST) {
      expect(item.text.de.title && item.text.en.title && item.text.de.how && item.text.en.how).toBeTruthy();
    }
  });
});
