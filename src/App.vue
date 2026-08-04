<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import UnitToggler from './components/UnitToggler.vue'

const theme = ref('light')
const themeLabel = computed(() => (theme.value === 'light' ? '다크 모드' : '라이트 모드'))

const applyTheme = () => {
  document.documentElement.dataset.theme = theme.value
  localStorage.setItem('skala-theme', theme.value)
}

const toggleTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
}

onMounted(() => {
  theme.value = localStorage.getItem('skala-theme') || 'light'
  applyTheme()
})

watch(theme, applyTheme)
</script>

<template>
  <main class="app-shell">
    <header class="app-header">
      <RouterLink class="brand" to="/">
        <span>SKALA</span>
        Vue Lab
      </RouterLink>
      <div class="header-actions">
        <nav aria-label="주요 메뉴">
          <RouterLink to="/practice">실습 페이지</RouterLink>
          <RouterLink to="/assignment">과제 제출</RouterLink>
        </nav>
        <UnitToggler />
        <button class="theme-toggle" type="button" :aria-label="themeLabel" @click="toggleTheme">
          <span aria-hidden="true">{{ theme === 'light' ? '☾' : '☀' }}</span>
          {{ themeLabel }}
        </button>
      </div>
    </header>

    <RouterView />
  </main>
</template>

<style scoped>
.app-shell {
  width: min(100% - 32px, 1180px);
  min-height: 100vh;
  margin: 0 auto;
  padding: 24px 0 56px;
}

.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 62px;
}

.brand {
  display: grid;
  gap: 1px;
  color: #17324d;
  font-size: 19px;
  font-weight: 800;
  line-height: 1;
  text-decoration: none;
}

.brand span {
  color: #148476;
  font-size: 10px;
  letter-spacing: 0.16em;
}

nav {
  display: flex;
  gap: 8px;
}

.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

nav a {
  padding: 8px 12px;
  color: #5d7284;
  font-weight: 700;
  text-decoration: none;
  border-radius: 8px;
}

nav a:hover,
nav a.router-link-active {
  color: #0c695d;
  background: #e8f5f2;
}

.theme-toggle {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  padding: 8px 10px;
  color: #3d5b70;
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  background: #f0f5f4;
  border: 1px solid #d7e4e1;
  border-radius: 8px;
}

.theme-toggle:hover {
  color: #075f55;
  background: #e1f2ed;
}

@media (max-width: 720px) {
  .app-shell {
    padding-top: 16px;
  }

  .app-header {
    align-items: flex-start;
    flex-direction: column;
    gap: 18px;
    margin-bottom: 36px;
  }

  .header-actions {
    width: 100%;
    justify-content: space-between;
  }
}
</style>

<style>
:root[data-theme='light'] {
  --color-background: #fff;
  --color-background-soft: #f8f8f8;
  --color-background-mute: #f2f2f2;
  --color-text: #2c3e50;
}

:root[data-theme='dark'] {
  --color-background: #101b26;
  --color-background-soft: #172632;
  --color-background-mute: #213541;
  --color-text: #d7e4eb;
  color-scheme: dark;
}

:root[data-theme='dark'] .app-shell,
:root[data-theme='dark'] .practice-page,
:root[data-theme='dark'] .lesson-page,
:root[data-theme='dark'] .dashboard-wrapper {
  color: #d7e4eb;
}

:root[data-theme='dark'] .brand,
:root[data-theme='dark'] .page-heading h1,
:root[data-theme='dark'] .hero-copy h1,
:root[data-theme='dark'] .practice-page,
:root[data-theme='dark'] .lesson-page,
:root[data-theme='dark'] .dashboard-wrapper,
:root[data-theme='dark'] .overview-heading h2 {
  color: #e4f0f4;
}

:root[data-theme='dark'] .practice-sidebar,
:root[data-theme='dark'] .base-dashboard-card,
:root[data-theme='dark'] .map-box,
:root[data-theme='dark'] .remote-sensing-box,
:root[data-theme='dark'] .selected-detail,
:root[data-theme='dark'] .forecast-panel,
:root[data-theme='dark'] .practice-section,
:root[data-theme='dark'] .lesson-card,
:root[data-theme='dark'] .detail-modal-card {
  background: #1a2a36;
  border-color: #304755;
}

:root[data-theme='dark'] .practice-sidebar .example-link.selected,
:root[data-theme='dark'] .detail-metrics span,
:root[data-theme='dark'] .status-bar {
  background: #243c48;
}

:root[data-theme='dark'] .practice-sidebar button,
:root[data-theme='dark'] .practice-sidebar .example-link.selected,
:root[data-theme='dark'] .practice-content,
:root[data-theme='dark'] .practice-content .practice-section,
:root[data-theme='dark'] .practice-content .monitor,
:root[data-theme='dark'] .practice-content .status-bar {
  color: #d7e4eb;
}

:root[data-theme='dark'] .detail-metrics strong {
  color: #e4f4f1;
}

:root[data-theme='dark'] .forecast-panel,
:root[data-theme='dark'] .forecast-heading h2,
:root[data-theme='dark'] .forecast-item strong {
  color: #e4f0f4;
}

:root[data-theme='dark'] .forecast-panel .eyebrow,
:root[data-theme='dark'] .forecast-panel .loading-text {
  color: #9ed9e6;
}

:root[data-theme='dark'] .practice-sidebar button.active,
:root[data-theme='dark'] .practice-sidebar .example-link.selected {
  color: #9ae5d8;
}

:root[data-theme='dark'] .practice-content input,
:root[data-theme='dark'] .practice-content select,
:root[data-theme='dark'] .practice-content textarea {
  color: #e3edf1;
  background: #223642;
  border-color: #46606d;
}

:root[data-theme='dark'] .practice-content button:not(.el-button) {
  color: #c9eee6;
  background: #24443f;
  border-color: #3b7067;
}

:root[data-theme='dark'] .practice-content .monitor,
:root[data-theme='dark'] .practice-content .status-bar {
  background: #243c48;
  border-color: #3c6970;
}

:root[data-theme='dark'] .example-stage {
  --example-surface: #1a2a36;
  --example-surface-muted: #243c48;
  --example-border: #304755;
  --example-text: #e0edf1;
  --example-subtext: #b8cbd5;
}

:root[data-theme='dark'] .practice-sidebar button,
:root[data-theme='dark'] .detail-heading p,
:root[data-theme='dark'] .detail-empty,
:root[data-theme='dark'] .updated-at,
:root[data-theme='dark'] .forecast-item p,
:root[data-theme='dark'] .forecast-item small {
  color: #b8cbd5;
}

:root[data-theme='dark'] .theme-toggle {
  color: #d5e7ec;
  background: #223844;
  border-color: #3a5663;
}

:root[data-theme='dark'] .weather-card,
:root[data-theme='dark'] .weather-card h3,
:root[data-theme='dark'] .weather-summary p,
:root[data-theme='dark'] .forecast-item,
:root[data-theme='dark'] .forecast-item strong,
:root[data-theme='dark'] .city-marker,
:root[data-theme='dark'] .el-card {
  color: #1e3147;
}

:root[data-theme='dark'] .weather-card .card-heading p,
:root[data-theme='dark'] .forecast-item p,
:root[data-theme='dark'] .forecast-item small {
  color: #597083;
}

:root[data-theme='dark'] nav a:hover,
:root[data-theme='dark'] nav a.router-link-active {
  color: #8de2d1;
  background: #1d403f;
}
</style>
