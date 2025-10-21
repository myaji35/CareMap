# PRD (Product Requirements Document) - CareMap

> **Vibe:** 데이터의 역사와 흐름을 시각화하여, 사용자가 깊은 통찰력을 얻을 수 있도록 돕는 모던 데이터 대시보드

---

## B (Business & Brainstorm) - 제품 비전

### 1. 제품명
CareMap

### 2. 목표 (The Vibe)
* 전국 장기요양기관의 데이터를 수집, 분석하여 사용자에게 직관적인 시각 자료(지도, 차트)로 제공한다.
* 단순 현재 상태 조회를 넘어, 기관 데이터의 '월별 변경 이력'을 추적하여 데이터의 신뢰성과 깊이를 더한다.
* 사용자가 기관의 안정성, 변화 추이 등 깊은 통찰력(Insight)을 얻을 수 있도록 돕는 분석 플랫폼이 된다.

### 3. 주요 사용자 (Target User)
* **보호자:** 가족을 위한 요양 기관을 탐색하며 기관의 현재 상태와 운영 안정성(정원/현원 변화)을 확인하고 싶은 사람.
* **업계 종사자/연구원:** 지역별 기관 분포, 정원 대비 현원 통계, 기관 변동 추이 등 분석 데이터를 필요로 하는 사람.

### 4. 핵심 사용자 경험 (UX Vibe)
* **레이아웃:** 전형적인 SaaS 대시보드 (좌측 고정 메뉴, 우측 본문).
* **디자인:** shadcn/ui (New York, Slate) 기반의 세련되고 전문적인 느낌.
* **흐름:** `지도 뷰(시각화)` -> `팝업(정보 요약)` -> `이력 모달(심층 분석)`로 이어지는 자연스러운 정보 탐색 플로우.

---

## A (Analysis & Architecture) - 기술 설계

### 1. Tech Stack
* **Frontend:** Next.js 14 (App Router), React, TypeScript
* **UI:** Tailwind CSS, shadcn/ui
* ...
* **베이스 템플릿 (New):**
  * **SaaS UI Template by nextjstemplates.com**
  * **URL:** https://nextjstemplates.com/templates/saas-ui
* **Database:** Neon.tech (Serverless Postgres)
* **ORM:** Prisma
* **Maps API:** Kakao Maps (`react-kakao-maps-sdk`)
* **Charts:** Recharts (또는 Chart.js)

### 2. 데이터 모델 (`prisma/schema.prisma`)
* **`Institution` (최신 정보 모델)**
    * `id` (String, CUID)
    * `institutionCode` (String, Unique): 기관 식별 코드
    * `name` (String): 기관명
    * `serviceType` (String): 급여종류
    * `capacity` (Int): 정원
    * `currentHeadcount` (Int): 현원
    * `address` (String): 주소
    * `latitude` (Float): 위도
    * `longitude` (Float): 경도
    * `history` (Relation): `InstitutionHistory`와 1:N 관계
* **`InstitutionHistory` (변경 이력 모델)**
    * `id` (String, CUID)
    * `recordedDate` (DateTime): 이력이 기록된 날짜
    * `name` (String): 당시의 기관명
    * `address` (String): 당시의 주소
    * `capacity` (Int): 당시의 정원
    * `currentHeadcount` (Int): 당시의 현원
    * `institution` (Relation): `Institution`과 N:1 관계

---

## M (Method & Model) - 핵심 기능 명세

### F1: 데이터 수집 및 이력 관리 (Backend)
* **[USR-001]** 시스템은 월 1회 `longtermcare.or.kr` 사이트에서 기관 정보를 크롤링한다.
* **[USR-002]** 시스템은 크롤링된 데이터를 DB의 `Institution` 테이블과 비교한다.
* **[USR-003]** 비교 시 `상호명`, `주소`, `정원`, `현원` 중 하나라도 변경된 경우, `Institution` 테이블의 기존 데이터를 `InstitutionHistory` 테이블로 백업(기록)한다.
* **[USR-004]** `Institution` 테이블은 항상 최신 크롤링 데이터로 덮어쓴다(업데이트한다).

### F2: SaaS 대시보드 레이아웃 (Frontend)
* **[GIVEN-001]** 'SaaS UI' 템플릿을 기반으로, 좌측 고정 사이드바 및 우측 본문, 상단 헤더를 포함한 **전형적인 SaaS 대시보드 레이아웃을 기본 제공(Given)받는다.**
* **[GIVEN-002]** 템플릿의 라이트/다크 모드 테마 토글 기능을 기본 제공받는다.
* **[GIVEN-003]** 템플릿의 (로그인/회원가입/유저 설정) 등 기본 인증 페이지 UI를 제공받는다.
* **[USR-005]** (커스터마이징) 템플릿의 `Sidebar` 메뉴를 `CareMap` 요구사항에 맞게 **수정한다.** (e.g., [지도 뷰], [이력 분석] 링크로 변경 및 아이콘 적용)
* **[USR-006]** (제거) 템플릿이 제공하는 페이지 중 `CareMap`에 불필요한 페이지(e.g., Pricing, Blog)는 메뉴에서 **숨기거나 제거한다.** 클릭 시, 화면 우측의 본문(children) 영역에서 해당 페이지를 볼 수 있다.

### F3: 지도 기반 기관 시각화 (Map View)
* **[USR-008]** 사용자는 지도 위에 `Institution` 데이터 기반의 마커를 볼 수 있다.
* **[USR-009]** 마커는 `정원` 대비 `현원` 비율을 나타내는 커스텀 파이그래프(Pie Chart) 형태로 표시된다.
* **[USR-010]** 파이그래프 마커 내부에는 `정원`과 `현원` 숫자가 텍스트로 표시된다 (예: 85/100).
* **[USR-011]** `현원`이 `정원`을 초과할 경우 (예: 110/100), 파이그래프는 100%로 채워지되 경고 색상(예: Red)으로 표시하고, 숫자는 `110/100`으로 정확히 표시한다.

### F4: 기관 상세 정보 팝업 (Map View)
* **[USR-012]