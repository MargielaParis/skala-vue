<script setup>
import { useConfigStore } from '../stores/configStore'

const configStore = useConfigStore()
</script>

<template>
  <button class="unit-toggler" type="button" @click="configStore.toggleUnit">
    단위 {{ configStore.unitSymbol }}
  </button>
</template>

<style scoped>
.unit-toggler {
  padding: 8px 10px;
  color: #135e55;
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  background: rgb(222 243 246 / 78%);
  border: 1px solid rgb(255 255 255 / 72%);
  border-radius: 8px;
}
</style>
