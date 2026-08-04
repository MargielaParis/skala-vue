<script setup>
import { useTemperature } from '../../../composables/useTemperature'

defineProps({
  weather: {
    type: Object,
    required: true,
  },
  rank: {
    type: Number,
    required: true,
  },
  selected: Boolean,
  favorite: Boolean,
})

const emit = defineEmits(['select-card', 'click-detail', 'toggle-favorite'])
const { temperatureText } = useTemperature()

const weatherIconUrl = (icon) => (icon ? `https://openweathermap.org/img/wn/${icon}@2x.png` : '')

const weatherTheme = (weather) => {
  if (weather.temp === null) return 'weather-unavailable'
  if (['비', '이슬비', '뇌우'].includes(weather.status)) return 'weather-rain'
  if (weather.status === '눈') return 'weather-snow'
  if (weather.status === '안개') return 'weather-fog'
  if (['구름 조금', '구름 많음', '흐림'].includes(weather.status)) return 'weather-cloud'
  return weather.temp >= 26 ? 'weather-hot' : 'weather-clear'
}

const airGrade = (type, value) => {
  if (value === null || value === undefined) return { label: '정보 없음', className: 'air-unknown' }

  const thresholds = {
    pm10: [30, 80, 150],
    pm25: [15, 35, 75],
    ozone: [60, 180, 300],
  }
  const labels = ['좋음', '보통', '나쁨', '매우 나쁨']
  const classes = ['air-good', 'air-normal', 'air-bad', 'air-very-bad']
  const index = thresholds[type].findIndex((threshold) => value <= threshold)
  const gradeIndex = index === -1 ? 3 : index

  return { label: labels[gradeIndex], className: classes[gradeIndex] }
}
</script>

<template>
  <article
    class="weather-card"
    :class="[{ selected }, weatherTheme(weather)]"
    role="button"
    tabindex="0"
    @click="emit('select-card', weather)"
    @keydown.enter.self="emit('select-card', weather)"
    @keydown.space.self.prevent="emit('select-card', weather)"
  >
    <header class="card-heading">
      <span class="rank">{{ rank }}</span>
      <div class="city-name">
        <h3>{{ weather.name }}</h3>
        <p>{{ weather.status }}</p>
      </div>
      <img v-if="weather.icon" :src="weatherIconUrl(weather.icon)" :alt="weather.status" />
      <button
        type="button"
        class="btn-favorite"
        :aria-label="favorite ? `${weather.name} 즐겨찾기 해제` : `${weather.name} 즐겨찾기 추가`"
        :aria-pressed="favorite"
        @click.stop="emit('toggle-favorite', weather)"
      >
        {{ favorite ? '★' : '☆' }}
      </button>
      <button type="button" class="btn-detail" @click.stop="emit('click-detail', weather)">
        상세
      </button>
    </header>

    <div class="weather-summary">
      <strong>{{ temperatureText(weather.temp) }}</strong>
      <div>
        <span>습도 {{ weather.humidity ?? '--' }}%</span>
        <span>풍속 {{ weather.windSpeed ?? '--' }} m/s</span>
      </div>
    </div>

    <div class="weather-index-grid">
      <section>
        <span>미세먼지</span>
        <strong>{{ weather.pm10 ?? '--' }}<small> ㎍/㎥</small></strong>
        <em :class="airGrade('pm10', weather.pm10).className">
          {{ airGrade('pm10', weather.pm10).label }}
        </em>
      </section>
      <section>
        <span>초미세먼지</span>
        <strong>{{ weather.pm25 ?? '--' }}<small> ㎍/㎥</small></strong>
        <em :class="airGrade('pm25', weather.pm25).className">
          {{ airGrade('pm25', weather.pm25).label }}
        </em>
      </section>
      <section>
        <span>오존</span>
        <strong>{{ weather.ozone ?? '--' }}<small> ㎍/㎥</small></strong>
        <em :class="airGrade('ozone', weather.ozone).className">
          {{ airGrade('ozone', weather.ozone).label }}
        </em>
      </section>
      <section class="sun-time">
        <span>일출</span>
        <strong><i aria-hidden="true">↑</i> {{ weather.sunrise ?? '--:--' }}</strong>
      </section>
      <section class="sun-time">
        <span>일몰</span>
        <strong><i aria-hidden="true">↓</i> {{ weather.sunset ?? '--:--' }}</strong>
      </section>
    </div>
  </article>
</template>

<style scoped>
.weather-card {
  display: grid;
  gap: 12px;
  padding: 14px;
  margin-bottom: 10px;
  color: #1e3147;
  cursor: pointer;
  background: #fff;
  border: 2px solid #dfe9eb;
  border-radius: 12px;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.weather-card:hover {
  border-color: #72bcb0;
}

.weather-card.selected {
  border-color: #08796c;
  box-shadow: 0 7px 16px rgb(8 121 108 / 15%);
}

.weather-card.weather-hot {
  background: linear-gradient(135deg, #fff3dc, #ffe6df);
}
.weather-card.weather-clear {
  background: linear-gradient(135deg, #fffce6, #eaf8ff);
}
.weather-card.weather-cloud {
  background: linear-gradient(135deg, #f5f7f8, #e5edf1);
}
.weather-card.weather-rain {
  background: linear-gradient(135deg, #eaf5fc, #e0eaf3);
}
.weather-card.weather-snow {
  background: linear-gradient(135deg, #fbfeff, #e7f6fa);
}
.weather-card.weather-fog {
  background: linear-gradient(135deg, #f5f5f2, #e6eae7);
}
.weather-card.weather-unavailable {
  background: #f1f3f4;
}

.card-heading {
  display: grid;
  grid-template-columns: 24px minmax(0, 1fr) 38px auto auto;
  gap: 8px;
  align-items: center;
}

.rank {
  display: grid;
  width: 24px;
  height: 24px;
  place-items: center;
  color: #16766b;
  font-size: 11px;
  font-weight: 800;
  background: rgb(255 255 255 / 76%);
  border-radius: 50%;
}

.city-name h3,
.city-name p {
  margin: 0;
}
.city-name h3 {
  font-size: 16px;
}
.city-name p {
  color: #66808f;
  font-size: 11px;
}
.card-heading img {
  width: 38px;
  height: 38px;
}

.btn-detail {
  padding: 5px 7px;
  color: #116d63;
  font: inherit;
  font-size: 11px;
  font-weight: 800;
  cursor: pointer;
  background: rgb(255 255 255 / 70%);
  border: 1px solid rgb(17 109 99 / 18%);
  border-radius: 6px;
}

.btn-favorite {
  padding: 4px 5px;
  color: #e18a38;
  font: inherit;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  background: rgb(255 255 255 / 70%);
  border: 1px solid rgb(225 138 56 / 18%);
  border-radius: 6px;
}

.weather-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.weather-summary > strong {
  font-size: 28px;
}
.weather-summary > div {
  display: flex;
  gap: 6px;
}
.weather-summary span {
  padding: 5px 8px;
  color: #526d7d;
  font-size: 11px;
  font-weight: 700;
  background: rgb(255 255 255 / 62%);
  border-radius: 999px;
}

.weather-index-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px;
}
.weather-index-grid section {
  display: grid;
  gap: 5px;
  min-width: 0;
  padding: 10px;
  background: rgb(255 255 255 / 68%);
  border: 1px solid rgb(30 75 91 / 8%);
  border-radius: 9px;
}
.weather-index-grid span {
  color: #66808f;
  font-size: 11px;
}
.weather-index-grid strong {
  color: #29485b;
  font-size: 14px;
}
.weather-index-grid small {
  color: #66808f;
  font-size: 9px;
  font-weight: 500;
}
.weather-index-grid em {
  width: max-content;
  padding: 2px 6px;
  font-size: 9px;
  font-style: normal;
  font-weight: 800;
  border-radius: 999px;
}
.air-good { color: #1769aa; background: #e0f1ff; }
.air-normal { color: #187553; background: #dcf4e8; }
.air-bad { color: #b46100; background: #fff0d5; }
.air-very-bad { color: #b42318; background: #ffe4e1; }
.air-unknown { color: #687b8e; background: #edf1f3; }
.sun-time strong {
  font-size: 16px;
}
.sun-time i {
  color: #ef8c3f;
  font-style: normal;
}

@media (max-width: 720px) {
  .weather-index-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 480px) {
  .card-heading {
    grid-template-columns: 24px minmax(0, 1fr) auto auto;
  }
  .card-heading img {
    display: none;
  }
  .weather-summary {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
