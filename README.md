# 대한민국 날씨 대시보드

[![GitHub Pages](https://github.com/MargielaParis/skala-vue/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/MargielaParis/skala-vue/actions/workflows/deploy-pages.yml)

Vue 3 Composition API 실습을 실제 날씨 데이터와 대한민국 행정구역 지도까지 확장한 반응형 대시보드입니다.

**[배포 페이지 바로가기](https://margielaparis.github.io/skala-vue/#/assignment)**

## 과제 요구사항 구현

- `ref`, `computed`, `watch`, `watchEffect` 기반 검색·선택·날씨 상태 관리
- `v-for` 날씨 카드 렌더링 및 지역명 필터링
- `WeatherParent`, `BaseDashboardCard`, `SearchBar`, `WeatherCard` 컴포넌트 분리
- Props, Emits, 기본·Named·Scoped Slot 실습
- Vue Router 지연 로딩, 동적 지역 상세 경로, Catch-all 경로
- Pinia 기반 섭씨·화씨 단위 전환과 메인·상세 화면 연동
- Axios와 OpenWeather API를 이용한 현재 날씨·예보 조회
- Element Plus·PrimeVue 컴포넌트 적용
- ESLint 커스텀 규칙, Prettier, staging·production 모드 빌드
- 환경 변수로 API 키 분리 및 GitHub Pages 자동 배포

## 과제 외 추가 구현

- 17개 시·도와 251개 시·군·구 GeoJSON을 이용한 SVG 행정구역 지도
- 지역 선택 애니메이션, 마우스 오버 강조, 전국 기온 히트맵과 범례
- 행정구역 통합 검색, 내 위치 기반 지역 탐색, 검색 결과 상태 유지
- Windy 실시간 기상 지도와 초기 위치 복원 기능
- 현재 기온·체감온도·습도·풍속·미세먼지·오존·일출·일몰 표시
- 3시간 예보와 12시간 기온·체감온도·습도·강수확률 그래프
- 기온·습도·풍속 정렬, 즐겨찾기 필터·드래그 정렬·로컬 저장
- 더위·추위·강수·대기질·강풍 조건별 날씨 요약 알림
- API 요청 중복 방지와 날씨·예보·히트맵 캐시
- 다크 모드, 섭씨·화씨 전환, 반응형 레이아웃, 구름 배경 애니메이션
- 강의별 Vue 문법·Composition API·컴포넌트·Modern JavaScript 실습 모음

## 기술 구성

- Vue 3, Vite, Vue Router, Pinia
- Axios, OpenWeather API, Open-Meteo API, Windy Embed
- PrimeVue, Element Plus
- ESLint, Oxlint, Prettier
- GitHub Actions, GitHub Pages

## 로컬 실행

Node.js `22.18+` 또는 `24.12+`가 필요합니다.

```sh
npm ci
cp .env.example .env.local
```

`.env.local`에 OpenWeather API 키를 입력합니다.

```dotenv
VITE_OPENWEATHER_API_KEY=발급받은_API_키
```

```sh
npm run dev
```

## 환경별 빌드

| 명령                       | 환경 파일         | 용도                            |
| -------------------------- | ----------------- | ------------------------------- |
| `npm run build:staging`    | `.env.staging`    | staging 모드 실습               |
| `npm run build`            | `.env.production` | 기본 production 빌드            |
| `npm run build:production` | `.env.production` | production 모드 명시 빌드       |
| `npm run preview`          | 빌드 결과         | 로컬 배포 결과 확인             |
| `npm run lint`             | -                 | Oxlint·ESLint 검사 및 자동 수정 |
| `npm run format`           | -                 | `src` 코드 Prettier 정리        |

`.env.staging`과 `.env.production`에는 공개 가능한 API 주소만 저장합니다. API 키는 `.env.local` 또는 GitHub Actions Secret으로만 관리합니다.

## API

| 서비스      | 사용 기능                     | 키 필요 여부 |
| ----------- | ----------------------------- | ------------ |
| OpenWeather | 현재 날씨, 3시간 예보, 대기질 | 필요         |
| Open-Meteo  | 시간별 예보, 전국 기온 히트맵 | 불필요       |
| Windy       | 실시간 기상 레이어            | 불필요       |

Vite의 `VITE_*` 환경 변수는 브라우저용 번들에 포함됩니다. 공개 배포용 OpenWeather 키에는 서비스 제공자 설정에서 도메인과 호출량 제한을 적용하는 것을 권장합니다.

## 주요 경로

| 경로                 | 화면           |
| -------------------- | -------------- |
| `/#/`                | 프로젝트 소개  |
| `/#/practice`        | 강의 실습 모음 |
| `/#/assignment`      | 날씨 대시보드  |
| `/#/weather/about`   | 서비스 소개    |
| `/#/weather/:cityId` | 지역 상세 관측 |

## 배포

저장소의 `Settings → Secrets and variables → Actions`에 아래 Repository Secret을 등록합니다.

```text
VITE_OPENWEATHER_API_KEY
```

`main` 브랜치에 push하면 [배포 워크플로](.github/workflows/deploy-pages.yml)가 다음 순서로 실행됩니다.

1. 의존성 재현 설치
2. Oxlint·ESLint 정적 검사
3. API Secret 설정 확인
4. production 빌드
5. GitHub Pages 아티팩트 업로드 및 배포

API Secret이 비어 있으면 API가 제외된 페이지를 배포하지 않도록 빌드 작업이 중단됩니다.
