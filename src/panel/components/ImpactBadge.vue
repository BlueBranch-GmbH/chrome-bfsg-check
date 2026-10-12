<script setup lang="ts">
import type { Impact } from '../../shared/types';
import { useI18n } from '../i18n';

defineProps<{ impact: Impact | null }>();
const { t } = useI18n();
</script>

<template>
  <span class="badge" :class="`impact-${impact ?? 'none'}`">{{ t(`impact.${impact ?? 'none'}`) }}</span>
</template>
