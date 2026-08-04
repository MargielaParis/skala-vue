<script setup>
import axios from 'axios'
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useTemperature } from '../composables/useTemperature'
import { findWeatherCity } from '../data/weatherCities'

const route = useRoute()
const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY
const { temperatureText } = useTemperature()
const cityConfig = computed(() => findWeatherCity(route.params.cityId))
const weather = ref(null)
const loading = ref(false)
const errorMessage = ref('')

const weatherStatus = (code) => {
  if (code === 800) return '맑음'
  if (code >= 200 && code < 300) return '뇌우'
  if (code >= 300 && code < 600) return '비'
  if (code >= 600 && code < 700) return '눈'
  if (code >= 700 && code < 800) return '안개'
  return '흐림'
}

const loadWeather = async () => {
  weather.value = null
  errorMessage.value = ''
  if (!cityConfig.value) return
  if (!apiKey) {
    errorMessage.value = 'VITE_OPENWEATHER_API_KEY가 설정되지 않았습니다.'
    return
  }

  loading.value = true
  try {
    const { data } = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: {
        lat: cityConfig.value.latitude,
        lon: cityConfig.value.longitude,
        appid: apiKey,
        units: 'metric',
        lang: 'kr',
      },
    })
    weather.value = {
      temp: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      status: weatherStatus(data.weather[0].id),
      icon: data.weather[0].icon,
    }
  } catch (error) {
    errorMessage.value = error.response?.data?.message || '날씨 정보를 불러오지 못했습니다.'
  } finally {
    loading.value = false
  }
}

watch(() => route.params.cityId, loadWeather, { immediate: true })
</script>

<template>
  <section class="detail-page">
    <template v-if="cityConfig">
      <p>WEATHER / {{ cityConfig.name }}</p>
      <h1>{{ cityConfig.name }} 상세 관측</h1>
      <el-skeleton v-if="loading" :rows="4" animated />
      <el-alert v-else-if="errorMessage" :title="errorMessage" type="error" :closable="false" />
      <template v-else-if="weather">
        <div class="weather-heading">
          <strong>{{ temperatureText(weather.temp) }}</strong>
          <img
            :src="`https://openweathermap.org/img/wn/${weather.icon}@2x.png`"
            :alt="weather.status"
          />
        </div>
        <dl>
          <div><dt>날씨</dt><dd>{{ weather.status }}</dd></div>
          <div><dt>체감</dt><dd>{{ temperatureText(weather.feelsLike) }}</dd></div>
          <div><dt>습도</dt><dd>{{ weather.humidity }}%</dd></div>
          <div><dt>풍속</dt><dd>{{ weather.windSpeed }} m/s</dd></div>
        </dl>
      </template>
    </template>
    <h1 v-else>도시 정보를 찾을 수 없습니다.</h1>
    <RouterLink to="/assignment">대시보드로 돌아가기</RouterLink>
  </section>
</template>

<style scoped>
.detail-page { max-width: 680px; padding: 30px; color: #1e3147; background: #fff; border: 1px solid #dfe9eb; border-radius: 16px; }
.detail-page > p { margin: 0; color: #148476; font-size: 12px; font-weight: 800; letter-spacing: .1em; }
.detail-page h1 { margin: 8px 0 24px; }
.weather-heading { display: flex; align-items: center; justify-content: space-between; }
.weather-heading strong { font-size: 48px; }
.weather-heading img { width: 80px; height: 80px; }
.detail-page dl { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 22px 0; }
.detail-page dl div { display: grid; gap: 4px; padding: 12px; background: #f3f8f7; border-radius: 8px; }
.detail-page dt { color: #64798c; font-size: 12px; }
.detail-page dd { margin: 0; font-weight: 700; }
.detail-page a { color: #08796c; font-weight: 800; }
@media (max-width: 560px) { .detail-page dl { grid-template-columns: repeat(2, 1fr); } }
</style>
