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

const result1 = ref('')
const result2 = ref('')
const result3 = ref('')

/* 과제 1. includes · 비구조화 할당 · 템플릿 리터럴 */
const runTask1 = () => {
  const members = ['김수원', '이서울', '박부산', '최대전']
  const rawData = { id: 101, grade: 'VIP', details: { score: 95 } }

  const memberContainsPark = members.includes('박부산')
  const {
    grade,
    details: { score },
  } = rawData

  result1.value = `부산 포함 여부: ${memberContainsPark} / 등급: ${grade} / 점수: ${score}점`
}

/* 과제 2. 스프레드 · 옵셔널 체이닝 · 널 병합 */
const runTask2 = () => {
  const currentCart = ['Apple', 'Banana']
  const newProduct = { name: 'Orange', stock: 0, preview: null }

  const updatedCart = [...currentCart, newProduct.name]
  const imgStatus = newProduct.preview?.url ?? '이미지 준비중'
  const finalStock = newProduct.stock ?? 0

  result2.value = `카트: ${updatedCart} / 이미지: ${imgStatus} / 수량: ${finalStock}개`
}

/* 과제 3. async/await 연쇄 호출 및 try-catch */
const fetchUserId = () => new Promise((resolve) => setTimeout(() => resolve({ uid: 777 }), 400))
const fetchUserProfile = (uid) =>
  new Promise((resolve) => setTimeout(() => resolve({ uid, nick: 'Graves' }), 400))

const runTask3 = async () => {
  result3.value = '⏳ 데이터 동기화 중...'
  try {
    const { uid } = await fetchUserId()
    const { nick } = await fetchUserProfile(uid)
    result3.value = `동기화 성공: ${nick}님 환영합니다.`
  } catch {
    result3.value = '통신 실패'
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
    <el-card v-else-if="example === 'ecma'" header="Modern JavaScript 과제">
      <div class="ecma-task">
        <h3>과제 1. 데이터 추출 및 포맷팅</h3>
        <el-button @click="runTask1">과제 1 가동</el-button>
        <p class="console">결과창 1: {{ result1 }}</p>
      </div>
      <div class="ecma-task">
        <h3>과제 2. 불변성 복사 및 데이터 방어</h3>
        <el-button @click="runTask2">과제 2 가동</el-button>
        <p class="console">결과창 2: {{ result2 }}</p>
      </div>
      <div class="ecma-task">
        <h3>과제 3. 비동기 연쇄 파이프라인 (Async/Await)</h3>
        <el-button @click="runTask3">과제 3 가동</el-button>
        <p class="console">결과창 3: {{ result3 }}</p>
      </div>
    </el-card>
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
.ecma-task {
  display: grid;
  gap: 8px;
  justify-items: start;
}
.ecma-task h3 {
  margin: 0;
  font-size: 15px;
}
.ecma-task .console {
  width: 100%;
  padding: 10px 12px;
  margin: 0;
  color: #29485b;
  font-size: 13px;
  background: #f3f8f7;
  border-radius: 8px;
}
</style>
