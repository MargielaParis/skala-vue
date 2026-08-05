<script setup>
import axios from 'axios'
import { computed, onMounted, onUnmounted, ref, watch, watchEffect } from 'vue'
import municipalitiesGeo from '../../../data/municipalities-geo-simple.json'
import provincesGeo from '../../../data/provinces-geo-simple.json'
import { weatherCities } from '../../../data/weatherCities'
import { useTemperature } from '../../../composables/useTemperature'
import { dashboardWeatherCache } from '../../../utils/dashboardWeatherCache'
import { weatherStatus, weatherIconUrl } from '../../../utils/weatherFormat'
import BaseDashboardCard from './BaseDashboardCard.vue'
import SearchBar from './SearchBar.vue'
import WeatherCard from './WeatherCard.vue'
import WeatherForecast from './WeatherForecast.vue'
import HourlyWeatherModal from './HourlyWeatherModal.vue'

const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY
const windyEmbedUrl =
  'https://embed.windy.com/embed2.html?lat=36.3&lon=127.8&zoom=6&level=surface&overlay=rain&product=ecmwf&menu=&message=&marker=false&forecast=12&calendar=&pressure=&type=map&location=coordinates&detail=&metricRain=default&metricWind=default&metricTemp=default&radarRange=-1&lang=ko'
const windyFrameKey = ref(0)
const { temperatureText, unitSymbol, convertTemperature } = useTemperature()

const defaultCityIds = new Set([...weatherCities.map((city) => city.id), 'my-location'])

const createWeatherEntry = (city) => ({
  ...city,
  temp: null,
  status: '조회 중',
  icon: '',
  humidity: null,
  feelsLike: null,
  windSpeed: null,
  pm10: null,
  pm25: null,
  ozone: null,
  sunrise: '--:--',
  sunset: '--:--',
})

const weatherList = ref(weatherCities.map(createWeatherEntry))

const provinceOptions = [
  { id: 'seoul', label: '서울특별시', svgId: 'seoul', codePrefix: '11' },
  { id: 'incheon', label: '인천광역시', svgId: 'incheon', codePrefix: '23' },
  { id: 'gyeonggi', label: '경기도', svgId: 'gyeonggi', codePrefix: '31' },
  { id: 'gangwon', label: '강원특별자치도', svgId: 'gangwon', codePrefix: '32' },
  { id: 'chungbuk', label: '충청북도', svgId: 'chungbuk', codePrefix: '33' },
  { id: 'chungnam', label: '충청남도', svgId: 'chungnam', codePrefix: '34' },
  { id: 'daejeon', label: '대전광역시', svgId: 'daejeon', codePrefix: '25' },
  { id: 'sejong', label: '세종특별자치시', svgId: 'sejong', codePrefix: '29' },
  { id: 'jeonbuk', label: '전북특별자치도', svgId: 'jeonbuk', codePrefix: '35' },
  { id: 'gwangju', label: '광주광역시', svgId: 'gwangju', codePrefix: '24' },
  { id: 'jeonnam', label: '전라남도', svgId: 'jeonnam', codePrefix: '36' },
  { id: 'gyeongnam', label: '경상남도', svgId: 'gyeongnam', codePrefix: '38' },
  { id: 'daegu', label: '대구광역시', svgId: 'daegu', codePrefix: '22' },
  { id: 'gyeongbuk', label: '경상북도', svgId: 'gyeongbuk', codePrefix: '37' },
  { id: 'ulsan', label: '울산광역시', svgId: 'ulsan', codePrefix: '26' },
  { id: 'busan', label: '부산광역시', svgId: 'busan', codePrefix: '21' },
  { id: 'jeju', label: '제주특별자치도', svgId: 'jeju', codePrefix: '39' },
]

const searchQuery = ref('')
const selectedCityId = ref('')
const selectedProvinceId = ref('')
const mapViewBox = ref({ x: 0, y: 0, width: 800, height: 1200 })
const mapAnimating = ref(false)
const municipalityLayerVisible = ref(false)
const selectedMunicipalityCode = ref('')
const municipalityRequestId = ref(0)
const favoriteCityIds = ref([])
const draggedFavoriteId = ref('')
const showFavoritesOnly = ref(false)
const detailCity = ref(null)
const sortBy = ref('temp')
const sortDirection = ref('desc')
const loading = ref(false)
const errorMessage = ref('')
const updatedAt = ref('')
const forecasts = ref([])
const forecastLoading = ref(false)
const forecastErrorMessage = ref('')
const locationLoading = ref(false)
const locationError = ref('')
const heatmapTemperatures = ref({})
const heatmapLoading = ref(false)
const heatmapError = ref('')

let mapAnimationFrameId = null
let forecastRequestId = 0

const WEATHER_CACHE_TTL = 5 * 60 * 1000
const weatherCache = dashboardWeatherCache.weather
const weatherRequests = dashboardWeatherCache.weatherRequests
const forecastCache = dashboardWeatherCache.forecasts
const forecastRequests = dashboardWeatherCache.forecastRequests
const municipalityGeocodeCache = dashboardWeatherCache.municipalityGeocodes
const heatmapTemperatureCache = dashboardWeatherCache.heatmap
const HEATMAP_CACHE_STORAGE_KEY = 'skala-weather-heatmap-cache'
const HEATMAP_CACHE_TTL = 30 * 60 * 1000
const HEATMAP_ANCHOR_GRID_SIZE = 6

const DEFAULT_LOCATION = {
  id: 'my-location',
  name: '성남시 분당구',
  provinceId: 'gyeonggi',
  provinceName: '경기도',
  districtType: '구',
  latitude: 37.3826,
  longitude: 127.1189,
}

const selectedProvince = computed(() =>
  provinceOptions.find((province) => province.id === selectedProvinceId.value),
)

const municipalityFeatures = computed(() => {
  const prefix = selectedProvince.value?.codePrefix
  if (!prefix) return []
  return municipalitiesGeo.features
    .filter((feature) => String(feature.properties.code).startsWith(prefix))
    .sort((a, b) => a.properties.name.localeCompare(b.properties.name, 'ko'))
})

const normalizeSearchText = (value) =>
  String(value ?? '')
    .replace(/\s+/g, '')
    .toLocaleLowerCase()

const sameWeatherName = (first, second) =>
  normalizeSearchText(first?.name) === normalizeSearchText(second?.name)

const municipalitySearchResults = computed(() => {
  const keyword = searchQuery.value.trim()
  const normalizedKeyword = normalizeSearchText(keyword)
  if (!normalizedKeyword) return []
  const seenMunicipalityNames = new Set()
  return municipalitiesGeo.features
    .map((feature) => ({
      feature,
      province: provinceOptions.find(
        (province) => province.codePrefix === String(feature.properties.code).slice(0, 2),
      ),
    }))
    .filter(
      ({ feature, province }) =>
        normalizeSearchText(feature.properties.name).includes(normalizedKeyword) ||
        normalizeSearchText(province?.label).includes(normalizedKeyword),
    )
    .filter(({ feature }) => {
      const normalizedName = normalizeSearchText(feature.properties.name)
      if (seenMunicipalityNames.has(normalizedName)) {
        return false
      }
      seenMunicipalityNames.add(normalizedName)
      return true
    })
    .sort((first, second) => {
      const firstExact = normalizeSearchText(first.feature.properties.name).startsWith(
        normalizedKeyword,
      )
        ? 0
        : 1
      const secondExact = normalizeSearchText(second.feature.properties.name).startsWith(
        normalizedKeyword,
      )
        ? 0
        : 1
      return (
        firstExact - secondExact ||
        first.feature.properties.name.localeCompare(second.feature.properties.name, 'ko')
      )
    })
    .slice(0, 8)
})

const favoriteWeatherList = computed(() =>
  favoriteCityIds.value
    .map((id) => weatherList.value.find((weather) => weather.id === id))
    .filter(Boolean),
)

const collectCoordinates = (items, coordinates) => {
  if (!Array.isArray(items) || !items.length) return
  if (typeof items[0] === 'number') {
    coordinates.push(items)
    return
  }
  items.forEach((item) => collectCoordinates(item, coordinates))
}

const MAP_CANVAS = { x: 0, y: 0, width: 800, height: 1200 }

const allMapCoordinates = []
municipalitiesGeo.features.forEach((feature) =>
  collectCoordinates(feature.geometry.coordinates, allMapCoordinates),
)
const allLongitudes = allMapCoordinates.map(([longitude]) => longitude)
const allLatitudes = allMapCoordinates.map(([, latitude]) => latitude)
const mapMinLongitude = Math.min(...allLongitudes)
const mapMaxLongitude = Math.max(...allLongitudes)
const mapMinLatitude = Math.min(...allLatitudes)
const mapMaxLatitude = Math.max(...allLatitudes)
const mapLongitudeScale = Math.cos((((mapMinLatitude + mapMaxLatitude) / 2) * Math.PI) / 180)
const mapLongitudeRange = (mapMaxLongitude - mapMinLongitude) * mapLongitudeScale
const mapLatitudeRange = mapMaxLatitude - mapMinLatitude
const mapProjectionScale = Math.min(720 / mapLongitudeRange, 1120 / mapLatitudeRange)
const mapOffsetX = (MAP_CANVAS.width - mapLongitudeRange * mapProjectionScale) / 2
const mapOffsetY = (MAP_CANVAS.height - mapLatitudeRange * mapProjectionScale) / 2

const projectMapCoordinate = ([longitude, latitude]) => [
  mapOffsetX + (longitude - mapMinLongitude) * mapLongitudeScale * mapProjectionScale,
  mapOffsetY + (mapMaxLatitude - latitude) * mapProjectionScale,
]

const nationalProjectedCoordinates = allMapCoordinates.map(projectMapCoordinate)
const nationalXValues = nationalProjectedCoordinates.map(([x]) => x)
const nationalYValues = nationalProjectedCoordinates.map(([, y]) => y)
const nationalPaddingX = (Math.max(...nationalXValues) - Math.min(...nationalXValues)) * 0.03
const nationalPaddingY = (Math.max(...nationalYValues) - Math.min(...nationalYValues)) * 0.03
const NATIONAL_VIEW_BOX = {
  x: Math.min(...nationalXValues) - nationalPaddingX,
  y: Math.min(...nationalYValues) - nationalPaddingY,
  width: Math.max(...nationalXValues) - Math.min(...nationalXValues) + nationalPaddingX * 2,
  height: Math.max(...nationalYValues) - Math.min(...nationalYValues) + nationalPaddingY * 2,
}
mapViewBox.value = { ...NATIONAL_VIEW_BOX }

const mapRingPath = (ring) =>
  ring
    .map((coordinate, index) => {
      const [x, y] = projectMapCoordinate(coordinate)
      return `${index === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`
    })
    .join(' ') + ' Z'

const mapGeometryPath = (geometry) => {
  if (geometry.type === 'Polygon') return geometry.coordinates.map(mapRingPath).join(' ')
  return geometry.coordinates.map((polygon) => polygon.map(mapRingPath).join(' ')).join(' ')
}

const provincePaths = provincesGeo.features
  .map((feature) => {
    const province = provinceOptions.find(
      (option) => option.codePrefix === String(feature.properties.code),
    )
    if (!province) return null
    return { ...province, feature, path: mapGeometryPath(feature.geometry) }
  })
  .filter(Boolean)

const municipalityPaths = computed(() =>
  municipalityFeatures.value.map((feature) => ({
    feature,
    code: feature.properties.code,
    name: feature.properties.name,
    path: mapGeometryPath(feature.geometry),
  })),
)

const mapViewBoxText = computed(
  () =>
    `${mapViewBox.value.x.toFixed(2)} ${mapViewBox.value.y.toFixed(2)} ${mapViewBox.value.width.toFixed(2)} ${mapViewBox.value.height.toFixed(2)}`,
)

const projectedFeatureBounds = (feature) => {
  const coordinates = []
  collectCoordinates(feature.geometry.coordinates, coordinates)
  const projected = coordinates.map(projectMapCoordinate)
  const xValues = projected.map(([x]) => x)
  const yValues = projected.map(([, y]) => y)
  return {
    minX: Math.min(...xValues),
    maxX: Math.max(...xValues),
    minY: Math.min(...yValues),
    maxY: Math.max(...yValues),
  }
}

const provinceViewBox = (feature) => {
  const { minX, maxX, minY, maxY } = projectedFeatureBounds(feature)
  const centerX = (minX + maxX) / 2
  const centerY = (minY + maxY) / 2
  const width = (maxX - minX) * 1.08
  const height = (maxY - minY) * 1.08
  return { x: centerX - width / 2, y: centerY - height / 2, width, height }
}

const mapStyle = computed(() => ({
  aspectRatio: `${mapViewBox.value.width} / ${mapViewBox.value.height}`,
}))

const easeInOutCubic = (value) =>
  value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2

const animateMapViewBox = (target, onComplete) => {
  cancelAnimationFrame(mapAnimationFrameId)
  const start = { ...mapViewBox.value }
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const duration = reduceMotion ? 0 : 900
  const startedAt = performance.now()
  mapAnimating.value = true

  const update = (now) => {
    const progress = duration === 0 ? 1 : Math.min((now - startedAt) / duration, 1)
    const eased = easeInOutCubic(progress)
    mapViewBox.value = {
      x: start.x + (target.x - start.x) * eased,
      y: start.y + (target.y - start.y) * eased,
      width: start.width + (target.width - start.width) * eased,
      height: start.height + (target.height - start.height) * eased,
    }
    if (progress < 1) {
      mapAnimationFrameId = requestAnimationFrame(update)
      return
    }
    mapAnimating.value = false
    mapAnimationFrameId = null
    onComplete?.()
  }

  mapAnimationFrameId = requestAnimationFrame(update)
}

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

  return `도시: ${selectedCity.value.name}, 기온: ${temperatureText(selectedCity.value.temp)}, 상태: ${selectedCity.value.status}`
})

const selectedStatusClass = computed(() => {
  if (selectedCity.value?.temp === null || selectedCity.value?.temp === undefined) {
    return ''
  }

  return selectedCity.value.temp >= 26 ? 'status-hot' : 'status-cool'
})

const filteredWeatherList = computed(() => {
  const keyword = searchQuery.value.trim()
  const normalizedKeyword = normalizeSearchText(keyword)
  const regionList = selectedProvinceId.value
    ? weatherList.value.filter(
        (weather) =>
          weather.provinceId === selectedProvinceId.value ||
          favoriteCityIds.value.includes(weather.id),
      )
    : weatherList.value
  const favoriteList = showFavoritesOnly.value
    ? regionList.filter((weather) => favoriteCityIds.value.includes(weather.id))
    : regionList

  if (!normalizedKeyword) return favoriteList

  return favoriteList.filter((weather) => {
    if (!showFavoritesOnly.value && weather.id === selectedCityId.value) return true
    return (
      normalizeSearchText(weather.name).includes(normalizedKeyword) ||
      normalizeSearchText(weather.status).includes(normalizedKeyword)
    )
  })
})

const sortedWeatherList = computed(() => {
  const toSortValue = (weather) => {
    const value = weather[sortBy.value]
    if (value === null || value === undefined || value === '') return null
    if (sortBy.value === 'sunrise' || sortBy.value === 'sunset') {
      const [hour, minute] = value.split(':').map(Number)
      return hour * 60 + minute
    }
    return value
  }

  return [...filteredWeatherList.value].sort((a, b) => {
    const first = toSortValue(a)
    const second = toSortValue(b)
    if (first === null && second === null) return 0
    if (first === null) return 1
    if (second === null) return -1
    const result = first - second
    return sortDirection.value === 'asc' ? result : -result
  })
})

const weatherSummary = computed(() => {
  const available = weatherList.value.filter((weather) => weather.temp !== null)
  if (!available.length) return []

  return [
    {
      label: '최고 기온',
      city: [...available].sort((a, b) => b.temp - a.temp)[0],
      unit: unitSymbol.value,
      valueKey: 'temp',
    },
    {
      label: '습도 최고',
      city: [...available].sort((a, b) => b.humidity - a.humidity)[0],
      unit: '%',
      valueKey: 'humidity',
    },
    {
      label: '풍속 최고',
      city: [...available].sort((a, b) => b.windSpeed - a.windSpeed)[0],
      unit: ' m/s',
      valueKey: 'windSpeed',
    },
  ]
})

const weatherAlerts = computed(() => {
  const available = weatherList.value.filter((weather) => weather.temp !== null)
  if (!available.length) return []

  const alerts = []
  const hotCity = [...available].sort((first, second) => second.temp - first.temp)[0]
  const coldCity = [...available].sort((first, second) => first.temp - second.temp)[0]
  const rainCities = available.filter((weather) =>
    ['비', '이슬비', '뇌우', '눈'].includes(weather.status),
  )
  const airCity = [...available]
    .filter((weather) => weather.pm25 !== null || weather.pm10 !== null)
    .sort((first, second) => (second.pm25 ?? second.pm10) - (first.pm25 ?? first.pm10))[0]
  const windCity = [...available].sort(
    (first, second) => (second.windSpeed ?? -1) - (first.windSpeed ?? -1),
  )[0]

  if (hotCity.temp >= 30) {
    alerts.push({
      type: 'hot',
      title: '더위 주의',
      message: `${hotCity.name} ${temperatureText(hotCity.temp)} · 야외 활동 시 수분을 챙기세요.`,
    })
  }
  if (coldCity.temp <= 0) {
    alerts.push({
      type: 'cold',
      title: '추위 주의',
      message: `${coldCity.name} ${temperatureText(coldCity.temp)} · 방한에 유의하세요.`,
    })
  }
  if (rainCities.length) {
    alerts.push({
      type: 'rain',
      title: '강수 지역',
      message: `${rainCities
        .slice(0, 3)
        .map((city) => city.name)
        .join(
          ', ',
        )}${rainCities.length > 3 ? ` 외 ${rainCities.length - 3}곳` : ''}에 ${rainCities[0].status}가 예상됩니다.`,
    })
  }
  if (airCity && ((airCity.pm25 ?? 0) >= 36 || (airCity.pm10 ?? 0) >= 81)) {
    alerts.push({
      type: 'air',
      title: '대기질 주의',
      message: `${airCity.name} 미세먼지 수치가 높습니다. 외출 시 대기질을 확인하세요.`,
    })
  }
  if (windCity?.windSpeed >= 14) {
    alerts.push({
      type: 'wind',
      title: '강풍 주의',
      message: `${windCity.name} 풍속 ${windCity.windSpeed} m/s · 시설물과 이동에 유의하세요.`,
    })
  }

  return alerts.length
    ? alerts.slice(0, 4)
    : [
        {
          type: 'normal',
          title: '현재 특이사항 없음',
          message: '조회된 지역의 기상 상태가 안정적입니다.',
        },
      ]
})

const provinceTemperature = (provinceId) => {
  const province = provinceOptions.find((item) => item.id === provinceId)
  const values = municipalitiesGeo.features
    .filter((feature) => String(feature.properties.code).startsWith(province?.codePrefix || ''))
    .map((feature) => heatmapTemperatures.value[feature.properties.code])
    .filter((temperature) => Number.isFinite(temperature))
  if (!values.length) {
    const fallbackValues = weatherList.value
      .filter((weather) => weather.provinceId === provinceId && weather.temp !== null)
      .map((weather) => weather.temp)
    if (!fallbackValues.length) return null
    return Math.round(fallbackValues.reduce((sum, value) => sum + value, 0) / fallbackValues.length)
  }
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
}

const municipalityTemperature = (code) => {
  const heatmapTemperature = heatmapTemperatures.value[code]
  if (Number.isFinite(heatmapTemperature)) return Math.round(heatmapTemperature)

  return (
    weatherList.value.find(
      (weather) => weather.id === `municipality-${code}` && weather.temp !== null,
    )?.temp ?? null
  )
}

const temperatureHeatmapStyle = (temperature) => {
  if (temperature === null || temperature === undefined) return {}
  const ratio = Math.min(1, Math.max(0, (temperature + 10) / 45))
  const hue = 215 - ratio * 215
  return { '--temperature-fill': `hsl(${hue} 76% 76%)` }
}

const formatSunTime = (timestamp, timezoneOffset) => {
  if (!timestamp) return '--:--'
  return new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  }).format(new Date((timestamp + timezoneOffset) * 1000))
}

const selectCity = (weather) => {
  if (selectedCityId.value === weather.id) {
    clearSelectedCity()
    return
  }

  selectedCityId.value = weather.id
  loadForecast(weather)
}

const clearSelectedCity = ({ resetProvince = true } = {}) => {
  const keepMunicipalitySearch =
    searchQuery.value.trim().length > 0 && municipalitySearchResults.value.length > 0
  municipalityRequestId.value += 1
  weatherList.value = weatherList.value.filter(
    (weather) => defaultCityIds.has(weather.id) || favoriteCityIds.value.includes(weather.id),
  )
  if (!keepMunicipalitySearch) searchQuery.value = ''
  selectedCityId.value = ''
  if (resetProvince) {
    selectedProvinceId.value = ''
    municipalityLayerVisible.value = false
    animateMapViewBox(NATIONAL_VIEW_BOX)
  }
  selectedMunicipalityCode.value = ''
  forecastRequestId += 1
  forecastLoading.value = false
  forecasts.value = []
  forecastErrorMessage.value = ''
  detailCity.value = null
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur()
  }
}

const selectProvince = (provinceId) => {
  const alreadyZoomedToProvince =
    provinceId &&
    selectedProvinceId.value === provinceId &&
    municipalityLayerVisible.value &&
    !mapAnimating.value
  selectedProvinceId.value = provinceId
  clearSelectedCity({ resetProvince: false })

  if (alreadyZoomedToProvince) return

  municipalityLayerVisible.value = false

  if (!provinceId) {
    animateMapViewBox(NATIONAL_VIEW_BOX)
    return
  }

  const province = provincePaths.find((item) => item.id === provinceId)
  if (!province) return
  animateMapViewBox(provinceViewBox(province.feature), () => {
    if (selectedProvinceId.value === provinceId) municipalityLayerVisible.value = true
  })
}

const selectSearchMunicipality = (result) => {
  if (!result.province) return
  const code = result.feature.properties.code
  if (selectedMunicipalityCode.value === code) {
    clearSelectedCity()
    return
  }
  selectProvince(result.province.id)
  selectMunicipalityByCode(code)
}

const districtType = (name) => {
  if (name.endsWith('군')) return '군'
  if (name.endsWith('구')) return '구'
  return '시'
}

const pointInRing = ([longitude, latitude], ring) => {
  let inside = false

  for (let index = 0, previous = ring.length - 1; index < ring.length; previous = index++) {
    const [currentLongitude, currentLatitude] = ring[index]
    const [previousLongitude, previousLatitude] = ring[previous]
    const intersects =
      currentLatitude > latitude !== previousLatitude > latitude &&
      longitude <
        ((previousLongitude - currentLongitude) * (latitude - currentLatitude)) /
          (previousLatitude - currentLatitude) +
          currentLongitude

    if (intersects) inside = !inside
  }

  return inside
}

const pointInFeature = (point, feature) => {
  const polygons =
    feature.geometry.type === 'Polygon'
      ? [feature.geometry.coordinates]
      : feature.geometry.coordinates

  return polygons.some(
    (polygon) =>
      pointInRing(point, polygon[0]) && !polygon.slice(1).some((hole) => pointInRing(point, hole)),
  )
}

const findLocationRegion = (latitude, longitude) => {
  const feature = municipalitiesGeo.features.find((item) =>
    pointInFeature([longitude, latitude], item),
  )
  if (!feature) return null

  const code = String(feature.properties.code)
  const province = provinceOptions.find((item) => item.codePrefix === code.slice(0, 2))
  return {
    name: feature.properties.name,
    provinceId: province?.id || '',
    provinceName: province?.label || '',
  }
}

const getFeatureCentroid = (feature) => {
  const coordinates = []
  collectCoordinates(feature.geometry.coordinates, coordinates)
  if (!coordinates.length) return null
  const [longitude, latitude] = coordinates.reduce(
    ([longitudeSum, latitudeSum], [longitude, latitude]) => [
      longitudeSum + longitude,
      latitudeSum + latitude,
    ],
    [0, 0],
  )
  return {
    longitude: longitude / coordinates.length,
    latitude: latitude / coordinates.length,
  }
}

const restoreHeatmapTemperatureCache = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(HEATMAP_CACHE_STORAGE_KEY) || 'null')
    if (!stored || stored.expiresAt <= Date.now() || !stored.data) {
      localStorage.removeItem(HEATMAP_CACHE_STORAGE_KEY)
      return false
    }

    heatmapTemperatureCache.data = stored.data
    heatmapTemperatureCache.expiresAt = stored.expiresAt
    heatmapTemperatures.value = stored.data
    return true
  } catch {
    return false
  }
}

const coordinateDistance = (first, second) =>
  Math.hypot((first.latitude - second.latitude) * 111, (first.longitude - second.longitude) * 88)

const selectHeatmapAnchors = (locations) => {
  const latitudes = locations.map(({ centroid }) => centroid.latitude)
  const longitudes = locations.map(({ centroid }) => centroid.longitude)
  const minLatitude = Math.min(...latitudes)
  const maxLatitude = Math.max(...latitudes)
  const minLongitude = Math.min(...longitudes)
  const maxLongitude = Math.max(...longitudes)
  const latitudeRange = Math.max(maxLatitude - minLatitude, 0.001)
  const longitudeRange = Math.max(maxLongitude - minLongitude, 0.001)
  const cells = new Map()

  locations.forEach((location) => {
    const row = Math.min(
      HEATMAP_ANCHOR_GRID_SIZE - 1,
      Math.floor(
        ((location.centroid.latitude - minLatitude) / latitudeRange) * HEATMAP_ANCHOR_GRID_SIZE,
      ),
    )
    const column = Math.min(
      HEATMAP_ANCHOR_GRID_SIZE - 1,
      Math.floor(
        ((location.centroid.longitude - minLongitude) / longitudeRange) * HEATMAP_ANCHOR_GRID_SIZE,
      ),
    )
    const cellCenter = {
      latitude: minLatitude + ((row + 0.5) / HEATMAP_ANCHOR_GRID_SIZE) * latitudeRange,
      longitude: minLongitude + ((column + 0.5) / HEATMAP_ANCHOR_GRID_SIZE) * longitudeRange,
    }
    const cellKey = `${row}-${column}`
    const current = cells.get(cellKey)
    if (!current || coordinateDistance(location.centroid, cellCenter) < current.distance) {
      cells.set(cellKey, { location, distance: coordinateDistance(location.centroid, cellCenter) })
    }
  })

  return [...cells.values()].map(({ location }) => location)
}

const interpolateHeatmapTemperatures = (locations, anchors, responses) => {
  const anchorTemperatures = anchors
    .map((anchor, index) => ({
      ...anchor,
      temperature: responses[index]?.current?.temperature_2m ?? null,
    }))
    .filter(({ temperature }) => temperature !== null)

  return Object.fromEntries(
    locations.map((location) => {
      const exactTemperature = anchorTemperatures.find((anchor) => anchor.code === location.code)
      if (exactTemperature) return [location.code, exactTemperature.temperature]

      const nearest = anchorTemperatures
        .map((anchor) => ({
          temperature: anchor.temperature,
          distance: coordinateDistance(location.centroid, anchor.centroid),
        }))
        .sort((first, second) => first.distance - second.distance)
        .slice(0, 4)

      if (!nearest.length) return [location.code, null]
      const weighted = nearest.reduce(
        (result, anchor) => {
          const weight = 1 / Math.max(anchor.distance, 0.1) ** 2
          return {
            temperature: result.temperature + anchor.temperature * weight,
            weight: result.weight + weight,
          }
        },
        { temperature: 0, weight: 0 },
      )
      return [location.code, weighted.temperature / weighted.weight]
    }),
  )
}

const loadHeatmapTemperatures = async ({ force = false } = {}) => {
  if (heatmapLoading.value) return
  if (!force && heatmapTemperatureCache.data && heatmapTemperatureCache.expiresAt > Date.now()) {
    heatmapTemperatures.value = heatmapTemperatureCache.data
    return
  }
  if (!force && restoreHeatmapTemperatureCache()) return
  if (heatmapTemperatureCache.request) {
    try {
      heatmapTemperatures.value = await heatmapTemperatureCache.request
    } catch (error) {
      heatmapError.value = error.response?.data?.reason || '전국 기온 데이터를 불러오지 못했습니다.'
    }
    return
  }

  const locations = municipalitiesGeo.features
    .map((feature) => ({
      code: feature.properties.code,
      centroid: getFeatureCentroid(feature),
    }))
    .filter((location) => location.centroid)
  const anchors = selectHeatmapAnchors(locations)

  heatmapLoading.value = true
  heatmapError.value = ''
  heatmapTemperatureCache.request = axios
    .get('https://api.open-meteo.com/v1/forecast', {
      params: {
        latitude: anchors.map((location) => location.centroid.latitude.toFixed(4)).join(','),
        longitude: anchors.map((location) => location.centroid.longitude.toFixed(4)).join(','),
        current: 'temperature_2m',
        temperature_unit: 'celsius',
        timezone: 'Asia/Seoul',
      },
    })
    .then(({ data }) => {
      const responses = Array.isArray(data) ? data : [data]
      return interpolateHeatmapTemperatures(locations, anchors, responses)
    })

  try {
    const data = await heatmapTemperatureCache.request
    heatmapTemperatures.value = data
    heatmapTemperatureCache.data = data
    heatmapTemperatureCache.expiresAt = Date.now() + HEATMAP_CACHE_TTL
    localStorage.setItem(
      HEATMAP_CACHE_STORAGE_KEY,
      JSON.stringify({ data, expiresAt: heatmapTemperatureCache.expiresAt }),
    )
  } catch (error) {
    heatmapError.value = error.response?.data?.reason || '전국 기온 데이터를 불러오지 못했습니다.'
  } finally {
    heatmapTemperatureCache.request = null
    heatmapLoading.value = false
  }
}

const selectMunicipalityByCode = async (code) => {
  const requestId = ++municipalityRequestId.value
  selectedMunicipalityCode.value = code
  const feature = municipalityFeatures.value.find((item) => item.properties.code === code)
  if (!feature) {
    clearSelectedCity()
    return
  }

  const province = selectedProvince.value
  const cityId = `municipality-${feature.properties.code}`
  const existingWeather = weatherList.value.find((item) =>
    sameWeatherName(item, feature.properties),
  )
  if (existingWeather) {
    weatherList.value = weatherList.value.filter(
      (item) => item.id === existingWeather.id || !sameWeatherName(item, existingWeather),
    )
    selectedCityId.value = existingWeather.id
    loadForecast(existingWeather)
    return
  }
  const favorite = weatherList.value.find((item) => item.id === cityId && isFavorite(item.id))
  weatherList.value = weatherList.value.filter(
    (item) => defaultCityIds.has(item.id) || favoriteCityIds.value.includes(item.id),
  )
  selectedCityId.value = ''
  forecastRequestId += 1
  forecastLoading.value = false
  forecasts.value = []
  forecastErrorMessage.value = ''
  errorMessage.value = ''

  if (favorite) {
    selectedCityId.value = favorite.id
    loadForecast(favorite)
    return
  }

  loading.value = true
  try {
    const cacheKey = feature.properties.name
    let results = municipalityGeocodeCache.get(cacheKey)
    if (!results) {
      const { data } = await axios.get('https://geocoding-api.open-meteo.com/v1/search', {
        params: { name: cacheKey, count: 10, language: 'ko', format: 'json' },
      })
      if (requestId !== municipalityRequestId.value) return
      results = (data.results || []).filter((result) => result.country_code === 'KR')
      municipalityGeocodeCache.set(cacheKey, results)
    }
    const sameNameResults = results.filter((item) => item.name === feature.properties.name)
    const result = sameNameResults.length === 1 ? sameNameResults[0] : null
    const centroid = getFeatureCentroid(feature)
    if (!result && !centroid)
      throw new Error(`${feature.properties.name}의 좌표를 찾지 못했습니다.`)

    const city = {
      id: cityId,
      name: feature.properties.name,
      provinceId: selectedProvinceId.value,
      provinceName: province?.label || '',
      districtType: districtType(feature.properties.name),
      latitude: result?.latitude ?? centroid.latitude,
      longitude: result?.longitude ?? centroid.longitude,
      temp: null,
      status: '조회 중',
      icon: '',
      humidity: null,
    }
    const weather = await fetchCityWeather(city)
    if (requestId !== municipalityRequestId.value) return
    weatherList.value = [
      ...weatherList.value.filter(
        (item) =>
          (defaultCityIds.has(item.id) || favoriteCityIds.value.includes(item.id)) &&
          !sameWeatherName(item, weather),
      ),
      weather,
    ]
    selectedCityId.value = weather.id
    loadForecast(weather)
    updatedAt.value = new Intl.DateTimeFormat('ko-KR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date())
  } catch (error) {
    if (requestId !== municipalityRequestId.value) return
    errorMessage.value = error.response?.data?.reason || error.message
    clearSelectedCity()
  } finally {
    if (requestId === municipalityRequestId.value) loading.value = false
  }
}

const handleMapClick = (event) => {
  if (mapAnimating.value) return
  const target =
    event.target instanceof Element ? event.target.closest('[data-code], [data-province-id]') : null
  const municipalityCode = target?.dataset.code
  if (municipalityCode && selectedProvinceId.value) {
    if (selectedMunicipalityCode.value === municipalityCode && selectedCityId.value) {
      clearSelectedCity()
    } else {
      selectMunicipalityByCode(municipalityCode)
    }
    return
  }
  const provinceId = target?.dataset.provinceId

  if (provinceId) {
    selectProvince(provinceId)
    return
  }

  clearSelectedCity()
}

const isFavorite = (cityId) => favoriteCityIds.value.includes(cityId)

const toggleFavorite = (city) => {
  favoriteCityIds.value = isFavorite(city.id)
    ? favoriteCityIds.value.filter((id) => id !== city.id)
    : [...favoriteCityIds.value, city.id]
}

const selectFavoriteFromComparison = (city) => {
  if (selectedCityId.value === city.id) {
    clearSelectedCity()
    searchQuery.value = ''
    return
  }

  searchQuery.value = city.name
  selectCity(city)
}

const startFavoriteDrag = (city, event) => {
  draggedFavoriteId.value = city.id
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', city.id)
}

const dropFavorite = (targetCity) => {
  const draggedId = draggedFavoriteId.value
  draggedFavoriteId.value = ''
  if (!draggedId || draggedId === targetCity.id) return

  const ids = [...favoriteCityIds.value]
  const fromIndex = ids.indexOf(draggedId)
  const toIndex = ids.indexOf(targetCity.id)
  if (fromIndex === -1 || toIndex === -1) return

  ids.splice(fromIndex, 1)
  ids.splice(toIndex, 0, draggedId)
  favoriteCityIds.value = ids
}

const weatherCacheKey = (city) =>
  `${Number(city.latitude).toFixed(4)},${Number(city.longitude).toFixed(4)}`

const fetchCityWeather = async (city, { force = false } = {}) => {
  const cacheKey = weatherCacheKey(city)
  const cached = weatherCache.get(cacheKey)
  if (!force && cached && cached.expiresAt > Date.now()) {
    return { ...city, ...cached.data }
  }

  const pendingRequest = weatherRequests.get(cacheKey)
  if (pendingRequest) return { ...city, ...(await pendingRequest) }

  const request = (async () => {
    const weatherRequest = axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: {
        lat: city.latitude,
        lon: city.longitude,
        appid: apiKey,
        units: 'metric',
        lang: 'kr',
      },
    })
    const airRequest = axios
      .get('https://api.openweathermap.org/data/2.5/air_pollution', {
        params: { lat: city.latitude, lon: city.longitude, appid: apiKey },
      })
      .catch(() => null)
    const [{ data }, airResponse] = await Promise.all([weatherRequest, airRequest])
    const air = airResponse?.data?.list?.[0]?.components ?? {}

    return {
      temp: Math.round(data.main.temp),
      status: weatherStatus(data.weather[0].id),
      icon: data.weather[0].icon,
      humidity: data.main.humidity,
      feelsLike: Math.round(data.main.feels_like),
      windSpeed: data.wind.speed,
      pm10: air.pm10 === undefined ? null : Math.round(air.pm10),
      pm25: air.pm2_5 === undefined ? null : Math.round(air.pm2_5),
      ozone: air.o3 === undefined ? null : Math.round(air.o3),
      sunrise: formatSunTime(data.sys.sunrise, data.timezone),
      sunset: formatSunTime(data.sys.sunset, data.timezone),
    }
  })()

  weatherRequests.set(cacheKey, request)
  try {
    const data = await request
    weatherCache.set(cacheKey, { data, expiresAt: Date.now() + WEATHER_CACHE_TTL })
    return { ...city, ...data }
  } finally {
    weatherRequests.delete(cacheKey)
  }
}

const applyLocationWeather = (weather, force, loadForecastData = true) => {
  weatherList.value = [
    weather,
    ...weatherList.value.filter(
      (item) => item.id !== weather.id && !sameWeatherName(item, weather),
    ),
  ]
  searchQuery.value = weather.name
  selectedCityId.value = weather.id

  if (loadForecastData && apiKey) {
    loadForecast(weather, { force })
    return
  }

  forecastRequestId += 1
  forecastLoading.value = false
  forecasts.value = []
  forecastErrorMessage.value = apiKey
    ? ''
    : 'VITE_OPENWEATHER_API_KEY가 설정되지 않아 예보를 표시할 수 없습니다.'
}

const loadDefaultLocationWeather = async (force) => {
  const city = { ...DEFAULT_LOCATION }
  try {
    const weather = apiKey ? await fetchCityWeather(city, { force }) : createWeatherEntry(city)
    applyLocationWeather(weather, force)
  } catch (error) {
    applyLocationWeather(createWeatherEntry(city), force, false)
    locationError.value = error.response?.data?.message || '기본 지역의 날씨를 불러오지 못했습니다.'
  } finally {
    locationLoading.value = false
  }
}

const requestMyLocationWeather = (force = false) => {
  if (locationLoading.value) return
  locationLoading.value = true
  locationError.value = ''

  if (!apiKey) {
    locationError.value = '위치를 확인할 수 없어 성남시 분당구를 기본 지역으로 표시합니다.'
    loadDefaultLocationWeather(force)
    return
  }
  if (!('geolocation' in navigator)) {
    locationError.value = '위치를 확인할 수 없어 성남시 분당구를 기본 지역으로 표시합니다.'
    loadDefaultLocationWeather(force)
    return
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const locationRegion = findLocationRegion(position.coords.latitude, position.coords.longitude)
      const city = {
        id: 'my-location',
        name: locationRegion?.name || '내 위치',
        provinceId: locationRegion?.provinceId || '',
        provinceName: locationRegion?.provinceName || '',
        districtType: locationRegion ? districtType(locationRegion.name) : '',
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      }
      try {
        const weather = await fetchCityWeather(city, { force })
        applyLocationWeather(weather, force)
        locationLoading.value = false
      } catch {
        locationError.value = '현재 위치 날씨를 확인할 수 없어 성남시 분당구를 기본으로 표시합니다.'
        loadDefaultLocationWeather(force)
      }
    },
    (error) => {
      locationError.value =
        error.code === 1
          ? '위치 권한이 없어 성남시 분당구를 기본 지역으로 표시합니다.'
          : '위치를 확인할 수 없어 성남시 분당구를 기본 지역으로 표시합니다.'
      loadDefaultLocationWeather(force)
    },
    { enableHighAccuracy: false, timeout: 8000, maximumAge: 10 * 60 * 1000 },
  )
}

const loadWeather = async ({ force = false } = {}) => {
  if (!apiKey) {
    errorMessage.value = 'VITE_OPENWEATHER_API_KEY가 설정되지 않았습니다.'
    return
  }

  loading.value = true
  errorMessage.value = ''

  const citiesToLoad = [...weatherList.value]
  const results = await Promise.allSettled(
    citiesToLoad.map((city) => fetchCityWeather(city, { force })),
  )
  const failedCount = results.filter((result) => result.status === 'rejected').length

  const refreshedWeatherList = results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value
    }

    return {
      ...citiesToLoad[index],
      temp: null,
      status: '조회 실패',
      icon: '',
      humidity: null,
      feelsLike: null,
      windSpeed: null,
      pm10: null,
      pm25: null,
      ozone: null,
      sunrise: '--:--',
      sunset: '--:--',
    }
  })

  const refreshedById = new Map(refreshedWeatherList.map((city) => [city.id, city]))
  const currentWeatherList = [...weatherList.value]
  weatherList.value = currentWeatherList.map((city) => refreshedById.get(city.id) || city)

  if (failedCount > 0) {
    errorMessage.value = `${failedCount}개 도시의 날씨를 불러오지 못했습니다.`
  }

  updatedAt.value = new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date())
  loading.value = false
}

const refreshWeather = () =>
  Promise.all([loadWeather({ force: true }), loadHeatmapTemperatures({ force: true })])

const resetWindyMap = () => {
  windyFrameKey.value += 1
}

const forecastCacheKey = (city) => weatherCacheKey(city)

const fetchForecastData = async (city, { force = false } = {}) => {
  const cacheKey = forecastCacheKey(city)
  const cached = forecastCache.get(cacheKey)
  if (!force && cached && cached.expiresAt > Date.now()) return cached.data

  const pendingRequest = forecastRequests.get(cacheKey)
  if (pendingRequest) return pendingRequest

  const request = axios
    .get('https://api.openweathermap.org/data/2.5/forecast', {
      params: {
        lat: city.latitude,
        lon: city.longitude,
        appid: apiKey,
        units: 'metric',
        lang: 'kr',
      },
    })
    .then(({ data }) =>
      data.list.slice(0, 5).map((forecast) => ({
        dt: forecast.dt,
        temp: Math.round(forecast.main.temp),
        status: weatherStatus(forecast.weather[0].id),
        icon: forecast.weather[0].icon,
      })),
    )

  forecastRequests.set(cacheKey, request)
  try {
    const data = await request
    forecastCache.set(cacheKey, { data, expiresAt: Date.now() + WEATHER_CACHE_TTL })
    return data
  } finally {
    forecastRequests.delete(cacheKey)
  }
}

const loadForecast = async (city, { force = false } = {}) => {
  const requestId = ++forecastRequestId
  if (!apiKey) {
    forecastErrorMessage.value = 'VITE_OPENWEATHER_API_KEY가 설정되지 않았습니다.'
    forecastLoading.value = false
    return
  }

  forecastLoading.value = true
  forecastErrorMessage.value = ''
  forecasts.value = []

  try {
    const data = await fetchForecastData(city, { force })
    if (requestId !== forecastRequestId) return

    forecasts.value = data.map((forecast) => ({
      id: `${city.id}_${forecast.dt}`,
      time: new Intl.DateTimeFormat('ko-KR', {
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(forecast.dt * 1000)),
      temp: forecast.temp,
      status: forecast.status,
      icon: forecast.icon,
    }))
  } catch (error) {
    if (requestId === forecastRequestId) {
      forecastErrorMessage.value = error.response?.data?.message || error.message
    }
  } finally {
    if (requestId === forecastRequestId) forecastLoading.value = false
  }
}

const showDetail = (weather) => {
  detailCity.value = weather
}

const closeDetail = () => {
  detailCity.value = null
}

watch(selectedCityInfo, (newValue, oldValue) => {
  console.log(`🤖 선택 도시 변경\n${oldValue} --> ${newValue}`)
})

watchEffect(() => {
  console.log(`🤖 검색어 변경: ${searchQuery.value}`)
})

watch(
  favoriteCityIds,
  (cityIds) => {
    const favorites = weatherList.value.filter((city) => cityIds.includes(city.id))
    localStorage.setItem('skala-weather-favorites', JSON.stringify(favorites))
  },
  { deep: true },
)

onMounted(() => {
  try {
    const saved = JSON.parse(localStorage.getItem('skala-weather-favorites') || '[]')
    if (Array.isArray(saved) && saved.every((city) => city && typeof city === 'object')) {
      const savedById = new Map(saved.map((city) => [city.id, city]))
      const savedLocation = savedById.get('my-location')
      weatherList.value = [
        ...weatherCities.map((city) => ({
          ...createWeatherEntry(city),
          ...savedById.get(city.id),
        })),
        ...(savedLocation ? [{ ...createWeatherEntry(DEFAULT_LOCATION), ...savedLocation }] : []),
        ...saved
          .filter((city) => !defaultCityIds.has(city.id))
          .map((city) => ({ ...createWeatherEntry(city), ...city })),
      ]
      favoriteCityIds.value = saved.map((city) => city.id)
    }
  } catch {
    weatherList.value = weatherCities.map(createWeatherEntry)
    favoriteCityIds.value = []
  }
  if (weatherList.value.length) loadWeather()
  loadHeatmapTemperatures()
  requestMyLocationWeather()
})

onUnmounted(() => {
  cancelAnimationFrame(mapAnimationFrameId)
})
</script>

<template>
  <div class="dashboard-wrapper">
    <BaseDashboardCard>
      <SearchBar
        :query="searchQuery"
        :result-count="filteredWeatherList.length"
        @update-query="searchQuery = $event"
      />
      <div
        v-if="municipalitySearchResults.length"
        class="municipality-search-results"
        aria-label="행정구역 검색 결과"
      >
        <span>행정구역 검색 결과</span>
        <button
          v-for="result in municipalitySearchResults"
          :key="result.feature.properties.code"
          type="button"
          :class="{ selected: selectedMunicipalityCode === result.feature.properties.code }"
          @click="selectSearchMunicipality(result)"
        >
          {{ result.feature.properties.name }} · {{ result.province?.label }}
        </button>
      </div>
    </BaseDashboardCard>

    <div class="weather-visuals">
      <section class="map-box">
        <div class="section-heading">
          <h2>대한민국 지역별 날씨 지도</h2>
          <div class="section-actions">
            <button type="button" :disabled="loading || heatmapLoading" @click="refreshWeather">
              {{ loading || heatmapLoading ? '불러오는 중' : '새로고침' }}
            </button>
            <button
              type="button"
              class="location-refresh"
              :disabled="locationLoading"
              @click="requestMyLocationWeather(true)"
            >
              {{ locationLoading ? '위치 확인 중' : '내 위치 새로고침' }}
            </button>
          </div>
        </div>

        <p v-if="updatedAt" class="updated-at">최근 조회: {{ updatedAt }}</p>
        <p v-if="errorMessage" class="error-message" role="alert">{{ errorMessage }}</p>
        <p v-if="heatmapError" class="heatmap-error" role="alert">{{ heatmapError }}</p>
        <p v-if="locationError" class="location-error" role="alert">{{ locationError }}</p>

        <div class="region-controls">
          <label>
            광역지역
            <select :value="selectedProvinceId" @change="selectProvince($event.target.value)">
              <option value="">전체 지역</option>
              <option v-for="province in provinceOptions" :key="province.id" :value="province.id">
                {{ province.label }}
              </option>
            </select>
          </label>
          <label>
            시·군·구 선택
            <select
              :value="selectedMunicipalityCode"
              :disabled="!selectedProvinceId || !municipalityFeatures.length"
              @change="selectMunicipalityByCode($event.target.value)"
            >
              <option value="">행정구역을 선택하세요</option>
              <option
                v-for="feature in municipalityFeatures"
                :key="feature.properties.code"
                :value="feature.properties.code"
              >
                {{ feature.properties.name }}
              </option>
            </select>
          </label>
          <button
            v-if="selectedProvinceId"
            type="button"
            class="map-reset"
            @click="selectProvince('')"
          >
            전국 지도 보기
          </button>
        </div>

        <div class="temperature-legend" aria-label="기온 히트맵 범례">
          <span>기온 히트맵</span>
          <small>낮음</small>
          <i></i>
          <small>높음</small>
          <em>{{ heatmapLoading ? '전국 기온 불러오는 중' : '전국 시·군·구 기준' }}</em>
        </div>

        <p v-if="selectedProvinceId && !municipalityFeatures.length" class="region-empty">
          해당 시·도의 행정구역 지도를 찾지 못했습니다.
        </p>

        <div
          class="image-map"
          :style="mapStyle"
          :aria-busy="loading || mapAnimating || heatmapLoading"
          @click="handleMapClick"
        >
          <svg
            class="image-map-svg"
            :viewBox="mapViewBoxText"
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label="대한민국 시도 및 행정구역 지도"
          >
            <g
              class="province-layer"
              :class="{ subdued: municipalityLayerVisible }"
              fill-rule="evenodd"
            >
              <path
                v-for="province in provincePaths"
                :key="province.id"
                class="province-shape"
                :class="{ selected: selectedProvinceId === province.id }"
                :style="temperatureHeatmapStyle(provinceTemperature(province.id))"
                :data-province-id="province.id"
                :d="province.path"
                vector-effect="non-scaling-stroke"
              >
                <title>
                  {{ province.label }} ·
                  {{
                    provinceTemperature(province.id) === null
                      ? '데이터 없음'
                      : temperatureText(provinceTemperature(province.id))
                  }}
                </title>
              </path>
            </g>
            <g
              v-if="selectedProvinceId"
              class="municipality-layer"
              :class="{ visible: municipalityLayerVisible }"
              fill-rule="evenodd"
            >
              <path
                v-for="municipality in municipalityPaths"
                :key="municipality.code"
                class="municipality-shape"
                :class="{ selected: selectedMunicipalityCode === municipality.code }"
                :style="temperatureHeatmapStyle(municipalityTemperature(municipality.code))"
                :data-code="municipality.code"
                :d="municipality.path"
                vector-effect="non-scaling-stroke"
              >
                <title>
                  {{ municipality.name }} ·
                  {{
                    municipalityTemperature(municipality.code) === null
                      ? '데이터 없음'
                      : temperatureText(municipalityTemperature(municipality.code))
                  }}
                </title>
              </path>
            </g>
          </svg>
        </div>
      </section>

      <aside class="remote-sensing-box">
        <div class="remote-sensing-heading">
          <div>
            <span style="font-size: 16px; font-weight: 500">Windy Map</span>
          </div>
          <div class="remote-sensing-heading-actions">
            <button type="button" @click="resetWindyMap">지도 초기화</button>
            <a :href="windyEmbedUrl" target="_blank" rel="noreferrer"> 새 창 열기 </a>
          </div>
        </div>
        <div class="windy-viewer">
          <iframe
            class="windy-frame"
            :key="windyFrameKey"
            :src="windyEmbedUrl"
            width="650"
            height="750"
            title="대한민국 Windy 바람 예보"
            loading="lazy"
            tabindex="-1"
            allowfullscreen
            referrerpolicy="strict-origin-when-cross-origin"
          ></iframe>
        </div>

        <section class="selected-detail" :class="selectedStatusClass">
          <p class="detail-label">SELECTED CITY</p>
          <template v-if="selectedCity">
            <div class="detail-heading">
              <div>
                <h3>{{ selectedCity.name }}</h3>
                <p>{{ selectedCity.status }}</p>
              </div>
              <div class="detail-actions">
                <img
                  v-if="selectedCity.icon"
                  :src="weatherIconUrl(selectedCity.icon)"
                  :alt="selectedCity.status"
                />
                <button
                  type="button"
                  class="detail-favorite"
                  :class="{ active: isFavorite(selectedCity.id) }"
                  :aria-pressed="isFavorite(selectedCity.id)"
                  :aria-label="isFavorite(selectedCity.id) ? '즐겨찾기 해제' : '즐겨찾기 등록'"
                  @click.stop="toggleFavorite(selectedCity)"
                >
                  {{ isFavorite(selectedCity.id) ? '★' : '☆' }}
                </button>
              </div>
            </div>
            <strong class="detail-temp">{{ temperatureText(selectedCity.temp) }}</strong>
            <div class="detail-metrics">
              <span
                >습도 <strong>{{ selectedCity.humidity ?? '--' }}%</strong></span
              >
              <span
                >상태
                <strong>{{
                  selectedCity.temp !== null && selectedCity.temp >= 26 ? '더움' : '선선함'
                }}</strong></span
              >
              <span
                >체감 <strong>{{ temperatureText(selectedCity.feelsLike) }}</strong></span
              >
              <span
                >풍속 <strong>{{ selectedCity.windSpeed ?? '--' }} m/s</strong></span
              >
            </div>
          </template>
          <p v-else class="detail-empty">지도 또는 카드를 선택하면 세부 날씨를 표시합니다.</p>
        </section>
      </aside>
    </div>

    <WeatherForecast
      v-if="selectedCity"
      :city-name="selectedCity.name"
      :forecasts="forecasts"
      :loading="forecastLoading"
      :error-message="forecastErrorMessage"
    />

    <BaseDashboardCard class="weather-overview" @click.self="clearSelectedCity">
      <section v-if="weatherAlerts.length" class="weather-alerts" aria-live="polite">
        <div class="weather-alerts-heading">
          <div>
            <p>WEATHER BRIEFING</p>
            <h2>날씨 요약 알림</h2>
          </div>
          <span>{{ weatherAlerts.length }}건</span>
        </div>
        <div class="weather-alert-list">
          <article
            v-for="alert in weatherAlerts"
            :key="`${alert.type}-${alert.message}`"
            :class="`alert-${alert.type}`"
          >
            <strong>{{ alert.title }}</strong>
            <p>{{ alert.message }}</p>
          </article>
        </div>
      </section>

      <div class="overview-heading">
        <div>
          <p>LIVE COMPARISON</p>
          <h2>오늘의 지역 비교</h2>
        </div>
        <div class="overview-actions">
          <button
            type="button"
            class="favorite-filter"
            :class="{ active: showFavoritesOnly }"
            @click="showFavoritesOnly = !showFavoritesOnly"
          >
            ★ 즐겨찾기 {{ favoriteWeatherList.length }}
          </button>
          <div class="sort-controls" aria-label="지역 정렬">
            <label for="weather-sort">정렬</label>
            <select id="weather-sort" v-model="sortBy">
              <option value="temp">기온</option>
              <option value="humidity">습도</option>
              <option value="windSpeed">풍속</option>
              <option value="pm10">미세먼지</option>
              <option value="pm25">초미세먼지</option>
              <option value="ozone">오존</option>
              <option value="sunrise">일출</option>
              <option value="sunset">일몰</option>
            </select>
            <button
              :class="{ active: sortDirection === 'asc' }"
              type="button"
              :aria-pressed="sortDirection === 'asc'"
              @click="sortDirection = 'asc'"
            >
              오름차순
            </button>
            <button
              :class="{ active: sortDirection === 'desc' }"
              type="button"
              :aria-pressed="sortDirection === 'desc'"
              @click="sortDirection = 'desc'"
            >
              내림차순
            </button>
          </div>
        </div>
      </div>

      <div v-if="favoriteWeatherList.length" class="favorite-strip">
        <span>즐겨찾기 지역 (드래그로 순서 변경)</span>
        <button
          v-for="city in favoriteWeatherList"
          :key="city.id"
          type="button"
          draggable="true"
          :class="{ selected: selectedCityId === city.id, dragging: draggedFavoriteId === city.id }"
          @click.stop="selectFavoriteFromComparison(city)"
          @dragstart="startFavoriteDrag(city, $event)"
          @dragover.prevent
          @drop.stop.prevent="dropFavorite(city)"
          @dragend="draggedFavoriteId = ''"
        >
          ★ {{ city.name }}
        </button>
      </div>

      <div v-if="weatherSummary.length" class="weather-summary-grid">
        <article v-for="summary in weatherSummary" :key="summary.label">
          <span>{{ summary.label }}</span>
          <strong>{{ summary.city.name }}</strong>
          <em
            >{{
              summary.valueKey === 'temp'
                ? convertTemperature(summary.city.temp)
                : summary.city[summary.valueKey]
            }}{{ summary.unit }}</em
          >
        </article>
      </div>

      <WeatherCard
        v-for="(item, index) in sortedWeatherList"
        :key="item.id"
        :weather="item"
        :rank="index + 1"
        :selected="selectedCityId === item.id"
        :favorite="isFavorite(item.id)"
        @select-card="selectCity"
        @click-detail="showDetail"
        @toggle-favorite="toggleFavorite"
      />

      <p
        v-if="
          filteredWeatherList.length === 0 &&
          searchQuery.length > 0 &&
          !municipalitySearchResults.length
        "
        class="empty-message"
      >
        "{{ searchQuery }}" 도시가 없습니다.
      </p>

      <div class="status-bar" :class="selectedStatusClass">
        <p>{{ selectedCityInfo }}</p>
      </div>
    </BaseDashboardCard>

    <HourlyWeatherModal
      v-if="detailCity"
      :key="detailCity.id"
      :city="detailCity"
      @close="closeDetail"
    />
  </div>
</template>

<style scoped>
.dashboard-wrapper {
  width: min(100%, 1080px);
  margin: 0 auto;
  color: #2c3e50;
}

.municipality-search-results {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  padding-top: 10px;
  margin-top: 10px;
  border-top: 1px solid #e1ece9;
}

.municipality-search-results > span {
  width: 100%;
  color: #587080;
  font-size: 11px;
  font-weight: 800;
}

.municipality-search-results button {
  padding: 6px 9px;
  color: #276b61;
  font: inherit;
  font-size: 12px;
  cursor: pointer;
  background: #e8f5f1;
  border: 1px solid #c9e4dc;
  border-radius: 7px;
}

.municipality-search-results button:hover,
.municipality-search-results button.selected,
.municipality-search-results button:focus-visible {
  color: #fff;
  background: #168273;
  border-color: #168273;
}

.map-box {
  min-width: 0;
  padding: 18px;
  margin-bottom: 18px;
  background: var(--sky-surface);
  border: 1px solid var(--sky-border);
  border-radius: 24px;
  box-shadow: var(--sky-shadow-soft);
  backdrop-filter: var(--sky-backdrop);
}

.weather-visuals {
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(280px, 0.7fr);
  gap: 15px;
  align-items: stretch;
}

.remote-sensing-box {
  display: flex;
  flex-direction: column;
  contain: paint;
  isolation: isolate;
  min-width: 0;
  margin-bottom: 18px;
  overflow: hidden;
  background: var(--sky-surface);
  border: 1px solid var(--sky-border);
  border-radius: 24px;
  box-shadow: var(--sky-shadow-soft);
  backdrop-filter: var(--sky-backdrop);
}

.remote-sensing-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px;
  border-bottom: 1px solid var(--sky-border-muted);
}

.remote-sensing-heading a {
  padding: 6px 9px;
  color: #14756a;
  font-size: 12px;
  font-weight: 700;
  text-decoration: none;
  background: #e2f3ee;
  border-radius: 5px;
}

.remote-sensing-heading-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  justify-content: flex-end;
}

.remote-sensing-heading-actions button {
  padding: 6px 9px;
  color: #14756a;
  font: inherit;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  background: #e2f3ee;
  border: 0;
  border-radius: 5px;
}

.windy-viewer {
  display: grid;
  place-items: center;
  contain: paint;
  isolation: isolate;
  width: 100%;
  aspect-ratio: 650 / 750;
  overflow: hidden;
  background: #142536;
}

.windy-frame {
  display: block;
  width: 100%;
  height: 100%;
  pointer-events: auto;
  border: 0;
}

.selected-detail {
  flex: 1;
  min-height: 173px;
  padding: 16px;
  background: var(--sky-surface-strong);
  border-top: 1px solid var(--sky-border-muted);
}

.detail-label {
  margin: 0;
  color: #168273;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.09em;
}

.detail-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 6px;
}

.detail-heading h3,
.detail-heading p {
  margin: 0;
}

.detail-heading p,
.detail-empty {
  color: #687b8e;
  font-size: 13px;
}

.detail-heading img {
  width: 48px;
  height: 48px;
}
.detail-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}
.detail-favorite {
  width: 30px;
  height: 30px;
  padding: 0;
  color: #9a641f;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  background: #fff8eb;
  border: 1px solid #efd7aa;
  border-radius: 50%;
}
.detail-favorite.active {
  color: #fff;
  background: #d9902f;
  border-color: #d9902f;
}
.detail-temp {
  display: block;
  margin: 4px 0 10px;
  font-size: 30px;
}
.detail-metrics {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}
.detail-metrics span {
  padding: 11px 9px;
  color: #64798c;
  font-size: 12px;
  background: var(--sky-surface-soft);
  border: 1px solid var(--sky-border);
  border-radius: 9px;
}
.detail-metrics strong {
  display: block;
  color: #284458;
  margin-top: 2px;
  font-size: 14px;
}

.detail-empty {
  margin: 12px 0 0;
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

.section-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: flex-end;
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

.section-heading button.location-refresh {
  color: #1769aa;
  background: #e0f1ff;
  border: 1px solid #bcdff6;
}

.section-heading button.location-refresh:disabled {
  color: #78909c;
  background: #edf1f3;
}

.updated-at {
  margin: 8px 0;
  color: #636e72;
  font-size: 12px;
}

.region-controls {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin: 12px 0;
}

.region-controls label {
  display: grid;
  gap: 4px;
  color: #587080;
  font-size: 11px;
  font-weight: 700;
}

.region-controls select {
  width: 100%;
  padding: 8px 10px;
  color: #29485b;
  font: inherit;
  background: rgb(255 255 255 / 76%);
  border: 1px solid var(--sky-border-muted);
  border-radius: 10px;
}

.region-controls select:disabled {
  color: #9aaeb6;
  cursor: not-allowed;
  background: #edf2f2;
}

.map-reset {
  align-self: end;
  padding: 8px 10px;
  color: #14756a;
  font: inherit;
  font-size: 11px;
  font-weight: 800;
  cursor: pointer;
  background: #e2f3ee;
  border: 1px solid #c2e3da;
  border-radius: 7px;
}

.region-empty {
  padding: 10px;
  margin: 0 0 10px;
  color: #687b8e;
  font-size: 12px;
  background: #eef5f4;
  border-radius: 6px;
}

.error-message {
  padding: 10px;
  color: #c0392b;
  background: #fff0ee;
  border-radius: 6px;
}

.location-error {
  padding: 10px;
  margin: 8px 0;
  color: #9a641f;
  background: #fff7e8;
  border-radius: 6px;
}

.heatmap-error {
  padding: 10px;
  margin: 8px 0;
  color: #9a641f;
  background: #fff7e8;
  border-radius: 6px;
}

.temperature-legend {
  display: flex;
  gap: 7px;
  align-items: center;
  margin: 8px 0 10px;
  color: #587080;
  font-size: 11px;
}

.temperature-legend span {
  color: #29485b;
  font-weight: 800;
}

.temperature-legend i {
  width: 100px;
  height: 8px;
  background: linear-gradient(90deg, hsl(215 76% 76%), hsl(108 76% 76%), hsl(0 76% 76%));
  border-radius: 999px;
}

.temperature-legend em {
  color: #78909c;
  font-style: normal;
}

.image-map {
  position: relative;
  width: min(100%, 600px);
  aspect-ratio: 1 / 1;
  margin: 0 auto;
  overflow: hidden;
}

.image-map-svg {
  display: block;
  width: 100%;
  height: 100%;
}

.province-layer {
  opacity: 1;
}

.province-layer.subdued {
  pointer-events: none;
  opacity: 0;
}

.municipality-layer {
  opacity: 0;
  transition: opacity 0.38s ease;
}

.municipality-layer.visible {
  opacity: 1;
}

.province-shape {
  cursor: pointer;
  fill: var(--temperature-fill, #edf7f4);
  stroke: #b7d7cf;
  stroke-width: 0.8px;
  stroke-linejoin: round;
  transition:
    fill 0.15s ease,
    stroke 0.15s ease;
}

.province-shape:hover,
.province-shape.selected {
  fill: #b9ead9;
  stroke: #63a99d;
  stroke-width: 1.3px;
}

.municipality-shape {
  cursor: pointer;
  fill: var(--temperature-fill, #edf7f4);
  stroke: #bddbd4;
  stroke-width: 0.65px;
  stroke-linejoin: round;
  transition:
    fill 0.15s ease,
    stroke 0.15s ease;
}

.municipality-shape:hover,
.municipality-shape.selected {
  fill: #97ebc5;
  stroke: #63a99d;
  stroke-width: 1.1px;
}

@media (prefers-reduced-motion: reduce) {
  .province-layer,
  .municipality-layer {
    transition-duration: 0.01ms;
  }
}

.empty-message {
  padding: 24px 12px;
  color: #636e72;
  text-align: center;
}

.weather-overview {
  background: linear-gradient(135deg, rgb(248 253 255 / 68%), rgb(225 242 249 / 54%));
}

.overview-heading {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.overview-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  justify-content: flex-end;
}

.favorite-filter {
  padding: 6px 9px;
  color: #9a641f;
  font: inherit;
  font-size: 11px;
  font-weight: 800;
  cursor: pointer;
  background: #fff6e7;
  border: 1px solid #f0d6a7;
  border-radius: 7px;
}

.favorite-filter.active {
  color: #fff;
  background: #d9902f;
  border-color: #d9902f;
}

.favorite-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  padding: 8px 10px;
  margin-bottom: 10px;
  background: #fffaf0;
  border: 1px solid #f1dfbd;
  border-radius: 8px;
}

.favorite-strip > span {
  margin-right: 2px;
  color: #9a641f;
  font-size: 11px;
  font-weight: 800;
}

.favorite-strip button {
  padding: 4px 7px;
  color: #9a641f;
  font: inherit;
  font-size: 11px;
  font-weight: 700;
  cursor: grab;
  background: #fff;
  border: 1px solid #efd7aa;
  border-radius: 6px;
}

.favorite-strip button.dragging {
  opacity: 0.4;
}

.favorite-strip button.selected {
  color: #fff;
  background: #d9902f;
}

.overview-heading p,
.overview-heading h2 {
  margin: 0;
}

.overview-heading p {
  color: #168273;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.1em;
}

.overview-heading h2 {
  margin-top: 2px;
  font-size: 20px;
}

.sort-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
  padding: 3px;
  background: var(--sky-surface-soft);
  border: 1px solid var(--sky-border);
  border-radius: 10px;
}

.sort-controls label {
  padding-left: 5px;
  color: #587080;
  font-size: 11px;
  font-weight: 700;
}

.sort-controls select {
  padding: 5px 22px 5px 6px;
  color: #29485b;
  font: inherit;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  background: #fff;
  border: 0;
  border-radius: 6px;
}

.sort-controls button {
  padding: 5px 7px;
  color: #587080;
  font: inherit;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  background: transparent;
  border: 0;
  border-radius: 6px;
}

.sort-controls button.active {
  color: #07665c;
  background: #fff;
  box-shadow: 0 1px 3px rgb(26 66 62 / 12%);
}

.weather-summary-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin-bottom: 12px;
}

.weather-summary-grid article {
  display: grid;
  gap: 1px;
  padding: 9px 10px;
  background: rgb(255 255 255 / 64%);
  border: 1px solid var(--sky-border);
  border-radius: 11px;
}

.weather-summary-grid span {
  color: #66808f;
  font-size: 10px;
}

.weather-summary-grid strong {
  color: #294454;
  font-size: 14px;
}

.weather-summary-grid em {
  color: #08796c;
  font-size: 12px;
  font-style: normal;
  font-weight: 800;
}

.weather-alerts {
  padding: 12px;
  margin-bottom: 12px;
  background: rgb(255 255 255 / 58%);
  border: 1px solid var(--sky-border);
  border-radius: 12px;
}

.weather-alerts-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 9px;
}

.weather-alerts-heading p,
.weather-alerts-heading h2 {
  margin: 0;
}

.weather-alerts-heading p {
  color: #168273;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.1em;
}

.weather-alerts-heading h2 {
  margin-top: 2px;
  font-size: 16px;
}

.weather-alerts-heading > span {
  padding: 4px 7px;
  color: #587080;
  font-size: 11px;
  font-weight: 800;
  background: #edf4f3;
  border-radius: 999px;
}

.weather-alert-list {
  display: grid;
  gap: 6px;
}

.weather-alert-list article {
  display: grid;
  gap: 2px;
  padding: 8px 10px;
  border-left: 4px solid #7aa9a0;
  background: #f3f8f7;
  border-radius: 5px;
}

.weather-alert-list article strong {
  font-size: 12px;
}

.weather-alert-list article p {
  margin: 0;
  color: #587080;
  font-size: 11px;
}

.weather-alert-list .alert-hot,
.weather-alert-list .alert-cold {
  border-left-color: #e97845;
  background: #fff3e8;
}

.weather-alert-list .alert-rain {
  border-left-color: #4b9ac8;
  background: #edf7ff;
}

.weather-alert-list .alert-air {
  border-left-color: #d9902f;
  background: #fff8e8;
}

.weather-alert-list .alert-wind {
  border-left-color: #8067b7;
  background: #f3effb;
}

.weather-alert-list .alert-normal {
  border-left-color: #42a57a;
  background: #edf9f0;
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

@media (max-width: 560px) {
  .overview-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .weather-summary-grid {
    grid-template-columns: 1fr;
  }

  .region-controls {
    grid-template-columns: 1fr;
  }

  .overview-actions {
    width: 100%;
    justify-content: flex-start;
  }
}

@media (max-width: 820px) {
  .weather-visuals {
    grid-template-columns: 1fr;
  }
}
</style>
