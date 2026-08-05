<template>
  <section class="base-dashboard-card">
    <slot />
  </section>
</template>

<style scoped>
.base-dashboard-card {
  position: relative;
  padding: 18px;
  margin-bottom: 18px;
  overflow: hidden;
  background: var(--sky-surface);
  border: 1px solid var(--sky-border);
  border-radius: 24px;
  box-shadow: var(--sky-shadow-soft);
  backdrop-filter: var(--sky-backdrop);
}

.base-dashboard-card::before {
  position: absolute;
  inset: 0;
  pointer-events: none;
  content: '';
  background: linear-gradient(
    125deg,
    rgb(255 255 255 / 32%),
    transparent 28%,
    rgb(255 255 255 / 8%) 72%,
    rgb(255 255 255 / 13%)
  );
}

.base-dashboard-card > :deep(*) {
  position: relative;
}
</style>
