import { createRequire } from 'node:module';
import type { Plugin } from 'vite';

/**
 * axe-core compiles doT templates in locale files with `new Function` when
 * `axe.configure({ locale })` runs. Extension pages and content scripts
 * forbid eval (CSP), so this plugin compiles those templates at build time
 * and exposes the locale as a virtual module: `virtual:axe-locale/de`.
 */

const PREFIX = 'virtual:axe-locale/';
const RESOLVED_PREFIX = `\0${PREFIX}`;
// Same pattern axe-core uses to decide whether a message is a template.
const TEMPLATE = /\{\{.+?\}\}/;

type DotCompile = (template: string) => (...args: unknown[]) => string;

export function serializeLocale(value: unknown, compile: DotCompile): string {
  if (typeof value === 'string') {
    return TEMPLATE.test(value) ? `(${compile(value).toString()})` : JSON.stringify(value);
  }
  if (Array.isArray(value)) return `[${value.map((item) => serializeLocale(item, compile)).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.entries(value)
      .map(([key, item]) => `${JSON.stringify(key)}:${serializeLocale(item, compile)}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
}

export function axeLocalePlugin(): Plugin {
  const require = createRequire(import.meta.url);
  return {
    name: 'bfsg-axe-locale',
    resolveId(id) {
      return id.startsWith(PREFIX) ? `\0${id}` : undefined;
    },
    load(id) {
      if (!id.startsWith(RESOLVED_PREFIX)) return undefined;
      const lang = id.slice(RESOLVED_PREFIX.length);
      if (!/^[a-z]{2}(_[A-Z]{2})?$/.test(lang)) throw new Error(`Invalid axe-core locale: ${lang}`);
      const axe = require('axe-core') as { imports: { doT: { compile: DotCompile } } };
      const locale = require(`axe-core/locales/${lang}.json`) as unknown;
      return `export default ${serializeLocale(locale, axe.imports.doT.compile)};`;
    },
  };
}
