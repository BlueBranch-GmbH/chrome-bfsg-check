<script setup lang="ts">
import { computed } from 'vue';
import type { PerfReport, ResourceKind } from '../../shared/types';
import { useI18n } from '../i18n';
import { showOnPage } from '../show-on-page';
import MetricCard from './MetricCard.vue';

const props = defineProps<{ perf: PerfReport; detailed: boolean }>();
const { t, formatBytes, formatNumber } = useI18n();

const kinds: ResourceKind[] = ['document', 'script', 'stylesheet', 'image', 'font', 'media', 'fetch', 'other'];
const usedKinds = computed(() => kinds.filter((kind) => props.perf.resources.byKind[kind].count > 0));
const hints = computed(() => (props.detailed ? props.perf.hints : props.perf.hints.slice(0, 4)));

function itemLabel(item: { url?: string; html?: string; data?: Record<string, string | number> }): string {
  if (item.data?.family) return `${item.data.family} (${item.data.weight}, ${item.data.style}) · font-display: ${item.data.display}`;
  if (item.data?.natural) return `${item.data.natural} → ${item.data.displayed}`;
  return item.url ?? item.html ?? '';
}
</script>

<template>
  <div class="stack">
    <p class="muted small intro">{{ t('perf.intro') }}</p>
    <p v-if="perf.navigation.hiddenDuringLoad" class="alert alert-warning small">{{ t('perf.hiddenWarning') }}</p>
    <p v-else-if="perf.navigation.fromCache" class="alert alert-info small">{{ t('perf.cacheWarning') }}</p>

    <section class="card stack" aria-labelledby="vitals-heading">
      <h2 id="vitals-heading">{{ t('perf.coreVitals') }}</h2>
      <div class="grid">
        <MetricCard metric="lcp" :value="perf.metrics.lcp" :label="detailed ? t('perf.lcp') : t('perf.lcpShort')" :help="detailed ? undefined : t('perf.lcpHelp')" />
        <MetricCard metric="cls" :value="perf.metrics.cls" :label="detailed ? t('perf.cls') : t('perf.clsShort')" :help="detailed ? undefined : t('perf.clsHelp')" />
        <MetricCard
          metric="inp"
          :value="perf.metrics.inp"
          :label="detailed ? t('perf.inp') : t('perf.inpShort')"
          :help="detailed ? undefined : t('perf.inpHelp')"
          :empty="t('perf.inpNone')"
        />
      </div>
      <div v-if="detailed && perf.lcpElement" class="lcp small">
        <strong>{{ t('perf.lcpElement') }}:</strong>
        <pre class="snippet">{{ perf.lcpElement.html }}</pre>
        <button v-if="perf.lcpElement.target" type="button" class="btn btn-small" @click="showOnPage(perf.lcpElement.target!, 'LCP')">
          {{ t('detailed.show') }}
        </button>
      </div>
    </section>

    <section class="card stack" aria-labelledby="weight-heading">
      <h2 id="weight-heading">{{ t('perf.weight') }}</h2>
      <p class="weight">
        <strong>{{ formatBytes(perf.resources.total.transfer) }}</strong> {{ t('perf.transferred') }} ·
        {{ t('perf.requests', { count: perf.resources.total.count }) }}
      </p>
      <template v-if="detailed">
        <table>
          <caption class="sr-only">{{ t('perf.resources') }}</caption>
          <thead>
            <tr>
              <th scope="col">{{ t('perf.kind') }}</th>
              <th scope="col" class="num">{{ t('perf.count') }}</th>
              <th scope="col" class="num">{{ t('perf.size') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="kind in usedKinds" :key="kind">
              <th scope="row">{{ t(`perf.kinds.${kind}`) }}</th>
              <td class="num">{{ perf.resources.byKind[kind].count }}</td>
              <td class="num">{{ formatBytes(perf.resources.byKind[kind].transfer) }}</td>
            </tr>
          </tbody>
        </table>
        <p v-if="perf.resources.unknownSize" class="muted small">{{ t('perf.unknownSize', { count: perf.resources.unknownSize }) }}</p>
        <p class="small">
          <strong>{{ t('perf.thirdParty') }}:</strong>
          {{ t('perf.thirdPartyText', { count: perf.resources.thirdPartyCount, origins: perf.resources.thirdPartyOrigins.length }) }}
        </p>
      </template>
    </section>

    <section v-if="detailed" class="card stack" aria-labelledby="metrics-heading">
      <h2 id="metrics-heading">{{ t('perf.otherMetrics') }}</h2>
      <div class="grid">
        <MetricCard metric="ttfb" :value="perf.metrics.ttfb" :label="t('perf.ttfb')" />
        <MetricCard metric="fcp" :value="perf.metrics.fcp" :label="t('perf.fcp')" />
        <MetricCard metric="blockingTime" :value="perf.metrics.blockingTime" :label="t('perf.blockingTime')" />
        <MetricCard metric="longFrames" :value="perf.metrics.longFrames" :label="t('perf.longFrames')" />
        <MetricCard metric="domContentLoaded" :value="perf.metrics.domContentLoaded" :label="t('perf.domContentLoaded')" />
        <MetricCard metric="load" :value="perf.metrics.load" :label="t('perf.load')" />
      </div>
      <p class="small">
        <strong>{{ t('perf.domSize') }}:</strong> {{ formatNumber(perf.domSize) }}
        <template v-if="perf.navigation.protocol"> · {{ perf.navigation.protocol }}</template>
      </p>
    </section>

    <section class="card" aria-labelledby="hints-heading">
      <h2 id="hints-heading">{{ t('perf.hints') }}</h2>
      <p v-if="!perf.hints.length" class="muted">{{ t('perf.noHints') }}</p>
      <article v-for="hint in hints" :key="hint.id" class="hint">
        <h3>
          <span class="sev" :class="`sev-${hint.severity}`" aria-hidden="true"></span>
          {{ t(`hints.${hint.id}.title`, { count: perf.domSize }) }}
        </h3>
        <p class="small">{{ t(`hints.${hint.id}.text`) }}</p>
        <p v-if="hint.savings" class="small"><strong>{{ t('perf.savings', { size: formatBytes(hint.savings) }) }}</strong></p>
        <details v-if="detailed && hint.id !== 'large-dom'" class="items">
          <summary class="small">{{ t('perf.showItems', { count: hint.itemCount }) }}</summary>
          <ul>
            <li v-for="(item, index) in hint.items" :key="index" class="small">
              <span class="item-label">{{ itemLabel(item) }}</span>
              <span v-if="item.data?.size" class="muted"> · {{ formatBytes(Number(item.data.size)) }}</span>
              <button v-if="item.target" type="button" class="btn-link" @click="showOnPage(item.target!, hint.id)">{{ t('detailed.show') }}</button>
            </li>
          </ul>
          <p v-if="hint.itemCount > hint.items.length" class="muted small">{{ t('perf.moreItems', { count: hint.itemCount - hint.items.length }) }}</p>
        </details>
      </article>
    </section>

    <p class="muted small">{{ t('perf.lighthouse') }}</p>
  </div>
</template>

<style scoped>
h2 {
  font-size: 15px;
}
.intro,
p {
  margin: 0;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 8px;
}
.weight strong {
  font-size: 18px;
}
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
th,
td {
  text-align: left;
  padding: 5px 4px;
  border-bottom: 1px solid var(--border);
}
th[scope='row'] {
  font-weight: 500;
}
.num {
  text-align: right;
}
.hint {
  padding: 10px 0;
  border-top: 1px solid var(--border);
}
.hint:first-of-type {
  border-top: 0;
}
.hint h3 {
  font-size: 13.5px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.hint p {
  margin-top: 4px;
}
.sev {
  flex: none;
  width: 10px;
  height: 10px;
  border-radius: 2px;
}
.sev-high {
  background: var(--red);
}
.sev-medium {
  background: var(--yellow);
}
.sev-low {
  background: var(--minor);
}
.items {
  margin-top: 6px;
}
.items ul {
  margin: 6px 0 0;
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.item-label {
  overflow-wrap: anywhere;
}
.lcp .snippet {
  margin-bottom: 6px;
}
</style>
