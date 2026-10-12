<script setup lang="ts">
import { computed } from 'vue';
import { CHECKLIST, type ChecklistItem, type ChecklistStatus } from '../../shared/checklist';
import { checklist, resetChecklist } from '../checklist-state';
import { useI18n } from '../i18n';

const emit = defineEmits<{ openTool: [tool: NonNullable<ChecklistItem['tool']>] }>();
const { t, locale } = useI18n();

const statuses: ChecklistStatus[] = ['open', 'pass', 'fail', 'na'];
const done = computed(() => CHECKLIST.filter((item) => (checklist.items[item.id] ?? 'open') !== 'open').length);

function setStatus(id: string, status: ChecklistStatus) {
  checklist.items = { ...checklist.items, [id]: status };
}
</script>

<template>
  <div class="stack">
    <p class="muted small intro">{{ t('checklist.intro') }}</p>
    <p v-if="!checklist.origin" class="alert alert-info small">{{ t('checklist.noSite') }}</p>
    <template v-else>
      <div class="progress-row">
        <span class="small"><strong>{{ checklist.origin }}</strong> · {{ t('checklist.progress', { done, total: CHECKLIST.length }) }}</span>
        <progress :value="done" :max="CHECKLIST.length" :aria-label="t('checklist.progress', { done, total: CHECKLIST.length })"></progress>
      </div>

      <ol class="items">
        <li v-for="item in CHECKLIST" :key="item.id" class="card item" :class="`status-${checklist.items[item.id] ?? 'open'}`">
          <h3 :id="`check-${item.id}`">{{ item.text[locale].title }}</h3>
          <p v-if="item.criteria.length" class="muted small">{{ t('checklist.criteria', { criteria: item.criteria.join(', ') }) }}</p>
          <details>
            <summary class="small">{{ t('checklist.how') }}</summary>
            <p class="small">{{ item.text[locale].how }}</p>
            <button v-if="item.tool" type="button" class="btn btn-small" @click="emit('openTool', item.tool)">{{ t('checklist.openTool') }}</button>
          </details>
          <fieldset class="status" :aria-labelledby="`check-${item.id}`">
            <label v-for="status in statuses" :key="status" :class="`opt-${status}`">
              <input
                type="radio"
                :name="`status-${item.id}`"
                :value="status"
                :checked="(checklist.items[item.id] ?? 'open') === status"
                @change="setStatus(item.id, status)"
              />
              {{ t(`checklist.${status}`) }}
            </label>
          </fieldset>
        </li>
      </ol>

      <div>
        <button type="button" class="btn btn-small" @click="resetChecklist">{{ t('checklist.reset') }}</button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.intro,
p {
  margin: 0;
}
.progress-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
progress {
  width: 100%;
  height: 8px;
  accent-color: var(--accent);
}
.items {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.item {
  border-left-width: 5px;
}
.item.status-pass {
  border-left-color: var(--green);
}
.item.status-fail {
  border-left-color: var(--red);
}
.item.status-na {
  border-left-color: var(--minor);
}
h3 {
  font-size: 14px;
}
details {
  margin: 6px 0;
}
details summary {
  color: var(--accent);
  font-weight: 600;
}
details p {
  margin: 6px 0;
}
.status {
  border: 0;
  padding: 0;
  margin: 8px 0 0;
  display: flex;
  flex-wrap: wrap;
  gap: 4px 12px;
}
.status label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12.5px;
  cursor: pointer;
}
</style>
