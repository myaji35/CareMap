# CareMap v1.0 작업 체크리스트 (The Tasks)

> PRD와 Plan을 기반으로 BAMD(Brainstorm, Analysis, Method, Development)의 모든 요소를 실제 코드로 변환하기 위한 상세 작업 목록

---

## 🚀 Milestone 1: The Foundation (Data Pipeline)

### Analysis & Method (DB/Prisma)
- [ ] Neon.tech 프로젝트 생성 및 `DATABASE_URL`, `DIRECT_URL` 확보
- [ ] `.env` 파일에 Neon.tech URL 설정
- [ ] `prisma/schema.prisma` 파일에 `Institution` 모델 정의
- [ ] `prisma/schema.prisma` 파일에 `InstitutionHistory` 모델 정의 (관계 포함)
- [ ] `npx prisma db push` 명령어로 Neon.tech DB와 스키마 동기화

### Development (API & Crawler)
- [ ] Next.js API Route (`/app/api/institutions/route.ts`) 생성 (GET - 목록 조회)
- [ ] Next.js API Route (`/app/api/institutions/[id]/history/route.ts`) 생성 (GET - 이력 조회)
- [ ] (임시) 위 API들이 하드코딩된 JSON 데이터를 반환하도록 구현
- [ ] (Backend) `crawler/` 폴더 또는 API Route 내부에 크롤링 로직 MVP 개발
- [ ] (Backend) `Geocoding` 로직 구현 (주소 -> 위도/경도 변환)
- [ ] (Backend) F1 (데이터 비교 및 이력 저장) 로직 구현

---

## 🚀 Milestone 2: The Core UX (Map Visualization)

### Development (Layout & Map)
- [ ] `npm install react-kakao-maps-sdk` 설치
- [ ] `/app/dashboard/layout.tsx` 생성 (SaaS 레이아웃)
- [ ] `/components/layout/Sidebar.tsx` 생성 (프로젝트명, 네비게이션 링크 포함)
- [ ] `/app/dashboard/map-view/page.tsx` 생성 및 기본 지도 렌더링
- [ ] `map-view` 페이지에서 `/api/institutions` API 호출 로직 구현 (`useEffect` 또는 SWR/TanStack Query)
- [ ] `components/CustomPieMarker.tsx` 컴포넌트 생성 (파이그래프 마커 UI)
- [ ] `CustomPieMarker`에 `currentHeadcount > capacity`일 때 색상 변경 로직 추가
- [ ] `npm install @radix-ui/react-popover` (shadcn/ui `popover` 설치)
- [ ] `components/InstitutionPopover.tsx` 컴포G넌트 생성
- [ ] `CustomPieMarker` 클릭(또는 호버) 시 `InstitutionPopover`가 나타나도록 연동

---

## 🚀 Milestone 3: The "Aha!" Feature (Time-Series)

### Development (Analytics)
- [ ] `npm install recharts` 설치
- [ ] `npm install @radix-ui/react-dialog` (shadcn/ui `dialog` 설치)
- [ ] `components/HistoryDialog.tsx` 컴포넌트 생성
- [ ] `InstitutionPopover` 내부에 [변동 이력 보기] `Button` 추가 및 `HistoryDialog` 트리거
- [ ] `HistoryDialog` 내부에 `LineChart` (Recharts) 뼈대 추가
- [ ] `HistoryDialog`가 열릴 때 `/api/institutions/[id]/history` API를 호출하는 로직 구현
- [ ] API 응답 데이터를 `LineChart`의 `data` prop에 연결
- [ ] (Method) `/api/`의 임시 데이터를 Prisma Client를 사용한 실제 DB 조회 로직으로 교체

---

## 🚀 Milestone 4: Polish & Deploy

### Development (UX & Deploy)
- [ ] `npm install @radix-ui/react-skeleton` (shadcn/ui `skeleton` 설치)
- [ ] 지도 및 팝업 데이터 로딩 시 `Skeleton` UI 적용
- [ ] shadcn/ui `Button` 스타일을 `Sidebar` 네비게이션 링크에 적용
- [ ] (Optional) 모바일 화면에서 `Sidebar`가 햄버거 메뉴로 변경되도록 반응형 처리
- [ ] Vercel 프로젝트 생성 및 `caremap` Git 리포지토리 연결
- [ ] Vercel 대시보드에 `.env`의 Neon.tech URL 환경 변수 등록
- [ ] `main` 브랜치에 푸시하여 프로덕션 배포
- [ ] 배포된 URL에서 모든 기능 (지도, 팝업, 이력)이 정상 작동하는지 최종 테스트