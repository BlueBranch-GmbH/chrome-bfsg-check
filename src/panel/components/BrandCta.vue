<script setup lang="ts">
import { authorLink } from '../../shared/meta';
import { useI18n } from '../i18n';
import BbLogo from './BbLogo.vue';

const props = defineProps<{ placement: string }>();
const { t } = useI18n();
</script>

<template>
  <aside class="cta" aria-labelledby="cta-title">
    <BbLogo class="logo" mark-color="var(--navy-mark)" />
    <h2 id="cta-title">{{ t('cta.title') }}</h2>
    <p>{{ t('cta.text') }}</p>
    <a class="cta-button" :href="authorLink(`cta-${props.placement}`)" target="_blank" rel="noopener">
      {{ t('cta.button') }}
      <span class="sr-only">{{ t('cta.newTab') }}</span>
      <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </a>
    <div class="glow" aria-hidden="true"></div>
  </aside>
</template>

<style scoped>
.cta {
  position: relative;
  overflow: hidden;
  padding: 20px 18px;
  border-radius: var(--radius);
  background: var(--navy);
  color: var(--navy-text);
}
.cta > :not(.glow) {
  position: relative;
  z-index: 1;
}
.glow {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(26rem 14rem at 0% 100%, hsl(227 100% 50% / 0.32), transparent 70%);
}
.logo {
  height: 14px;
  width: auto;
  color: #fff;
}
h2 {
  margin-top: 14px;
  font-size: 18px;
  color: #fff;
}
p {
  margin: 6px 0 14px;
  color: var(--navy-muted);
}
.cta-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 38px;
  padding: 0 16px;
  border-radius: 8px;
  background: #fff;
  color: hsl(230 40% 10%);
  font-weight: 600;
  text-decoration: none;
  transition: transform 0.15s;
}
.cta-button:hover {
  transform: translateY(-1px);
}
.cta-button:focus-visible {
  outline-color: #fff;
}
</style>
