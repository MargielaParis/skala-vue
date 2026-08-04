<script setup>
import { RouterLink } from 'vue-router'
import WeatherComposition from '../components/practices/day02/WeatherComposition.vue'
</script>

<template>
  <section class="assignment-page">
    <header class="page-heading">
      <p>Kiyeon Park</p>
      <h1>대한민국 날씨 대시보드</h1>
      <span>도시를 선택하면 현재 날씨와 다음 예보를 확인할 수 있습니다.</span>
      <RouterLink to="/weather/about">서비스 소개</RouterLink>
    </header>
    <WeatherComposition />
  </section>
</template>

<style scoped>
.page-heading {
  margin-bottom: 28px;
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
</style>
