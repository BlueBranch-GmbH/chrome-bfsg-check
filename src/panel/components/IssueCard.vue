<script setup lang="ts">
import { computed, ref } from 'vue';
import { audienceOf, ruleText, ruleTitle } from '../../shared/rule-texts';
import type { RuleResult } from '../../shared/types';
import { useI18n } from '../i18n';
import { showOnPage } from '../show-on-page';
import ImpactBadge from './ImpactBadge.vue';

const props = defineProps<{ rule: RuleResult; compact?: boolean }>();
const { t, locale } = useI18n();

const text = computed(() => ruleText(props.rule, locale.value));
const title = computed(() => ruleTitle(props.rule, locale.value));
const position = ref(0);

async function show() {
  const node = props.rule.nodes[position.value];
  if (!node) return;
  await showOnPage(node.target, title.value);
  position.value = (position.value + 1) % props.rule.nodes.length;
}
</script>

<template>
  <article class="issue">
    <header class="head">
      <h3>{{ title }}</h3>
      <ImpactBadge v-if="rule.outcome !== 'pass'" :impact="rule.impact" />
    </header>
    <p class="muted small meta">
      {{ t(`audience.${audienceOf(rule)}`) }}<template v-if="rule.nodeCount"> · {{ t('simple.elements', { count: rule.nodeCount }) }}</template>
    </p>
    <template v-if="!compact">
      <p v-if="text.why"><strong>{{ t('simple.why') }}</strong> {{ text.why }}</p>
      <p v-if="text.fix"><strong>{{ t('simple.fix') }}:</strong> {{ text.fix }}</p>
    </template>
    <details v-else-if="text.why || text.fix" class="more">
      <summary class="small">{{ t('simple.why') }}</summary>
      <p v-if="text.why">{{ text.why }}</p>
      <p v-if="text.fix"><strong>{{ t('simple.fix') }}:</strong> {{ text.fix }}</p>
    </details>
    <div v-if="rule.nodes.length" class="actions">
      <button type="button" class="btn btn-small" @click="show">
        {{ rule.nodes.length > 1 && position > 0 ? t('simple.showNext', { index: position + 1, count: rule.nodes.length }) : t('simple.showOnPage') }}
      </button>
    </div>
  </article>
</template>

<style scoped>
.issue {
  padding: 12px 0;
  border-top: 1px solid var(--border);
}
.issue:first-child {
  border-top: 0;
  padding-top: 0;
}
.head {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  justify-content: space-between;
}
h3 {
  font-size: 14px;
}
p {
  margin: 6px 0 0;
}
.meta {
  margin-top: 2px;
}
.more {
  margin-top: 6px;
}
.more summary {
  color: var(--accent);
  font-weight: 600;
}
.actions {
  margin-top: 8px;
}
</style>
