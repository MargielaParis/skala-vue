<script setup>
import { computed, onUnmounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const userForm = ref({ email: '', agree: false })
defineProps({
  example: { type: String, default: 'form' },
})
const productQuantity = ref(1)
const productRate = ref(4)
const downloadProgress = ref(0)
const isDownloading = ref(false)
let downloadTimerId = null

const orderSummary = computed(() => `${productQuantity.value}개 · 만족도 ${productRate.value}점`)

const register = () => {
  if (!userForm.value.email || !userForm.value.agree) {
    ElMessage.warning('이메일과 약관 동의가 필요합니다.')
    return
  }
  ElMessage.success('회원가입 예제가 완료되었습니다.')
}

const startDownload = () => {
  if (isDownloading.value) return
  isDownloading.value = true
  downloadProgress.value = 0
  downloadTimerId = window.setInterval(() => {
    downloadProgress.value += 20
    if (downloadProgress.value >= 100) {
      clearInterval(downloadTimerId)
      downloadTimerId = null
      isDownloading.value = false
      ElMessage.success('다운로드 완료')
    }
  }, 250)
}

onUnmounted(() => clearInterval(downloadTimerId))

const confirmDelete = async () => {
  try {
    await ElMessageBox.confirm('서버에서 항목을 삭제할까요?', '최종 확인', { type: 'warning' })
    ElMessage.success('삭제 요청 예제 완료')
  } catch {
    ElMessage.info('삭제를 취소했습니다.')
  }
}
</script>

<template>
  <section class="lesson-page">
    <el-card v-if="example === 'form'" header="Element Plus Form"
      ><el-input v-model="userForm.email" placeholder="email@example.com" /><el-switch
        v-model="userForm.agree"
        active-text="약관 동의"
      /><el-button type="primary" @click="register">회원가입</el-button></el-card
    >
    <el-card v-else-if="example === 'product'" header="Product State"
      ><el-input-number v-model="productQuantity" :min="1" /><el-rate v-model="productRate" />
      <p>{{ orderSummary }}</p></el-card
    >
    <el-card v-else-if="example === 'async'" header="Async Progress"
      ><el-progress :percentage="downloadProgress" /><el-button
        :loading="isDownloading"
        @click="startDownload"
        >다운로드</el-button
      ></el-card
    >
    <el-card v-else header="Confirm"
      ><p>ESLint · Prettier · Vite build 결과를 제출 전에 점검합니다.</p>
      <el-button type="danger" plain @click="confirmDelete">삭제 확인창</el-button></el-card
    >
  </section>
</template>

<style scoped>
.lesson-page {
  color: #1e3147;
}
.lesson-page :deep(.el-card__body) {
  display: grid;
  gap: 14px;
}
.lesson-grid p {
  margin: 0;
  color: #687b8e;
}
@media (max-width: 640px) {
}
</style>
