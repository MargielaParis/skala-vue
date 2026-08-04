<script setup>
import { ref } from 'vue'

const count = ref(1)
</script>

<template>
  <div class="practice-section">
    <h2>v-once 디렉티브 학습</h2>
    <p>일반 변수 (실시간): {{ count }}</p>
    <p v-once>v-once 변수: {{ count }}</p>
    <button @click="count++">숫자 증가</button>
  </div>
</template>
