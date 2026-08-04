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
  background: #e7f6f1;
  border: 1px solid #abdbd0;
  border-radius: 8px;
}
</style>
