<script setup>
import { ref } from 'vue'

const position = ref('')
const tagName = ref('')

const getOnlyEvent = (event) => {
  position.value = `좌표: X=${event.clientX}, Y=${event.clientY}`
}

const getWithParam = (name, event) => {
  tagName.value = `대상: ${name} / 클릭된 태그: ${event.target.tagName}`
}
</script>

<template>
  <div class="practice-section">
    <h2>v-on 이벤트 객체($event) 활용</h2>
    <p>좌표: {{ position }}</p>
    <p>태그: {{ tagName }}</p>
    <button @click="getOnlyEvent">클릭 좌표 알아내기</button>
    <button @click="getWithParam('회원A', $event)">회원 정보와 태그 확인</button>
  </div>
</template>
