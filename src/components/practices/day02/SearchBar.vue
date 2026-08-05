<script setup>
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'

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

const updateQuery = (value) => {
  emit('update-query', value)
}
</script>

<template>
  <div class="search-bar">
    <label for="search">지역 검색</label>
    <div class="search-field">
      <InputText
        id="search"
        :model-value="query"
        type="search"
        size="large"
        fluid
        placeholder="도시·시군구 또는 날씨 상태"
        @update:model-value="updateQuery"
      />
      <Button
        v-if="query"
        class="search-clear"
        type="button"
        label="지우기"
        severity="secondary"
        size="small"
        text
        rounded
        @click="updateQuery('')"
      />
    </div>

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

.search-field {
  position: relative;
}

.search-bar :deep(.p-inputtext) {
  width: 100%;
  padding: 13px 74px 13px 16px;
  color: #29485b;
  background: linear-gradient(125deg, rgb(255 255 255 / 72%), rgb(255 255 255 / 32%));
  border: 1px solid rgb(255 255 255 / 84%);
  border-radius: 16px;
  box-shadow:
    0 10px 26px rgb(39 92 122 / 10%),
    inset 0 1px 0 rgb(255 255 255 / 92%),
    inset 0 -1px 0 rgb(135 192 220 / 22%);
  backdrop-filter: blur(18px) saturate(1.35);
}

.search-bar :deep(.p-inputtext:focus) {
  border-color: rgb(126 205 218 / 78%);
  box-shadow:
    0 0 0 3px rgb(121 219 213 / 18%),
    0 12px 30px rgb(39 92 122 / 13%),
    inset 0 1px 0 rgb(255 255 255 / 94%);
}

.search-clear {
  position: absolute;
  top: 50%;
  right: 7px;
  transform: translateY(-50%);
}

.search-bar p {
  margin: 9px 2px 0;
  color: #64798c;
  font-size: 12px;
}

.search-bar p span {
  margin-left: 4px;
}

:global([data-theme='dark']) .search-bar :deep(.p-inputtext) {
  color: #e4f0f4;
  background: linear-gradient(125deg, rgb(255 255 255 / 22%), rgb(255 255 255 / 8%));
  border-color: rgb(255 255 255 / 34%);
  box-shadow:
    0 10px 26px rgb(0 0 0 / 18%),
    inset 0 1px 0 rgb(255 255 255 / 24%);
}

:global([data-theme='dark']) .search-bar p {
  color: #e4f0f4;
}

:global([data-theme='dark']) .search-bar p strong,
:global([data-theme='dark']) .search-bar p span {
  color: #f2f8fa;
}
</style>
