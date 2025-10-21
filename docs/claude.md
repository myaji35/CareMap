# Docs 디렉토리 (bmad-method 문서)

> **상위 디렉토리의 내용을 상속받습니다.**

## 개요

bmad-method v4.44.0 방법론에 따라 작성된 프로젝트 문서들입니다.

## 디렉토리 구조

```
docs/
├── claude.md                # 현재 파일 (문서 디렉토리 설명)
├── prd.md                   # Product Requirement Document (제품 요구사항 정의서)
├── architecture.md          # System Architecture (시스템 아키텍처)
├── prd/                     # Epic 별 상세 문서
│   ├── epic-1-data-collection.md      # Epic 1: 데이터 수집
│   ├── epic-2-map-visualization.md    # Epic 2: 지도 시각화
│   ├── epic-3-institution-detail.md   # Epic 3: 기관 상세
│   └── epic-4-search-filter.md        # Epic 4: 검색 및 필터
├── architecture/            # 아키텍처 상세 문서
│   ├── tech-stack.md       # 기술 스택 상세
│   ├── coding-standards.md # 코딩 표준
│   └── source-tree.md      # 소스 트리 구조
└── stories/                 # User Story 카드 (향후 추가)
```

## 문서 개요

### 1. PRD (Product Requirement Document)

**파일**: `prd.md`

**내용**:
- Executive Summary: 프로젝트 비전 및 목표
- Target Users: 3가지 페르소나 (시스템 관리자, 기관 관리자, 일반 사용자)
- 5개 Epic 정의:
  - Epic 1: 데이터 수집 및 관리
  - Epic 2: 지도 시각화
  - Epic 3: 기관 상세 정보
  - Epic 4: 검색 및 필터링
  - Epic 5: 사용자 관리 (추가됨)
- Success Metrics: MAU, 데이터 정확도, 응답 시간, 사용자 만족도
- Release Plan: Phase별 개발 일정

**User Story 총 개수**: 17개
- Epic 1: 4개 (크롤링, 좌표변환, 이력추적, 스케줄링)
- Epic 2: 4개 (지도표시, 파이차트, 호버정보, 클릭이벤트)
- Epic 3: 2개 (기본정보, 시계열차트)
- Epic 4: 3개 (이름검색, 서비스타입필터, 지역필터)
- Epic 5: 4개 (로그인, 회원가입, 권한관리, 프로필관리)

### 2. Architecture (시스템 아키텍처)

**파일**: `architecture.md`

**내용**:
- High-Level Architecture Diagram
- Component 설명:
  - Frontend: Next.js (React, TypeScript)
  - Backend: Django REST Framework
  - Database: PostgreSQL
  - Crawler: Python (Selenium, BeautifulSoup)
- Technology Stack 선정 이유
- API Design: 4개 RESTful Endpoints
  - GET /api/institutions
  - GET /api/institutions/:id
  - GET /api/institutions/:id/history
  - POST /api/crawler/start
- Data Flow: Crawler → DB → API → Frontend
- Security: Token 인증, HTTPS, CORS
- Deployment: Docker, Nginx, Gunicorn
- Performance: 캐싱, CDN, DB 인덱스

### 3. Epic 상세 문서 (prd/)

#### epic-1-data-collection.md
**User Story 4개**:
1. **US-1.1**: 장기요양기관 정보 크롤링
   - 주기적으로 웹사이트에서 데이터 수집
   - AC: 기관코드, 이름, 서비스유형, 정원, 현원, 주소 추출
2. **US-1.2**: 주소 좌표 변환
   - Kakao Geocoding API로 주소 → 위경도 변환
   - AC: 성공률 95% 이상, 실패 시 로그 기록
3. **US-1.3**: 변경 이력 추적
   - 정원/현원 변경 시 history 테이블에 기록
   - AC: 변경 필드, 이전값, 새값 저장
4. **US-1.4**: 자동 스케줄링
   - Cron으로 매월 1일 자동 실행
   - AC: 실행 로그, 실패 시 알림

#### epic-2-map-visualization.md
**User Story 4개**:
1. **US-2.1**: 기본 지도 표시
   - Kakao Maps SDK로 전국 지도 렌더링
   - AC: 기관 위치 마커 표시, 줌/팬 기능
2. **US-2.2**: 파이차트 마커
   - 입소율에 따른 색상 구분 (녹색/주황/빨강)
   - AC: 70% 미만 녹색, 70-90% 주황, 90% 이상 빨강
3. **US-2.3**: 호버 정보 카드
   - 마커에 마우스 오버 시 기관 정보 표시
   - AC: 기관명, 주소, 입소율, 정원/현원 표시
4. **US-2.4**: 마커 클릭 이벤트
   - 클릭 시 상세 페이지로 이동
   - AC: /institution/:id 라우팅

#### epic-3-institution-detail.md
**User Story 2개**:
1. **US-3.1**: 기본 정보 표시
   - 기관명, 주소, 서비스유형, 운영시간, 정원/현원
   - AC: 반응형 UI, 로딩 스피너
2. **US-3.2**: 시계열 차트
   - 최근 12개월 정원/현원 변화 그래프
   - AC: Chart.js 사용, 월별 데이터 표시

#### epic-4-search-filter.md
**User Story 3개**:
1. **US-4.1**: 기관명 검색
   - 검색 바에 기관명 입력 시 실시간 필터링
   - AC: 부분 일치 검색, 대소문자 무시
2. **US-4.2**: 서비스 유형 필터
   - 드롭다운에서 서비스 유형 선택
   - AC: 노인요양시설, 주야간보호센터, 방문요양센터 등
3. **US-4.3**: 지역 필터
   - 시/도, 시/군/구 2단계 필터
   - AC: 계층적 선택, 전체 옵션

### 4. 아키텍처 상세 문서 (architecture/)

#### tech-stack.md
- Frontend: Next.js 14, React 18, TypeScript, Tailwind CSS
- Backend: Django 4.2.11, DRF 3.14
- Database: PostgreSQL 15
- Crawler: Python 3.11, Selenium 4.18
- Map: Kakao Maps SDK
- Geocoding: Kakao REST API
- Authentication: Token-based (DRF authtoken)
- 각 기술 선정 이유 및 대안 비교

#### coding-standards.md
- Python: PEP 8, Black formatter, type hints
- TypeScript: ESLint, Prettier, strict mode
- React: Functional components, Hooks, Context API
- Django: Class-based views, Serializers, ViewSets
- Git: Conventional Commits, feature branches
- 파일명 규칙, 주석 작성법, 테스트 커버리지

#### source-tree.md
- 전체 프로젝트 디렉토리 구조
- 각 디렉토리 및 파일 역할 설명
- 모듈 의존성 다이어그램
- 빌드 아티팩트, 가상환경 위치

## bmad-method 방법론

### 개발 프로세스
1. **Discovery**: 프로젝트 비전 및 목표 정의
2. **Planning**: PRD 작성, Epic 정의
3. **Design**: Architecture 설계, Tech Stack 선정
4. **Epic Sharding**: Epic을 User Story로 분해
5. **Development**: User Story 단위로 구현
6. **Testing**: QA 및 테스트
7. **Deployment**: 배포 및 운영

### 문서 작성 원칙
- **명확성**: 모호하지 않고 구체적으로 작성
- **완전성**: 모든 요구사항과 제약사항 포함
- **일관성**: 용어 및 형식 통일
- **추적성**: User Story → Code 추적 가능
- **유지보수성**: 변경 이력 기록, 버전 관리

### Epic Priority
1. **P0 (Critical)**: Epic 1 (데이터 수집) - 데이터가 없으면 시스템 동작 불가
2. **P1 (High)**: Epic 2 (지도 시각화) - 핵심 기능
3. **P2 (Medium)**: Epic 5 (사용자 관리) - SaaS 필수 기능
4. **P3 (Low)**: Epic 3, 4 (상세 정보, 검색) - 부가 기능

## 개발 진행 상황

### 완료된 Epic
- ✅ Epic 5: 사용자 관리 (로그인, 회원가입, 권한, 프로필)
- ✅ Epic 2: 지도 시각화 (기본 지도, 파이차트 마커, 호버 정보)
- ✅ Epic 1: 데이터 수집 (크롤러 기본 구조, DB 관리, Geocoding)

### 진행 중인 Epic
- 🔄 Epic 1: 실제 웹사이트 크롤링 구현 필요
- 🔄 Epic 2: 마커 클릭 이벤트 (상세 페이지 미구현)

### 대기 중인 Epic
- 🔲 Epic 3: 기관 상세 정보 (전체 미구현)
- 🔲 Epic 4: 검색 및 필터링 (전체 미구현)

## User Story 진행 현황

| Epic | User Story | Status | 구현 파일 |
|------|-----------|--------|----------|
| 1.1 | 기관 정보 크롤링 | 🔄 부분완료 | crawler/main.py (샘플 데이터) |
| 1.2 | 주소 좌표 변환 | ✅ 완료 | crawler/geocoding.py |
| 1.3 | 변경 이력 추적 | ✅ 완료 | crawler/db_manager.py |
| 1.4 | 자동 스케줄링 | 🔲 미구현 | - |
| 2.1 | 기본 지도 표시 | ✅ 완료 | frontend/components/KakaoMap.tsx |
| 2.2 | 파이차트 마커 | ✅ 완료 | frontend/components/KakaoMap.tsx |
| 2.3 | 호버 정보 카드 | ✅ 완료 | frontend/components/KakaoMap.tsx |
| 2.4 | 마커 클릭 이벤트 | 🔲 미구현 | - |
| 3.1 | 기본 정보 표시 | 🔲 미구현 | - |
| 3.2 | 시계열 차트 | 🔲 미구현 | - |
| 4.1 | 기관명 검색 | 🔲 미구현 | - |
| 4.2 | 서비스 유형 필터 | 🔲 미구현 | - |
| 4.3 | 지역 필터 | 🔲 미구현 | - |
| 5.1 | 로그인 | ✅ 완료 | frontend/app/login, backend/accounts |
| 5.2 | 회원가입 | ✅ 완료 | frontend/app/register, backend/accounts |
| 5.3 | 권한 관리 | ✅ 완료 | backend/accounts/models.py (user_type) |
| 5.4 | 프로필 관리 | ✅ 완료 | backend/accounts/views.py (UserProfileView) |

## 다음 개발 단계

### Phase 2 (진행 예정)
1. **US-1.1 완료**: 실제 웹사이트 크롤링 구현
2. **US-2.4 구현**: 마커 클릭 → 상세 페이지 라우팅
3. **US-3.1, 3.2 구현**: 기관 상세 페이지 및 차트
4. **Backend API**: institutions 앱 CRUD 구현

### Phase 3 (계획)
1. **US-4.1, 4.2, 4.3 구현**: 검색 및 필터링 기능
2. **US-1.4 구현**: Cron 스케줄링
3. **관리자 대시보드**: 크롤러 관리, 사용자 관리
4. **배포 환경 구축**: Docker, Nginx

## 참고 사항

- 모든 문서는 Markdown 형식으로 작성되었습니다
- bmad-method v4.44.0 가이드라인을 따릅니다
- 문서 변경 시 변경 이력을 기록합니다
- User Story는 INVEST 원칙을 따릅니다 (Independent, Negotiable, Valuable, Estimable, Small, Testable)
- Acceptance Criteria는 Given-When-Then 형식으로 작성합니다

## 문서 업데이트

### 최종 업데이트
- 날짜: 2025-10-20
- 내용: Epic 5 (사용자 관리) 추가, 진행 상황 업데이트

### 변경 이력
- 2025-10-20: 초기 PRD 및 Architecture 작성
- 2025-10-20: Epic 1-4 상세 문서 작성
- 2025-10-20: Epic 5 추가 (인증 시스템 구현 후)
