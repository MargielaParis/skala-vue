<template>
  <section class="about-page">
    <p>DAY 03</p>
    <h1>SKALA Weather</h1>
    <span>Vue Router로 화면을 나누고 Pinia로 온도 단위를 공유하는 날씨 실습입니다.</span
    ><RouterLink to="/weather">대시보드 보기</RouterLink>
  </section>
</template>
<style scoped>
.about-page {
  display: grid;
  gap: 14px;
  max-width: 620px;
}
.about-page p {
  margin: 0;
  color: #148476;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.1em;
}
.about-page h1 {
  margin: 0;
  color: #17324d;
}
.about-page span {
  color: #64798c;
}
.about-page a {
  color: #08796c;
  font-weight: 800;
}
</style>
