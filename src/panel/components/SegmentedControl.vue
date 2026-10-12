<script setup lang="ts" generic="T extends string">
/** Radio group styled as a segmented control. Native radios keep keyboard and screen reader support. */
defineProps<{
  label: string;
  name: string;
  options: Array<{ value: T; label: string }>;
  hideLabel?: boolean;
}>();
const model = defineModel<T>({ required: true });
</script>

<template>
  <fieldset class="segmented">
    <legend :class="{ 'sr-only': hideLabel }">{{ label }}</legend>
    <div class="options">
      <label v-for="option in options" :key="option.value" :class="{ active: model === option.value }">
        <input v-model="model" type="radio" :name="name" :value="option.value" />
        <span>{{ option.label }}</span>
      </label>
    </div>
  </fieldset>
</template>

<style scoped>
.segmented {
  border: 0;
  margin: 0;
  padding: 0;
  min-width: 0;
}
legend {
  padding: 0;
  margin-bottom: 4px;
  font-size: 12px;
  font-weight: 600;
  color: var(--muted);
}
.options {
  display: inline-flex;
  flex-wrap: wrap;
  padding: 2px;
  border: 1px solid var(--control-border);
  border-radius: 9px;
  background: var(--surface-2);
}
label {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 28px;
  padding: 3px 10px;
  border-radius: 7px;
  font-weight: 600;
  font-size: 12.5px;
  color: var(--muted);
  cursor: pointer;
}
label.active {
  background: var(--surface);
  color: var(--text);
  box-shadow: var(--shadow);
  outline: 1px solid var(--border);
}
input {
  position: absolute;
  opacity: 0;
  inset: 0;
  margin: 0;
  cursor: pointer;
}
label:has(input:focus-visible) {
  outline: 3px solid var(--focus);
  outline-offset: 1px;
}
</style>
