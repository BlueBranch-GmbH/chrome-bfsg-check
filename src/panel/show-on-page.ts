import type { Target } from '../shared/types';
import { translate, locale } from './i18n';
import { notify } from './notice';
import { highlight } from './scan-state';

/** Highlights an element in the page and explains when that is not possible. */
export async function showOnPage(target: Target, label: string): Promise<void> {
  const result = await highlight(target, label);
  if (!result?.found) notify(translate(locale.value, 'detailed.notFound'));
  else if (!result.visible) notify(translate(locale.value, 'detailed.notVisible'));
}
