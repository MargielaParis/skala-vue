<script setup>
import { computed, ref } from 'vue'
import Day03Page from './forPage/day03/Day03Page.vue'
import Day04Page from './forPage/day04/Day04Page.vue'
import EventBasic from './practices/day01/EventBasic.vue'
import EventModifier from './practices/day01/EventModifier.vue'
import EventObject from './practices/day01/EventObject.vue'
import ModelBasic from './practices/day01/ModelBasic.vue'
import ModelForm from './practices/day01/ModelForm.vue'
import ModelModifier from './practices/day01/ModelModifier.vue'
import SampleOne from './practices/day01/SampleOne.vue'
import SampleTwo from './practices/day01/SampleTwo.vue'
import StyleScoped from './practices/day01/StyleScoped.vue'
import VueBind from './practices/day01/VueBind.vue'
import VueBindClass from './practices/day01/VueBindClass.vue'
import VueBindShorthand from './practices/day01/VueBindShorthand.vue'
import VueBindStyle from './practices/day01/VueBindStyle.vue'
import VueCloak from './practices/day01/VueCloak.vue'
import VueFor from './practices/day01/VueFor.vue'
import VueHtml from './practices/day01/VueHtml.vue'
import VueHtmlXss from './practices/day01/VueHtmlXss.vue'
import VueIf from './practices/day01/VueIf.vue'
import VueMemo from './practices/day01/VueMemo.vue'
import VueOnce from './practices/day01/VueOnce.vue'
import VuePre from './practices/day01/VuePre.vue'
import VueShow from './practices/day01/VueShow.vue'
import VueText from './practices/day01/VueText.vue'
import ComputedEx from './practices/day02/ComputedEx.vue'
import ReactiveEx from './practices/day02/ReactiveEx.vue'
import RefEx from './practices/day02/RefEx.vue'
import WatchDeepEx from './practices/day02/WatchDeepEx.vue'
import WatchEffectEx from './practices/day02/WatchEffectEx.vue'
import WatchEx from './practices/day02/WatchEx.vue'
import WatchMultiEx from './practices/day02/WatchMultiEx.vue'
import WatchReactiveEx from './practices/day02/WatchReactiveEx.vue'
import LifecycleParent from './practices/day02_own/lifeCycleParent.vue'
import PropsEmitsParent from './practices/day02_own/propsEmitsParent.vue'
import SlotDefaultParent from './practices/day02_own/slotDefaultParent.vue'
import SlotNameParent from './practices/day02_own/slotNameParent.vue'
import SlotScopedParent from './practices/day02_own/slotScopedParent.vue'

const lessons = [
  {
    id: 'day01',
    label: 'Day 01',
    range: '1 · 2장',
    examples: [
      { id: 'reactivity', label: '반응성', component: SampleOne },
      { id: 'interpolation', label: '보간법', component: SampleTwo },
      { id: 'text', label: 'v-text', component: VueText },
      { id: 'html', label: 'v-html', component: VueHtml },
      { id: 'xss', label: 'XSS', component: VueHtmlXss },
      { id: 'bind', label: 'v-bind', component: VueBind },
      { id: 'class', label: 'class 바인딩', component: VueBindClass },
      { id: 'style', label: 'style 바인딩', component: VueBindStyle },
      { id: 'shorthand', label: '단축 문법', component: VueBindShorthand },
      { id: 'if', label: 'v-if', component: VueIf },
      { id: 'show', label: 'v-show', component: VueShow },
      { id: 'for', label: 'v-for', component: VueFor },
      { id: 'pre', label: 'v-pre', component: VuePre },
      { id: 'cloak', label: 'v-cloak', component: VueCloak },
      { id: 'once', label: 'v-once', component: VueOnce },
      { id: 'memo', label: 'v-memo', component: VueMemo },
      { id: 'event', label: '이벤트', component: EventBasic },
      { id: 'event-modifier', label: '이벤트 수식어', component: EventModifier },
      { id: 'event-object', label: '이벤트 객체', component: EventObject },
      { id: 'model', label: 'v-model', component: ModelBasic },
      { id: 'form', label: '폼', component: ModelForm },
      { id: 'model-modifier', label: '모델 수식어', component: ModelModifier },
      { id: 'scoped-css', label: 'Scoped CSS', component: StyleScoped },
    ],
  },
  {
    id: 'day02',
    label: 'Day 02',
    range: '3 · 4장',
    examples: [
      { id: 'ref', label: 'ref()', component: RefEx },
      { id: 'reactive', label: 'reactive()', component: ReactiveEx },
      { id: 'computed', label: 'computed()', component: ComputedEx },
      { id: 'watch', label: 'watch()', component: WatchEx },
      { id: 'multi-watch', label: 'Multi Watch', component: WatchMultiEx },
      { id: 'deep-watch', label: 'Deep Watch', component: WatchDeepEx },
      { id: 'reactive-watch', label: 'reactive Watch', component: WatchReactiveEx },
      { id: 'watch-effect', label: 'watchEffect()', component: WatchEffectEx },
      { id: 'lifecycle', label: 'Lifecycle', component: LifecycleParent },
      { id: 'props-emits', label: 'Props & Emits', component: PropsEmitsParent },
      { id: 'default-slot', label: 'Default Slot', component: SlotDefaultParent },
      { id: 'named-slot', label: 'Named Slot', component: SlotNameParent },
      { id: 'scoped-slot', label: 'Scoped Slot', component: SlotScopedParent },
    ],
  },
  {
    id: 'day03',
    label: 'Day 03',
    range: '5 · 6 · 7장',
    examples: [
      { id: 'router', label: 'Vue Router', component: Day03Page, props: { example: 'router' } },
      { id: 'pinia', label: 'Pinia Store', component: Day03Page, props: { example: 'pinia' } },
      { id: 'axios', label: 'Axios Weather', component: Day03Page, props: { example: 'axios' } },
    ],
  },
  {
    id: 'day04',
    label: 'Day 04',
    range: '8 · 9 · 10장',
    examples: [
      { id: 'form', label: 'Element Plus Form', component: Day04Page, props: { example: 'form' } },
      {
        id: 'product',
        label: 'Product State',
        component: Day04Page,
        props: { example: 'product' },
      },
      { id: 'async', label: 'Async Progress', component: Day04Page, props: { example: 'async' } },
      { id: 'confirm', label: 'Build 점검', component: Day04Page, props: { example: 'confirm' } },
    ],
  },
]

const selectedDayId = ref('day01')
const selectedExampleId = ref(lessons[0].examples[0].id)
const selectedLesson = computed(() => lessons.find((lesson) => lesson.id === selectedDayId.value))
const selectedExample = computed(() =>
  selectedLesson.value.examples.find((example) => example.id === selectedExampleId.value),
)
const emit = defineEmits(['go-home'])
const selectLesson = (lesson) => {
  selectedDayId.value = lesson.id
  selectedExampleId.value = lesson.examples[0].id
}
</script>

<template>
  <section class="practice-page">
    <header class="page-heading">
      <p>VUE CURRICULUM</p>
      <h1>실습 페이지</h1>
      <span>4일 간의 실습을 한 눈에 볼 수 있습니다.</span>
    </header>
    <div class="practice-layout">
      <aside class="practice-sidebar">
        <p>DAY</p>
        <div class="day-list">
          <button
            v-for="lesson in lessons"
            :key="lesson.id"
            :class="{ active: selectedDayId === lesson.id }"
            @click="selectLesson(lesson)"
          >
            <strong>{{ lesson.label }}</strong>
            <small>{{ lesson.range }}</small>
          </button>
        </div>
        <div class="sidebar-divider"></div>
        <p>EXAMPLES</p>
        <button
          v-for="example in selectedLesson.examples"
          :key="example.id"
          class="example-link"
          :class="{ selected: selectedExampleId === example.id }"
          @click="selectedExampleId = example.id"
        >
          {{ example.label }}
        </button>
      </aside>
      <div class="practice-content">
        <p class="current-example">{{ selectedLesson.label }} · {{ selectedExample.label }}</p>
        <div class="example-stage">
          <component
            :is="selectedExample.component"
            :key="`${selectedDayId}-${selectedExample.id}`"
            v-bind="selectedExample.props"
            @go-home="emit('go-home')"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.practice-page {
  color: #1e3147;
}
.page-heading p,
.practice-sidebar > p,
.current-example {
  margin: 0;
  color: #148476;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.1em;
}
.page-heading h1 {
  margin: 4px 0;
  font-size: clamp(30px, 4vw, 44px);
}
.page-heading span {
  color: #687b8e;
}
.practice-layout {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 24px;
  margin-top: 30px;
}
.practice-sidebar {
  display: flex;
  flex-direction: column;
  gap: 5px;
  height: max-content;
  padding: 14px;
  background: #f0f6f5;
  border: 1px solid #dbe9e6;
  border-radius: 16px;
}
.practice-sidebar > p {
  margin: 6px 7px;
}
.day-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 5px;
}
.practice-sidebar button {
  display: grid;
  gap: 2px;
  padding: 10px;
  color: #5d7284;
  cursor: pointer;
  text-align: left;
  background: transparent;
  border: 0;
  border-radius: 8px;
}
.practice-sidebar button.active {
  color: #075f55;
  background: #dff4ed;
}
.practice-sidebar small {
  font-size: 11px;
}
.sidebar-divider {
  height: 1px;
  margin: 8px 2px;
  background: #d4e1df;
}
.practice-sidebar .example-link {
  padding: 8px 10px;
  font-size: 13px;
}
.practice-sidebar .example-link.selected {
  color: #075f55;
  font-weight: 800;
  background: #fff;
}
.current-example {
  margin-bottom: 12px;
}
.example-stage {
  --example-surface: #fff;
  --example-surface-muted: #f3f8f7;
  --example-border: #dfe9eb;
  --example-text: #1e3147;
  --example-subtext: #64798c;
  color: var(--example-text);
}
.example-stage :deep(.practice-section),
.example-stage :deep(.lesson-card),
.example-stage :deep(.el-card) {
  color: var(--example-text);
  background: var(--example-surface);
  border: 1px solid var(--example-border);
  border-radius: 16px;
  box-shadow: 0 10px 24px rgb(32 68 83 / 8%);
}
.example-stage :deep(.practice-section),
.example-stage :deep(.lesson-card) {
  padding: 22px;
  margin: 0;
}
.example-stage :deep(.practice-section h2),
.example-stage :deep(.practice-section h3),
.example-stage :deep(.lesson-card h2),
.example-stage :deep(.el-card__header) {
  color: var(--example-text);
}
.example-stage :deep(.practice-section p),
.example-stage :deep(.practice-section label),
.example-stage :deep(.lesson-card p),
.example-stage :deep(.lesson-card label) {
  color: var(--example-subtext);
}
.example-stage :deep(.monitor),
.example-stage :deep(.status-bar) {
  color: var(--example-text);
  background: var(--example-surface-muted);
  border-color: var(--example-border);
}
.example-stage :deep(.el-card__header) {
  border-bottom-color: var(--example-border);
}
.example-stage :deep(button) {
  margin: 2px;
}
@media (max-width: 720px) {
  .practice-layout {
    grid-template-columns: 1fr;
  }
}
</style>
