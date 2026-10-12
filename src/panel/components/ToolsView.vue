<script setup lang="ts">
import { computed } from 'vue';
import type { ToolState } from '../../shared/types';
import { useI18n } from '../i18n';
import { clearHighlight, current, openReflowWindow, setTool, setZoom, state, toolsFor } from '../scan-state';

const { t } = useI18n();
const tools = computed(() => (state.activeTabId === null ? null : toolsFor(state.activeTabId)));
const url = computed(() => current.value?.result?.url ?? null);

async function toggle(tool: keyof ToolState, event: Event) {
  await setTool(tool, (event.target as HTMLInputElement).checked).catch(() => undefined);
}
</script>

<template>
  <div class="stack">
    <p class="muted small intro">{{ t('tools.intro') }}</p>
    <ul v-if="tools" class="tools">
      <li id="tool-tabOrder" class="card">
        <label class="switch">
          <input type="checkbox" role="switch" :checked="tools.tabOrder" aria-describedby="tool-tab-help" @change="toggle('tabOrder', $event)" />
          <span class="name">{{ t('tools.tabOrder') }}</span>
        </label>
        <p id="tool-tab-help" class="muted small">{{ t('tools.tabOrderHelp') }}</p>
        <p v-if="tools.tabOrder && tools.tabOrderCount !== null" class="small">{{ t('tools.tabOrderCount', { count: tools.tabOrderCount }) }}</p>
      </li>
      <li id="tool-textSpacing" class="card">
        <label class="switch">
          <input type="checkbox" role="switch" :checked="tools.textSpacing" aria-describedby="tool-spacing-help" @change="toggle('textSpacing', $event)" />
          <span class="name">{{ t('tools.textSpacing') }}</span>
        </label>
        <p id="tool-spacing-help" class="muted small">{{ t('tools.textSpacingHelp') }}</p>
      </li>
      <li id="tool-grayscale" class="card">
        <label class="switch">
          <input type="checkbox" role="switch" :checked="tools.grayscale" aria-describedby="tool-gray-help" @change="toggle('grayscale', $event)" />
          <span class="name">{{ t('tools.grayscale') }}</span>
        </label>
        <p id="tool-gray-help" class="muted small">{{ t('tools.grayscaleHelp') }}</p>
      </li>
      <li id="tool-zoom" class="card">
        <label class="switch">
          <input
            type="checkbox"
            role="switch"
            :checked="tools.zoom"
            aria-describedby="tool-zoom-help"
            @change="setZoom(($event.target as HTMLInputElement).checked)"
          />
          <span class="name">{{ t('tools.zoom') }}</span>
        </label>
        <p id="tool-zoom-help" class="muted small">{{ t('tools.zoomHelp') }}</p>
      </li>
      <li id="tool-reflow" class="card">
        <button type="button" class="btn btn-small" :disabled="!url" aria-describedby="tool-reflow-help" @click="url && openReflowWindow(url)">
          {{ t('tools.reflow') }}
        </button>
        <p id="tool-reflow-help" class="muted small">{{ url ? t('tools.reflowHelp') : t('tools.needsScan') }}</p>
      </li>
    </ul>
    <div>
      <button type="button" class="btn btn-small" @click="clearHighlight()">{{ t('tools.clearHighlight') }}</button>
    </div>
  </div>
</template>

<style scoped>
.intro,
p {
  margin: 0;
}
.tools {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.tools p {
  margin-top: 4px;
}
.switch {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}
.name {
  font-weight: 600;
}
.switch input {
  appearance: none;
  flex: none;
  position: relative;
  width: 44px;
  height: 24px;
  margin: 0;
  border-radius: 99px;
  background: var(--control-border);
  cursor: pointer;
  transition: background 0.15s;
}
.switch input::after {
  content: '';
  position: absolute;
  top: 4px;
  left: 4px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  transition: transform 0.15s;
}
.switch input:checked {
  background: var(--accent);
}
.switch input:checked::after {
  transform: translateX(20px);
}
@media (forced-colors: active) {
  .switch input {
    appearance: auto;
  }
}
</style>
