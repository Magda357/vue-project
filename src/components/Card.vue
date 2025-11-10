<template>
  <!-- Root element is customizable via the `as` prop (defaults to a <div>) -->
  <component :is="as" class="card">
    <slot />
  </component>
</template>

<script setup lang="ts">
// Simple, reusable Card component
// - Keeps a clean API
// - Accepts arbitrary HTML/content via the default <slot>
// - Lets you optionally change the root tag with the `as` prop

interface Props {
  /** Root element tag name, e.g. 'div', 'section', 'article' */
  as?: keyof HTMLElementTagNameMap | string;
}

const props = withDefaults(defineProps<Props>(), {
  as: "div",
});

// Give the component a friendly name for devtools
defineOptions({name: "Card"});
</script>

<style scoped>
.card {
  /* Requested styles */
  background-color: rgba(1, 31, 53, 1);
  border-radius: 16px;
  padding: 24px 32px 24px 32px; /* top right bottom left */

  /* Nice defaults */
  color: #f4f8fb; /* readable on dark bg */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.06);
}
</style>

<!--
USAGE EXAMPLES

<template>
  <Card>
    <h2>Überschrift</h2>
    <p>Beliebiger HTML‑Inhalt kann hier rein.</p>
  </Card>

  <Card as="section">
    <form>
      <label for="email">E‑Mail</label>
      <input id="email" type="email" />
    </form>
  </Card>
</template>

<script setup>
import Card from './Card.vue'
</script>
-->
