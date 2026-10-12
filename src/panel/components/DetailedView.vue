<script setup lang="ts">
import { computed, ref } from 'vue';
import { audienceOf, ruleTitle } from '../../shared/rule-texts';
import { compareRules, IMPACT_ORDER, summarize } from '../../shared/summary';
import type { Impact, Outcome, RuleResult, ScanNode, ScanResult } from '../../shared/types';
import { compareCriteria, criteriaOf, enClause, getCriterion } from '../../shared/wcag';
import { useI18n } from '../i18n';
import { targetToString } from '../report';
import RuleDetails from './RuleDetails.vue';
import SegmentedControl from './SegmentedControl.vue';
import StructureView from './StructureView.vue';
import SummaryCard from './SummaryCard.vue';

const props = defineProps<{ result: ScanResult }>();
const { t, locale } = useI18n();

const outcome = ref<Outcome>('violation');
const impact = ref<Impact | 'all'>('all');
const onlyViewport = ref(false);
const query = ref('');

const summary = computed(() => summarize(props.result.rules));
const counts = computed(() => ({
  violation: props.result.rules.filter((r) => r.outcome === 'violation').length,
  review: props.result.rules.filter((r) => r.outcome === 'review').length,
  pass: props.result.rules.filter((r) => r.outcome === 'pass').length,
}));

interface Entry {
  rule: RuleResult;
  nodes: ScanNode[];
}

const entries = computed<Entry[]>(() => {
  const q = query.value.trim().toLowerCase();
  return props.result.rules
    .filter((rule) => rule.outcome === outcome.value)
    .filter((rule) => impact.value === 'all' || outcome.value === 'pass' || rule.impact === impact.value)
    .map((rule) => ({
      rule,
      nodes: onlyViewport.value ? rule.nodes.filter((node) => node.inViewport !== false) : rule.nodes,
    }))
    .filter((entry) => !onlyViewport.value || entry.rule.outcome === 'pass' || entry.rule.nodes.length === 0 || entry.nodes.length > 0)
    .filter(({ rule, nodes }) => {
      if (!q) return true;
      const haystack = [
        rule.id,
        rule.help,
        rule.description,
        ruleTitle(rule, locale.value),
        t(`audience.${audienceOf(rule)}`),
        ...criteriaOf(rule.tags),
        ...nodes.map((node) => `${targetToString(node.target)} ${node.html}`),
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    })
    .sort((a, b) => compareRules(a.rule, b.rule));
});

/** Group by WCAG criterion; a rule mapped to several criteria appears under the first one. */
const groups = computed(() => {
  const byCriterion = new Map<string, Entry[]>();
  const other: Entry[] = [];
  for (const entry of entries.value) {
    const [criterion] = criteriaOf(entry.rule.tags);
    if (!criterion) {
      other.push(entry);
      continue;
    }
    if (!byCriterion.has(criterion)) byCriterion.set(criterion, []);
    byCriterion.get(criterion)!.push(entry);
  }
  const list = [...byCriterion.entries()]
    .sort(([a], [b]) => compareCriteria(a, b))
    .map(([id, items]) => {
      const sc = getCriterion(id)!;
      return { id, title: `${id} ${sc.name[locale.value]}`, meta: [t('detailed.level', { level: sc.level }), t('detailed.en', { clause: enClause(id) })], items };
    });
  if (other.length) list.push({ id: 'other', title: t('detailed.otherRules'), meta: [], items: other });
  return list;
});
</script>

<template>
  <div class="stack">
    <SummaryCard :summary="summary" detailed />

    <section class="card stack filters" :aria-label="t('detailed.filterOutcome')">
      <SegmentedControl
        v-model="outcome"
        :label="t('detailed.filterOutcome')"
        name="outcome"
        :options="[
          { value: 'violation', label: `${t('detailed.violations')} (${counts.violation})` },
          { value: 'review', label: `${t('detailed.review')} (${counts.review})` },
          { value: 'pass', label: `${t('detailed.passes')} (${counts.pass})` },
        ]"
      />
      <div class="row filter-row">
        <label class="field">
          <span>{{ t('detailed.filterImpact') }}</span>
          <select v-model="impact" :disabled="outcome === 'pass'">
            <option value="all">{{ t('detailed.allImpacts') }}</option>
            <option v-for="level in IMPACT_ORDER" :key="level" :value="level">{{ t(`impact.${level}`) }}</option>
          </select>
        </label>
        <label class="field grow">
          <span>{{ t('detailed.search') }}</span>
          <input v-model="query" type="search" :placeholder="t('detailed.searchPlaceholder')" />
        </label>
      </div>
      <label class="checkbox">
        <input v-model="onlyViewport" type="checkbox" />
        <span>{{ t('detailed.onlyViewport') }}</span>
      </label>
    </section>

    <p v-if="!groups.length" class="card muted">{{ t('detailed.noResults') }}</p>

    <section v-for="group in groups" :key="group.id" class="card group" :aria-labelledby="`group-${group.id}`">
      <h2 :id="`group-${group.id}`">{{ group.title }}</h2>
      <p v-if="group.meta.length" class="muted small meta">{{ group.meta.join(' · ') }}</p>
      <RuleDetails v-for="entry in group.items" :key="`${entry.rule.id}-${entry.rule.outcome}`" :rule="entry.rule" :nodes="entry.nodes" />
    </section>

    <StructureView :structure="result.structure" />
  </div>
</template>

<style scoped>
.filter-row {
  align-items: flex-end;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
  color: var(--muted);
}
.field.grow {
  flex: 1;
  min-width: 140px;
}
.checkbox {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 13px;
  font-weight: 600;
}
.group h2 {
  font-size: 14px;
}
.meta {
  margin: 2px 0 6px;
}
</style>
