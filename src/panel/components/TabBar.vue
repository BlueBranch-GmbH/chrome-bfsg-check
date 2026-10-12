<script setup lang="ts" generic="T extends string">
import { nextTick, ref } from 'vue';

/**
 * WAI-ARIA tabs with roving tabindex and arrow-key navigation. Equal columns
 * with the icon above the label, so all tabs fit even in a narrow side panel.
 */
const props = defineProps<{ label: string; tabs: Array<{ id: T; label: string; icon: string[]; count?: number }>; idPrefix: string }>();
const model = defineModel<T>({ required: true });
const buttons = ref<HTMLButtonElement[]>([]);

async function onKeydown(event: KeyboardEvent, index: number) {
  const last = props.tabs.length - 1;
  let next: number | null = null;
  if (event.key === 'ArrowRight') next = index === last ? 0 : index + 1;
  else if (event.key === 'ArrowLeft') next = index === 0 ? last : index - 1;
  else if (event.key === 'Home') next = 0;
  else if (event.key === 'End') next = last;
  if (next === null) return;
  event.preventDefault();
  model.value = props.tabs[next].id;
  await nextTick();
  buttons.value[next]?.focus();
}
</script>

<template>
  <div class="tabbar" role="tablist" :aria-label="label" :style="{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }">
    <button
      v-for="(tab, index) in tabs"
      :id="`${idPrefix}-tab-${tab.id}`"
      :key="tab.id"
      ref="buttons"
      type="button"
      role="tab"
      :aria-selected="model === tab.id"
      :aria-controls="`${idPrefix}-panel`"
      :tabindex="model === tab.id ? 0 : -1"
      @click="model = tab.id"
      @keydown="onKeydown($event, index)"
    >
      <span class="icon">
        <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path v-for="(d, i) in tab.icon" :key="i" :d="d" />
        </svg>
        <span v-if="tab.count" class="count">{{ tab.count }}</span>
      </span>
      <span class="label">{{ tab.label }}</span>
    </button>
  </div>
</template>

<style scoped>
.tabbar {
  display: grid;
  border-bottom: 1px solid var(--border);
}
button {
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 2px 9px;
  border: 0;
  border-bottom: 3px solid transparent;
  margin-bottom: -1px;
  background: none;
  color: var(--muted);
  font: inherit;
  cursor: pointer;
}
button[aria-selected='true'] {
  color: var(--accent-text);
  border-bottom-color: var(--accent);
}
button:hover {
  color: var(--text);
}
button[aria-selected='true']:hover {
  color: var(--accent-text);
}
.icon {
  position: relative;
  display: inline-flex;
}
.label {
  max-width: 100%;
  font-size: 11.5px;
  font-weight: 600;
  line-height: 1.2;
  text-align: center;
  /* Only break at soft hyphens placed in the translations (e.g. Barriere-freiheit). */
  hyphens: manual;
}
.count {
  position: absolute;
  top: -6px;
  left: 14px;
  min-width: 18px;
  padding: 0 5px;
  border-radius: 99px;
  background: var(--accent);
  color: var(--on-accent);
  font-size: 10.5px;
  font-weight: 700;
  line-height: 17px;
  text-align: center;
  box-shadow: 0 0 0 2px var(--bg);
}
</style>
