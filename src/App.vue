<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import UnitToggler from './components/UnitToggler.vue'
import WeatherCloudScene from './components/WeatherCloudScene.vue'

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
  <div class="app-environment">
    <WeatherCloudScene />

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
            <RouterLink to="/weather/about">서비스 소개</RouterLink>
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
  </div>
</template>

<style scoped>
.app-environment {
  position: relative;
  isolation: isolate;
  min-height: 100vh;
  overflow-x: clip;
}

.app-shell {
  position: relative;
  z-index: 2;
  width: min(100% - 32px, 1180px);
  min-height: 100vh;
  margin: 0 auto;
  padding: 24px 0 56px;
}

.app-header {
  position: sticky;
  top: 16px;
  z-index: 100;
  display: flex;
  isolation: isolate;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  margin-bottom: 62px;
  overflow: hidden;
  background: var(--sky-surface-strong);
  border: 1px solid var(--sky-border);
  border-radius: 26px;
  box-shadow: var(--sky-shadow-soft);
  backdrop-filter: var(--sky-backdrop);
}

.app-header::before {
  position: absolute;
  z-index: -1;
  inset: 0;
  pointer-events: none;
  content: '';
  background:
    radial-gradient(circle at 8% -50%, rgb(255 255 255 / 78%), transparent 42%),
    radial-gradient(circle at 88% 145%, rgb(255 255 255 / 24%), transparent 40%);
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
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

nav a {
  padding: 8px 12px;
  color: #5d7284;
  font-weight: 700;
  text-decoration: none;
  border: 1px solid transparent;
  border-radius: 999px;
}

nav a:hover,
nav a.router-link-active {
  color: #116b84;
  background: linear-gradient(135deg, rgb(255 255 255 / 76%), rgb(199 235 255 / 54%));
  border-color: rgb(255 255 255 / 72%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 90%),
    0 5px 14px rgb(27 86 111 / 10%);
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
  background: linear-gradient(135deg, rgb(255 255 255 / 70%), rgb(214 239 249 / 54%));
  border: 1px solid rgb(255 255 255 / 72%);
  border-radius: 999px;
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 84%);
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
    justify-content: flex-start;
  }

  .header-actions nav {
    width: 100%;
    flex-wrap: wrap;
  }
}
</style>

<style>
html,
body,
#app {
  max-width: 100%;
  overflow-x: clip;
}

html {
  scrollbar-gutter: stable;
}

:root[data-theme='light'] {
  --color-background: #fff;
  --color-background-soft: #f8f8f8;
  --color-background-mute: #f2f2f2;
  --color-text: #2c3e50;
  --weather-sky-base: #b3d9e9;
  --weather-sky-shadow: inset 0 0 120px rgb(255 255 255 / 20%);
  --weather-sky-image-filter: none;
  --weather-sky-overlay: linear-gradient(
    180deg,
    rgb(211 233 245 / 47%) 0%,
    rgb(220 238 247 / 54%) 45%,
    rgb(184 221 237 / 72%) 72%,
    rgb(151 204 227 / 86%) 100%
  );
  --weather-cloud-filter: none;
  --sky-surface: linear-gradient(
    135deg,
    rgb(255 255 255 / 68%),
    rgb(255 255 255 / 25%) 52%,
    rgb(255 255 255 / 40%)
  );
  --sky-surface-strong: linear-gradient(
    135deg,
    rgb(255 255 255 / 80%),
    rgb(255 255 255 / 34%) 56%,
    rgb(255 255 255 / 50%)
  );
  --sky-surface-soft: linear-gradient(135deg, rgb(255 255 255 / 50%), rgb(255 255 255 / 25%));
  --sky-border: rgb(255 255 255 / 84%);
  --sky-border-muted: rgb(159 206 225 / 56%);
  --sky-shadow:
    0 26px 64px rgb(25 67 91 / 17%), inset 0 1px 0 rgb(255 255 255 / 94%),
    inset 0 -1px 0 rgb(137 191 217 / 20%);
  --sky-shadow-soft:
    0 16px 38px rgb(25 67 91 / 14%), inset 0 1px 0 rgb(255 255 255 / 90%),
    inset 0 -1px 0 rgb(137 191 217 / 16%);
  --sky-backdrop: blur(32px) saturate(1.48);
}

:root[data-theme='dark'] {
  --color-background: #06152d;
  --color-background-soft: #0b203c;
  --color-background-mute: #112b49;
  --color-text: #d7e4eb;
  --weather-sky-base: #06152d;
  --weather-sky-shadow: inset 0 0 150px rgb(0 4 18 / 48%);
  --weather-sky-image-filter: brightness(0.38) saturate(1.25) contrast(1.12) hue-rotate(12deg);
  --weather-sky-overlay:
    radial-gradient(circle at 74% 8%, rgb(127 174 221 / 18%), transparent 27%),
    linear-gradient(180deg, rgb(4 14 39 / 54%) 0%, rgb(7 24 53 / 66%) 48%, rgb(5 18 42 / 78%) 100%);
  --weather-cloud-filter: brightness(0.72) saturate(0.92) contrast(1.05);
  --sky-surface: linear-gradient(
    135deg,
    rgb(255 255 255 / 22%),
    rgb(255 255 255 / 7%) 58%,
    rgb(255 255 255 / 13%)
  );
  --sky-surface-strong: linear-gradient(
    135deg,
    rgb(255 255 255 / 30%),
    rgb(255 255 255 / 11%) 58%,
    rgb(255 255 255 / 18%)
  );
  --sky-surface-soft: linear-gradient(135deg, rgb(255 255 255 / 17%), rgb(255 255 255 / 6%));
  --sky-border: rgb(255 255 255 / 34%);
  --sky-border-muted: rgb(205 229 242 / 28%);
  --sky-shadow: 0 26px 64px rgb(0 0 0 / 32%), inset 0 1px 0 rgb(211 238 248 / 19%);
  --sky-shadow-soft: 0 16px 38px rgb(0 0 0 / 25%), inset 0 1px 0 rgb(211 238 248 / 16%);
  --sky-backdrop: blur(32px) saturate(1.4);
  color-scheme: dark;
}

.app-environment .app-shell :is(.about-page, .not-found, .detail-page) {
  padding: clamp(24px, 4vw, 42px);
  background: var(--sky-surface);
  border: 1px solid var(--sky-border);
  border-radius: 22px;
  box-shadow: var(--sky-shadow);
  backdrop-filter: var(--sky-backdrop);
}

:root[data-theme='dark'] .app-shell,
:root[data-theme='dark'] .practice-page,
:root[data-theme='dark'] .lesson-page,
:root[data-theme='dark'] .dashboard-wrapper {
  color: #d7e4eb;
}

:root[data-theme='dark'] .page-heading h1,
:root[data-theme='dark'] .hero-copy h1,
:root[data-theme='dark'] .about-page h1,
:root[data-theme='dark'] .not-found h1,
:root[data-theme='dark'] .detail-page h1,
:root[data-theme='dark'] .practice-page,
:root[data-theme='dark'] .lesson-page,
:root[data-theme='dark'] .dashboard-wrapper,
:root[data-theme='dark'] .overview-heading h2 {
  color: #e4f0f4;
}

:root[data-theme='dark'] .page-heading span,
:root[data-theme='dark'] .hero-copy > span,
:root[data-theme='dark'] .about-page span,
:root[data-theme='dark'] .not-found span,
:root[data-theme='dark'] .municipality-search-results > span,
:root[data-theme='dark'] .region-controls label,
:root[data-theme='dark'] .sort-controls label,
:root[data-theme='dark'] .detail-metrics span,
:root[data-theme='dark'] .temperature-legend span {
  color: #c4d5de;
}

:root[data-theme='dark'] .about-page a,
:root[data-theme='dark'] .not-found a,
:root[data-theme='dark'] .detail-page a {
  color: #88dfd1;
}

:root[data-theme='dark'] .detail-page {
  color: #e4f0f4;
}

:root[data-theme='dark'] .detail-page dl div {
  color: #1e3147;
  background: rgb(243 248 247 / 90%);
}

:root[data-theme='dark'] .detail-page dt {
  color: #587080;
}

:root[data-theme='dark'] .practice-sidebar,
:root[data-theme='dark'] .base-dashboard-card,
:root[data-theme='dark'] .map-box,
:root[data-theme='dark'] .remote-sensing-box,
:root[data-theme='dark'] .selected-detail,
:root[data-theme='dark'] .forecast-panel,
:root[data-theme='dark'] .weather-alerts,
:root[data-theme='dark'] .practice-section,
:root[data-theme='dark'] .lesson-card {
  background: var(--sky-surface);
  border-color: var(--sky-border);
}

:root[data-theme='dark'] .detail-metrics span,
:root[data-theme='dark'] .status-bar {
  background: rgb(255 255 255 / 12%);
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
:root[data-theme='dark'] .forecast-item strong,
:root[data-theme='dark'] .weather-alerts-heading h2 {
  color: #e4f0f4;
}

:root[data-theme='dark'] .forecast-panel .eyebrow,
:root[data-theme='dark'] .forecast-panel .loading-text {
  color: #9ed9e6;
}

:root[data-theme='dark'] .practice-sidebar button.active,
:root[data-theme='dark'] .practice-sidebar .example-link.selected {
  color: #075f55;
}

:root[data-theme='dark'] .practice-content input,
:root[data-theme='dark'] .practice-content select,
:root[data-theme='dark'] .practice-content textarea {
  color: #e3edf1;
  background: rgb(255 255 255 / 11%);
  border-color: rgb(255 255 255 / 24%);
}

:root[data-theme='dark'] .practice-content button:not(.el-button) {
  color: #c9eee6;
  background: rgb(255 255 255 / 11%);
  border-color: rgb(255 255 255 / 22%);
}

:root[data-theme='dark'] .practice-content .monitor,
:root[data-theme='dark'] .practice-content .status-bar {
  background: rgb(255 255 255 / 10%);
  border-color: rgb(255 255 255 / 20%);
}

:root[data-theme='dark'] .example-stage {
  --example-surface: var(--sky-surface-strong);
  --example-surface-muted: var(--sky-surface-soft);
  --example-border: var(--sky-border);
  --example-text: #e0edf1;
  --example-subtext: #b8cbd5;
}

:root[data-theme='dark'] .practice-sidebar button,
:root[data-theme='dark'] .detail-heading p,
:root[data-theme='dark'] .detail-empty,
:root[data-theme='dark'] .updated-at,
:root[data-theme='dark'] .forecast-item p,
:root[data-theme='dark'] .forecast-item small,
:root[data-theme='dark'] .temperature-legend,
:root[data-theme='dark'] .temperature-legend em {
  color: #b8cbd5;
}

:root[data-theme='dark'] .weather-alerts-heading > span {
  color: #b8cbd5;
  background: rgb(255 255 255 / 12%);
}

:root[data-theme='dark'] .theme-toggle {
  color: #d5e7ec;
  background: rgb(255 255 255 / 14%);
  border-color: rgb(255 255 255 / 28%);
}

:root[data-theme='dark'] .app-header {
  background: var(--sky-surface-strong);
  border-color: var(--sky-border);
  box-shadow: var(--sky-shadow-soft);
}

:root[data-theme='dark'] .brand {
  color: #17324d;
}

:root[data-theme='dark'] .search-bar .p-inputtext {
  color: #29485b;
}

:root[data-theme='dark'] .search-bar .search-clear {
  color: #426174;
}

:root[data-theme='dark'] .sort-controls button {
  color: #c4d5de;
}

:root[data-theme='dark'] .sort-controls button.active {
  color: #075f55;
}

:root[data-theme='dark'] .weather-alert-list article,
:root[data-theme='dark'] .weather-alert-list article strong {
  color: #1e3147;
}

:root[data-theme='dark'] .weather-alert-list article p {
  color: #587080;
}

:root[data-theme='dark'] .status-bar {
  color: #a9e7cf;
}

:root[data-theme='dark'] .status-bar.status-hot {
  color: #ffaaa1;
}

:root[data-theme='dark'] .status-bar.status-cool {
  color: #9acdf4;
}

:root[data-theme='dark'] .selected-detail.status-hot {
  color: #ffaaa1;
}

:root[data-theme='dark'] .selected-detail.status-cool {
  color: #9acdf4;
}

:root[data-theme='dark'] .weather-card,
:root[data-theme='dark'] .weather-card h3,
:root[data-theme='dark'] .weather-summary p,
:root[data-theme='dark'] .forecast-item,
:root[data-theme='dark'] .forecast-item strong {
  color: #1e3147;
}

:root[data-theme='dark'] .weather-card .card-heading p,
:root[data-theme='dark'] .forecast-item p,
:root[data-theme='dark'] .forecast-item small {
  color: #597083;
}

:root[data-theme='dark'] nav a:hover,
:root[data-theme='dark'] nav a.router-link-active {
  color: #e5f7f4;
  background: linear-gradient(135deg, rgb(255 255 255 / 20%), rgb(255 255 255 / 8%));
  border-color: rgb(255 255 255 / 26%);
}

:root[data-theme='dark'] nav a {
  color: #cfdee7;
}
</style>
