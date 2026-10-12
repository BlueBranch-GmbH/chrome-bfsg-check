import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';
import { serializeLocale } from '../build/axe-locale-plugin';

const require = createRequire(import.meta.url);

describe('axe-core locale precompilation', () => {
  it('turns doT templates into functions and leaves plain strings alone', () => {
    const axe = require('axe-core') as { imports: { doT: { compile: (t: string) => (...a: unknown[]) => string } } };
    const locale = require('axe-core/locales/de.json');
    const code = serializeLocale(locale, axe.imports.doT.compile);
    // eslint-disable-next-line no-new-func -- evaluating the generated module in the test only
    const compiled = new Function(`return ${code}`)();
    expect(typeof compiled.failureSummaries.any.failureMessage).toBe('function');
    expect(compiled.failureSummaries.any.failureMessage(['A', 'B'])).toContain('A');
    expect(compiled.rules['image-alt'].help).toBe(locale.rules['image-alt'].help);
    expect(code).not.toMatch(/"[^"]*\{\{[^"]*"/);
  });
});
