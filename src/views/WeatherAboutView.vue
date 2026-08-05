<template>
  <section class="about-page">
    <header class="about-hero">
      <p>SKALA WEATHER</p>
      <h1>대한민국의 하늘을,<br />한 화면에서</h1>
      <span>
        서울부터 제주까지, 전국 251개 시·군·구의 현재 날씨와 예보를 지도 위에서 탐색하는 실시간 날씨
        대시보드입니다. 오늘의 하늘이 궁금할 때, 클릭 한 번이면 충분합니다.
      </span>
      <div class="hero-actions">
        <RouterLink class="cta-primary" to="/weather">대시보드 바로가기 →</RouterLink>
        <RouterLink class="cta-secondary" to="/practice">Vue 실습 모음</RouterLink>
      </div>
    </header>

    <ul class="about-stats">
      <li>
        <strong>17</strong>
        <span>시·도 지도 탐색</span>
      </li>
      <li>
        <strong>251</strong>
        <span>시·군·구 날씨 조회</span>
      </li>
      <li>
        <strong>12시간</strong>
        <span>시간별 예보 그래프</span>
      </li>
      <li>
        <strong>3곳</strong>
        <span>기상 데이터 소스</span>
      </li>
    </ul>

    <div class="about-section">
      <p>FEATURES</p>
      <h2>핵심 기능</h2>
      <div class="about-features">
        <article>
          <span class="feature-icon" aria-hidden="true">🗺️</span>
          <h3>지도로 탐색하는 전국 날씨</h3>
          <p>
            행정구역 지도에서 시·도를 선택하면 시·군·구까지 확대됩니다. 전국 기온 히트맵으로 온도
            분포를 한눈에 볼 수 있습니다.
          </p>
        </article>
        <article>
          <span class="feature-icon" aria-hidden="true">🌤️</span>
          <h3>지금 이 순간의 날씨</h3>
          <p>
            기온·체감온도·습도·풍속부터 미세먼지·오존·일출·일몰까지, 현재 날씨의 상태를 상세하게
            보여줍니다.
          </p>
        </article>
        <article>
          <span class="feature-icon" aria-hidden="true">📈</span>
          <h3>다가올 날씨 미리 보기</h3>
          <p>
            3시간 단위 예보와 12시간 기온·체감·습도·강수확률 그래프로 앞으로의 날씨를 미리
            준비하세요.
          </p>
        </article>
        <article>
          <span class="feature-icon" aria-hidden="true">⭐</span>
          <h3>나만의 대시보드</h3>
          <p>
            자주 찾는 지역은 즐겨찾기로 모아두고 드래그로 순서를 바꿔보세요. 기온·습도·풍속 정렬과
            함께 설정이 브라우저에 그대로 저장됩니다.
          </p>
        </article>
        <article>
          <span class="feature-icon" aria-hidden="true">🔔</span>
          <h3>조건별 날씨 요약</h3>
          <p>더위·추위·강수·대기질·강풍 — 즐겨찾는 지역의 주의가 필요한 날씨를 자동으로 요약해 알려드립니다.</p>
        </article>
        <article>
          <span class="feature-icon" aria-hidden="true">🌓</span>
          <h3>세심한 사용 경험</h3>
          <p>
            다크 모드와 섭씨·화씨 전환, 내 위치 기반 탐색, 어떤 화면에서도 편안한 반응형 레이아웃을
            갖췄습니다.
          </p>
        </article>
      </div>
    </div>

    <div class="about-section">
      <p>HOW TO USE</p>
      <h2>이렇게 사용해 보세요</h2>
      <ol class="about-guide">
        <li>
          <h3>지역 찾기</h3>
          <span>
            검색창에 지역명을 입력하거나 지도에서 시·도를 직접 선택하세요. 내 위치 버튼으로 주변
            날씨도 바로 확인할 수 있습니다.
          </span>
        </li>
        <li>
          <h3>날씨 확인</h3>
          <span>
            날씨 카드에서 현재 상태를 확인하고, 카드를 열면 상세 관측값과 시간별 예보 그래프가
            펼쳐집니다.
          </span>
        </li>
        <li>
          <h3>내 스타일로</h3>
          <span>
            즐겨찾기·정렬·단위·테마를 취향대로 설정하세요. 다음 방문에도 그대로 유지됩니다.
          </span>
        </li>
      </ol>
    </div>

    <footer class="about-data">
      <div>
        <p>DATA SOURCES</p>
        <h2>믿을 수 있는 기상 데이터</h2>
      </div>
      <ul>
        <li>
          <strong>OpenWeather</strong>
          <span>현재 날씨 · 3시간 예보 · 대기질</span>
        </li>
        <li>
          <strong>Open-Meteo</strong>
          <span>시간별 예보 · 전국 기온 히트맵</span>
        </li>
        <li>
          <strong>Windy</strong>
          <span>실시간 기상 레이어</span>
        </li>
      </ul>
      <span class="tech-note">Vue 3 · Vite · Pinia · Vue Router로 만들었습니다.</span>
    </footer>
  </section>
</template>

<style scoped>
.about-page {
  display: grid;
  gap: 44px;
}

.about-hero {
  display: grid;
  gap: 14px;
  max-width: 640px;
}

.about-hero p,
.about-section > p,
.about-data p {
  margin: 0;
  color: #148476;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.11em;
}

.about-hero h1 {
  margin: 0;
  color: #17324d;
  font-size: clamp(32px, 5vw, 54px);
  line-height: 1.14;
  letter-spacing: -0.04em;
}

.about-hero > span {
  color: #64798c;
  font-size: 17px;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 8px;
}

.cta-primary,
.cta-secondary {
  padding: 11px 18px;
  font-size: 14px;
  font-weight: 800;
  text-decoration: none;
  border-radius: 999px;
}

.cta-primary {
  color: #f2fbf9;
  background: linear-gradient(135deg, #119a86, #0b6d77);
  box-shadow: 0 10px 22px rgb(12 105 112 / 28%);
}

.cta-primary:hover {
  filter: brightness(1.06);
}

.cta-secondary {
  color: #116b84;
  background: var(--sky-surface-soft);
  border: 1px solid var(--sky-border-muted);
}

.about-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  padding: 0;
  margin: 0;
  list-style: none;
}

.about-stats li {
  display: grid;
  gap: 4px;
  padding: 18px 20px;
  background: var(--sky-surface-soft);
  border: 1px solid var(--sky-border-muted);
  border-radius: 18px;
}

.about-stats strong {
  color: #17324d;
  font-size: 28px;
  letter-spacing: -0.03em;
}

.about-stats span {
  color: #64798c;
  font-size: 13px;
  font-weight: 600;
}

.about-section {
  display: grid;
  gap: 18px;
}

.about-section h2,
.about-data h2 {
  margin: 2px 0 0;
  color: #17324d;
  font-size: 24px;
  letter-spacing: -0.02em;
}

.about-features {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.about-features article {
  display: grid;
  gap: 8px;
  align-content: start;
  padding: 20px;
  background: var(--sky-surface-soft);
  border: 1px solid var(--sky-border-muted);
  border-radius: 18px;
}

.feature-icon {
  font-size: 22px;
  line-height: 1;
}

.about-features h3 {
  margin: 2px 0 0;
  color: #17324d;
  font-size: 16px;
}

.about-features p {
  margin: 0;
  color: #64798c;
  font-size: 14px;
  line-height: 1.6;
}

.about-guide {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding: 0;
  margin: 0;
  list-style: none;
  counter-reset: guide-step;
}

.about-guide li {
  display: grid;
  gap: 6px;
  padding: 20px;
  background: var(--sky-surface-soft);
  border: 1px solid var(--sky-border-muted);
  border-radius: 18px;
  counter-increment: guide-step;
}

.about-guide li::before {
  color: #148476;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.1em;
  content: 'STEP 0' counter(guide-step);
}

.about-guide h3 {
  margin: 0;
  color: #17324d;
  font-size: 16px;
}

.about-guide span {
  color: #64798c;
  font-size: 14px;
  line-height: 1.6;
}

.about-data {
  display: grid;
  gap: 16px;
  padding: 22px 24px;
  background: var(--sky-surface-soft);
  border: 1px solid var(--sky-border-muted);
  border-radius: 18px;
}

.about-data ul {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding: 0;
  margin: 0;
  list-style: none;
}

.about-data li {
  display: grid;
  gap: 2px;
}

.about-data strong {
  color: #17324d;
  font-size: 15px;
}

.about-data li span {
  color: #64798c;
  font-size: 13px;
}

.tech-note {
  padding-top: 12px;
  color: #64798c;
  font-size: 13px;
  border-top: 1px solid var(--sky-border-muted);
}

:root[data-theme='dark'] .about-hero h1,
:root[data-theme='dark'] .about-stats strong,
:root[data-theme='dark'] .about-section h2,
:root[data-theme='dark'] .about-features h3,
:root[data-theme='dark'] .about-guide h3,
:root[data-theme='dark'] .about-data h2,
:root[data-theme='dark'] .about-data strong {
  color: #e4f0f4;
}

:root[data-theme='dark'] .about-features p {
  color: #b8cbd5;
}

:root[data-theme='dark'] .about-page a.cta-primary {
  color: #f2fbf9;
}

:root[data-theme='dark'] .about-page a.cta-secondary {
  color: #88dfd1;
}

@media (max-width: 900px) {
  .about-features,
  .about-guide,
  .about-data ul {
    grid-template-columns: 1fr;
  }

  .about-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
