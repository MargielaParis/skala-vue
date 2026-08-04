<script setup>
import { computed, onMounted, ref } from 'vue'

const cities = [
  { id: 'city_01', name: '서울', latitude: 37.5665, longitude: 126.978 },
  { id: 'city_02', name: '수원', latitude: 37.2636, longitude: 127.0286 },
  { id: 'city_03', name: '부산', latitude: 35.1796, longitude: 129.0756 },
  { id: 'city_04', name: '대구', latitude: 35.8714, longitude: 128.6014 },
  { id: 'city_05', name: '제주', latitude: 33.4996, longitude: 126.5312 },
  { id: 'city_06', name: '대전', latitude: 36.3504, longitude: 127.3845 },
]

const weatherList = ref(
  cities.map((city) => ({
    ...city,
    temp: null,
    status: '불러오는 중',
  })),
)

const searchQuery = ref('')
const selectedCityId = ref('')
const loading = ref(false)
const errorMessage = ref('')

const weatherCodeToStatus = (code) => {
  if (code === 0) return '맑음'
  if (code === 1) return '대체로 맑음'
  if (code === 2) return '구름 조금'
  if (code === 3) return '흐림'
  if ([45, 48].includes(code)) return '안개'
  if ([51, 53, 55].includes(code)) return '이슬비'
  if ([56, 57].includes(code)) return '어는 이슬비'
  if ([61, 63, 65].includes(code)) return '비'
  if ([66, 67].includes(code)) return '어는 비'
  if ([71, 73, 75, 77].includes(code)) return '눈'
  if ([80, 81, 82].includes(code)) return '소나기'
  if ([85, 86].includes(code)) return '소낙눈'
  if ([95, 96, 99].includes(code)) return '뇌우'
  return '알 수 없음'
}

const fetchCityWeather = async (city) => {
  const params = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    current: 'temperature_2m,weather_code',
    timezone: 'Asia/Seoul',
  })

  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`)

  if (!response.ok) {
    throw new Error(`${city.name} 날씨 조회 실패`)
  }

  const data = await response.json()

  if (!data.current || typeof data.current.temperature_2m !== 'number') {
    throw new Error(`${city.name} 날씨 데이터 오류`)
  }

  return {
    ...city,
    temp: Math.round(data.current.temperature_2m),
    status: weatherCodeToStatus(data.current.weather_code),
  }
}

const loadWeather = async () => {
  loading.value = true
  errorMessage.value = ''

  const results = await Promise.allSettled(cities.map(fetchCityWeather))
  const failedCount = results.filter((result) => result.status === 'rejected').length

  weatherList.value = results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value
    }

    return {
      ...cities[index],
      temp: null,
      status: '조회 실패',
    }
  })

  if (failedCount > 0) {
    errorMessage.value = `${failedCount}개 도시의 날씨를 가져오지 못했습니다.`
  }

  loading.value = false
}

const filteredWeatherList = computed(() => {
  const keyword = searchQuery.value.trim()

  if (!keyword) {
    return weatherList.value
  }

  return weatherList.value.filter((weather) => weather.name.includes(keyword))
})

const selectedCity = computed(() =>
  weatherList.value.find((weather) => weather.id === selectedCityId.value),
)

const selectedCityInfo = computed(() => {
  if (!selectedCity.value) {
    return '카드를 클릭하거나 검색해 보세요.'
  }

  if (selectedCity.value.temp === null) {
    return `${selectedCity.value.name}의 날씨를 가져오지 못했습니다.`
  }

  return `${selectedCity.value.name}이 선택되었습니다. (현재 기온: ${selectedCity.value.temp}°C)`
})

const selectedStatusClass = computed(() => {
  if (selectedCity.value?.temp === null || selectedCity.value?.temp === undefined) {
    return ''
  }

  return selectedCity.value.temp >= 26 ? 'status-hot' : 'status-cool'
})

const selectCity = (weather) => {
  selectedCityId.value = weather.id
}

const showDetail = (weather) => {
  window.alert(
    `${weather.name}의 현재 날씨는 [${weather.status}] 입니다. (현재 기온: ${weather.temp}°C)`,
  )
}

onMounted(loadWeather)
</script>

<template>
  <div class="dashboard-wrapper">
    <section class="search-box">
      <label for="search">지역 검색</label>
      <input id="search" v-model.lazy="searchQuery" type="search" />
      <p aria-live="polite">
        검색 중인 도시: <strong>{{ searchQuery || '전체' }}</strong>
        <span>({{ filteredWeatherList.length }}개)</span>
      </p>
    </section>

    <section class="list-box" :aria-busy="loading">
      <div class="list-heading">
        <h2>지역별 날씨 현황</h2>
        <button type="button" :disabled="loading" @click="loadWeather">
          {{ loading ? '불러오는 중' : '새로고침' }}
        </button>
      </div>

      <p v-if="loading" class="loading-message">현재 날씨를 불러오고 있습니다.</p>
      <p v-if="errorMessage" class="error-message" role="alert">{{ errorMessage }}</p>

      <article
        v-for="item in filteredWeatherList"
        :key="item.id"
        :class="{ selected: selectedCityId === item.id }"
        class="weather-card"
        role="button"
        tabindex="0"
        @click="selectCity(item)"
        @keydown.enter.self="selectCity(item)"
        @keydown.space.self.prevent="selectCity(item)"
      >
        <div class="card-heading">
          <h3>{{ item.name }} ({{ item.status }})</h3>
          <button
            type="button"
            class="btn-detail"
            :disabled="item.temp === null"
            @click.stop="showDetail(item)"
          >
            상세보기
          </button>
        </div>

        <div class="weather-summary">
          <p>현재 기온: {{ item.temp === null ? '--' : item.temp }}°C</p>
          <span v-if="item.temp === null" class="badge unavailable">날씨 정보 없음</span>
          <span v-else-if="item.temp >= 26" class="badge hot">🔥 더움 (26도 이상)</span>
          <span v-else class="badge cool">❄ 선선함 (26도 미만)</span>
        </div>
      </article>

      <p v-if="filteredWeatherList.length === 0" class="empty-message">
        "{{ searchQuery }}"에 해당하는 도시가 없습니다.
      </p>

      <div class="status-bar" :class="selectedStatusClass" aria-live="polite">
        <p>{{ selectedCityInfo }}</p>
      </div>

      <p class="attribution">
        Weather data by
        <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo</a>
      </p>
    </section>
  </div>
</template>

<style scoped>
.dashboard-wrapper {
  width: min(100%, 600px);
  margin: 0 auto;
  color: #2c3e50;
}

.search-box,
.list-box {
  padding: 15px;
  margin-bottom: 15px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
}

.search-box label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
}

.search-box input {
  width: 100%;
}

.list-heading {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.list-heading h2 {
  margin: 0;
}

.loading-message,
.error-message {
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 6px;
}

.loading-message {
  color: #2d6a4f;
  background: #e8f5e9;
}

.error-message {
  color: #b42318;
  background: #fee4e2;
}

.weather-card {
  padding: 12px;
  margin-bottom: 10px;
  cursor: pointer;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.weather-card:hover,
.weather-card.selected {
  border-color: #42b883;
  box-shadow: 0 3px 12px rgb(66 184 131 / 15%);
}

.weather-card:focus-visible {
  outline: 3px solid rgb(66 184 131 / 30%);
}

.card-heading {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
}

.card-heading h3 {
  margin: 0;
}

.weather-summary {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
}

.weather-summary p,
.status-bar p {
  margin: 0;
}

.badge {
  display: inline-block;
  padding: 4px 8px;
  color: white;
  font-size: 12px;
  border-radius: 4px;
}

.hot {
  background-color: #d63031;
}

.cool {
  background-color: #0984e3;
}

.unavailable {
  background-color: #636e72;
}

.empty-message {
  padding: 24px 12px;
  color: #636e72;
  text-align: center;
}

.status-bar {
  padding: 10px;
  color: #2e7d32;
  font-weight: 700;
  text-align: center;
  background: #e8f5e9;
  border-radius: 6px;
}

.status-hot {
  color: #d63031;
}

.status-cool {
  color: #0984e3;
}

.attribution {
  margin: 12px 0 0;
  color: #636e72;
  font-size: 12px;
  text-align: right;
}

@media (max-width: 480px) {
  .list-heading,
  .card-heading,
  .weather-summary {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
