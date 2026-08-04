<script setup>
import { computed, ref, watch, watchEffect } from 'vue'
import koreaMapUrl from '../../imgs/Map_of_South_Korea-blank.svg'

const weatherList = ref([
  { id: 'city_01', name: '서울', temp: 24, status: '맑음', x: '35%', y: '20%' },
  { id: 'city_02', name: '광주', temp: 26, status: '비', x: '29%', y: '63%' },
  { id: 'city_03', name: '부산', temp: 29, status: '구름', x: '77%', y: '63%' },
  { id: 'city_04', name: '대구', temp: 32, status: '맑음', x: '65%', y: '50%' },
  { id: 'city_05', name: '제주', temp: 33, status: '맑음', x: '24%', y: '94%' },
  { id: 'city_06', name: '대전', temp: 25, status: '비', x: '42%', y: '43%' },
  { id: 'city_07', name: '강릉', temp: 23, status: '맑음', x: '70%', y: '15%' },
])

const searchQuery = ref('')
const selectedCityInfo = ref('카드 또는 지도에서 도시를 선택하세요.')
const selectedCityId = ref('')
const selectedTemp = ref(null)

const selectedStatusClass = computed(() => {
  if (selectedTemp.value === null) return ''
  return selectedTemp.value >= 26 ? 'status-hot' : 'status-cool'
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

const weatherIcon = (status) => {
  return { 맑음: '☀️', 구름: '☁️', 비: '🌧️' }[status]
}

const selectCity = (weather) => {
  selectedCityId.value = weather.id
  selectedTemp.value = weather.temp
  selectedCityInfo.value = `도시: ${weather.name}, 기온: ${weather.temp}°C, 상태: ${weather.status}`
}

const showDetail = (cityName, status) => {
  window.alert(`${cityName}의 현재 날씨는 [${status}] 입니다.`)
}

watch(selectedCityInfo, (newValue, oldValue) => {
  console.log(`🤖 선택 도시 변경\n${oldValue} --> ${newValue}`)
})

watchEffect(() => {
  console.log(`🤖 검색어 변경: ${searchQuery.value}`)
})
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

    <section class="map-box">
      <h2>대한민국 지역별 날씨 지도</h2>

      <div class="image-map">
        <img :src="koreaMapUrl" alt="대한민국 행정구역 지도" draggable="false" />

        <button
          v-for="item in filteredWeatherList"
          :key="item.id"
          class="city-marker"
          :class="{ selected: selectedCityId === item.id }"
          :style="{ left: item.x, top: item.y }"
          :aria-label="`${item.name}, ${item.temp}도, ${item.status}`"
          @click="selectCity(item)"
        >
          <span class="marker-icon">{{ weatherIcon(item.status) }}</span>
          <strong>{{ item.name }}</strong>
          <small>{{ item.temp }}°C</small>
        </button>
      </div>
    </section>

    <section class="list-box">
      <h2>지역별 날씨 현황</h2>

      <article
        v-for="item in filteredWeatherList"
        :key="item.id"
        class="weather-card"
        :class="{ selected: selectedCityId === item.id }"
        role="button"
        tabindex="0"
        @click="selectCity(item)"
        @keydown.enter.self="selectCity(item)"
        @keydown.space.self.prevent="selectCity(item)"
      >
        <div class="card-heading">
          <h3>{{ item.name }} ({{ item.status }})</h3>
          <button type="button" class="btn-detail" @click.stop="showDetail(item.name, item.status)">
            상세보기
          </button>
        </div>

        <div class="weather-summary">
          <p>현재 기온: {{ item.temp }}°C</p>
          <span v-if="item.temp >= 26" class="badge hot">🔥 더움 (26도 이상)</span>
          <span v-else class="badge cool">❄ 선선함 (25도 미만)</span>
        </div>
      </article>

      <p v-if="filteredWeatherList.length === 0" class="empty-message">
        "{{ searchQuery }}" 도시가 없습니다.
      </p>

      <div class="status-bar" :class="selectedStatusClass">
        <p>{{ selectedCityInfo }}</p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.dashboard-wrapper {
  width: min(100%, 760px);
  margin: 0 auto;
  color: #2c3e50;
}

.search-box,
.list-box,
.map-box {
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

.map-box h2 {
  margin-top: 0;
  text-align: center;
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
  padding: 5px 7px;
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
  background: #89e73c;
  border-color: #5ae73a;
  box-shadow: 0 0 0 5px rgba(27, 131, 23, 0.25);
  transform: translate(-50%, -50%) scale(1.15);
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

.card-heading,
.weather-summary {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
}

.card-heading h3,
.weather-summary p {
  margin: 0;
}

.weather-summary {
  margin-top: 10px;
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
  .card-heading,
  .weather-summary {
    align-items: flex-start;
    flex-direction: column;
  }

  .city-marker {
    min-width: 48px;
    padding: 3px 5px;
    font-size: 12px;
  }
}
</style>
