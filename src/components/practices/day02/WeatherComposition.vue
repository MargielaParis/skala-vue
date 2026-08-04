<script setup>
import axios from 'axios'
import { computed, onMounted, onUnmounted, ref, watch, watchEffect } from 'vue'
import municipalitiesGeo from '../../../data/municipalities-geo-simple.json'
import provincesGeo from '../../../data/provinces-geo-simple.json'
import { useTemperature } from '../../../composables/useTemperature'
import BaseDashboardCard from './BaseDashboardCard.vue'
import SearchBar from './SearchBar.vue'
import WeatherCard from './WeatherCard.vue'
import WeatherForecast from './WeatherForecast.vue'
import HourlyWeatherModal from './HourlyWeatherModal.vue'

const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY
const { temperatureText, unitSymbol, convertTemperature } = useTemperature()

const weatherList = ref([])

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
const mapSvgRef = ref(null)
const selectedMunicipalityCode = ref('')
const favoriteCityIds = ref([])
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
const satelliteFrames = ref([])
const satelliteFrameIndex = ref(0)
const satelliteLoadError = ref(false)

let satellitePlayTimerId = null
let satelliteRefreshTimerId = null
let mapAnimationFrameId = null

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

const municipalitySearchResults = computed(() => {
  const keyword = searchQuery.value.trim()
  if (!keyword) return []
  return municipalitiesGeo.features
    .map((feature) => ({
      feature,
      province: provinceOptions.find(
        (province) => province.codePrefix === String(feature.properties.code).slice(0, 2),
      ),
    }))
    .filter(
      ({ feature, province }) =>
        feature.properties.name.includes(keyword) || province?.label.includes(keyword),
    )
    .sort((first, second) => {
      const firstExact = first.feature.properties.name.startsWith(keyword) ? 0 : 1
      const secondExact = second.feature.properties.name.startsWith(keyword) ? 0 : 1
      return firstExact - secondExact || first.feature.properties.name.localeCompare(second.feature.properties.name, 'ko')
    })
    .slice(0, 8)
})

const favoriteWeatherList = computed(() =>
  weatherList.value.filter((weather) => favoriteCityIds.value.includes(weather.id)),
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

  if (!keyword) return favoriteList

  return favoriteList.filter((weather) => {
    if (!showFavoritesOnly.value && weather.id === selectedCityId.value) return true
    return weather.name.includes(keyword) || weather.status.includes(keyword)
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

const weatherIconUrl = (icon) => (icon ? `https://openweathermap.org/img/wn/${icon}@2x.png` : '')

const formatSunTime = (timestamp, timezoneOffset) => {
  if (!timestamp) return '--:--'
  return new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  }).format(new Date((timestamp + timezoneOffset) * 1000))
}

const weatherStatus = (code) => {
  if (code === 800) return '맑음'
  if (code === 801) return '구름 조금'
  if (code === 802) return '구름 많음'
  if ([803, 804].includes(code)) return '흐림'
  if (code >= 200 && code < 300) return '뇌우'
  if (code >= 300 && code < 400) return '이슬비'
  if (code >= 500 && code < 600) return '비'
  if (code >= 600 && code < 700) return '눈'
  if (code >= 700 && code < 800) return '안개'
  return '알 수 없음'
}

const formatSatelliteTime = (date) => {
  const padded = (value) => String(value).padStart(2, '0')

  return [
    date.getUTCFullYear(),
    padded(date.getUTCMonth() + 1),
    padded(date.getUTCDate()),
    padded(date.getUTCHours()),
    padded(date.getUTCMinutes()),
  ].join('')
}

const refreshSatelliteFrames = () => {
  const now = new Date()
  const latestAvailableTime = new Date(now.getTime() - 10 * 60 * 1000)
  latestAvailableTime.setUTCMinutes(Math.floor(latestAvailableTime.getUTCMinutes() / 2) * 2, 0, 0)

  satelliteFrames.value = Array.from({ length: 30 }, (_, index) => {
    const frameTime = new Date(latestAvailableTime.getTime() - (29 - index) * 2 * 60 * 1000)
    const timestamp = formatSatelliteTime(frameTime)

    return `https://www.weather.go.kr/w/repositary/image/sat/gk2a/KO/gk2a_ami_le1b_rgb-cs_ko005lc_${timestamp}.thn.jpg`
  })
  satelliteFrameIndex.value = 0
  satelliteLoadError.value = false
  startSatellitePlayback()
}

const showNextSatelliteFrame = () => {
  if (satelliteFrameIndex.value >= satelliteFrames.value.length - 1) {
    clearInterval(satellitePlayTimerId)
    satellitePlayTimerId = null
    return
  }

  satelliteFrameIndex.value = (satelliteFrameIndex.value + 1) % satelliteFrames.value.length
}

const startSatellitePlayback = () => {
  clearInterval(satellitePlayTimerId)
  satelliteFrameIndex.value = 0
  satellitePlayTimerId = window.setInterval(showNextSatelliteFrame, 200)
}

const selectCity = (weather) => {
  if (selectedCityId.value === weather.id) {
    clearSelectedCity()
    return
  }

  selectedCityId.value = weather.id
  loadForecast(weather)
}

const clearSelectedCity = () => {
  weatherList.value = weatherList.value.filter((weather) =>
    favoriteCityIds.value.includes(weather.id),
  )
  selectedCityId.value = ''
  selectedMunicipalityCode.value = ''
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
  clearSelectedCity()

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
    if (selectedCityId.value) clearSelectedCity()
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

const selectMunicipalityByCode = async (code) => {
  selectedMunicipalityCode.value = code
  const feature = municipalityFeatures.value.find((item) => item.properties.code === code)
  if (!feature) {
    clearSelectedCity()
    return
  }

  const province = selectedProvince.value
  const cityId = `municipality-${feature.properties.code}`
  const favorite = weatherList.value.find((item) => item.id === cityId && isFavorite(item.id))
  weatherList.value = weatherList.value.filter((item) => favoriteCityIds.value.includes(item.id))
  selectedCityId.value = ''
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
    const { data } = await axios.get('https://geocoding-api.open-meteo.com/v1/search', {
      params: { name: feature.properties.name, count: 10, language: 'ko', format: 'json' },
    })
    const results = (data.results || []).filter((result) => result.country_code === 'KR')
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
    weatherList.value = [
      ...weatherList.value.filter((item) => favoriteCityIds.value.includes(item.id)),
      weather,
    ]
    selectedCityId.value = weather.id
    loadForecast(weather)
    updatedAt.value = new Intl.DateTimeFormat('ko-KR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date())
  } catch (error) {
    errorMessage.value = error.response?.data?.reason || error.message
    clearSelectedCity()
  } finally {
    loading.value = false
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

const fetchCityWeather = async (city) => {
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
    ...city,
    temp: Math.round(data.main.temp),
    status: weatherStatus(data.weather[0].id),
    icon: data.weather[0].icon,
    humidity: data.main.humidity,
    feelsLike: Math.round(data.main.feels_like),
    windSpeed: data.wind.speed,
    pm10: air.pm10 ? Math.round(air.pm10) : null,
    pm25: air.pm2_5 ? Math.round(air.pm2_5) : null,
    ozone: air.o3 ? Math.round(air.o3) : null,
    sunrise: formatSunTime(data.sys.sunrise, data.timezone),
    sunset: formatSunTime(data.sys.sunset, data.timezone),
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
      feelsLike: null,
      windSpeed: null,
      pm10: null,
      pm25: null,
      ozone: null,
      sunrise: '--:--',
      sunset: '--:--',
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

const loadForecast = async (city) => {
  if (!apiKey) {
    forecastErrorMessage.value = 'VITE_OPENWEATHER_API_KEY가 설정되지 않았습니다.'
    return
  }

  forecastLoading.value = true
  forecastErrorMessage.value = ''
  forecasts.value = []

  try {
    const { data } = await axios.get('https://api.openweathermap.org/data/2.5/forecast', {
      params: {
        lat: city.latitude,
        lon: city.longitude,
        appid: apiKey,
        units: 'metric',
        lang: 'kr',
      },
    })

    forecasts.value = data.list.slice(0, 5).map((forecast) => ({
      id: `${city.id}_${forecast.dt}`,
      time: new Intl.DateTimeFormat('ko-KR', {
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(forecast.dt * 1000)),
      temp: Math.round(forecast.main.temp),
      status: weatherStatus(forecast.weather[0].id),
      icon: forecast.weather[0].icon,
    }))
  } catch (error) {
    forecastErrorMessage.value = error.response?.data?.message || error.message
  } finally {
    forecastLoading.value = false
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
      weatherList.value = saved
      favoriteCityIds.value = saved.map((city) => city.id)
    }
  } catch {
    weatherList.value = []
    favoriteCityIds.value = []
  }
  if (weatherList.value.length) loadWeather()
  refreshSatelliteFrames()
  satelliteRefreshTimerId = window.setInterval(refreshSatelliteFrames, 5 * 60 * 1000)
})

onUnmounted(() => {
  clearInterval(satellitePlayTimerId)
  clearInterval(satelliteRefreshTimerId)
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
          <button type="button" :disabled="loading" @click="loadWeather">
            {{ loading ? '불러오는 중' : '새로고침' }}
          </button>
        </div>

        <p v-if="updatedAt" class="updated-at">최근 조회: {{ updatedAt }}</p>
        <p v-if="errorMessage" class="error-message" role="alert">{{ errorMessage }}</p>

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

        <p v-if="selectedProvinceId && !municipalityFeatures.length" class="region-empty">
          해당 시·도의 행정구역 지도를 찾지 못했습니다.
        </p>

        <div
          class="image-map"
          :style="mapStyle"
          :aria-busy="loading || mapAnimating"
          @click="handleMapClick"
        >
          <svg
            ref="mapSvgRef"
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
                :data-province-id="province.id"
                :d="province.path"
                vector-effect="non-scaling-stroke"
              >
                <title>{{ province.label }}</title>
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
                :data-code="municipality.code"
                :d="municipality.path"
                vector-effect="non-scaling-stroke"
              >
                <title>{{ municipality.name }}</title>
              </path>
            </g>
          </svg>
        </div>
      </section>

      <aside class="remote-sensing-box">
        <div class="remote-sensing-heading">
          <div>
            <p>REMOTE SENSING</p>
            <h2>천리안위성 2A호</h2>
          </div>
          <a
            href="https://www.weather.go.kr/w/weather/satellite/gk2a.do"
            target="_blank"
            rel="noreferrer"
          >
            새 창 열기
          </a>
        </div>
        <div class="satellite-viewer">
          <img
            v-if="satelliteFrames.length"
            :src="satelliteFrames[satelliteFrameIndex]"
            alt="천리안위성 2A호 한반도 RGB 구름 강조 관측 영상"
            @error="satelliteLoadError = true"
          />
          <p v-if="satelliteLoadError" class="satellite-error">
            관측 이미지를 불러오지 못했습니다. 새 창에서 확인하세요.
          </p>
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
        <span>즐겨찾기 지역</span>
        <button
          v-for="city in favoriteWeatherList"
          :key="city.id"
          type="button"
          :class="{ selected: selectedCityId === city.id }"
          @click.stop="selectCity(city)"
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
        v-if="filteredWeatherList.length === 0 && searchQuery.length > 0 && !municipalitySearchResults.length"
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
  padding: 15px;
  margin-bottom: 15px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
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
  min-width: 0;
  margin-bottom: 15px;
  overflow: hidden;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
}

.remote-sensing-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px;
  border-bottom: 1px solid #e9ecef;
}

.remote-sensing-heading p {
  margin: 0;
  color: #168273;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.remote-sensing-heading h2 {
  margin: 2px 0 0;
  font-size: 18px;
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

.satellite-viewer {
  display: grid;
  place-items: center;
  width: 100%;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  background: #142536;
}

.satellite-viewer img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.satellite-error {
  padding: 20px;
  color: white;
  text-align: center;
}

.selected-detail {
  flex: 1;
  min-height: 173px;
  padding: 16px;
  background: #fff;
  border-top: 1px solid #e9ecef;
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
  background: #f3f8f7;
  border-radius: 6px;
}
.detail-metrics strong {
  display: block;
  color: #284458;
  margin-top: 2px;
  font-size: 14px;
}

.detail-page-link {
  width: 100%;
  padding: 10px 12px;
  margin-top: 14px;
  color: #fff;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  background: #148476;
  border: 0;
  border-radius: 8px;
}
.detail-empty {
  margin: 12px 0 0;
}

.detail-modal-backdrop {
  position: fixed;
  z-index: 1000;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgb(18 42 58 / 42%);
  backdrop-filter: blur(3px);
}

.detail-modal-card {
  width: min(100%, 360px);
  min-height: 0;
  border: 1px solid #d8e9e5;
  border-radius: 12px;
  box-shadow: 0 22px 50px rgb(14 39 54 / 28%);
}

.detail-modal-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.detail-modal-close {
  display: grid;
  width: 28px;
  height: 28px;
  padding: 0;
  color: #426174;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
  background: #f1f6f5;
  border: 0;
  border-radius: 50%;
}

.detail-modal-close:hover {
  color: #075f55;
  background: #dff4ed;
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
  background: #fff;
  border: 1px solid #cfe1de;
  border-radius: 7px;
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
  fill: #edf7f4;
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
  fill: #edf7f4;
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

.city-marker {
  position: absolute;
  z-index: 1;
  display: grid;
  place-items: center;
  min-width: 52px;
  padding: 3px 5px;
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
  transform: translate(-50%, -50%) scale(1.05);
}

.city-marker.selected {
  z-index: 2;
  color: white;
  background: #97ebc5;
  border-color: #42b883;
  box-shadow: 0 0 0 1px rgba(32, 157, 64, 0.458);
  transform: translate(-50%, -50%) scale(1.1);
}

.city-marker.unavailable {
  border-color: #95a5a6;
}

.city-marker img {
  width: 28px;
  height: 28px;
}

.marker-icon {
  font-size: 16px;
}

.city-marker strong,
.city-marker small {
  display: block;
}

.city-marker small {
  font-size: 10px;
}

.empty-message {
  padding: 24px 12px;
  color: #636e72;
  text-align: center;
}

.weather-overview {
  background: linear-gradient(135deg, #f8fcfb, #f0f7f6);
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
  cursor: pointer;
  background: #fff;
  border: 1px solid #efd7aa;
  border-radius: 6px;
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
  background: #e3efec;
  border-radius: 8px;
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
  background: rgb(255 255 255 / 70%);
  border: 1px solid #d8e9e5;
  border-radius: 9px;
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
    min-width: 44px;
    padding: 2px 4px;
    font-size: 12px;
  }
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
