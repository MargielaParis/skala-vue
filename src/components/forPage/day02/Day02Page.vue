<script setup>
import { computed, reactive, ref, watch, watchEffect } from 'vue'
import StatusCard from './StatusCard.vue'
import CompositionExamples from './CompositionExamples.vue'

const members = reactive([
  { id: 1, name: '민지', role: 'Frontend', online: true },
  { id: 2, name: '준호', role: 'Backend', online: false },
  { id: 3, name: '서연', role: 'Design', online: true },
])
const selectedMemberId = ref(1)
const searchQuery = ref('')
const activityLog = ref('대기 중')

const filteredMembers = computed(() =>
  members.filter((member) => member.name.includes(searchQuery.value.trim())),
)
const selectedMember = computed(() =>
  members.find((member) => member.id === selectedMemberId.value),
)

watch(selectedMemberId, () => {
  activityLog.value = `${selectedMember.value.name}님의 카드를 선택했습니다.`
})
watchEffect(() => {
  console.log(`Day 02 검색어: ${searchQuery.value}`)
})

const selectMember = (member) => {
  selectedMemberId.value = member.id
}
</script>

<template>
  <section class="lesson-page">
    <header>
      <p>CHAPTER 3 · 4</p>
      <h1>Composition API와 Component</h1>
      <span>ref·reactive·computed·watch와 Props/Emits·Slot 흐름을 실습합니다.</span>
    </header>

    <section class="dashboard-card">
      <div class="toolbar">
        <div>
          <h2>팀 상태 보드</h2>
          <p>{{ activityLog }}</p>
        </div>
        <input v-model="searchQuery" type="search" placeholder="이름 검색" />
      </div>

      <div class="member-grid">
        <StatusCard
          v-for="member in filteredMembers"
          :key="member.id"
          :user="member"
          :selected="selectedMemberId === member.id"
          @select-user="selectMember"
        />
      </div>
    </section>

    <section class="slot-card">
      <header>
        <p>DEFAULT SLOT</p>
        <h2>선택한 구성원</h2>
      </header>
      <slot>
        <p v-if="selectedMember">
          <strong>{{ selectedMember.name }}</strong> · {{ selectedMember.role }}
        </p>
      </slot>
      <button @click="selectedMember.online = !selectedMember.online">온라인 상태 토글</button>
    </section>
    <CompositionExamples />
  </section>
</template>

<style scoped>
.lesson-page {
  color: #1e3147;
}
.lesson-page > header p,
.slot-card header p {
  margin: 0;
  color: #148476;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.1em;
}
.lesson-page > header h1 {
  margin: 4px 0;
  font-size: clamp(28px, 4vw, 42px);
}
.lesson-page > header span,
.toolbar p {
  color: #687b8e;
}
.dashboard-card,
.slot-card {
  padding: 22px;
  margin-top: 28px;
  background: #f6fbfa;
  border: 1px solid #d9e9e5;
  border-radius: 16px;
}
.toolbar {
  display: flex;
  gap: 16px;
  align-items: start;
  justify-content: space-between;
}
.toolbar h2,
.toolbar p,
.slot-card h2 {
  margin: 0;
}
.toolbar p {
  margin-top: 5px;
}
.toolbar input {
  max-width: 230px;
  padding: 9px;
  border: 1px solid #bfd2d9;
  border-radius: 8px;
}
.member-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 18px;
}
.slot-card {
  background: #fff;
}
.slot-card header {
  margin-bottom: 10px;
}
.slot-card button {
  padding: 8px 11px;
  color: #135e55;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  background: #e7f6f1;
  border: 1px solid #abdbd0;
  border-radius: 8px;
}
@media (max-width: 640px) {
  .toolbar {
    flex-direction: column;
  }
  .toolbar input {
    max-width: none;
    width: 100%;
  }
  .member-grid {
    grid-template-columns: 1fr;
  }
}
</style>
