<script setup>
import axios from 'axios'
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

const formatHour = (time) =>
  new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(time))

const loadHourlyWeather = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const { data } = await axios.get('https://api.open-meteo.com/v1/forecast', {
      params: {
        latitude: props.city.latitude,
        longitude: props.city.longitude,
        hourly: 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability',
        forecast_days: 2,
        timezone: 'auto',
      },
    })

    const now = Date.now()
    const startIndex = Math.max(
      0,
      data.hourly.time.findIndex((time) => new Date(time).getTime() >= now),
    )

    hours.value = data.hourly.time.slice(startIndex, startIndex + 12).map((time, index) => ({
      time,
      label: formatHour(time),
      temperature: data.hourly.temperature_2m[startIndex + index],
      humidity: data.hourly.relative_humidity_2m[startIndex + index],
      apparentTemperature: data.hourly.apparent_temperature[startIndex + index],
      precipitationProbability: data.hourly.precipitation_probability[startIndex + index],
    }))
  } catch (error) {
    errorMessage.value = error.response?.data?.reason || '시간별 예보를 불러오지 못했습니다.'
  } finally {
    loading.value = false
  }
}

const temperatureValues = computed(() =>
  hours.value.flatMap((hour) => {
    const values = [convertTemperature(hour.temperature), convertTemperature(hour.apparentTemperature)]
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
  hours.value
    .map((hour, index) => `${graphX(index)},${98 - (hour.humidity ?? 0) * 0.7}`)
    .join(' '),
)

const precipitationHeight = (value) => ((value ?? 0) / 100) * 45

let previousBodyOverflow = ''

onMounted(() => {
  previousBodyOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
  loadHourlyWeather()
})

onUnmounted(() => {
  document.body.style.overflow = previousBodyOverflow
})
</script>

<template>
  <Teleport to="body">
    <div class="hourly-modal-backdrop" role="presentation" @click.self="emit('close')">
      <section
        class="hourly-modal"
        role="dialog"
        aria-modal="true"
        :aria-label="`${city.name} 시간별 날씨`"
      >
        <header class="hourly-modal-header">
          <div>
            <p>HOURLY FORECAST · 12시간</p>
            <h2>{{ city.name }} 시간별 날씨</h2>
          </div>
          <button type="button" aria-label="시간별 예보 닫기" @click="emit('close')">×</button>
        </header>

        <el-skeleton v-if="loading" :rows="7" animated />
        <el-alert v-else-if="errorMessage" :title="errorMessage" type="error" :closable="false" />
        <template v-else-if="hours.length">
          <div class="chart-legend">
            <span><i class="legend-temperature"></i>기온 {{ unitSymbol }}</span>
            <span><i class="legend-apparent"></i>체감온도 {{ unitSymbol }}</span>
            <span><i class="legend-precipitation"></i>강수확률 (%)</span>
          </div>

          <div class="hourly-content-scroll">
            <svg class="temperature-chart" viewBox="0 0 1200 235" role="img" :aria-label="`${city.name} 기온과 강수확률 그래프`">
              <line v-for="tick in 4" :key="tick" x1="40" :y1="22 + (tick - 1) * 42" x2="1160" :y2="22 + (tick - 1) * 42" class="chart-grid" />
              <text v-for="tick in 4" :key="`label-${tick}`" x="4" :y="27 + (tick - 1) * 42" class="axis-label">
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
                <text :x="graphX(index)" :y="Math.max(15, 217 - precipitationHeight(hour.precipitationProbability) - 5)" text-anchor="middle" class="precipitation-label">
                  {{ hour.precipitationProbability ?? '--' }}%
                </text>
                <text v-if="index % 2 === 0" :x="graphX(index)" y="232" text-anchor="middle" class="time-label">{{ hour.label }}</text>
              </g>
              <polyline :points="temperaturePoints('temperature')" class="temperature-line" />
              <polyline :points="temperaturePoints('apparentTemperature')" class="apparent-line" />
              <circle v-for="(hour, index) in hours" :key="`point-${hour.time}`" :cx="graphX(index)" :cy="temperatureY(convertTemperature(hour.temperature))" r="3.5" class="temperature-point">
                <title>{{ hour.label }} · {{ temperatureText(hour.temperature) }}</title>
              </circle>
            </svg>
            <div class="humidity-heading"><span>습도 추이</span><strong>상대습도</strong></div>
            <svg class="humidity-chart" viewBox="0 0 1200 120" role="img" :aria-label="`${city.name} 습도 그래프`">
              <line x1="40" y1="28" x2="1160" y2="28" class="chart-grid" />
              <line x1="40" y1="63" x2="1160" y2="63" class="chart-grid" />
              <line x1="40" y1="98" x2="1160" y2="98" class="chart-grid" />
              <text x="4" y="33" class="axis-label">100%</text>
              <text x="10" y="68" class="axis-label">50%</text>
              <text x="17" y="103" class="axis-label">0%</text>
              <polyline :points="humidityPoints" class="humidity-line" />
              <circle v-for="(hour, index) in hours" :key="`humidity-${hour.time}`" :cx="graphX(index)" :cy="98 - (hour.humidity ?? 0) * 0.7" r="3" class="humidity-point">
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
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.hourly-modal-backdrop { position: fixed; z-index: 1100; inset: 0; display: grid; place-items: center; overflow: hidden; padding: 20px; background: rgb(18 42 58 / 48%); backdrop-filter: blur(4px); }
.hourly-modal { width: min(100%, 820px); max-height: min(92vh, 760px); overflow: auto; overscroll-behavior: contain; padding: 24px; color: #1e3147; background: #fff; border: 1px solid #d8e9e5; border-radius: 18px; box-shadow: 0 24px 60px rgb(14 39 54 / 28%); }
.hourly-modal-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 16px; }
.hourly-modal-header p { margin: 0; color: #168273; font-size: 11px; font-weight: 800; letter-spacing: .1em; }
.hourly-modal-header h2 { margin: 3px 0 0; font-size: 24px; }
.hourly-modal-header button { display: grid; width: 30px; height: 30px; place-items: center; color: #426174; font-size: 22px; cursor: pointer; background: #f1f6f5; border: 0; border-radius: 50%; }
.chart-legend { display: flex; flex-wrap: wrap; gap: 12px; margin: 8px 0; color: #587080; font-size: 12px; font-weight: 700; }
.chart-legend span { display: inline-flex; gap: 5px; align-items: center; }
.chart-legend i { display: inline-block; width: 18px; height: 3px; border-radius: 99px; }
.legend-temperature { background: #e97845; }.legend-apparent { background: #6875d7; }.legend-precipitation { width: 9px !important; height: 9px !important; background: #8ac7ed; border-radius: 3px !important; }
.hourly-content-scroll { overflow-x: auto; }
.temperature-chart, .humidity-chart { display: block; width: 1200px; max-width: none; overflow: visible; }
.chart-grid { stroke: #e7eeee; stroke-width: 1; }.axis-label, .time-label, .precipitation-label { fill: #78909c; font-size: 10px; }.precipitation-label { fill: #4389b2; font-size: 9px; font-weight: 700; }.precipitation-bar { fill: #a7d9f4; opacity: .75; }.temperature-line, .apparent-line, .humidity-line { fill: none; stroke-linecap: round; stroke-linejoin: round; stroke-width: 3; }.temperature-line { stroke: #e97845; }.apparent-line { stroke: #6875d7; stroke-dasharray: 5 4; }.humidity-line { stroke: #35a481; }.temperature-point { fill: #fff; stroke: #e97845; stroke-width: 2; }.humidity-point { fill: #fff; stroke: #35a481; stroke-width: 2; }
.humidity-heading { display: flex; gap: 8px; align-items: baseline; margin: 8px 0 0 40px; }.humidity-heading span { color: #168273; font-size: 12px; font-weight: 800; }.humidity-heading strong { color: #78909c; font-size: 11px; }
.hourly-list { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: 0; width: 1120px; min-width: 1120px; margin-top: 12px; margin-left: 40px; }.hourly-list article { display: grid; gap: 4px; min-width: 0; padding: 10px 8px; color: #607783; font-size: 11px; background: #f4f9f8; border-right: 7px solid #fff; }.hourly-list article:last-child { border-right: 0; }.hourly-list strong { color: #1e3147; font-size: 12px; }.empty-hourly { color: #687b8e; }
@media (max-width: 560px) { .hourly-modal { padding: 18px; }.hourly-modal-header h2 { font-size: 20px; } }
</style>
