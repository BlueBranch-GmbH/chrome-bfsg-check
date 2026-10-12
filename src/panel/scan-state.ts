import { computed, reactive } from 'vue';
import { browser } from 'wxt/browser';
import type { HighlightResult, ScanResult, ScannerApi, Target, ToolState } from '../shared/types';
import { settings } from './settings';

export type ScanErrorKind = 'permission' | 'restricted' | 'file' | 'unknown' | 'noTab';

export interface TabScan {
  result: ScanResult | null;
  error: { kind: ScanErrorKind; message: string } | null;
  status: 'idle' | 'scanning' | 'reloading';
  /** The page navigated or reloaded after the scan. */
  stale: boolean;
}

interface State {
  windowId: number | null;
  activeTabId: number | null;
  /** Set via ?tab=<id> (used by end-to-end tests): always work on this tab. */
  pinnedTabId: number | null;
  scans: Record<number, TabScan>;
  tools: Record<number, ToolState & { tabOrderCount: number | null; zoom: boolean }>;
  hasAllSites: boolean;
}

export const state = reactive<State>({
  windowId: null,
  activeTabId: null,
  pinnedTabId: null,
  scans: {},
  tools: {},
  hasAllSites: false,
});

const SCANNER_FILE = '/scanner.js';
const SESSION_PREFIX = 'scan:';

export const current = computed<TabScan | null>(() => (state.activeTabId === null ? null : (state.scans[state.activeTabId] ?? null)));

function entry(tabId: number): TabScan {
  if (!state.scans[tabId]) state.scans[tabId] = { result: null, error: null, status: 'idle', stale: false };
  return state.scans[tabId];
}

export function toolsFor(tabId: number) {
  if (!state.tools[tabId]) state.tools[tabId] = { tabOrder: false, textSpacing: false, grayscale: false, tabOrderCount: null, zoom: false };
  return state.tools[tabId];
}

function classifyError(error: unknown, url?: string): { kind: ScanErrorKind; message: string } {
  const message = error instanceof Error ? error.message : String(error);
  if (url?.startsWith('file:') || /file:\/\//.test(message)) return { kind: 'file', message };
  if (/chrome:\/\/|chrome-extension:\/\/|extensions gallery|edge:\/\/|about:|devtools:|webstore|chrome-search/i.test(message)) {
    return { kind: 'restricted', message };
  }
  if (/permission|cannot access|host/i.test(message)) return { kind: 'permission', message };
  return { kind: 'unknown', message };
}

async function persist(tabId: number): Promise<void> {
  const scan = state.scans[tabId];
  try {
    if (scan?.result) await browser.storage.session.set({ [`${SESSION_PREFIX}${tabId}`]: { result: scan.result, stale: scan.stale } });
    else await browser.storage.session.remove(`${SESSION_PREFIX}${tabId}`);
  } catch {
    /* storage.session is a convenience, results stay in memory anyway */
  }
}

async function restore(tabId: number): Promise<void> {
  if (state.scans[tabId]?.result) return;
  try {
    const key = `${SESSION_PREFIX}${tabId}`;
    const stored = (await browser.storage.session.get(key))[key] as { result: ScanResult; stale: boolean } | undefined;
    if (stored && !state.scans[tabId]?.result) {
      const scan = entry(tabId);
      scan.result = stored.result;
      scan.stale = stored.stale;
    }
  } catch {
    /* ignore */
  }
}

type ApiMethod = 'highlight' | 'clearHighlight' | 'setTool' | 'getTools' | 'scan';

/** Calls a scanner method in the top frame, injecting the scanner first if needed. */
async function callScanner<T>(tabId: number, method: ApiMethod, args: unknown[] = []): Promise<T> {
  const invoke = async () => {
    const [frame] = await browser.scripting.executeScript({
      target: { tabId, frameIds: [0] },
      func: async (name: string, params: unknown[]) => {
        const api = (globalThis as unknown as { __bfsgCheck?: Record<string, (...a: unknown[]) => unknown> }).__bfsgCheck;
        if (!api) return { missing: true as const };
        return { value: await api[name](...params) };
      },
      // Vue hands us reactive proxies, which cannot be cloned into the page.
      args: [method, JSON.parse(JSON.stringify(args)) as unknown[]],
    });
    return frame?.result as { missing: true } | { value: T } | undefined;
  };
  let response = await invoke();
  if (!response || 'missing' in response) {
    await browser.scripting.executeScript({ target: { tabId, frameIds: [0] }, files: [SCANNER_FILE] });
    response = await invoke();
  }
  if (!response || 'missing' in response) throw new Error('Scanner could not be loaded');
  return response.value;
}

async function injectEverywhere(tabId: number): Promise<void> {
  try {
    await browser.scripting.executeScript({ target: { tabId, allFrames: true }, files: [SCANNER_FILE] });
  } catch {
    // Some frames may be off-limits (e.g. cross-origin without permission): fall back to the top frame.
    await browser.scripting.executeScript({ target: { tabId, frameIds: [0] }, files: [SCANNER_FILE] });
  }
  await browser.scripting
    .executeScript({
      target: { tabId, allFrames: true },
      func: (locale: string) => {
        (globalThis as unknown as { __bfsgCheck?: Pick<ScannerApi, 'prepare'> }).__bfsgCheck?.prepare(locale as 'de' | 'en');
      },
      args: [settings.locale],
    })
    .catch(() => undefined);
}

async function targetTab(): Promise<{ id: number; url?: string } | null> {
  if (state.pinnedTabId !== null) {
    const tab = await browser.tabs.get(state.pinnedTabId).catch(() => null);
    return tab?.id !== undefined ? { id: tab.id, url: tab.url } : null;
  }
  const [tab] = await browser.tabs.query({ active: true, ...(state.windowId !== null ? { windowId: state.windowId } : { currentWindow: true }) });
  return tab?.id !== undefined ? { id: tab.id, url: tab.url } : null;
}

export async function runScan(): Promise<void> {
  const tab = await targetTab();
  if (!tab) {
    if (state.activeTabId !== null) entry(state.activeTabId).error = { kind: 'noTab', message: '' };
    return;
  }
  state.activeTabId = tab.id;
  const scan = entry(tab.id);
  if (scan.status === 'scanning') return;
  scan.status = 'scanning';
  scan.error = null;
  try {
    await injectEverywhere(tab.id);
    const result = await callScanner<ScanResult>(tab.id, 'scan', [
      { locale: settings.locale, standard: settings.standard, bestPractices: settings.bestPractices },
    ]);
    scan.result = result;
    scan.stale = false;
    await refreshTools(tab.id);
  } catch (error) {
    scan.error = classifyError(error, tab.url);
  } finally {
    scan.status = 'idle';
    void persist(tab.id);
  }
}

/** Reloads the tab without cache, waits until it has finished loading, then scans. */
export async function reloadAndScan(): Promise<void> {
  const tab = await targetTab();
  if (!tab) return;
  const scan = entry(tab.id);
  scan.status = 'reloading';
  scan.error = null;
  const loaded = new Promise<void>((resolve) => {
    const timeout = setTimeout(done, 30_000);
    function done() {
      clearTimeout(timeout);
      browser.tabs.onUpdated.removeListener(listener);
      resolve();
    }
    function listener(tabId: number, info: { status?: string }) {
      if (tabId === tab!.id && info.status === 'complete') done();
    }
    browser.tabs.onUpdated.addListener(listener);
  });
  try {
    await browser.tabs.reload(tab.id, { bypassCache: true });
    await loaded;
    // Give late resources and the LCP candidate a moment to settle.
    await new Promise((resolve) => setTimeout(resolve, 1500));
  } catch (error) {
    scan.status = 'idle';
    scan.error = classifyError(error, tab.url);
    return;
  }
  scan.status = 'idle';
  delete state.tools[tab.id];
  await runScan();
}

export async function highlight(target: Target, label: string): Promise<HighlightResult | null> {
  if (state.activeTabId === null) return null;
  try {
    return await callScanner<HighlightResult>(state.activeTabId, 'highlight', [target, label]);
  } catch {
    return null;
  }
}

export async function clearHighlight(): Promise<void> {
  if (state.activeTabId === null) return;
  await callScanner(state.activeTabId, 'clearHighlight').catch(() => undefined);
}

export async function refreshTools(tabId: number): Promise<void> {
  try {
    const tools = await callScanner<ToolState>(tabId, 'getTools');
    Object.assign(toolsFor(tabId), tools);
    const zoom = await browser.tabs.getZoom(tabId).catch(() => 1);
    toolsFor(tabId).zoom = zoom >= 1.99;
  } catch {
    /* tab not accessible (yet) */
  }
}

export async function setTool(tool: keyof ToolState, enabled: boolean): Promise<void> {
  const tabId = state.activeTabId;
  if (tabId === null) return;
  const count = await callScanner<number | null>(tabId, 'setTool', [tool, enabled]);
  const tools = toolsFor(tabId);
  tools[tool] = enabled;
  if (tool === 'tabOrder') tools.tabOrderCount = count;
}

export async function setZoom(enabled: boolean): Promise<void> {
  const tabId = state.activeTabId;
  if (tabId === null) return;
  await browser.tabs.setZoom(tabId, enabled ? 2 : 0);
  toolsFor(tabId).zoom = enabled;
}

/** Opens the scanned page in a narrow popup window to test reflow at 320 CSS px. */
export async function openReflowWindow(url: string): Promise<void> {
  const created = await browser.windows.create({ url, type: 'popup', width: 336, height: 760, focused: true });
  const tabId = created?.tabs?.[0]?.id;
  if (tabId !== undefined) await browser.tabs.setZoom(tabId, 1).catch(() => undefined);
}

export async function requestAllSites(): Promise<boolean> {
  // Must run directly in the click handler: permission requests need a user gesture.
  const granted = await browser.permissions.request({ origins: ['<all_urls>'] });
  state.hasAllSites = granted;
  return granted;
}

export async function initScanState(): Promise<void> {
  const pinned = Number(new URLSearchParams(location.search).get('tab'));
  if (pinned > 0) state.pinnedTabId = pinned;

  const win = await browser.windows.getCurrent().catch(() => null);
  state.windowId = win?.id ?? null;
  const tab = await targetTab();
  state.activeTabId = tab?.id ?? null;
  if (tab) {
    await restore(tab.id);
    void refreshTools(tab.id);
  }
  state.hasAllSites = await browser.permissions.contains({ origins: ['<all_urls>'] }).catch(() => false);

  browser.tabs.onActivated.addListener(async ({ tabId, windowId }) => {
    if (state.pinnedTabId !== null || (state.windowId !== null && windowId !== state.windowId)) return;
    state.activeTabId = tabId;
    await restore(tabId);
    void refreshTools(tabId);
  });
  browser.tabs.onUpdated.addListener((tabId, info) => {
    if (info.status !== 'loading') return;
    const scan = state.scans[tabId];
    delete state.tools[tabId];
    if (scan?.result && scan.status === 'idle') {
      scan.stale = true;
      void persist(tabId);
    }
  });
  browser.tabs.onRemoved.addListener((tabId) => {
    delete state.scans[tabId];
    delete state.tools[tabId];
    void browser.storage.session.remove(`${SESSION_PREFIX}${tabId}`).catch(() => undefined);
  });
  browser.permissions.onAdded.addListener(async () => {
    state.hasAllSites = await browser.permissions.contains({ origins: ['<all_urls>'] });
  });
  browser.permissions.onRemoved.addListener(async () => {
    state.hasAllSites = await browser.permissions.contains({ origins: ['<all_urls>'] });
  });
}
