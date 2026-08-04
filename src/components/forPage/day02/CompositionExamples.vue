<script setup>
import { computed, ref } from 'vue'
import ComputedEx from '../../practices/day02/ComputedEx.vue'
import ReactiveEx from '../../practices/day02/ReactiveEx.vue'
import RefEx from '../../practices/day02/RefEx.vue'
import WatchDeepEx from '../../practices/day02/WatchDeepEx.vue'
import WatchEffectEx from '../../practices/day02/WatchEffectEx.vue'
import WatchEx from '../../practices/day02/WatchEx.vue'
import WatchMultiEx from '../../practices/day02/WatchMultiEx.vue'
import WatchReactiveEx from '../../practices/day02/WatchReactiveEx.vue'
import LifecycleParent from '../../practices/day02_own/lifeCycleParent.vue'
import PropsEmitsParent from '../../practices/day02_own/propsEmitsParent.vue'
import SlotDefaultParent from '../../practices/day02_own/slotDefaultParent.vue'
import SlotNameParent from '../../practices/day02_own/slotNameParent.vue'
import SlotScopedParent from '../../practices/day02_own/slotScopedParent.vue'

const examples = [
  ['ref', 'ref()', RefEx],
  ['reactive', 'reactive()', ReactiveEx],
  ['computed', 'computed()', ComputedEx],
  ['watch', 'watch()', WatchEx],
  ['multi', 'Multi Watch', WatchMultiEx],
  ['deep', 'Deep Watch', WatchDeepEx],
  ['reactive-watch', 'reactive Watch', WatchReactiveEx],
  ['effect', 'watchEffect()', WatchEffectEx],
  ['life', 'Lifecycle', LifecycleParent],
  ['props', 'Props & Emits', PropsEmitsParent],
  ['default', 'Default Slot', SlotDefaultParent],
  ['named', 'Named Slot', SlotNameParent],
  ['scoped', 'Scoped Slot', SlotScopedParent],
]
const selectedId = ref('ref')
const selected = computed(() => examples.find(([id]) => id === selectedId.value))
</script>
<template>
  <section class="browser">
    <h2>전체 Composition · Component 예제</h2>
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
