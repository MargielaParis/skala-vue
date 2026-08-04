<script setup>
import { computed, ref } from 'vue'

const weatherList = ref([
  { id: 'city_01', name: '서울', temp: 22, status: '맑음' },
  { id: 'city_02', name: '광주', temp: 24, status: '비' },
  { id: 'city_03', name: '부산', temp: 26, status: '구름' },
  { id: 'city_04', name: '대구', temp: 36, status: '맑음' },
  { id: 'city_05', name: '제주', temp: 34, status: '맑음' },
  { id: 'city_06', name: '대전', temp: 30, status: '비' },
])

const searchQuery = ref('')
const selectedCityInfo = ref('카드를 클릭하거나 검색해 보세요.')
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
  return weatherList.value.filter((weather) => weather.name.includes(keyword))
})
const selectCity = (weather) => {
  selectedCityId.value = weather.id
  selectedTemp.value = weather.temp
  selectedCityInfo.value = `선택된 도시 : ${weather.name} - 현재 기온: ${weather.temp}°C`
}

const showDetail = (cityName, status) => {
  window.alert(`${cityName}의 현재 날씨는 [${status}] 입니다.`)
}
</script>

<template>
  <div class="dashboard-wrapper">
    <section class="search-box">
      <label for="search">지역 검색</label>
      <input type="search" id="search" v-model.lazy="searchQuery" />
      <p aria-live="polite">
        검색 중인 도시: <strong>{{ searchQuery || '전체' }}</strong>
        <span>({{ filteredWeatherList.length }}개)</span>
      </p>
    </section>

    <section class="list-box">
      <h2>지역별 날씨 현황</h2>
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
          <button type="button" class="btn-detail" @click.stop="showDetail(item.name, item.status)">
            상세보기
          </button>
        </div>

        <div class="weather-summary">
          <p>현재 기온: {{ item.temp }}°C</p>
          <span v-if="item.temp >= 26" class="badge hot"> 🔥 더움 (26도 이상)</span>
          <span v-else class="badge cool"> ❄ 선선함 (25도 미만)</span>
        </div>
      </article>

      <p v-if="filteredWeatherList.length === 0" class="empty-message">
        "{{ searchQuery }}"에 때한 도시가 없습니다.
      </p>

      <div class="status-bar" :class="selectedStatusClass">
        <p>{{ selectedCityInfo }}</p>
      </div>
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

.weather-summary p {
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
}
</style>
