<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <section class="home-page">
    <div class="hero-copy">
      <p>FULL-STACK ENGINEERING · VUE.JS</p>
      <h1>배운 것을 직접<br />움직여 보는 Vue 실습실</h1>
      <span>기본 문법부터 각종 실습 예제까지 한곳에서 확인하세요.</span>
    </div>

    <div class="home-cards">
      <RouterLink class="home-card practice-card" to="/practice">
        <span>01</span>
        <h2>실습 페이지</h2>
        <p>실습 예제를 선택해 실행합니다.</p>
        <strong>실습 둘러보기 →</strong>
      </RouterLink>
      <RouterLink class="home-card assignment-card" to="/assignment">
        <span>02</span>
        <h2>과제 제출</h2>
        <p>컴포넌트로 구성한 실시간 날씨 대시보드입니다.</p>
        <strong>과제 보기 →</strong>
      </RouterLink>
    </div>
  </section>
</template>

<style scoped>
.home-page {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(360px, 0.75fr);
  gap: 32px;
  align-items: end;
  min-height: 64vh;
}

.hero-copy {
  padding: 44px 0;
}

.hero-copy p {
  margin: 0;
  color: #148476;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.11em;
}

.hero-copy h1 {
  margin: 12px 0 20px;
  color: #17324d;
  font-size: clamp(38px, 6vw, 72px);
  line-height: 1.12;
  letter-spacing: -0.06em;
}

.hero-copy span {
  color: #64798c;
  font-size: 17px;
}

.home-cards {
  display: grid;
  gap: 14px;
}

.home-card {
  min-height: 190px;
  padding: 25px;
  color: inherit;
  text-align: left;
  text-decoration: none;
  border-radius: 20px;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.home-card:hover {
  box-shadow: 0 16px 30px rgb(30 69 81 / 18%);
  transform: translateY(-4px);
}

.home-card span {
  display: block;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.1em;
}

.home-card h2 {
  margin: 6px 0;
  font-size: 26px;
}

.home-card p {
  margin: 0 0 18px;
}

.practice-card {
  color: #163d3b;
  background: #dff5ef;
}

.assignment-card {
  color: #193a58;
  background: #ddecfa;
}

@media (max-width: 720px) {
  .home-page {
    grid-template-columns: 1fr;
    min-height: auto;
  }

  .hero-copy {
    padding: 0;
  }
}
</style>
