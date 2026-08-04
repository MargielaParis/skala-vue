<script setup>
import axios from 'axios'
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useConfigStore } from '../../../stores/configStore'

const configStore = useConfigStore()
const emit = defineEmits(['go-home'])
defineProps({
  example: { type: String, default: 'router' },
})
const loading = ref(false)
const errorMessage = ref('')
const weather = ref(null)
const selectedCity = ref('seoul')
const cities = {
  seoul: { name: '서울', latitude: 37.5665, longitude: 126.978 },
  tokyo: { name: '도쿄', latitude: 35.6762, longitude: 139.6503 },
  cebu: { name: '세부', latitude: 10.3157, longitude: 123.8854 },
}

const goHome = () => emit('go-home')
const displayedTemperature = computed(() => {
  if (!weather.value) return null

  const celsius = weather.value.temp
  return configStore.unit === 'celsius' ? celsius : Math.round((celsius * 9) / 5 + 32)
})

const loadWeather = async () => {
  loading.value = true
  errorMessage.value = ''
  const city = cities[selectedCity.value]
  try {
    const response = await axios.get('https://api.open-meteo.com/v1/forecast', {
      params: {
        latitude: city.latitude,
        longitude: city.longitude,
        current: 'temperature_2m,relative_humidity_2m',
        temperature_unit: 'celsius',
      },
    })
    weather.value = {
      cityName: city.name,
      temp: response.data.current.temperature_2m,
      humidity: response.data.current.relative_humidity_2m,
    }
  } catch (error) {
    errorMessage.value = error.response?.data?.reason || '날씨를 불러오지 못했습니다.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="lesson-page">
    <article v-if="example === 'router'" class="lesson-card">
      <h2>Vue Router</h2>
      <p>RouterLink로 애플리케이션의 홈 경로를 이동합니다.</p>
      <RouterLink to="/" @click="goHome">홈 경로 이동 →</RouterLink>
    </article>
    <article v-else-if="example === 'pinia'" class="lesson-card">
      <h2>Pinia Store</h2>
      <p>
        현재 단위: <strong>{{ configStore.unitSymbol }}</strong>
      </p>
      <button @click="configStore.toggleUnit">℃ / ℉ 전환</button>
    </article>
    <article v-else class="lesson-card weather-card">
      <div>
        <h2>Axios · Open-Meteo</h2>
        <p v-if="weather">
          {{ weather.cityName }} · {{ displayedTemperature }}{{ configStore.unitSymbol }} · 습도
          {{ weather.humidity }}%
        </p>
        <p v-else>도시를 골라 실시간 날씨를 조회합니다.</p>
      </div>
      <select v-model="selectedCity">
        <option v-for="(city, id) in cities" :key="id" :value="id">{{ city.name }}</option></select
      ><button :disabled="loading" @click="loadWeather">
        {{ loading ? '조회 중' : '날씨 조회' }}
      </button>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </article>
  </section>
</template>

<style scoped>
.lesson-page {
  color: #1e3147;
}
.lesson-page > header p {
  margin: 0;
  color: #148476;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.1em;
}
.lesson-page > header h1 {
  margin: 4px 0;
  font-size: clamp(28px, 4vw, 42px);
}
.lesson-page > header span,
p {
  color: #687b8e;
}
.lesson-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin: 28px 0 16px;
}
.lesson-card {
  padding: 22px;
  background: #fff;
  border: 1px solid #dfe9eb;
  border-radius: 16px;
  box-shadow: 0 10px 24px rgb(32 68 83 / 6%);
}
.lesson-card h2,
.lesson-card p {
  margin-top: 0;
}
.lesson-card a {
  color: #08796c;
  font-weight: 800;
}
.lesson-card button {
  padding: 8px 11px;
  color: #135e55;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  background: #e7f6f1;
  border: 1px solid #abdbd0;
  border-radius: 8px;
}
.weather-card {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
}
.weather-card select,
input {
  padding: 8px;
  border: 1px solid #bfd2d9;
  border-radius: 8px;
}
.error {
  color: #c23b32;
}
@media (max-width: 760px) {
  .weather-card {
    align-items: start;
    flex-direction: column;
  }
}
@media (max-width: 640px) {
  .lesson-grid {
    grid-template-columns: 1fr;
  }
}
</style>
