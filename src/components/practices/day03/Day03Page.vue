<script setup>
import axios from 'axios'
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useConfigStore } from '../../../stores/configStore'
import { useCounterStore } from '../../../stores/counter'

const configStore = useConfigStore()
const counterStore = useCounterStore()
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

const JSON_BASE_URL = 'https://jsonplaceholder.typicode.com/posts'
const posts = ref([])
const postTitle = ref('')
const jsonLoading = ref(false)
const jsonLog = ref('버튼을 눌러 REST API CRUD를 확인하세요.')

const runJsonRequest = async (label, request) => {
  jsonLoading.value = true
  try {
    const result = await request()
    jsonLog.value = `${label} 성공 · ${result}`
  } catch (error) {
    jsonLog.value = `${label} 실패 · ${error.message}`
  } finally {
    jsonLoading.value = false
  }
}

const handleRead = () =>
  runJsonRequest('GET', async () => {
    const { data } = await axios.get(JSON_BASE_URL, { params: { _limit: 3 } })
    posts.value = data
    return `${data.length}건 조회`
  })

const handleCreate = () => {
  if (!postTitle.value.trim()) return
  return runJsonRequest('POST', async () => {
    const { data } = await axios.post(JSON_BASE_URL, {
      title: postTitle.value,
      body: '샘플 내용',
      userId: 1,
    })
    posts.value = [data, ...posts.value]
    postTitle.value = ''
    return `id ${data.id} 생성`
  })
}

const handleUpdate = (id) =>
  runJsonRequest('PUT', async () => {
    const { data } = await axios.put(`${JSON_BASE_URL}/${id}`, {
      title: '✨ 수정된 타이틀',
      body: '수정 완료',
      userId: 1,
    })
    posts.value = posts.value.map((post) => (post.id === id ? { ...post, ...data } : post))
    return `id ${id} 수정`
  })

const handleDelete = (id) =>
  runJsonRequest('DELETE', async () => {
    const { status } = await axios.delete(`${JSON_BASE_URL}/${id}`)
    posts.value = posts.value.filter((post) => post.id !== id)
    return `id ${id} 삭제 (status ${status})`
  })
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
    <article v-else-if="example === 'counter'" class="lesson-card">
      <h2>Counter Store</h2>
      <p>
        원본 카운트(state): <strong>{{ counterStore.count }}</strong> / 2배 연산(getters):
        <strong>{{ counterStore.doubleCount }}</strong>
      </p>
      <button @click="counterStore.increment">숫자 1 증가 (actions)</button>
      <button @click="counterStore.reset">초기화</button>
    </article>
    <article v-else-if="example === 'json'" class="lesson-card">
      <h2>Axios · JSONPlaceholder CRUD</h2>
      <p>{{ jsonLog }}</p>
      <div class="json-input">
        <input v-model="postTitle" placeholder="저장할 텍스트를 입력하세요" />
        <button :disabled="jsonLoading" @click="handleCreate">POST</button>
        <button :disabled="jsonLoading" @click="handleRead">GET</button>
      </div>
      <ul class="json-list">
        <li v-for="post in posts" :key="post.id">
          <div>
            <span>ID {{ post.id }}</span>
            <p>{{ post.title }}</p>
          </div>
          <div class="json-actions">
            <button :disabled="jsonLoading" @click="handleUpdate(post.id)">PUT</button>
            <button :disabled="jsonLoading" @click="handleDelete(post.id)">DELETE</button>
          </div>
        </li>
      </ul>
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
.lesson-card p {
  color: #687b8e;
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
.json-input {
  display: flex;
  gap: 6px;
  margin-bottom: 14px;
}
.json-input input {
  flex: 1;
  min-width: 0;
}
.json-list {
  display: grid;
  gap: 8px;
  padding: 0;
  margin: 0;
  list-style: none;
}
.json-list li {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: #f3f8f7;
  border: 1px solid #dfe9eb;
  border-radius: 10px;
}
.json-list span {
  color: #148476;
  font-size: 11px;
  font-weight: 800;
}
.json-list p {
  margin: 2px 0 0;
  font-size: 13px;
}
.json-actions {
  display: flex;
  gap: 5px;
  flex-shrink: 0;
}
.json-actions button {
  padding: 6px 9px;
  font-size: 12px;
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
