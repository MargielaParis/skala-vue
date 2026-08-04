<script setup>
import { ref } from 'vue'

const lazyText = ref('')
const age = ref('')
const userEmail = ref('')
const price = ref('')
</script>

<template>
  <div class="practice-section">
    <h2>v-model 수식어(Modifiers) 활용</h2>
    <section>
      <h3>1) .lazy 수식어</h3>
      <input v-model.lazy="lazyText" type="text" placeholder="입력 후 Enter 또는 외부 클릭" />
      <p>
        확정된 값: <strong>{{ lazyText }}</strong>
      </p>
    </section>
    <section>
      <h3>2) .number 수식어</h3>
      <input v-model.number="age" type="text" placeholder="나이를 입력하세요" />
      <p>
        입력된 값: <strong>{{ age }}</strong>
      </p>
      <p>
        데이터 타입: <strong>{{ typeof age }}</strong>
      </p>
    </section>
    <section>
      <h3>3) .trim 수식어</h3>
      <input v-model.trim="userEmail" type="text" placeholder="앞뒤 공백을 포함해 입력해 보세요" />
      <p>
        공백 제거된 값: <strong>"{{ userEmail }}"</strong>
      </p>
      <p>
        문자열 길이: <strong>{{ userEmail.length }}</strong>
      </p>
    </section>
    <section>
      <h3>4) 수식어 체이닝 (.trim.number)</h3>
      <input
        v-model.trim.number="price"
        type="text"
        placeholder="공백과 숫자를 섞어 입력해 보세요"
      />
      <p>
        처리된 값: <strong>"{{ price }}"</strong>
      </p>
      <p>
        데이터 타입: <strong>{{ typeof price }}</strong>
      </p>
    </section>
  </div>
</template>

<style scoped>
section + section {
  margin-top: 20px;
}
</style>
