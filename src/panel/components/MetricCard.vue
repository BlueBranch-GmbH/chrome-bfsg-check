<script setup lang="ts">
import { computed } from 'vue';
import { rate } from '../../shared/perf-thresholds';
import type { PerfMetrics } from '../../shared/types';
import { useI18n } from '../i18n';

const props = defineProps<{ metric: keyof PerfMetrics; value: number | null; label: string; help?: string; empty?: string }>();
const { t, formatMs, formatNumber } = useI18n();

const rating = computed(() => rate(props.metric, props.value));
const display = computed(() => {
  if (props.value === null) return '–';
  if (props.metric === 'cls') return formatNumber(props.value, 3);
  if (props.metric === 'longFrames') return formatNumber(props.value);
  return formatMs(props.value);
});
</script>

<template>
  <div class="metric" :class="rating ? `rating-${rating}` : ''">
    <span class="label">{{ label }}</span>
    <span class="value">{{ display }}</span>
    <span v-if="rating" class="rating"><span class="dot" aria-hidden="true"></span>{{ t(`perf.${rating}`) }}</span>
    <span v-if="value === null && empty" class="muted small">{{ empty }}</span>
    <span v-if="help" class="muted small">{{ help }}</span>
  </div>
</template>

<style scoped>
.metric {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px 12px;
  border-radius: 8px;
  background: var(--surface-2);
  border-top: 4px solid var(--border);
}
.metric.rating-good {
  border-top-color: var(--green);
}
.metric.rating-needs-improvement {
  border-top-color: var(--yellow);
}
.metric.rating-poor {
  border-top-color: var(--red);
}
.label {
  font-size: 12px;
  font-weight: 600;
  color: var(--muted);
}
.value {
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 600;
  color: var(--text);
  font-variant-numeric: tabular-nums;
}
.rating {
  display: flex;
  align-items: baseline;
  gap: 5px;
  font-size: 12px;
  font-weight: 700;
}
.dot {
  flex: none;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
}
</style>
