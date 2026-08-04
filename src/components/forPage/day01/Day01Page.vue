<script setup>
import { computed, ref } from 'vue'
import BasicExamples from './BasicExamples.vue'

const name = ref('Vue 학습자')
const isLoggedIn = ref(false)
const keyword = ref('')
const selectedTopics = ref([])
const cityList = ref([
  { id: 1, name: '서울', temp: 27, status: '맑음' },
  { id: 2, name: '수원', temp: 24, status: '비' },
  { id: 3, name: '부산', temp: 29, status: '구름' },
])

const filteredCities = computed(() =>
  cityList.value.filter((city) => city.name.includes(keyword.value.trim())),
)
</script>

<template>
  <section class="lesson-page">
    <header>
      <p>CHAPTER 1 · 2</p>
      <h1>Vue 시작과 기본 문법</h1>
      <span>반응성, 디렉티브, 이벤트, 양방향 바인딩을 한 화면에서 연습합니다.</span>
    </header>

    <div class="lesson-grid">
      <article class="lesson-card intro-card">
        <h2>Text Interpolation · v-if</h2>
        <p>
          안녕하세요, <strong>{{ name }}</strong
          >님.
        </p>
        <input v-model.trim="name" aria-label="이름" placeholder="이름 입력" />
        <p v-if="isLoggedIn" class="success">로그인 상태입니다.</p>
        <p v-else class="muted">로그인이 필요합니다.</p>
        <button @click="isLoggedIn = !isLoggedIn">
          {{ isLoggedIn ? '로그아웃' : '로그인' }}
        </button>
      </article>

      <article class="lesson-card">
        <h2>v-model · Form</h2>
        <p>관심 주제를 선택하세요.</p>
        <label
          ><input v-model="selectedTopics" type="checkbox" value="Directive" /> Directive</label
        >
        <label><input v-model="selectedTopics" type="checkbox" value="Event" /> Event</label>
        <label><input v-model="selectedTopics" type="checkbox" value="v-model" /> v-model</label>
        <p class="result">{{ selectedTopics.length ? selectedTopics.join(', ') : '선택 없음' }}</p>
      </article>
    </div>

    <article class="lesson-card weather-card">
      <div class="card-heading">
        <div>
          <h2>v-for · v-bind · v-on</h2>
          <p>도시 이름으로 날씨 목업을 검색합니다.</p>
        </div>
        <input v-model="keyword" type="search" placeholder="도시 검색" />
      </div>
      <div class="city-list">
        <button
          v-for="city in filteredCities"
          :key="city.id"
          class="city-item"
          @click="city.temp++"
        >
          <span>{{ city.name }}</span>
          <strong>{{ city.temp }}°C</strong>
          <small :class="{ hot: city.temp >= 25 }">{{ city.status }}</small>
        </button>
      </div>
      <p v-if="filteredCities.length === 0" class="muted">검색 결과가 없습니다.</p>
    </article>
    <BasicExamples />
  </section>
</template>

<style scoped>
.lesson-page {
  color: #1e3147;
}
header p {
  margin: 0;
  color: #148476;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.1em;
}
header h1 {
  margin: 4px 0;
  font-size: clamp(28px, 4vw, 42px);
}
header span,
.muted {
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
input {
  width: 100%;
  padding: 9px 10px;
  border: 1px solid #bfd2d9;
  border-radius: 8px;
}
label {
  display: block;
  margin: 8px 0;
}
label input {
  width: auto;
  margin-right: 6px;
}
button {
  padding: 8px 11px;
  color: #135e55;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  background: #e7f6f1;
  border: 1px solid #abdbd0;
  border-radius: 8px;
}
.success,
.result {
  margin: 14px 0;
  color: #08796c;
  font-weight: 700;
}
.weather-card {
  margin-top: 16px;
}
.card-heading {
  display: flex;
  gap: 20px;
  align-items: start;
  justify-content: space-between;
}
.card-heading input {
  max-width: 220px;
}
.city-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 18px;
}
.city-item {
  display: grid;
  gap: 4px;
  text-align: left;
  background: #f2faf8;
}
.city-item strong {
  font-size: 22px;
}
.city-item small {
  color: #597083;
}
.city-item small.hot {
  color: #d64a42;
}
@media (max-width: 640px) {
  .lesson-grid,
  .city-list {
    grid-template-columns: 1fr;
  }
  .card-heading {
    flex-direction: column;
  }
  .card-heading input {
    max-width: none;
  }
}
</style>
