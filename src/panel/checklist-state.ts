import { reactive, watch } from 'vue';
import { browser } from 'wxt/browser';
import type { ChecklistStatus } from '../shared/checklist';

/** Checklist progress per origin, stored locally. */
export const checklist = reactive<{ origin: string | null; items: Record<string, ChecklistStatus> }>({
  origin: null,
  items: {},
});

const key = (origin: string) => `checklist:${origin}`;
let loading = false;

export async function loadChecklist(url: string | undefined): Promise<void> {
  let origin: string | null = null;
  try {
    origin = url ? new URL(url).origin : null;
  } catch {
    origin = null;
  }
  if (origin === checklist.origin) return;
  loading = true;
  checklist.origin = origin;
  checklist.items = {};
  if (origin) {
    const stored = await browser.storage.local.get(key(origin)).catch(() => ({}) as Record<string, unknown>);
    checklist.items = (stored[key(origin)] as Record<string, ChecklistStatus> | undefined) ?? {};
  }
  loading = false;
}

watch(
  () => ({ ...checklist.items }),
  (items) => {
    if (loading || !checklist.origin) return;
    void browser.storage.local.set({ [key(checklist.origin)]: items });
  },
);

export function resetChecklist(): void {
  checklist.items = {};
}
