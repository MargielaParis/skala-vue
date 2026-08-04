<script setup>
import { ref } from 'vue'

const textColor = ref('purple')
const boxWidth = ref(150)
const baseBoxStyle = {
  backgroundColor: '#42b883',
  height: '100px',
  transition: 'all 0.3s ease',
}
</script>

<template>
  <div class="practice-section">
    <h2>v-bind 디렉티브 고급 (스타일 바인딩)</h2>
    <h3>1) 객체 형식</h3>
    <p :style="{ color: textColor, fontWeight: 'bold' }">이 글자의 색상은 실시간으로 바뀝니다.</p>
    <button @click="textColor = textColor === 'purple' ? 'blue' : 'purple'">글자 색상 토글</button>
    <br />
    <h3>2) 배열 형식</h3>
    <label>
      박스 가로 크기(px):
      <input v-model="boxWidth" type="number" step="50" />
    </label>
    <div :style="[baseBoxStyle, { width: boxWidth + 'px' }]">
      <p class="box-label">가로 크기: {{ boxWidth }}px 박스</p>
    </div>
  </div>
</template>

<style scoped>
.box-label {
  padding: 10px;
  color: white;
  text-align: center;
}
</style>
