<script setup>
import { ref } from 'vue'

const isLogged = ref(false)
const score = ref(85)
</script>

<template>
  <div class="practice-section">
    <h2>v-if, v-else-if, v-else 디렉티브 학습</h2>
    <h3>1) 기본 로그인 상태 스위치</h3>
    <p v-if="isLogged">환영합니다! 회원 전용 화면입니다.</p>
    <p v-else>로그인이 필요합니다. 먼저 로그인해 주세요.</p>
    <button @click="isLogged = !isLogged">
      {{ isLogged ? '로그아웃 하기' : '로그인 하기' }}
    </button>
    <br />
    <h3>2) 성적별 학점 등급</h3>
    <label>
      현재 점수:
      <input v-model="score" type="number" min="0" max="100" step="5" />
    </label>
    <p v-if="score >= 90" class="grade-a">합격 등급: A 학점</p>
    <p v-else-if="score >= 80" class="grade-b">합격 등급: B 학점</p>
    <p v-else-if="score >= 70" class="grade-c">합격 등급: C 학점</p>
    <p v-else class="grade-f">합격 등급: F 학점</p>
  </div>
</template>

<style scoped>
.grade-a {
  color: green;
  font-weight: 700;
}

.grade-b {
  color: blue;
}

.grade-c {
  color: orange;
}

.grade-f {
  color: red;
  font-weight: 700;
}
</style>
