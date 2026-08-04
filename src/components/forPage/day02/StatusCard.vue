<script setup>
defineProps({
  user: { type: Object, required: true },
  selected: Boolean,
})

const emit = defineEmits(['select-user'])
</script>

<template>
  <button class="status-card" :class="{ selected }" @click="emit('select-user', user)">
    <span>{{ user.role }}</span>
    <strong>{{ user.name }}</strong>
    <small>{{ user.online ? '온라인' : '자리 비움' }}</small>
  </button>
</template>

<style scoped>
.status-card {
  display: grid;
  gap: 4px;
  width: 100%;
  padding: 14px;
  color: #254054;
  cursor: pointer;
  text-align: left;
  background: #fff;
  border: 1px solid #dbe6e9;
  border-radius: 12px;
}
.status-card.selected {
  color: #075f55;
  background: #e7f7f1;
  border-color: #3ba996;
}
.status-card span,
.status-card small {
  color: #6d8090;
  font-size: 12px;
}
</style>
