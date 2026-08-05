<script setup>
import { ref, watch } from 'vue'

const teamMembers = ref(['홍길동', '이순신', '강감찬'])
const cityWeather = ref([
  { name: '서울', temp: 25 },
  { name: '수원', temp: 22 },
])
const logMember = ref('대기 중...')
const logWeather = ref('대기 중...')

watch(
  () => teamMembers.value[0],
  (newName, oldName) => {
    logMember.value = `[문자열 배열] 0번 멤버 교체: ${oldName} ➡️ ${newName}`
  },
)

watch(
  () => cityWeather.value[0],
  (newCity) => {
    logWeather.value = `[객체 배열] ${newCity.name} 기온이 ${newCity.temp}°C로 변경됨`
  },
  { deep: true },
)
</script>

<template>
  <div class="practice-section">
    <h2>ref() 배열의 특정 요소 감시</h2>
    <h3>🏃 1) 문자열 배열: 현재 0번 멤버 [ {{ teamMembers[0] }} ]</h3>
    <button @click="teamMembers[0] = '손흥민'">0번 멤버를 손흥민으로 교체</button>
    <div class="monitor target">
      <p>🎯 () =&gt; teamMembers.value[0] 감시</p>
      <p>{{ logMember }}</p>
      <small>원시값이라 deep 옵션 없이도 교체를 감지합니다.</small>
    </div>

    <h3>⛅ 2) 객체 배열: {{ cityWeather[0].name }} 기온 [ {{ cityWeather[0].temp }}°C ]</h3>
    <button @click="cityWeather[0].temp++">서울 기온 1도 올리기 (temp++)</button>
    <div class="monitor auto">
      <p>👁️‍🗨️ () =&gt; cityWeather.value[0] + deep: true 감시</p>
      <p>{{ logWeather }}</p>
      <small>주의: 가리키는 대상이 객체이므로 deep 옵션이 없으면 내부 temp 변경을 놓칩니다.</small>
    </div>
  </div>
</template>
