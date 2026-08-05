<script setup>
import SlotNamedChild from './SlotNamedChild.vue'
</script>

<template>
  <br />
  <br />
  <div class="practice-section">
    <h2>Named slot 레이아웃 주입 실습</h2>
    <SlotNamedChild>
      <template v-slot:header>
        <h3>child 주입 제목</h3>
      </template>
      <p>Default 영역에 주입합니다.</p>
    </SlotNamedChild>
  </div>
</template>
