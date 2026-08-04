<script setup>
import { ref } from 'vue'

const name = ref('홍길동')
const age = ref(20)
</script>

<template>
  <div class="practice-section">
    <h2>v-memo 디렉티브 학습</h2>
    <div v-memo="[name]" class="memo-box">
      <p>📦 v-memo 적용 영역 (기준: name)</p>
      <p>이름: {{ name }}</p>
      <p>나이: {{ age }} (name이 바뀌어야 함께 갱신됨)</p>
    </div>
    <button @click="name = '이순신'">이름 변경</button>
    <button @click="age++">나이 증가</button>
  </div>
</template>

<style scoped>
.memo-box {
  padding: 20px;
  margin-bottom: 10px;
  border: 1px solid #42b883;
}
</style>
