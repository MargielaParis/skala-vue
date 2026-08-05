export const weatherStatus = (code) => {
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

export const weatherIconUrl = (icon) =>
  icon ? `https://openweathermap.org/img/wn/${icon}@2x.png` : ''
