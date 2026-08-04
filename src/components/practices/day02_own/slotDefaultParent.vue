<script setup>
import slotDefaultChild from './slotDefaultChild.vue'
</script>

<template>
  <br />
  <br />
  <div class="practice-section">
    <h2>Default slot 레이아웃 주입 실습</h2>
    <slotDefaultChild>
      <p>단순한 텍스트 문장을 주입합니다.</p>
    </slotDefaultChild>
    <slotDefaultChild>
      <h2 style="color: red">HTML 태그를 주입합니다.</h2>
      <button>확인</button>
    </slotDefaultChild>
    <slotDefaultChild></slotDefaultChild>
  </div>
</template>
