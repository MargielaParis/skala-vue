<script setup>
import { ref } from 'vue'

const inputValue = ref('')
const message = ref('')

const showMessage = () => {
  message.value = inputValue.value
}
</script>

<template>
  <div class="practice-section">
    <h2>v-html XSS 학습</h2>
    <p class="warning">신뢰할 수 없는 HTML은 v-html로 출력하면 안 됩니다.</p>
    <input v-model="inputValue" placeholder="내용을 입력하세요" />
    <button @click="showMessage">확인</button>
    <div v-html="message"></div>
  </div>
</template>

<style scoped>
.warning {
  color: #c0392b;
  font-weight: 700;
}
</style>
