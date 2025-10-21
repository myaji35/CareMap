# CareMap v1.0 릴리즈 계획 (The Plan)

> **Vibe:** "데이터의 흐름을 시각화하는 모던 대시보드"라는 핵심 Vibe를 중심으로, 기능의 뼈대를 빠르고 견고하게 구축한다.

---

## 📍 Milestone 1: The Foundation (데이터 파이프라인)
**목표:** 데이터가 Neon.tech DB에 쌓이기 시작하고, API로 노출될 수 있는 상태를 만든다.
* **기간:** 1주 차
* **핵심 결과물:**
    1.  Prisma 스키마가 정의되고 Neon.tech와 동기화됨.
    2.  크롤링 스크립트가 최소 기능(MVP)으로 작동하여 DB를 채울 수 있음.
    3.  Next.js API Routes가 기관 목록과 이력 데이터를 (가짜 데이터라도) 반환함.

---

## 📍 Milestone 2: The Core UX (지도 시각화)
**목표:** 수집된 데이터를 'CareMap'이라는 이름에 걸맞게 지도 위에 시각화한다.
* **기간:** 2주 차
* **핵심 결과물:**
    1.  SaaS 레이아웃(Sidebar, Main Content)이 구현됨.
    2.  `react-kakao-maps-sdk`를 통해 지도가 렌더링됨.
    3.  `CustomOverlayMap`을 이용한 커스텀 **파이그래프 마커**가 구현됨.
    4.  마커와 **shadcn/ui `Popover`**가 연동되어 기본 정보를 표시함.

---

## 📍 Milestone 3: The "Aha!" Feature (시계열 분석)
**목표:** 우리 앱의 핵심 차별점인 '데이터 이력 분석' 기능을 구현한다.
* **기간:** 3주 차
* **핵심 결과물:**
    1.  `Popover` 내 [이력 보기] 버튼이 **shadcn/ui `Dialog`** 모달을 트리거함.
    2.  `Recharts`를 사용하여 `Dialog` 내에 시계열 라인 그래프를 렌더링함.
    3.  실제 이력 API (`/api/institutions/[id]/history`)를 연동하여 동적 데이터를 표시함.

---

## 📍 Milestone 4: Polish & Deploy (세련미와 배포)
**목표:** 사용자 경험을 세련되게 다듬고, Vercel을 통해 프로덕션을 배포한다.
* **기간:** 4주 차
* **핵심 결과물:**
    1.  shadcn/ui `Button`, `Skeleton` 등을 활용한 로딩/에러 상태 처리.
    2.  SaaS 레이아웃의 반응형 디자인 (모바일 뷰) 적용.
    3.  Vercel 배포 및 Neon.tech 환경 변수 설정 완료.
    4.  최종 v1.0 릴리즈.