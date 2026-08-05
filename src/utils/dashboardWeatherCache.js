export const dashboardWeatherCache = {
  weather: new Map(),
  weatherRequests: new Map(),
  forecasts: new Map(),
  forecastRequests: new Map(),
  municipalityGeocodes: new Map(),
  heatmap: {
    data: null,
    expiresAt: 0,
    request: null,
  },
}
