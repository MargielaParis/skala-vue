<script setup>
import { useTemperature } from '../../../composables/useTemperature'

defineProps({
  cityName: {
    type: String,
    required: true,
  },
  forecasts: {
    type: Array,
    required: true,
  },
  loading: Boolean,
  errorMessage: {
    type: String,
    default: '',
  },
})

const weatherIconUrl = (icon) => (icon ? `https://openweathermap.org/img/wn/${icon}@2x.png` : '')
const { temperatureText } = useTemperature()
</script>

<template>
  <section class="forecast-panel" :aria-busy="loading">
    <div class="forecast-heading">
      <div>
        <p class="eyebrow">3시간 단위 예보</p>
        <h2>{{ cityName }} 실시간 날씨 예보</h2>
      </div>
      <span v-if="loading" class="loading-text">불러오는 중</span>
    </div>

    <p v-if="errorMessage" class="forecast-error" role="alert">{{ errorMessage }}</p>
    <div v-else class="forecast-list">
      <article v-for="forecast in forecasts" :key="forecast.id" class="forecast-item">
        <p>{{ forecast.time }}</p>
        <img v-if="forecast.icon" :src="weatherIconUrl(forecast.icon)" :alt="forecast.status" />
        <span v-else aria-hidden="true">⛅</span>
        <strong>{{ temperatureText(forecast.temp) }}</strong>
        <small>{{ forecast.status }}</small>
      </article>
    </div>
  </section>
</template>

<style scoped>
.forecast-panel {
  padding: 20px;
  margin-bottom: 15px;
  color: #17324d;
  background: linear-gradient(135deg, #e9f7ff, #f7fcff);
  border: 1px solid #c9e6f7;
  border-radius: 14px;
}

.forecast-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.eyebrow,
.forecast-item p,
.forecast-item small {
  margin: 0;
  color: #537087;
  font-size: 12px;
}

.forecast-heading h2 {
  margin: 2px 0 0;
  font-size: 18px;
}

.loading-text {
  color: #1479b8;
  font-size: 13px;
  font-weight: 700;
}

.forecast-list {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px;
  margin-top: 16px;
}

.forecast-item {
  display: grid;
  gap: 5px;
  place-items: center;
  min-width: 0;
  padding: 10px 6px;
  text-align: center;
  background: rgb(255 255 255 / 75%);
  border-radius: 10px;
}

.forecast-item img {
  width: 38px;
  height: 38px;
}

.forecast-item strong {
  font-size: 15px;
}

.forecast-error {
  margin: 14px 0 0;
  color: #b42318;
}

@media (max-width: 520px) {
  .forecast-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
