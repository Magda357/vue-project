<template>
  <div class="card">
    <h1>Base Card Component Überschrift</h1>
    <p>dies ist ein beispiel</p>

    <slot></slot>
  </div>
</template>

<script setup></script>

<style scoped>
.card {
  background-color: rgba(2, 58, 98, 0.2);
  border-radius: 16px;
  padding: 100px;

  /* Optional schöne Defaults */
  color: #f4f8fb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.06);
}
</style>
