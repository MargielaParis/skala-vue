<script setup>
import { reactive, ref, watch } from 'vue'

const cityList = reactive(['서울', '수원'])
const logAuto = ref('대기 중...')
const logSnapshot = ref('대기 중...')

watch(cityList, (newList, oldList) => {
  logAuto.value = `[자동 감시] 이전길이인척하는: ${oldList.length} / 현재길이: ${newList.length}`
})

watch(
  () => [...cityList],
  (newList, oldList) => {
    logSnapshot.value = `[스냅샷 감시] 진짜 과거 길이: ${oldList.length} (${oldList}) ➡️ 현재 길이: ${newList.length}`
  },
)
</script>

<template>
  <div class="practice-section">
    <h2>reactive() 배열 감시 규칙</h2>
    <h3>⭐ 즐겨찾기 도시 목록 (reactive 배열)</h3>
    <p>
      현재 등록된 도시: <strong>{{ cityList }}</strong>
    </p>
    <button @click="cityList.push('부산')">부산 추가 (push)</button>
    <button @click="cityList.pop()">최근 도시 삭제 (pop)</button>

    <div class="monitor auto">
      <p>👁️‍🗨️ 1) cityList 변수명 그대로 감시</p>
      <p>{{ logAuto }}</p>
      <small>주의: 이전 배열과 현재 배열이 같은 참조라 길이·내용이 똑같이 찍힙니다.</small>
    </div>
    <div class="monitor target">
      <p>🎯 2) () =&gt; [...cityList] 복사본 감시</p>
      <p>{{ logSnapshot }}</p>
      <small>성공: 스냅샷을 감시하므로 과거 배열의 원본이 보존됩니다.</small>
    </div>
  </div>
</template>
