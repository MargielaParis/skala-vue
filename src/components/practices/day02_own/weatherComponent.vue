<script setup>
import { computed, onMounted, ref, watch, watchEffect } from 'vue'
import koreaMapUrl from '../../imgs/Map_of_South_Korea-blank.svg'
import BaseDashboardCard from './BaseDashboardCard.vue'
import SearchBar from './SearchBar.vue'
import WeatherCard from './WeatherCard.vue'

const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY

const weatherList = ref([
  {
    id: 'city_01',
    name: '서울',
    latitude: 37.5665,
    longitude: 126.978,
    x: '35%',
    y: '20%',
    temp: null,
    status: '조회 전',
    icon: '',
    humidity: null,
  },
  {
    id: 'city_02',
    name: '광주',
    latitude: 35.1595,
    longitude: 126.8526,
    x: '29%',
    y: '63%',
    temp: null,
    status: '조회 전',
    icon: '',
    humidity: null,
  },
  {
    id: 'city_03',
    name: '부산',
    latitude: 35.1796,
    longitude: 129.0756,
    x: '77%',
    y: '64%',
    temp: null,
    status: '조회 전',
    icon: '',
    humidity: null,
  },
  {
    id: 'city_04',
    name: '대구',
    latitude: 35.8714,
    longitude: 128.6014,
    x: '65%',
    y: '50%',
    temp: null,
    status: '조회 전',
    icon: '',
    humidity: null,
  },
  {
    id: 'city_05',
    name: '제주',
    latitude: 33.4996,
    longitude: 126.5312,
    x: '24%',
    y: '94%',
    temp: null,
    status: '조회 전',
    icon: '',
    humidity: null,
  },
  {
    id: 'city_06',
    name: '대전',
    latitude: 36.3504,
    longitude: 127.3845,
    x: '42%',
    y: '43%',
    temp: null,
    status: '조회 전',
    icon: '',
    humidity: null,
  },

  {
    id: 'city_07',
    name: '강릉',
    latitude: 37.7515,
    longitude: 128.891,
    x: '70%',
    y: '15%',
    temp: null,
    status: '조회 전',
    icon: '',
    humidity: null,
  },
])

const searchQuery = ref('')
const selectedCityId = ref('')
const loading = ref(false)
const errorMessage = ref('')
const updatedAt = ref('')

const selectedCity = computed(() =>
  weatherList.value.find((weather) => weather.id === selectedCityId.value),
)

const selectedCityInfo = computed(() => {
  if (!selectedCity.value) {
    return '카드 또는 지도에서 도시를 선택하세요.'
  }

  if (selectedCity.value.temp === null) {
    return `${selectedCity.value.name}의 날씨 정보를 불러오지 못했습니다.`
  }

  return `도시: ${selectedCity.value.name}, 기온: ${selectedCity.value.temp}°C, 상태: ${selectedCity.value.status}`
})

const selectedStatusClass = computed(() => {
  if (selectedCity.value?.temp === null || selectedCity.value?.temp === undefined) {
    return ''
  }

  return selectedCity.value.temp >= 26 ? 'status-hot' : 'status-cool'
})

const filteredWeatherList = computed(() => {
  const keyword = searchQuery.value.trim()

  if (!keyword) {
    return weatherList.value
  }

  return weatherList.value.filter(
    (weather) => weather.name.includes(keyword) || weather.status.includes(keyword),
  )
})

const selectCity = (weather) => {
  selectedCityId.value = weather.id
}

const fetchCityWeather = async (city) => {
  const params = new URLSearchParams({
    lat: String(city.latitude),
    lon: String(city.longitude),
    appid: apiKey,
    units: 'metric',
    lang: 'kr',
  })

  const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?${params}`)
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || `${city.name} 날씨 조회에 실패했습니다.`)
  }

  return {
    ...city,
    temp: Math.round(data.main.temp),
    status: data.weather[0].description,
    icon: data.weather[0].icon,
    humidity: data.main.humidity,
  }
}

const loadWeather = async () => {
  if (!apiKey) {
    errorMessage.value = 'VITE_OPENWEATHER_API_KEY가 설정되지 않았습니다.'
    return
  }

  loading.value = true
  errorMessage.value = ''

  const results = await Promise.allSettled(weatherList.value.map(fetchCityWeather))
  const failedCount = results.filter((result) => result.status === 'rejected').length

  weatherList.value = results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value
    }

    return {
      ...weatherList.value[index],
      temp: null,
      status: '조회 실패',
      icon: '',
      humidity: null,
    }
  })

  if (failedCount > 0) {
    errorMessage.value = `${failedCount}개 도시의 날씨를 불러오지 못했습니다.`
  }

  updatedAt.value = new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date())
  loading.value = false
}

const showDetail = (weather) => {
  if (weather.temp === null) {
    window.alert(`${weather.name}의 날씨 정보를 불러오지 못했습니다.`)
    return
  }

  window.alert(
    `${weather.name}\n현재 기온: ${weather.temp}°C\n상태: ${weather.status}\n습도: ${weather.humidity}%`,
  )
}

watch(selectedCityInfo, (newValue, oldValue) => {
  console.log(`🤖 선택 도시 변경\n${oldValue} --> ${newValue}`)
})

watchEffect(() => {
  console.log(`🤖 검색어 변경: ${searchQuery.value}`)
})

onMounted(loadWeather)
</script>

<template>
  <div class="dashboard-wrapper">
    <BaseDashboardCard>
      <SearchBar
        :query="searchQuery"
        :result-count="filteredWeatherList.length"
        @update-query="searchQuery = $event"
      />
    </BaseDashboardCard>

    <section class="map-box">
      <div class="section-heading">
        <h2>대한민국 지역별 날씨 지도</h2>
        <button type="button" :disabled="loading" @click="loadWeather">
          {{ loading ? '불러오는 중' : '새로고침' }}
        </button>
      </div>

      <p v-if="updatedAt" class="updated-at">최근 조회: {{ updatedAt }}</p>
      <p v-if="errorMessage" class="error-message" role="alert">{{ errorMessage }}</p>

      <div class="image-map" :aria-busy="loading">
        <img :src="koreaMapUrl" alt="대한민국 행정구역 지도" draggable="false" />

        <button
          v-for="item in filteredWeatherList"
          :key="item.id"
          class="city-marker"
          :class="{ selected: selectedCityId === item.id, unavailable: item.temp === null }"
          :style="{ left: item.x, top: item.y }"
          :aria-label="`${item.name}, ${item.temp ?? '조회 실패'}, ${item.status}`"
          @click="selectCity(item)"
        >
          <img v-if="item.icon" :src="weatherIconUrl(item.icon)" :alt="item.status" />
          <span v-else class="marker-icon">{{ item.temp === null ? '⚠️' : '⛅' }}</span>
          <strong>{{ item.name }}</strong>
          <small>{{ item.temp === null ? '--' : `${item.temp}°C` }}</small>
        </button>
      </div>
    </section>

    <BaseDashboardCard>
      <h2>지역별 날씨 현황</h2>

      <WeatherCard
        v-for="item in filteredWeatherList"
        :key="item.id"
        :weather="item"
        :selected="selectedCityId === item.id"
        @select-card="selectCity"
        @click-detail="showDetail"
      />

      <p v-if="filteredWeatherList.length === 0" class="empty-message">
        "{{ searchQuery }}" 도시가 없습니다.
      </p>

      <div class="status-bar" :class="selectedStatusClass">
        <p>{{ selectedCityInfo }}</p>
      </div>
    </BaseDashboardCard>
  </div>
</template>

<style scoped>
.dashboard-wrapper {
  width: min(100%, 760px);
  margin: 0 auto;
  color: #2c3e50;
}

.map-box {
  padding: 15px;
  margin-bottom: 15px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
}

.section-heading {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
}

.section-heading h2 {
  margin: 0;
}

.section-heading button {
  padding: 7px 12px;
  color: white;
  cursor: pointer;
  background: #42b883;
  border: 0;
  border-radius: 5px;
}

.section-heading button:disabled {
  cursor: wait;
  background: #95a5a6;
}

.updated-at {
  margin: 8px 0;
  color: #636e72;
  font-size: 12px;
}

.error-message {
  padding: 10px;
  color: #c0392b;
  background: #fff0ee;
  border-radius: 6px;
}

.image-map {
  position: relative;
  width: min(100%, 440px);
  margin: 0 auto;
}

.image-map img {
  display: block;
  width: 100%;
  user-select: none;
}

.city-marker {
  position: absolute;
  z-index: 1;
  display: grid;
  place-items: center;
  min-width: 58px;
  padding: 4px 6px;
  color: #2c3e50;
  cursor: pointer;
  background: white;
  border: 2px solid #42b883;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgb(0 0 0 / 18%);
  transform: translate(-50%, -50%);
  transition:
    transform 0.2s ease,
    background-color 0.2s ease;
}

.city-marker:hover,
.city-marker:focus-visible {
  transform: translate(-50%, -50%) scale(1.08);
}

.city-marker.selected {
  z-index: 2;
  color: white;
  background: #97ebc5;
  border-color: #42b883;
  box-shadow: 0 0 0 1px rgba(32, 157, 64, 0.458);
  transform: translate(-50%, -50%) scale(1.15);
}

.city-marker.unavailable {
  border-color: #95a5a6;
}

.city-marker img {
  width: 32px;
  height: 32px;
}

.marker-icon {
  font-size: 18px;
}

.city-marker strong,
.city-marker small {
  display: block;
}

.city-marker small {
  font-size: 11px;
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

@media (max-width: 480px) {
  .city-marker {
    min-width: 48px;
    padding: 3px 5px;
    font-size: 12px;
  }
}
</style>
