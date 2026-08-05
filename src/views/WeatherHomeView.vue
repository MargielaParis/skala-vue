<script setup>
import WeatherParent from '../components/practices/day02/WeatherParent.vue'

console.log('현재 주입된 API 서버 주소:', import.meta.env.VITE_API_URL)
</script>

<template>
  <section class="assignment-page">
    <header class="page-heading">
      <p>Kiyeon Park</p>
      <h1>대한민국 날씨 대시보드</h1>
      <span>도시를 선택하면 현재 날씨와 다음 예보를 확인할 수 있습니다.</span>
    </header>
    <WeatherParent />
  </section>
</template>

<style scoped>
.assignment-page {
  min-height: 100vh;
  padding: 28px 0 56px;
}

.page-heading {
  width: min(100%, 1080px);
  padding: 10px 4px 6px;
  margin: 0 auto 28px;
}

.assignment-page :deep(.base-dashboard-card),
.assignment-page :deep(.map-box),
.assignment-page :deep(.remote-sensing-box),
.assignment-page :deep(.forecast-panel) {
  box-shadow: var(--sky-shadow);
}

.assignment-page :deep(.remote-sensing-box),
.assignment-page :deep(.weather-overview),
.assignment-page :deep(.forecast-panel) {
  isolation: isolate;
  -webkit-backdrop-filter: none;
  backdrop-filter: none;
}

.page-heading p {
  margin: 0;
  color: #148476;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.11em;
}

.page-heading h1 {
  margin: 4px 0;
  color: #17324d;
  font-size: clamp(30px, 4vw, 45px);
  letter-spacing: -0.04em;
}

.page-heading span {
  color: #64798c;
  font-size: 17px;
}

.page-heading a {
  display: inline-block;
  margin-left: 12px;
  color: #08796c;
  font-weight: 700;
}

@media (max-width: 720px) {
  .assignment-page {
    padding-top: 0;
  }

  .page-heading {
    padding: 6px 2px 2px;
  }
}
</style>
