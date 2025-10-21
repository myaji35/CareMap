# CareMap - 장기요양기관 관리 시스템

전국 장기요양기관 정보를 지도로 시각화하고 관리하는 SaaS 플랫폼입니다.

## 프로젝트 개요

CareMap은 bmad-method 방법론을 적용하여 개발된 장기요양기관 데이터 수집, 시각화 및 관리 시스템입니다.

### 주요 기능

1. **데이터 수집 (Crawler)**
   - 장기요양기관 정보 크롤링
   - Kakao Geocoding API를 활용한 주소 좌표 변환
   - PostgreSQL 데이터베이스 자동 동기화
   - 변경 이력 추적

2. **지도 시각화 (Frontend)**
   - Kakao Maps SDK 기반 지도 렌더링
   - 입소율에 따른 파이차트 마커 표시 (녹색/주황/빨강)
   - 마커 호버 시 기관 정보 카드 표시
   - 반응형 UI (Tailwind CSS)

3. **인증 시스템 (SaaS)**
   - 사용자 등급: 시스템 관리자(admin) / 기관 관리자(manager) / 일반 사용자(user)
   - Token 기반 인증 (Django REST Framework)
   - 로그인/로그아웃/회원가입 기능
   - 시스템 관리자 계정: `Admin` / `admdnjs!00`

4. **REST API (Backend)**
   - Django 4.2.11 + DRF
   - 커스텀 User 모델 (user_type, organization 등)
   - CORS 설정으로 프론트엔드 연동

## 기술 스택

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3.4
- **Map**: Kakao Maps SDK (react-kakao-maps-sdk)
- **State Management**: React Context API

### Backend
- **Framework**: Django 4.2.11
- **API**: Django REST Framework 3.14
- **Database**: PostgreSQL 15 (Production), SQLite (Development)
- **Authentication**: Token-based (DRF authtoken)

### Crawler
- **Language**: Python 3.11
- **Libraries**: Selenium 4.18, BeautifulSoup 4.12, Requests 2.31
- **Database**: psycopg2 2.9.9
- **Geocoding**: Kakao REST API

## 프로젝트 구조

```
CareMap/
├── docs/                    # bmad-method 문서
│   ├── prd.md              # 제품 요구사항 정의서
│   ├── architecture.md     # 시스템 아키텍처
│   ├── prd/                # Epic 별 상세 문서
│   │   ├── epic-1-data-collection.md
│   │   ├── epic-2-map-visualization.md
│   │   ├── epic-3-institution-detail.md
│   │   └── epic-4-search-filter.md
│   └── architecture/       # 아키텍처 상세 문서
│       ├── tech-stack.md
│       ├── coding-standards.md
│       └── source-tree.md
├── frontend/               # Next.js 프론트엔드
│   ├── app/               # App Router 페이지
│   ├── components/        # React 컴포넌트
│   ├── contexts/          # Context API
│   ├── lib/               # 유틸리티 및 API
│   └── types/             # TypeScript 타입 정의
├── backend/               # Django 백엔드
│   ├── caremap/          # 프로젝트 설정
│   ├── accounts/         # 인증 앱
│   └── institutions/     # 기관 관리 앱
└── crawler/              # 데이터 크롤러
    ├── main.py           # 메인 실행 스크립트
    ├── db_manager.py     # DB 관리
    ├── geocoding.py      # 좌표 변환
    └── config.py         # 설정 관리
```

## 설치 및 실행

### 1. Frontend 설정

```bash
cd frontend
npm install
npm run dev
```

- 실행 후 http://localhost:3000 접속

### 2. Backend 설정

```bash
cd backend

# 가상환경 생성 및 활성화
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 패키지 설치
pip install --upgrade pip
pip install -r requirements.txt

# 데이터베이스 마이그레이션
python manage.py makemigrations
python manage.py migrate

# 관리자 계정 생성 (Admin/admdnjs!00)
python create_admin.py

# 서버 실행
python manage.py runserver
```

- API 엔드포인트: http://localhost:8000/api

### 3. Crawler 설정

```bash
cd crawler

# 가상환경 생성 및 활성화
python3 -m venv venv
source venv/bin/activate

# 패키지 설치
pip install -r requirements.txt

# 환경 변수 설정 (.env 파일 생성)
cp .env.example .env
# KAKAO_REST_API_KEY 등 필수 값 입력

# 크롤러 실행
python main.py
```

## 환경 변수 설정

### Frontend (.env.local)
```
NEXT_PUBLIC_KAKAO_APP_KEY=837719
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### Backend (settings.py 또는 .env)
```
SECRET_KEY=django-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=postgresql://user:password@localhost:5432/caremap
```

### Crawler (.env)
```
KAKAO_REST_API_KEY=your_kakao_rest_api_key
DB_HOST=localhost
DB_PORT=5432
DB_NAME=caremap
DB_USER=your_db_user
DB_PASSWORD=your_db_password
```

## API 엔드포인트

### 기관 API
- `GET /api/institutions/` - 기관 목록 조회
- `GET /api/institutions/[id]/history` - 기관 변경 이력 조회

### 관리자 크롤러 API
- `POST /api/admin/crawler/start` - 실시간 크롤링 시작
  - Body: `{ "maxPages": 1 }`
  - 백그라운드에서 Playwright를 사용하여 실제 웹페이지 크롤링
- `POST /api/admin/crawler/stop` - 크롤링 중지
- `GET /api/admin/crawler/data` - 크롤링된 데이터 조회
  - 파일 시스템 기반 임시 저장소에서 데이터 조회
- `POST /api/admin/crawler/import` - 크롤링 데이터 DB에 가져오기
  - Kakao Geocoding API로 주소 → 좌표 자동 변환
  - Prisma를 통해 Institution 및 InstitutionHistory 저장

## 개발 방법론

본 프로젝트는 **bmad-method v4.44.0**을 적용하여 개발되었습니다.

### 개발 단계
1. **계획 단계**: PRD 및 Architecture 문서 작성
2. **Epic 분해**: 5개 Epic을 17개 User Story로 분해
3. **우선순위 개발**: Epic 1(데이터 수집) → Epic 2(지도 시각화) → 인증 시스템 순으로 구현
4. **반복적 개선**: 사용자 피드백 반영 및 지속적 개선

### 문서 참조
- `/docs/prd.md` - 전체 제품 요구사항
- `/docs/architecture.md` - 시스템 아키텍처 설계
- `/docs/prd/epic-*.md` - Epic 별 상세 User Story

## 테스트 계정

### 시스템 관리자
- **아이디**: Admin
- **비밀번호**: admdnjs!00
- **권한**: 전체 시스템 관리, 사용자 관리

## 데이터베이스 스키마

### User (accounts_user)
- id, username, email, password
- user_type: admin / manager / user
- phone_number, organization
- created_at, updated_at

### Institution (institutions_institution)
- id, institution_code, name, service_type
- capacity, current_headcount, address
- operating_hours, latitude, longitude
- occupancy_rate, last_updated_at

### InstitutionHistory (institutions_institutionhistory)
- id, institution_id, change_type
- changed_fields, old_values, new_values
- changed_at

## 주요 화면

1. **랜딩 페이지** (`/`)
   - 서비스 소개 및 주요 기능 안내
   - 히어로 섹션, 통계 카드, 기능 설명
   - 대시보드로 이동 버튼

2. **대시보드** (`/dashboard`)
   - 주요 통계 및 KPI 표시
   - 최근 업데이트된 기관 목록

3. **지도 뷰** (`/dashboard/map-view`)
   - Kakao 지도에 기관 위치 마커 표시
   - 입소율에 따른 파이차트 마커 (빨강: 과밀)
   - 마커 클릭 시 상세 정보 팝오버
   - 기관별 이력 다이얼로그 (시계열 차트)

4. **이력 분석** (`/dashboard/analytics`)
   - 기관별 월별 데이터 변동 추이
   - 입소율, 정원, 현원 차트

5. **관리자 크롤러** (`/admin`)
   - 요양기관 데이터 크롤링 제어
   - 크롤링 진행률 모니터링
   - 수집된 데이터 미리보기
   - 데이터베이스 가져오기 기능
   - 실시간 크롤링 로그

## 향후 개발 계획

### Phase 1 (완료)
- ✅ 프로젝트 설정 및 기본 구조
- ✅ Prisma 스키마 및 데이터 모델링
- ✅ 기관 API 엔드포인트 (목록, 이력)
- ✅ Kakao 지도 연동
- ✅ 커스텀 파이차트 마커 구현
- ✅ 지도 뷰 페이지 및 팝오버
- ✅ 이력 다이얼로그 및 시계열 차트
- ✅ 반응형 사이드바 레이아웃
- ✅ 랜딩 페이지
- ✅ 관리자 크롤러 UI 및 API

### Phase 2 (진행 예정)
- 🔲 실제 웹사이트 크롤링 로직 구현
- 🔲 Kakao Geocoding API 연동
- 🔲 Neon.tech PostgreSQL 연결
- 🔲 대시보드 KPI 구현
- 🔲 이력 분석 페이지

### Phase 3 (계획)
- 🔲 검색 및 필터링 기능
- 🔲 사용자 인증 시스템
- 🔲 권한 기반 접근 제어
- 🔲 배포 환경 구축 (Vercel)

## 라이선스

MIT License

## 문의

프로젝트 관련 문의사항은 이슈를 등록해주세요.

---

**※ 각 디렉토리의 `claude.md` 파일에서 세부 구현 내용을 확인할 수 있습니다.**
