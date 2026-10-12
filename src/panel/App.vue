<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { browser } from 'wxt/browser';
import type { ChecklistItem } from '../shared/checklist';
import { REPO_URL, authorLink } from '../shared/meta';
import { summarize } from '../shared/summary';
import { loadChecklist } from './checklist-state';
import AppHeader from './components/AppHeader.vue';
import BbLogo from './components/BbLogo.vue';
import BrandCta from './components/BrandCta.vue';
import ChecklistView from './components/ChecklistView.vue';
import DetailedView from './components/DetailedView.vue';
import PerformanceView from './components/PerformanceView.vue';
import ScanCard from './components/ScanCard.vue';
import SimpleView from './components/SimpleView.vue';
import TabBar from './components/TabBar.vue';
import ToolsView from './components/ToolsView.vue';
import { useI18n } from './i18n';
import { notice } from './notice';
import { current, initScanState } from './scan-state';
import { loadSettings, settings } from './settings';

type Section = 'a11y' | 'perf' | 'checklist' | 'tools';

const { t } = useI18n();
const ready = ref(false);
const section = ref<Section>('a11y');
const result = computed(() => current.value?.result ?? null);
const version = browser.runtime.getManifest().version;

// Icon paths from Lucide (ISC license): accessibility, gauge, list-checks, wrench.
const ICONS: Record<Section, string[]> = {
  a11y: ['M17 4a1 1 0 1 1-2 0 1 1 0 0 1 2 0', 'm18 19 1-7-6 1', 'm5 8 3-3 5.5 3-2.36 3.5', 'M4.24 14.5a5 5 0 0 0 6.88 6', 'M13.76 17.5a5 5 0 0 0-6.88-6'],
  perf: ['m12 14 4-4', 'M3.34 19a10 10 0 1 1 17.32 0'],
  checklist: ['m3 17 2 2 4-4', 'm3 7 2 2 4-4', 'M13 6h8', 'M13 12h8', 'M13 18h8'],
  tools: [
    'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z',
  ],
};

const tabs = computed(() => [
  {
    id: 'a11y' as const,
    label: t('tabs.accessibility'),
    icon: ICONS.a11y,
    count: result.value ? summarize(result.value.rules).violations : undefined,
  },
  { id: 'perf' as const, label: t('tabs.performance'), icon: ICONS.perf },
  { id: 'checklist' as const, label: t('tabs.checklist'), icon: ICONS.checklist },
  { id: 'tools' as const, label: t('tabs.tools'), icon: ICONS.tools },
]);

watch(
  () => result.value?.url,
  (url) => void loadChecklist(url),
);

async function openTool(tool: NonNullable<ChecklistItem['tool']>) {
  section.value = 'tools';
  await nextTick();
  const el = document.getElementById(`tool-${tool}`);
  el?.scrollIntoView({ block: 'center' });
  el?.querySelector<HTMLElement>('input, button')?.focus();
}

onMounted(async () => {
  await loadSettings();
  await initScanState();
  ready.value = true;
});
</script>

<template>
  <div v-if="ready" class="app">
    <AppHeader />
    <main class="stack">
      <ScanCard />
      <TabBar v-model="section" :tabs="tabs" :label="t('tabs.label')" id-prefix="main" />
      <div id="main-panel" role="tabpanel" :aria-labelledby="`main-tab-${section}`" class="panel">
        <template v-if="section === 'a11y'">
          <div v-if="result" class="stack">
            <SimpleView v-if="settings.mode === 'simple'" :result="result" />
            <DetailedView v-else :result="result" />
            <BrandCta placement="results" />
          </div>
        </template>
        <template v-else-if="section === 'perf'">
          <PerformanceView v-if="result" :perf="result.perf" :detailed="settings.mode === 'detailed'" />
        </template>
        <ChecklistView v-else-if="section === 'checklist'" @open-tool="openTool" />
        <ToolsView v-else />
        <p v-if="!result && (section === 'a11y' || section === 'perf')" class="muted small">{{ t('tools.needsScan') }}</p>
      </div>
    </main>
    <footer class="footer small">
      <a class="made-by" :href="authorLink('panel-footer')" target="_blank" rel="noopener">
        <span>{{ t('app.madeBy') }}</span>
        <BbLogo class="footer-logo" />
        <span class="sr-only">{{ t('cta.newTab') }}</span>
      </a>
      <p class="muted">{{ t('app.privacy') }}</p>
      <nav class="links muted" :aria-label="t('app.links')">
        <a :href="authorLink('panel-footer-link')" target="_blank" rel="noopener">{{ t('app.website') }}</a>
        <a :href="REPO_URL" target="_blank" rel="noopener noreferrer">{{ t('app.sourceCode') }}</a>
        <a :href="`${REPO_URL}/blob/main/PRIVACY.md`" target="_blank" rel="noopener noreferrer">{{ t('app.privacyPolicy') }}</a>
      </nav>
      <p class="muted tabular">
        &copy; BlueBranch GmbH · v{{ version }}<template v-if="result"> · {{ result.engine.name }} {{ result.engine.version }}</template>
      </p>
    </footer>
    <div class="toast" role="status" aria-live="polite">
      <span v-if="notice">{{ notice }}</span>
    </div>
  </div>
</template>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 14px 14px 20px;
  max-width: 760px;
  margin: 0 auto;
}
.panel {
  padding-top: 4px;
}
.footer {
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-top: 1px solid var(--border);
  padding-top: 16px;
}
.footer p {
  margin: 0;
}
.made-by {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  align-self: flex-start;
  color: var(--text);
  font-weight: 500;
  text-decoration: none;
}
.made-by:hover span {
  text-decoration: underline;
}
.footer-logo {
  height: 15px;
  width: auto;
}
.links {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 14px;
}
.links a {
  color: var(--muted);
}
.links a:hover {
  color: var(--text);
}
.toast {
  position: fixed;
  left: 12px;
  right: 12px;
  bottom: 12px;
  display: flex;
  justify-content: center;
  pointer-events: none;
}
.toast span {
  background: var(--text);
  color: var(--bg);
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 13px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
}
</style>
