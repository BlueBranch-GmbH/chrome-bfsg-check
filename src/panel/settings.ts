import { reactive, watch } from 'vue';
import { browser } from 'wxt/browser';
import type { Locale, Standard } from '../shared/types';
import { locale } from './i18n';

export type ViewMode = 'simple' | 'detailed';

export interface Settings {
  locale: Locale;
  mode: ViewMode;
  standard: Standard;
  bestPractices: boolean;
}

const STORAGE_KEY = 'settings';

function defaultLocale(): Locale {
  try {
    return browser.i18n.getUILanguage().toLowerCase().startsWith('de') ? 'de' : 'en';
  } catch {
    return 'de';
  }
}

export const settings = reactive<Settings>({
  locale: defaultLocale(),
  mode: 'simple',
  standard: 'wcag21aa',
  bestPractices: true,
});

export async function loadSettings(): Promise<void> {
  try {
    const stored = await browser.storage.local.get(STORAGE_KEY);
    const value = stored[STORAGE_KEY] as Partial<Settings> | undefined;
    if (value) Object.assign(settings, value);
  } catch {
    /* defaults are fine */
  }
  locale.value = settings.locale;
  document.documentElement.lang = settings.locale;
  watch(
    settings,
    (value) => {
      locale.value = value.locale;
      document.documentElement.lang = value.locale;
      void browser.storage.local.set({ [STORAGE_KEY]: { ...value } });
    },
    { deep: true },
  );
}
