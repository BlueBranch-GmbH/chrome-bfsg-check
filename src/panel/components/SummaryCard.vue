<script setup lang="ts">
import type { Summary } from '../../shared/summary';
import { IMPACT_ORDER } from '../../shared/summary';
import { useI18n } from '../i18n';

defineProps<{ summary: Summary; detailed?: boolean }>();
const { t } = useI18n();
</script>

<template>
  <section class="card summary" :class="`light-${summary.light}`" aria-labelledby="summary-heading">
    <div class="headline">
      <span class="dot" aria-hidden="true"></span>
      <div>
        <h2 id="summary-heading">{{ t(`summary.${summary.light}`) }}</h2>
        <p class="small">{{ t(`summary.${summary.light}Text`) }}</p>
      </div>
    </div>
    <dl class="stats">
      <div>
        <dt>{{ t('summary.violations') }}</dt>
        <dd>{{ summary.violations }}</dd>
      </div>
      <div>
        <dt>{{ t('summary.affected') }}</dt>
        <dd>{{ summary.affectedNodes }}</dd>
      </div>
      <div>
        <dt>{{ t('summary.review') }}</dt>
        <dd>{{ summary.review }}</dd>
      </div>
      <div v-if="detailed">
        <dt>{{ t('summary.recommendations') }}</dt>
        <dd>{{ summary.recommendations }}</dd>
      </div>
      <div v-if="detailed">
        <dt>{{ t('summary.passes') }}</dt>
        <dd>{{ summary.passes }}</dd>
      </div>
    </dl>
    <ul v-if="detailed && summary.violations" class="impacts" :aria-label="t('detailed.filterImpact')">
      <li v-for="impact in IMPACT_ORDER" :key="impact" :class="`impact-${impact}`">
        <strong>{{ summary.byImpact[impact] }}</strong> {{ t(`impact.${impact}`) }}
      </li>
    </ul>
    <p class="muted small disclaimer">{{ t('summary.disclaimer') }}</p>
  </section>
</template>

<style scoped>
.summary {
  border-left-width: 6px;
}
.light-red {
  border-left-color: var(--red);
}
.light-yellow {
  border-left-color: var(--yellow);
}
.light-green {
  border-left-color: var(--green);
}
.headline {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}
.headline p {
  margin: 2px 0 0;
}
h2 {
  font-size: 18px;
}
.dot {
  flex: none;
  width: 14px;
  height: 14px;
  margin-top: 3px;
  border-radius: 50%;
}
.light-red .dot {
  background: var(--red);
}
.light-yellow .dot {
  background: var(--yellow);
}
.light-green .dot {
  background: var(--green);
}
.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
  gap: 8px;
  margin: 14px 0 0;
}
.stats div {
  background: var(--surface-2);
  border-radius: 8px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column-reverse;
}
dt {
  font-size: 11.5px;
  color: var(--muted);
}
dd {
  margin: 0;
  font-family: var(--font-display);
  font-size: 26px;
  font-weight: 600;
  line-height: 1.2;
  font-variant-numeric: tabular-nums;
}
.impacts {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 14px;
  list-style: none;
  padding: 0;
  margin: 10px 0 0;
  font-size: 12.5px;
}
.disclaimer {
  margin: 12px 0 0;
}
</style>
