<script setup>
import { ref } from 'vue'

const count = ref(0)
const name = ref('홍길동')
const isActive = ref(true)
const items = ref(['사과', '바나나', '체리'])
const user = ref({ name: '이순신', age: 30 })
const increaseRef = () => {
  count.value++
}
const changeUserName = () => {
  user.value.name = '장보고'
}
</script>

<template>
  <div class="practice-section">
    <h2>반응형 상태 ref() 기초</h2>
    <p>카운트: {{ count }}</p>
    <p>이름: <input v-model="name" /> {{ name }}</p>
    <p>활성상태: {{ isActive ? '활성' : '비활성' }}</p>
    <p>과일목록: {{ items.join(', ') }}</p>
    <p>사용자 정보: {{ user.name }}, 나이 - ({{ user.age }})</p>
    <button @click="increaseRef">카운트 증가</button>
    <button @click="isActive = !isActive">활성상태 변경</button>
    <button @click="items.push('포도')">과일 추가</button>
    <button @click="changeUserName">사용자 이름 변경</button>
  </div>
</template>
