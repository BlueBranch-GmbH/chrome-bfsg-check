<script setup lang="ts">
import { computed, ref } from 'vue';
import { ruleText, ruleTitle } from '../../shared/rule-texts';
import type { RuleResult, ScanNode } from '../../shared/types';
import { useI18n } from '../i18n';
import { notify } from '../notice';
import { targetToString } from '../report';
import { showOnPage } from '../show-on-page';
import ImpactBadge from './ImpactBadge.vue';

const props = defineProps<{ rule: RuleResult; nodes: ScanNode[] }>();
const { t, locale } = useI18n();

const custom = computed(() => props.rule.source === 'bfsg');
const plain = computed(() => ruleText(props.rule, locale.value));
const title = computed(() => (custom.value ? ruleTitle(props.rule, locale.value) : props.rule.help));
const description = computed(() => (custom.value ? plain.value.why : props.rule.description));
const isBestPractice = computed(() => props.rule.tags.includes('best-practice'));
const hiddenCount = computed(() => props.rule.nodeCount - props.rule.nodes.length);
const copiedIndex = ref<number | null>(null);

async function copy(node: ScanNode, index: number) {
  try {
    await navigator.clipboard.writeText(targetToString(node.target));
    copiedIndex.value = index;
    notify(t('detailed.copied'));
    setTimeout(() => (copiedIndex.value = null), 1500);
  } catch {
    /* clipboard not available */
  }
}
</script>

<template>
  <details class="rule">
    <summary>
      <span class="rule-title">{{ title }}</span>
      <span class="tags">
        <ImpactBadge v-if="rule.outcome !== 'pass'" :impact="rule.impact" />
        <span v-if="rule.nodeCount && rule.outcome !== 'pass'" class="badge count">{{ rule.nodeCount }}</span>
      </span>
    </summary>
    <div class="body stack">
      <p v-if="description">{{ description }}</p>
      <p v-if="plain.fix && rule.outcome !== 'pass'"><strong>{{ t('simple.fix') }}:</strong> {{ plain.fix }}</p>
      <p class="muted small">
        {{ t('detailed.rule') }}: <code>{{ rule.id }}</code>
        <template v-if="custom"> · {{ t('detailed.bfsg') }}</template>
        <template v-else-if="isBestPractice"> · {{ t('detailed.bestPractice') }}</template>
        <template v-if="rule.helpUrl">
          ·
          <a :href="rule.helpUrl" target="_blank" rel="noopener noreferrer">{{ t('detailed.learnMore') }}</a>
        </template>
      </p>
      <div v-if="nodes.length">
        <h3 class="small nodes-title">{{ t('detailed.nodes') }}</h3>
        <ol class="nodes">
          <li v-for="(node, index) in nodes" :key="index" class="node">
            <code class="selector">{{ targetToString(node.target) }}</code>
            <span v-if="node.target.length > 1" class="badge muted">{{ t('detailed.inFrame') }}</span>
            <span v-else-if="node.inViewport === false" class="muted small"> · {{ t('detailed.outsideViewport') }}</span>
            <pre class="snippet">{{ node.html }}</pre>
            <p v-if="node.summary" class="summary small">{{ node.summary }}</p>
            <p v-if="node.data?.text" class="small">„{{ node.data.text }}“</p>
            <div class="row">
              <button type="button" class="btn btn-small" @click="showOnPage(node.target, rule.id)">{{ t('detailed.show') }}</button>
              <button type="button" class="btn btn-small" @click="copy(node, index)">
                {{ copiedIndex === index ? t('detailed.copied') : t('detailed.copy') }}
              </button>
            </div>
          </li>
        </ol>
        <p v-if="hiddenCount > 0" class="muted small">{{ t('detailed.moreNodes', { count: hiddenCount }) }}</p>
      </div>
    </div>
  </details>
</template>

<style scoped>
.rule {
  border-top: 1px solid var(--border);
  padding: 8px 0;
}
.rule > summary {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}
.rule > summary::before {
  margin-top: 5px;
  flex: none;
}
.rule-title {
  flex: 1;
  font-weight: 600;
}
.tags {
  display: flex;
  gap: 4px;
  flex: none;
}
.count {
  color: var(--muted);
}
.body {
  padding: 8px 0 4px 15px;
}
.body p {
  margin: 0;
}
.nodes-title {
  margin-bottom: 6px;
}
.nodes {
  margin: 0;
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.selector {
  overflow-wrap: anywhere;
}
.summary {
  white-space: pre-line;
  color: var(--muted);
  margin: 4px 0;
}
.node .row {
  margin-top: 6px;
}
</style>
