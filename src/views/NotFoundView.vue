<template>
  <section class="not-found">
    <p>404</p>
    <h1>페이지를 찾을 수 없습니다.</h1>
    <span>현재 개발중이거나, 없는 페이지입니다.</span>
    <span>주소를 확인하시고, 다시 시도해주세요.</span>
    <RouterLink to="/">홈으로 돌아가기</RouterLink>
  </section>
</template>

<style scoped>
.not-found {
  display: grid;
  gap: 12px;
  place-content: center;
  min-height: 50vh;
  text-align: center;
}
.not-found p {
  margin: 0;
  color: #148476;
  font-weight: 800;
}
.not-found h1 {
  margin: 0;
  color: #17324d;
}
.not-found a {
  color: #08796c;
  font-weight: 800;
}
</style>
