<script setup lang="ts">
import { computed, ref } from 'vue';
import { checklist } from '../checklist-state';
import { useI18n } from '../i18n';
import { buildCsv, buildHtmlReport, buildJson, download, reportBaseName } from '../report';
import { current, reloadAndScan, requestAllSites, runScan, state } from '../scan-state';
import { settings } from '../settings';

const { t, formatTime, formatMs } = useI18n();

const busy = computed(() => current.value?.status === 'scanning' || current.value?.status === 'reloading');
const result = computed(() => current.value?.result ?? null);
const error = computed(() => current.value?.error ?? null);
const exportOpen = ref(false);

const settingsChanged = computed(() => {
  const options = result.value?.options;
  if (!options) return false;
  return options.locale !== settings.locale || options.standard !== settings.standard || options.bestPractices !== settings.bestPractices;
});

const host = computed(() => {
  if (!result.value) return '';
  try {
    return new URL(result.value.url).host;
  } catch {
    return result.value.url;
  }
});

async function grantAndRetry() {
  if (await requestAllSites()) await runScan();
}

function exportAs(format: 'html' | 'csv' | 'json') {
  if (!result.value) return;
  const base = reportBaseName(result.value);
  if (format === 'html') download(`${base}.html`, buildHtmlReport(result.value, checklist.items, settings.locale), 'text/html;charset=utf-8');
  if (format === 'csv') download(`${base}.csv`, buildCsv(result.value, settings.locale), 'text/csv;charset=utf-8');
  if (format === 'json') download(`${base}.json`, buildJson(result.value, checklist.items), 'application/json');
}
</script>

<template>
  <section class="card stack" aria-labelledby="scan-heading">
    <h2 id="scan-heading" class="sr-only">{{ t('scan.start') }}</h2>

    <div v-if="result" class="page">
      <p class="title">{{ result.title || host }}</p>
      <p class="muted small url">{{ result.url }}</p>
    </div>
    <template v-else-if="!error">
      <p class="intro">{{ t('scan.empty') }}</p>
      <p class="muted small">{{ t('scan.emptyHint') }}</p>
    </template>

    <div class="row">
      <button type="button" class="btn btn-primary" :disabled="busy" @click="runScan()">
        {{ result ? t('scan.again') : t('scan.start') }}
      </button>
      <button type="button" class="btn" :disabled="busy" :title="t('scan.reloadHint')" @click="reloadAndScan()">
        {{ t('scan.reloadAndScan') }}
      </button>
    </div>

    <p role="status" class="muted small status">
      <template v-if="current?.status === 'scanning'"><span class="spinner" aria-hidden="true"></span>{{ t('scan.running') }}</template>
      <template v-else-if="current?.status === 'reloading'"><span class="spinner" aria-hidden="true"></span>{{ t('scan.reloading') }}</template>
      <template v-else-if="result">{{ t('scan.scannedAt', { time: formatTime(result.scannedAt), duration: formatMs(result.durationMs) }) }}</template>
    </p>

    <p v-if="current?.stale" class="alert alert-warning small">{{ t('scan.stale') }}</p>
    <p v-else-if="settingsChanged" class="alert alert-info small">{{ t('scan.settingsChanged') }}</p>

    <div v-if="error" class="alert alert-error stack small" role="alert">
      <template v-if="error.kind === 'permission'">
        <strong>{{ t('errors.permission') }}</strong>
        <span>{{ t('errors.permissionHint') }}</span>
        <div v-if="!state.hasAllSites"><button type="button" class="btn btn-small" @click="grantAndRetry">{{ t('errors.grantAll') }}</button></div>
      </template>
      <template v-else-if="error.kind === 'restricted'">
        <strong>{{ t('errors.restricted') }}</strong>
        <span>{{ t('errors.restrictedHint') }}</span>
      </template>
      <template v-else-if="error.kind === 'file'">
        <strong>{{ t('errors.file') }}</strong>
        <span>{{ t('errors.fileHint') }}</span>
      </template>
      <template v-else-if="error.kind === 'noTab'">
        <strong>{{ t('errors.noTab') }}</strong>
      </template>
      <template v-else>
        <strong>{{ t('errors.unknown') }}</strong>
        <code>{{ error.message }}</code>
      </template>
    </div>

    <div v-if="result" class="export">
      <button type="button" class="btn-link small" :aria-expanded="exportOpen" aria-controls="export-options" @click="exportOpen = !exportOpen">
        {{ t('export.title') }}
      </button>
      <div v-show="exportOpen" id="export-options" class="stack export-options">
        <div class="row">
          <button type="button" class="btn btn-small" @click="exportAs('html')">{{ t('export.html') }}</button>
          <button type="button" class="btn btn-small" @click="exportAs('csv')">{{ t('export.csv') }}</button>
          <button type="button" class="btn btn-small" @click="exportAs('json')">{{ t('export.json') }}</button>
        </div>
        <p class="muted small">{{ t('export.printHint') }}</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.page p {
  margin: 0;
}
.title {
  font-weight: 700;
  overflow-wrap: anywhere;
}
.url {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.intro {
  margin: 0;
}
p {
  margin: 0;
}
.status:empty {
  display: none;
}
.spinner {
  display: inline-block;
  width: 12px;
  height: 12px;
  margin-right: 6px;
  border: 2px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  vertical-align: -1px;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.export-options {
  margin-top: 8px;
}
code {
  overflow-wrap: anywhere;
}
</style>
