<script setup lang="ts">
import { computed } from 'vue';
import { compareRules, isWcagRule, summarize } from '../../shared/summary';
import type { ScanResult } from '../../shared/types';
import { useI18n } from '../i18n';
import IssueCard from './IssueCard.vue';
import SummaryCard from './SummaryCard.vue';

const props = defineProps<{ result: ScanResult }>();
const { t } = useI18n();

const summary = computed(() => summarize(props.result.rules));
const violations = computed(() => props.result.rules.filter((r) => r.outcome === 'violation' && isWcagRule(r)).sort(compareRules));
const recommendations = computed(() => props.result.rules.filter((r) => r.outcome === 'violation' && !isWcagRule(r)).sort(compareRules));
const review = computed(() => props.result.rules.filter((r) => r.outcome === 'review').sort(compareRules));
</script>

<template>
  <div class="stack">
    <SummaryCard :summary="summary" />

    <section class="card" aria-labelledby="top-issues">
      <h2 id="top-issues" class="section-title">{{ t('simple.topIssues') }}</h2>
      <p v-if="!violations.length" class="muted">{{ t('simple.noIssues') }}</p>
      <IssueCard v-for="rule in violations" :key="rule.id" :rule="rule" />
    </section>

    <section v-if="review.length" class="card">
      <details>
        <summary>
          <h2 class="section-title inline">{{ t('simple.reviewTitle') }} ({{ review.length }})</h2>
        </summary>
        <p class="muted small">{{ t('simple.reviewIntro') }}</p>
        <IssueCard v-for="rule in review" :key="`review-${rule.id}`" :rule="rule" compact />
      </details>
    </section>

    <section v-if="recommendations.length" class="card">
      <details>
        <summary>
          <h2 class="section-title inline">{{ t('simple.recommendationsTitle') }} ({{ recommendations.length }})</h2>
        </summary>
        <IssueCard v-for="rule in recommendations" :key="`bp-${rule.id}`" :rule="rule" compact />
      </details>
    </section>
  </div>
</template>

<style scoped>
.section-title {
  font-size: 17px;
  margin-bottom: 10px;
}
.section-title.inline {
  display: inline;
  margin: 0;
}
details[open] > summary {
  margin-bottom: 10px;
}
</style>
