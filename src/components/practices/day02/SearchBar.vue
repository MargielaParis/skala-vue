<script setup>
defineProps({
  query: {
    type: String,
    required: true,
  },
  resultCount: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits(['update-query'])

const updateQuery = (event) => {
  emit('update-query', event.target.value)
}
</script>

<template>
  <div class="search-bar">
    <label for="search">지역 검색</label>
    <input
      id="search"
      :value="query"
      type="search"
      placeholder="도시·시군구 또는 날씨 상태"
      @input="updateQuery"
    />

    <p aria-live="polite">
      검색 중인 지역: <strong>{{ query || '전체' }}</strong>
      <span>({{ resultCount }}개)</span>
    </p>
  </div>
</template>

<style scoped>
.search-bar label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
}

.search-bar input {
  width: 100%;
}
</style>
