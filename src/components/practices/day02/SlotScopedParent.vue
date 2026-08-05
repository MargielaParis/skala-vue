<script setup>
import SlotScopedChild from './SlotScopedChild.vue'
</script>

<template>
  <br />
  <br />
  <div class="practice-section">
    <h2>Scoped slot 레이아웃 주입 실습</h2>
    <SlotScopedChild v-slot="{ text, count }">
      <div>
        <p>부모가 마크업을 주입한 화면</p>
        <p>{{ text }}</p>
        <p>현재 접속자 수: {{ count }}명</p>
      </div>
    </SlotScopedChild>
    <SlotScopedChild></SlotScopedChild>
  </div>
</template>
