<script setup>
import { computed, ref } from 'vue'
import EventBasic from '../../practices/day01/EventBasic.vue'
import EventModifier from '../../practices/day01/EventModifier.vue'
import EventObject from '../../practices/day01/EventObject.vue'
import ModelBasic from '../../practices/day01/ModelBasic.vue'
import ModelForm from '../../practices/day01/ModelForm.vue'
import ModelModifier from '../../practices/day01/ModelModifier.vue'
import SampleOne from '../../practices/day01/SampleOne.vue'
import SampleTwo from '../../practices/day01/SampleTwo.vue'
import StyleScoped from '../../practices/day01/StyleScoped.vue'
import VueBind from '../../practices/day01/VueBind.vue'
import VueBindClass from '../../practices/day01/VueBindClass.vue'
import VueBindShorthand from '../../practices/day01/VueBindShorthand.vue'
import VueBindStyle from '../../practices/day01/VueBindStyle.vue'
import VueCloak from '../../practices/day01/VueCloak.vue'
import VueFor from '../../practices/day01/VueFor.vue'
import VueHtml from '../../practices/day01/VueHtml.vue'
import VueHtmlXss from '../../practices/day01/VueHtmlXss.vue'
import VueIf from '../../practices/day01/VueIf.vue'
import VueMemo from '../../practices/day01/VueMemo.vue'
import VueOnce from '../../practices/day01/VueOnce.vue'
import VuePre from '../../practices/day01/VuePre.vue'
import VueShow from '../../practices/day01/VueShow.vue'
import VueText from '../../practices/day01/VueText.vue'

const examples = [
  ['sample1', '반응성', SampleOne],
  ['sample2', '보간법', SampleTwo],
  ['text', 'v-text', VueText],
  ['html', 'v-html', VueHtml],
  ['xss', 'XSS', VueHtmlXss],
  ['bind', 'v-bind', VueBind],
  ['class', 'class', VueBindClass],
  ['style', 'style', VueBindStyle],
  ['short', '단축 문법', VueBindShorthand],
  ['if', 'v-if', VueIf],
  ['show', 'v-show', VueShow],
  ['for', 'v-for', VueFor],
  ['pre', 'v-pre', VuePre],
  ['cloak', 'v-cloak', VueCloak],
  ['once', 'v-once', VueOnce],
  ['memo', 'v-memo', VueMemo],
  ['event', '이벤트', EventBasic],
  ['modifier', '수식어', EventModifier],
  ['object', '이벤트 객체', EventObject],
  ['model', 'v-model', ModelBasic],
  ['form', '폼', ModelForm],
  ['model-modifier', '모델 수식어', ModelModifier],
  ['scoped', 'Scoped CSS', StyleScoped],
]
const selectedId = ref('sample1')
const selected = computed(() => examples.find(([id]) => id === selectedId.value))
</script>
<template>
  <section class="browser">
    <h2>전체 기본 문법 예제</h2>
    <div class="tabs">
      <button
        v-for="[id, title] in examples"
        :key="id"
        :class="{ active: selectedId === id }"
        @click="selectedId = id"
      >
        {{ title }}
      </button>
    </div>
    <div class="stage"><component :is="selected[2]" :key="selected[0]" /></div>
  </section>
</template>
<style scoped>
.browser {
  padding: 22px;
  margin-top: 18px;
  background: #fff;
  border: 1px solid #dfe9eb;
  border-radius: 16px;
}
.browser h2 {
  margin-top: 0;
}
.tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.tabs button {
  padding: 6px 9px;
  cursor: pointer;
  background: #eef5f4;
  border: 0;
  border-radius: 7px;
}
.tabs button.active {
  color: #075f55;
  background: #dff4ed;
}
.stage {
  margin-top: 16px;
}
</style>
