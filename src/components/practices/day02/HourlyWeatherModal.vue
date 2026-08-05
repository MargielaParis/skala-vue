<script setup>
import axios from 'axios'
import Dialog from 'primevue/dialog'
import Message from 'primevue/message'
import Skeleton from 'primevue/skeleton'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useTemperature } from '../../../composables/useTemperature'

const props = defineProps({
  city: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['close'])
const { unitSymbol, convertTemperature, temperatureText } = useTemperature()
const hours = ref([])
const loading = ref(false)
const errorMessage = ref('')
const HOURLY_CACHE_TTL = 5 * 60 * 1000
const hourlyCache = new Map()
const hourlyRequests = new Map()
let previousHtmlOverflow = ''
let previousBodyOverflow = ''

const formatHour = (time) =>
  new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(time))

const hourlyCacheKey = (city) =>
  `${Number(city.latitude).toFixed(4)},${Number(city.longitude).toFixed(4)}`

const fetchHourlyWeather = async (city) => {
  const cacheKey = hourlyCacheKey(city)
  const cached = hourlyCache.get(cacheKey)
  if (cached && cached.expiresAt > Date.now()) return cached.data

  const pendingRequest = hourlyRequests.get(cacheKey)
  if (pendingRequest) return pendingRequest

  const request = axios
    .get('https://api.open-meteo.com/v1/forecast', {
      params: {
        latitude: city.latitude,
        longitude: city.longitude,
        hourly:
          'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability',
        forecast_days: 2,
        timezone: 'auto',
      },
    })
    .then(({ data }) => data.hourly)

  hourlyRequests.set(cacheKey, request)
  try {
    const data = await request
    hourlyCache.set(cacheKey, { data, expiresAt: Date.now() + HOURLY_CACHE_TTL })
    return data
  } finally {
    hourlyRequests.delete(cacheKey)
  }
}

const loadHourlyWeather = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const data = await fetchHourlyWeather(props.city)

    const now = Date.now()
    const startIndex = Math.max(
      0,
      data.time.findIndex((time) => new Date(time).getTime() >= now),
    )

    hours.value = data.time.slice(startIndex, startIndex + 12).map((time, index) => ({
      time,
      label: formatHour(time),
      temperature: data.temperature_2m[startIndex + index],
      humidity: data.relative_humidity_2m[startIndex + index],
      apparentTemperature: data.apparent_temperature[startIndex + index],
      precipitationProbability: data.precipitation_probability[startIndex + index],
    }))
  } catch (error) {
    errorMessage.value = error.response?.data?.reason || '시간별 예보를 불러오지 못했습니다.'
  } finally {
    loading.value = false
  }
}

const temperatureValues = computed(() =>
  hours.value.flatMap((hour) => {
    const values = [
      convertTemperature(hour.temperature),
      convertTemperature(hour.apparentTemperature),
    ]
    return values.filter((value) => value !== null)
  }),
)

const temperatureMin = computed(() => {
  if (!temperatureValues.value.length) return 0
  return Math.floor(Math.min(...temperatureValues.value) - 2)
})

const temperatureMax = computed(() => {
  if (!temperatureValues.value.length) return 30
  return Math.ceil(Math.max(...temperatureValues.value) + 2)
})

const graphX = (index) => {
  const width = 1120
  const count = Math.max(hours.value.length, 1)
  return 40 + ((index + 0.5) / count) * width
}

const temperatureY = (value) => {
  const range = Math.max(temperatureMax.value - temperatureMin.value, 1)
  return 172 - ((value - temperatureMin.value) / range) * 125
}

const temperaturePoints = (key) =>
  hours.value
    .map((hour, index) => {
      const value = convertTemperature(hour[key])
      return value === null ? null : `${graphX(index)},${temperatureY(value)}`
    })
    .filter(Boolean)
    .join(' ')

const humidityPoints = computed(() =>
  hours.value.map((hour, index) => `${graphX(index)},${98 - (hour.humidity ?? 0) * 0.7}`).join(' '),
)

const precipitationHeight = (value) => ((value ?? 0) / 100) * 45

const handleVisibilityChange = (visible) => {
  if (!visible) emit('close')
}

onMounted(() => {
  previousHtmlOverflow = document.documentElement.style.overflow
  previousBodyOverflow = document.body.style.overflow
  document.documentElement.style.overflow = 'hidden'
  document.body.style.overflow = 'hidden'
  loadHourlyWeather()
})

onUnmounted(() => {
  document.documentElement.style.overflow = previousHtmlOverflow
  document.body.style.overflow = previousBodyOverflow
})
</script>

<template>
  <Dialog
    :visible="true"
    :header="`${city.name} 시간별 날씨`"
    modal
    dismissable-mask
    class="hourly-dialog"
    :style="{ width: 'min(820px, calc(100vw - 32px))' }"
    @update:visible="handleVisibilityChange"
  >
    <template #header>
      <div class="hourly-dialog-title">
        <p>HOURLY FORECAST · 12시간</p>
        <h2>{{ city.name }} 시간별 날씨</h2>
      </div>
    </template>

    <div v-if="loading" class="hourly-loading" aria-label="시간별 예보 불러오는 중">
      <Skeleton v-for="row in 7" :key="row" :width="row % 3 === 0 ? '72%' : '100%'" height="1rem" />
    </div>
    <Message v-else-if="errorMessage" severity="error" :closable="false">
      {{ errorMessage }}
    </Message>
    <template v-else-if="hours.length">
      <div class="chart-legend">
        <span><i class="legend-temperature"></i>기온 {{ unitSymbol }}</span>
        <span><i class="legend-apparent"></i>체감온도 {{ unitSymbol }}</span>
        <span><i class="legend-precipitation"></i>강수확률 (%)</span>
      </div>

      <div class="hourly-content-scroll">
        <svg
          class="temperature-chart"
          viewBox="0 0 1200 235"
          role="img"
          :aria-label="`${city.name} 기온과 강수확률 그래프`"
        >
          <line
            v-for="tick in 4"
            :key="tick"
            x1="40"
            :y1="22 + (tick - 1) * 42"
            x2="1160"
            :y2="22 + (tick - 1) * 42"
            class="chart-grid"
          />
          <text
            v-for="tick in 4"
            :key="`label-${tick}`"
            x="4"
            :y="27 + (tick - 1) * 42"
            class="axis-label"
          >
            {{ Math.round(temperatureMax - ((tick - 1) / 3) * (temperatureMax - temperatureMin)) }}°
          </text>
          <g v-for="(hour, index) in hours" :key="hour.time">
            <rect
              :x="graphX(index) - 7"
              :y="217 - precipitationHeight(hour.precipitationProbability)"
              width="14"
              :height="precipitationHeight(hour.precipitationProbability)"
              class="precipitation-bar"
              rx="3"
            />
            <text
              :x="graphX(index)"
              :y="Math.max(15, 217 - precipitationHeight(hour.precipitationProbability) - 5)"
              text-anchor="middle"
              class="precipitation-label"
            >
              {{ hour.precipitationProbability ?? '--' }}%
            </text>
            <text
              v-if="index % 2 === 0"
              :x="graphX(index)"
              y="232"
              text-anchor="middle"
              class="time-label"
            >
              {{ hour.label }}
            </text>
          </g>
          <polyline :points="temperaturePoints('temperature')" class="temperature-line" />
          <polyline :points="temperaturePoints('apparentTemperature')" class="apparent-line" />
          <circle
            v-for="(hour, index) in hours"
            :key="`point-${hour.time}`"
            :cx="graphX(index)"
            :cy="temperatureY(convertTemperature(hour.temperature))"
            r="3.5"
            class="temperature-point"
          >
            <title>{{ hour.label }} · {{ temperatureText(hour.temperature) }}</title>
          </circle>
        </svg>
        <div class="humidity-heading"><span>습도 추이</span><strong>상대습도</strong></div>
        <svg
          class="humidity-chart"
          viewBox="0 0 1200 120"
          role="img"
          :aria-label="`${city.name} 습도 그래프`"
        >
          <line x1="40" y1="28" x2="1160" y2="28" class="chart-grid" />
          <line x1="40" y1="63" x2="1160" y2="63" class="chart-grid" />
          <line x1="40" y1="98" x2="1160" y2="98" class="chart-grid" />
          <text x="4" y="33" class="axis-label">100%</text>
          <text x="10" y="68" class="axis-label">50%</text>
          <text x="17" y="103" class="axis-label">0%</text>
          <polyline :points="humidityPoints" class="humidity-line" />
          <circle
            v-for="(hour, index) in hours"
            :key="`humidity-${hour.time}`"
            :cx="graphX(index)"
            :cy="98 - (hour.humidity ?? 0) * 0.7"
            r="3"
            class="humidity-point"
          >
            <title>{{ hour.label }} · 습도 {{ hour.humidity ?? '--' }}%</title>
          </circle>
        </svg>
        <div class="hourly-list">
          <article v-for="hour in hours" :key="`data-${hour.time}`">
            <strong>{{ hour.label }}</strong>
            <span>기온 {{ temperatureText(hour.temperature) }}</span>
            <span>체감 {{ temperatureText(hour.apparentTemperature) }}</span>
            <span>습도 {{ hour.humidity ?? '--' }}%</span>
            <span>강수 {{ hour.precipitationProbability ?? '--' }}%</span>
          </article>
        </div>
      </div>
    </template>
    <p v-else class="empty-hourly">시간별 예보가 없습니다.</p>
  </Dialog>
</template>

<style scoped>
:global(.hourly-dialog.p-dialog) {
  max-height: min(92vh, 760px);
  overflow: hidden;
  overscroll-behavior: contain;
  color: #1e3147;
  background: linear-gradient(145deg, rgb(255 255 255 / 90%), rgb(255 255 255 / 68%));
  border: 1px solid rgb(255 255 255 / 90%);
  border-radius: 26px;
  box-shadow:
    0 30px 80px rgb(14 39 54 / 34%),
    inset 0 1px 0 rgb(255 255 255 / 96%);
  backdrop-filter: blur(34px) saturate(1.45);
}
:global(.hourly-dialog .p-dialog-header) {
  padding: 22px 24px 12px;
  background: transparent;
}
:global(.hourly-dialog .p-dialog-content) {
  min-height: 0;
  max-height: calc(min(92vh, 760px) - 76px);
  padding: 0 24px 24px;
  overflow-y: auto;
  overscroll-behavior: contain;
  background: transparent;
}
:global(.p-dialog-mask) {
  background: rgb(18 42 58 / 42%);
  backdrop-filter: blur(10px) saturate(1.1);
}
.hourly-dialog-title p {
  margin: 0;
  color: #168273;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.1em;
}
.hourly-dialog-title h2 {
  margin: 3px 0 0;
  font-size: 24px;
}
.hourly-loading {
  display: grid;
  gap: 13px;
  padding: 8px 0;
}
.chart-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin: 8px 0;
  color: #587080;
  font-size: 12px;
  font-weight: 700;
}
.chart-legend span {
  display: inline-flex;
  gap: 5px;
  align-items: center;
}
.chart-legend i {
  display: inline-block;
  width: 18px;
  height: 3px;
  border-radius: 99px;
}
.legend-temperature {
  background: #e97845;
}
.legend-apparent {
  background: #6875d7;
}
.legend-precipitation {
  width: 9px !important;
  height: 9px !important;
  background: #8ac7ed;
  border-radius: 3px !important;
}
.hourly-content-scroll {
  overflow-x: auto;
  overscroll-behavior: contain;
}
.temperature-chart,
.humidity-chart {
  display: block;
  width: 1200px;
  max-width: none;
  overflow: visible;
}
.chart-grid {
  stroke: #e7eeee;
  stroke-width: 1;
}
.axis-label,
.time-label,
.precipitation-label {
  fill: #78909c;
  font-size: 10px;
}
.precipitation-label {
  fill: #4389b2;
  font-size: 9px;
  font-weight: 700;
}
.precipitation-bar {
  fill: #a7d9f4;
  opacity: 0.75;
}
.temperature-line,
.apparent-line,
.humidity-line {
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 3;
}
.temperature-line {
  stroke: #e97845;
}
.apparent-line {
  stroke: #6875d7;
  stroke-dasharray: 5 4;
}
.humidity-line {
  stroke: #35a481;
}
.temperature-point {
  fill: #fff;
  stroke: #e97845;
  stroke-width: 2;
}
.humidity-point {
  fill: #fff;
  stroke: #35a481;
  stroke-width: 2;
}
.humidity-heading {
  display: flex;
  gap: 8px;
  align-items: baseline;
  margin: 8px 0 0 40px;
}
.humidity-heading span {
  color: #168273;
  font-size: 12px;
  font-weight: 800;
}
.humidity-heading strong {
  color: #78909c;
  font-size: 11px;
}
.hourly-list {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 0;
  width: 1120px;
  min-width: 1120px;
  margin-top: 12px;
  margin-left: 40px;
}
.hourly-list article {
  display: grid;
  gap: 4px;
  min-width: 0;
  padding: 10px 8px;
  color: #607783;
  font-size: 11px;
  background: #f4f9f8;
  border-right: 7px solid #fff;
}
.hourly-list article:last-child {
  border-right: 0;
}
.hourly-list strong {
  color: #1e3147;
  font-size: 12px;
}
.empty-hourly {
  color: #687b8e;
}
:global([data-theme='dark'] .hourly-dialog.p-dialog) {
  color: #e4f0f4;
  background: linear-gradient(145deg, rgb(31 53 67 / 96%), rgb(15 31 43 / 94%));
  border-color: rgb(111 151 169 / 44%);
}
@media (max-width: 560px) {
  :global(.hourly-dialog .p-dialog-header) {
    padding: 18px 18px 10px;
  }
  :global(.hourly-dialog .p-dialog-content) {
    padding: 0 18px 18px;
  }
  .hourly-dialog-title h2 {
    font-size: 20px;
  }
}
</style>
