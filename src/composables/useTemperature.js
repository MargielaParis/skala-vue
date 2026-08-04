import { unref } from 'vue'
import { storeToRefs } from 'pinia'
import { useConfigStore } from '../stores/configStore'

export const useTemperature = () => {
  const configStore = useConfigStore()
  const { unit, unitSymbol } = storeToRefs(configStore)

  const convertTemperature = (celsius) => {
    if (celsius === null || celsius === undefined) return null
    return unit.value === 'fahrenheit' ? Math.round((celsius * 9) / 5 + 32) : celsius
  }

  const temperatureText = (celsius) => {
    const converted = convertTemperature(unref(celsius))
    return converted === null ? '--' : `${converted}${unitSymbol.value}`
  }

  return {
    unit,
    unitSymbol,
    convertTemperature,
    temperatureText,
  }
}
