import { computed, ref } from 'vue';
import type { Locale } from '../../shared/types';
import de from './de';
import en from './en';

/** Same shape as the German messages, but with plain strings as values. */
type Widen<T> = { -readonly [K in keyof T]: T[K] extends string ? string : Widen<T[K]> };
export type Messages = Widen<typeof de>;

type Join<K, P> = K extends string ? (P extends string ? `${K}.${P}` : never) : never;
type Paths<T> = { [K in keyof T]: T[K] extends string ? K : Join<K, Paths<T[K]>> }[keyof T];
export type MessageKey = Paths<Messages>;

const catalogs: Record<Locale, Messages> = { de, en };

export const locale = ref<Locale>('de');

function lookup(messages: Messages, key: string): string | undefined {
  let value: unknown = messages;
  for (const part of key.split('.')) {
    if (value && typeof value === 'object') value = (value as Record<string, unknown>)[part];
    else return undefined;
  }
  return typeof value === 'string' ? value : undefined;
}

/**
 * Translates a key. `{name}` placeholders are replaced from params; a value
 * of the form "singular | plural" is chosen via params.count.
 */
export function translate(target: Locale, key: MessageKey | string, params: Record<string, string | number> = {}): string {
  let text = lookup(catalogs[target], key) ?? lookup(catalogs.de, key) ?? key;
  if (text.includes(' | ')) {
    const [one, other] = text.split(' | ');
    text = params.count === 1 ? one : other;
  }
  return text.replace(/\{(\w+)\}/g, (match, name: string) => (name in params ? String(params[name]) : match));
}

export function useI18n() {
  const t = (key: MessageKey | string, params?: Record<string, string | number>) => translate(locale.value, key, params);
  const numberFormat = computed(() => new Intl.NumberFormat(locale.value === 'de' ? 'de-DE' : 'en-GB'));
  const formatNumber = (value: number, digits = 0) =>
    new Intl.NumberFormat(locale.value === 'de' ? 'de-DE' : 'en-GB', { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(value);
  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${numberFormat.value.format(bytes)} B`;
    if (bytes < 1024 * 1024) return `${formatNumber(bytes / 1024, 0)} KB`;
    return `${formatNumber(bytes / 1024 / 1024, 1)} MB`;
  };
  const formatMs = (ms: number) => (ms >= 1000 ? `${formatNumber(ms / 1000, 2)} s` : `${numberFormat.value.format(Math.round(ms))} ms`);
  const formatTime = (timestamp: number) =>
    new Intl.DateTimeFormat(locale.value === 'de' ? 'de-DE' : 'en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(timestamp);
  const formatDateTime = (timestamp: number) =>
    new Intl.DateTimeFormat(locale.value === 'de' ? 'de-DE' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(timestamp);
  return { t, locale, formatNumber, formatBytes, formatMs, formatTime, formatDateTime };
}
