import { browser } from 'wxt/browser';
import { defineBackground } from 'wxt/utils/define-background';

export default defineBackground(() => {
  // Clicking the toolbar icon (or the shortcut) grants activeTab for the
  // current tab and opens the side panel, where the actual work happens.
  browser.action.onClicked.addListener((tab) => {
    if (tab.windowId !== undefined) void browser.sidePanel.open({ windowId: tab.windowId });
  });
});
