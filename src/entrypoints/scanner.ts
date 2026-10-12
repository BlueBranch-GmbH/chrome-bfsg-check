import { defineUnlistedScript } from 'wxt/utils/define-unlisted-script';
import { createScannerApi } from '../scanner';
import type { ScannerApi } from '../shared/types';

/**
 * Injected into the inspected tab (all frames) via chrome.scripting. Runs in
 * the extension's isolated world, so the page cannot see or change it.
 */
export default defineUnlistedScript(() => {
  const scope = globalThis as typeof globalThis & { __bfsgCheck?: ScannerApi };
  // Injected again on every scan; keep the first instance so overlay state survives.
  if (!scope.__bfsgCheck) scope.__bfsgCheck = createScannerApi();
});
