<script setup lang="ts">
import { LOGO_VIEWBOX, MARK_PATH, WORDMARK_PATHS } from '../../shared/brand';

/**
 * BlueBranch logo. The wordmark uses `currentColor`, so it follows the text
 * colour of its surroundings; the mark keeps the brand blue (or `markColor`).
 */
withDefaults(defineProps<{ markColor?: string }>(), { markColor: 'var(--brand-mark)' });
</script>

<template>
  <svg :viewBox="LOGO_VIEWBOX" fill="currentColor" role="img" aria-label="BlueBranch">
    <path v-for="(d, index) in WORDMARK_PATHS" :key="index" :d="d" />
    <path :d="MARK_PATH" :fill="markColor" />
  </svg>
</template>
