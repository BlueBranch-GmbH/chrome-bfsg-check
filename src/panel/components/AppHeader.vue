<script setup lang="ts">
import { ref } from 'vue';
import { authorLink } from '../../shared/meta';
import { useI18n } from '../i18n';
import { settings } from '../settings';
import BbLogo from './BbLogo.vue';
import SegmentedControl from './SegmentedControl.vue';

const { t } = useI18n();
const settingsOpen = ref(false);
</script>

<template>
  <header class="app-header">
  <div class="brand-bar">
    <div class="top">
      <a :href="authorLink('panel-header')" target="_blank" rel="noopener" class="logo-link" :aria-label="t('app.logoLink')">
        <BbLogo class="logo" mark-color="var(--navy-mark)" />
      </a>
      <button
        type="button"
        class="settings-toggle"
        :aria-expanded="settingsOpen"
        aria-controls="settings-panel"
        @click="settingsOpen = !settingsOpen"
      >
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0" />
          <circle cx="16" cy="6" r="2" />
          <circle cx="10" cy="12" r="2" />
          <circle cx="18" cy="18" r="2" />
        </svg>
        {{ t('app.settings') }}
      </button>
    </div>
    <div class="title">
      <h1>{{ t('app.title') }}</h1>
      <p>{{ t('app.subtitle') }}</p>
    </div>
    <div class="glow" aria-hidden="true"></div>
  </div>

  <div class="controls">
    <SegmentedControl
      v-model="settings.mode"
      :label="t('app.mode')"
      name="mode"
      :options="[
        { value: 'simple', label: t('app.modeSimple') },
        { value: 'detailed', label: t('app.modeDetailed') },
      ]"
    />
    <SegmentedControl
      v-model="settings.locale"
      :label="t('app.language')"
      name="locale"
      :options="[
        { value: 'de', label: 'Deutsch' },
        { value: 'en', label: 'English' },
      ]"
    />
  </div>

  <div v-show="settingsOpen" id="settings-panel" class="card settings stack">
    <label class="field">
      <span>{{ t('settings.standard') }}</span>
      <select v-model="settings.standard">
        <option value="wcag21aa">{{ t('settings.wcag21aa') }}</option>
        <option value="wcag22aa">{{ t('settings.wcag22aa') }}</option>
      </select>
    </label>
    <label class="checkbox">
      <input v-model="settings.bestPractices" type="checkbox" aria-describedby="best-practices-hint" />
      <span>{{ t('settings.bestPractices') }}</span>
    </label>
    <p id="best-practices-hint" class="muted small hint">{{ t('settings.bestPracticesHint') }}</p>
  </div>
  </header>
</template>

<style scoped>
.app-header {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.brand-bar {
  position: relative;
  overflow: hidden;
  margin: -14px -14px 0;
  padding: 18px 18px 22px;
  background: var(--navy);
  color: var(--navy-text);
}
.glow {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(28rem 16rem at 100% 0%, hsl(227 100% 50% / 0.35), transparent 70%),
    radial-gradient(20rem 12rem at 0% 120%, hsl(227 100% 50% / 0.22), transparent 70%);
}
.top,
.title {
  position: relative;
  z-index: 1;
}
.top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.logo-link {
  display: inline-flex;
  color: #fff;
  border-radius: 4px;
}
.logo {
  height: 20px;
  width: auto;
}
.settings-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 10px;
  border: 1px solid var(--navy-border);
  border-radius: 8px;
  background: hsl(0 0% 100% / 0.06);
  color: var(--navy-text);
  font: inherit;
  font-size: 12.5px;
  font-weight: 500;
  cursor: pointer;
}
.settings-toggle:hover,
.settings-toggle[aria-expanded='true'] {
  background: hsl(0 0% 100% / 0.14);
}
.brand-bar :focus-visible {
  outline-color: #fff;
}
.title {
  margin-top: 22px;
}
.title h1 {
  font-size: 26px;
  color: #fff;
}
.title p {
  margin: 4px 0 0;
  color: var(--navy-muted);
}
.controls {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-weight: 600;
  font-size: 12.5px;
}
.checkbox {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  font-weight: 600;
  font-size: 13px;
}
.checkbox input {
  margin-top: 3px;
}
.hint {
  margin: -8px 0 0 24px;
}
</style>
