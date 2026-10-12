<script setup lang="ts">
import type { StructureInfo } from '../../shared/types';
import { useI18n } from '../i18n';
import { showOnPage } from '../show-on-page';

defineProps<{ structure: StructureInfo }>();
const { t } = useI18n();
</script>

<template>
  <section class="card">
    <details>
      <summary><h2 class="inline">{{ t('detailed.structure') }}</h2></summary>
      <div class="stack body">
        <p class="small">{{ structure.lang ? t('detailed.pageLang', { lang: structure.lang }) : t('detailed.pageLangMissing') }}</p>

        <div>
          <h3>{{ t('detailed.headings') }} ({{ structure.headings.length }})</h3>
          <p v-if="!structure.headings.length" class="muted small">{{ t('detailed.noHeadings') }}</p>
          <ul v-else class="outline">
            <li v-for="(heading, index) in structure.headings" :key="index" :style="{ paddingLeft: `${(heading.level - 1) * 12}px` }">
              <button type="button" class="btn-link item" @click="showOnPage(heading.target, `h${heading.level}`)">
                <span class="level">H{{ heading.level }}</span>
                <span :class="{ muted: !heading.text }">{{ heading.text || t('detailed.emptyHeading') }}</span>
              </button>
            </li>
          </ul>
        </div>

        <div>
          <h3>{{ t('detailed.landmarks') }} ({{ structure.landmarks.length }})</h3>
          <p v-if="!structure.landmarks.length" class="muted small">{{ t('detailed.noLandmarks') }}</p>
          <ul v-else class="outline">
            <li v-for="(landmark, index) in structure.landmarks" :key="index">
              <button type="button" class="btn-link item" @click="showOnPage(landmark.target, landmark.role)">
                <span class="level">{{ landmark.role }}</span>
                <span v-if="landmark.label">{{ landmark.label }}</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </details>
  </section>
</template>

<style scoped>
h2.inline {
  display: inline;
  font-size: 15px;
}
h3 {
  font-size: 13px;
  margin-bottom: 6px;
}
.body {
  margin-top: 10px;
}
.body p {
  margin: 0;
}
.outline {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.item {
  display: inline-flex;
  gap: 8px;
  text-align: left;
  font-weight: 400;
  color: var(--text);
  text-decoration: none;
}
.item:hover span:last-child {
  text-decoration: underline;
}
.level {
  flex: none;
  font-family: var(--mono);
  font-size: 11px;
  font-weight: 700;
  padding: 1px 5px;
  border-radius: 4px;
  background: var(--accent-soft);
  color: var(--accent);
}
</style>
