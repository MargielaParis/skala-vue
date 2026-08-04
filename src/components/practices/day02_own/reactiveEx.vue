<script setup>
import { reactive } from 'vue'

const userReactive = reactive({ name: '이순신', age: 30 })
const celebrateReactive = () => {
  userReactive.age++
}

const items = reactive(['사과', '바나나', '체리'])
const addItem = () => {
  items.push(`과일 ${items.length + 1}`)
}
const removeItem = (index) => {
  items.splice(index, 1)
}
</script>

<template>
  <div class="practice-section">
    <h2>반응형 상태 reactive() 특징 및 주의점</h2>
    <h3>1) 객체(object) reactive</h3>
    <p>이름: {{ userReactive.name }}/ 나이: {{ userReactive.age }}</p>
    <button @click="celebrateReactive">사용자 나이 추가</button>
    <h3>2) 배열(array) reactive</h3>
    <ul>
      <li v-for="(item, index) in items" :key="index">
        {{ item }}
        <button @click="removeItem(index)">삭제</button>
      </li>
    </ul>
    <button @click="addItem">과일 추가</button>
  </div>
</template>
