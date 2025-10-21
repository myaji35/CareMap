# System Architecture Document
# 장기요양기관 데이터 시각화 및 분석 플랫폼 (CareMap)

**Version**: 1.0
**Date**: 2025-10-20
**Status**: Draft
**Author**: Technical Architecture Team

---

## Table of Contents
1. [System Overview](#1-system-overview)
2. [Architecture Principles](#2-architecture-principles)
3. [System Components](#3-system-components)
4. [Data Architecture](#4-data-architecture)
5. [API Design](#5-api-design)
6. [Technology Stack](#6-technology-stack)
7. [Security Architecture](#7-security-architecture)
8. [Deployment Architecture](#8-deployment-architecture)
9. [Performance & Scalability](#9-performance--scalability)
10. [Monitoring & Logging](#10-monitoring--logging)

---

## 1. System Overview

### 1.1 System Purpose
CareMap은 장기요양기관의 정보를 수집, 저장, 시각화하여 사용자에게 제공하는 웹 기반 데이터 플랫폼입니다. 크롤링, 데이터 처리, API 서버, 프론트엔드로 구성된 풀스택 애플리케이션입니다.

### 1.2 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        External Services                     │
│  - 공공 데이터 웹사이트 (크롤링 대상)                          │
│  - Kakao Maps API                                            │
│  - Kakao Geocoding API                                       │
└─────────────────────────────────────────────────────────────┘
                              ▲
                              │
┌─────────────────────────────▼─────────────────────────────┐
│                    Data Collection Layer                   │
│  ┌──────────────────────────────────────────────────┐     │
│  │  Crawler Service (Python + Selenium)             │     │
│  │  - Web Scraping                                  │     │
│  │  - Data Validation                               │     │
│  │  - Geocoding Integration                         │     │
│  └──────────────────────────────────────────────────┘     │
│                          │                                 │
│                          ▼                                 │
│  ┌──────────────────────────────────────────────────┐     │
│  │  Scheduler (Cron)                                │     │
│  │  - Monthly Execution (매월 1일)                   │     │
│  └──────────────────────────────────────────────────┘     │
└────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Data Storage Layer                      │
│  ┌──────────────────────────────────────────────────┐       │
│  │  PostgreSQL Database                             │       │
│  │  - institutions (현재 데이터)                      │       │
│  │  - institution_history (변경 이력)                │       │
│  └──────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
                              ▲
                              │
┌─────────────────────────────▼─────────────────────────────┐
│                   Application Layer (Backend)              │
│  ┌──────────────────────────────────────────────────┐     │
│  │  Django REST Framework                           │     │
│  │  - RESTful API                                   │     │
│  │  - Business Logic                                │     │
│  │  - Data Aggregation                              │     │
│  └──────────────────────────────────────────────────┘     │
└────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Presentation Layer (Frontend)               │
│  ┌──────────────────────────────────────────────────┐       │
│  │  Next.js 14 (React 18 + TypeScript)              │       │
│  │  ┌────────────────────────────────────────┐      │       │
│  │  │  Pages                                 │      │       │
│  │  │  - Map View (/)                        │      │       │
│  │  │  - Institution Detail (/institution/id)│      │       │
│  │  │  - Admin Dashboard (/admin)            │      │       │
│  │  └────────────────────────────────────────┘      │       │
│  │  ┌────────────────────────────────────────┐      │       │
│  │  │  Components                            │      │       │
│  │  │  - KakaoMap (지도 컴포넌트)             │      │       │
│  │  │  - InstitutionMarker (마커)            │      │       │
│  │  │  - TimeSeriesChart (시계열 차트)        │      │       │
│  │  │  - SearchFilter (검색/필터)            │      │       │
│  │  └────────────────────────────────────────┘      │       │
│  └──────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                           End Users                          │
│  - 요양기관 관리자                                             │
│  - 정책 입안자 / 연구자                                        │
│  - 일반 시민 / 보호자                                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Architecture Principles

### 2.1 Design Principles
1. **Separation of Concerns**: 크롤러, 백엔드, 프론트엔드 독립적으로 개발 및 배포
2. **Data Integrity**: 데이터 변경 이력을 보존하여 추적 가능성 확보
3. **Scalability**: 기관 수 증가 및 트래픽 증가에 대응 가능한 구조
4. **Maintainability**: 명확한 코드 구조, 문서화, 테스트 커버리지
5. **User-Centric**: 사용자 경험 최우선, 빠른 로딩 시간, 직관적 UI

### 2.2 Architectural Patterns
- **MVC Pattern**: Django에서 Model-View-Controller 적용
- **RESTful API**: 표준 HTTP 메서드 사용 (GET, POST, PUT, DELETE)
- **Component-Based UI**: React 컴포넌트 재사용성 극대화
- **Server-Side Rendering (SSR)**: Next.js SSR로 초기 로딩 성능 향상

---

## 3. System Components

### 3.1 Crawler Service

#### 3.1.1 Responsibilities
- 공공 웹사이트에서 장기요양기관 데이터 추출
- 데이터 검증 및 정제
- Kakao API를 통한 주소 → 좌표 변환
- PostgreSQL 데이터베이스 동기화

#### 3.1.2 Technology Stack
- **Language**: Python 3.11+
- **Libraries**:
  - Selenium (웹 자동화)
  - BeautifulSoup4 (HTML 파싱)
  - Requests (HTTP 요청)
  - psycopg2 (PostgreSQL 연결)

#### 3.1.3 Execution Flow
```python
1. Selenium으로 웹사이트 접속
2. 검색 조건 설정 (전국, 전체 급여종류)
3. 페이지 데이터 로드 및 파싱
4. BeautifulSoup으로 필요 필드 추출
5. 데이터 검증 (필수 필드 존재 여부, 타입 체크)
6. Kakao Geocoding API 호출 (주소 → 좌표)
7. PostgreSQL 데이터베이스 UPSERT
   - 기존 데이터와 비교
   - 변경 발생 시 history 테이블에 기록
   - institutions 테이블 업데이트
8. 로그 기록 및 리포트 생성
```

#### 3.1.4 Error Handling
- 웹사이트 접속 실패: 최대 3회 재시도
- 파싱 에러: 로그 기록 후 해당 기관 스킵
- API 제한 초과: 대기 후 재시도
- DB 연결 실패: 알림 발송 및 스크립트 중단

#### 3.1.5 Configuration
```python
# config.py
CRAWL_TARGET_URL = "https://example.gov.kr/..."
KAKAO_API_KEY = os.getenv("KAKAO_API_KEY")
DB_CONFIG = {
    "host": os.getenv("DB_HOST"),
    "database": os.getenv("DB_NAME"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD")
}
RETRY_LIMIT = 3
REQUEST_TIMEOUT = 30  # seconds
```

---

### 3.2 Backend Service (Django)

#### 3.2.1 Responsibilities
- RESTful API 제공
- 비즈니스 로직 처리
- 데이터 집계 및 분석
- 인증/인가 (Phase 2)

#### 3.2.2 Technology Stack
- **Framework**: Django 4.x + Django REST Framework
- **Database ORM**: Django ORM
- **API Documentation**: drf-spectacular (OpenAPI)
- **Testing**: pytest-django

#### 3.2.3 Project Structure
```
backend/
├── caremap/                 # Django 프로젝트 루트
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── institutions/            # 기관 앱
│   ├── models.py           # Institution, InstitutionHistory 모델
│   ├── serializers.py      # DRF Serializers
│   ├── views.py            # API Views
│   ├── urls.py
│   └── tests/
├── manage.py
└── requirements.txt
```

#### 3.2.4 API Endpoints (상세는 섹션 5 참조)
- `GET /api/institutions/` - 기관 목록 조회
- `GET /api/institutions/:id/` - 기관 상세 조회
- `GET /api/institutions/:id/history/` - 기관 변경 이력 조회
- `GET /api/stats/` - 통계 데이터 조회

---

### 3.3 Frontend Service (Next.js)

#### 3.3.1 Responsibilities
- 사용자 인터페이스 렌더링
- 지도 시각화 (Kakao Maps)
- 차트 렌더링 (Recharts)
- 사용자 인터랙션 처리

#### 3.3.2 Technology Stack
- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 3.x
- **Component Library**: shadcn/ui
- **State Management**: React Hooks (useState, useEffect), Context API
- **Data Fetching**: fetch API, SWR (옵션)
- **Maps**: react-kakao-maps-sdk
- **Charts**: Recharts

#### 3.3.3 Project Structure
```
frontend/
├── app/                     # Next.js App Router
│   ├── layout.tsx          # 루트 레이아웃
│   ├── page.tsx            # 메인 페이지 (지도)
│   ├── institution/
│   │   └── [id]/
│   │       └── page.tsx    # 기관 상세 페이지
│   └── admin/              # 관리자 페이지 (Phase 2)
├── components/              # 재사용 컴포넌트
│   ├── ui/                 # shadcn/ui 컴포넌트
│   ├── KakaoMap.tsx        # 지도 컴포넌트
│   ├── InstitutionMarker.tsx
│   ├── TimeSeriesChart.tsx
│   ├── SearchFilter.tsx
│   └── InstitutionInfoCard.tsx
├── lib/                     # 유틸리티
│   ├── api.ts              # API 호출 함수
│   ├── utils.ts
│   └── constants.ts
├── types/                   # TypeScript 타입 정의
│   └── institution.ts
├── public/
├── styles/
├── package.json
└── tsconfig.json
```

#### 3.3.4 Key Components

**KakaoMap.tsx**
```typescript
// 지도 렌더링 및 마커 관리
interface KakaoMapProps {
  institutions: Institution[];
  onMarkerClick: (id: string) => void;
}
```

**InstitutionMarker.tsx**
```typescript
// 파이차트 형태 커스텀 마커
interface InstitutionMarkerProps {
  institution: Institution;
  onClick: () => void;
}
// Canvas로 정원/현원 비율 시각화
```

**TimeSeriesChart.tsx**
```typescript
// Recharts 라인 차트
interface TimeSeriesChartProps {
  history: InstitutionHistory[];
}
```

---

## 4. Data Architecture

### 4.1 Database Schema

#### 4.1.1 institutions 테이블
```sql
CREATE TABLE institutions (
    id SERIAL PRIMARY KEY,
    institution_code VARCHAR(20) UNIQUE NOT NULL,  -- 기관 고유 코드
    name VARCHAR(255) NOT NULL,                    -- 기관명
    service_type VARCHAR(100),                     -- 급여종류
    capacity INT,                                  -- 정원
    current_headcount INT,                         -- 현원
    address VARCHAR(255),                          -- 주소
    operating_hours TEXT,                          -- 운영시간
    latitude DECIMAL(10, 8),                       -- 위도
    longitude DECIMAL(11, 8),                      -- 경도
    last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- 인덱스
    INDEX idx_institution_code (institution_code),
    INDEX idx_location (latitude, longitude),
    INDEX idx_service_type (service_type)
);
```

#### 4.1.2 institution_history 테이블
```sql
CREATE TABLE institution_history (
    id SERIAL PRIMARY KEY,
    institution_id INT REFERENCES institutions(id) ON DELETE CASCADE,
    recorded_date DATE NOT NULL,                   -- 기록 날짜
    name VARCHAR(255),
    address VARCHAR(255),
    capacity INT,
    current_headcount INT,

    -- 인덱스
    INDEX idx_institution_history_id (institution_id),
    INDEX idx_recorded_date (recorded_date)
);
```

### 4.2 Data Flow

#### 4.2.1 Crawling → Database
```
1. Crawler가 웹사이트에서 데이터 수집
2. 데이터 검증 및 정제
3. Geocoding API로 좌표 획득
4. PostgreSQL에 UPSERT
   - 신규 기관: INSERT into institutions
   - 기존 기관 + 변경 감지:
     a. 기존 데이터를 institution_history에 INSERT
     b. institutions 테이블 UPDATE
```

#### 4.2.2 Database → API → Frontend
```
1. Frontend가 API 요청 (GET /api/institutions/)
2. Django ORM이 PostgreSQL 쿼리
3. Serializer가 JSON 변환
4. Frontend가 데이터 수신 및 렌더링
```

### 4.3 Data Models (Django)

```python
# institutions/models.py

from django.db import models

class Institution(models.Model):
    institution_code = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=255)
    service_type = models.CharField(max_length=100, null=True, blank=True)
    capacity = models.IntegerField(null=True, blank=True)
    current_headcount = models.IntegerField(null=True, blank=True)
    address = models.CharField(max_length=255, null=True, blank=True)
    operating_hours = models.TextField(null=True, blank=True)
    latitude = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True)
    longitude = models.DecimalField(max_digits=11, decimal_places=8, null=True, blank=True)
    last_updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'institutions'
        indexes = [
            models.Index(fields=['institution_code']),
            models.Index(fields=['latitude', 'longitude']),
            models.Index(fields=['service_type']),
        ]

    def __str__(self):
        return f"{self.name} ({self.institution_code})"

    @property
    def occupancy_rate(self):
        """정원 대비 현원 비율"""
        if self.capacity and self.capacity > 0:
            return round((self.current_headcount / self.capacity) * 100, 2)
        return None


class InstitutionHistory(models.Model):
    institution = models.ForeignKey(Institution, on_delete=models.CASCADE, related_name='history')
    recorded_date = models.DateField()
    name = models.CharField(max_length=255, null=True, blank=True)
    address = models.CharField(max_length=255, null=True, blank=True)
    capacity = models.IntegerField(null=True, blank=True)
    current_headcount = models.IntegerField(null=True, blank=True)

    class Meta:
        db_table = 'institution_history'
        indexes = [
            models.Index(fields=['institution']),
            models.Index(fields=['recorded_date']),
        ]
        ordering = ['-recorded_date']

    def __str__(self):
        return f"{self.institution.name} - {self.recorded_date}"
```

---

## 5. API Design

### 5.1 RESTful API Specification

#### 5.1.1 Get All Institutions
```
GET /api/institutions/

Query Parameters:
- service_type (optional): 급여종류 필터 (예: "방문요양")
- region (optional): 지역 필터 (예: "서울")
- search (optional): 기관명 검색 키워드

Response (200 OK):
{
  "count": 1500,
  "results": [
    {
      "id": 1,
      "institution_code": "A1234",
      "name": "행복요양원",
      "service_type": "방문요양",
      "capacity": 100,
      "current_headcount": 85,
      "address": "서울특별시 강남구 ...",
      "operating_hours": "09:00-18:00",
      "latitude": 37.5088,
      "longitude": 127.0454,
      "occupancy_rate": 85.00,
      "last_updated_at": "2025-10-01T00:00:00Z"
    },
    ...
  ]
}
```

#### 5.1.2 Get Institution Detail
```
GET /api/institutions/:id/

Response (200 OK):
{
  "id": 1,
  "institution_code": "A1234",
  "name": "행복요양원",
  "service_type": "방문요양",
  "capacity": 100,
  "current_headcount": 85,
  "address": "서울특별시 강남구 ...",
  "operating_hours": "09:00-18:00",
  "latitude": 37.5088,
  "longitude": 127.0454,
  "occupancy_rate": 85.00,
  "last_updated_at": "2025-10-01T00:00:00Z"
}
```

#### 5.1.3 Get Institution History
```
GET /api/institutions/:id/history/

Query Parameters:
- start_date (optional): 시작 날짜 (YYYY-MM-DD)
- end_date (optional): 종료 날짜 (YYYY-MM-DD)

Response (200 OK):
{
  "institution_id": 1,
  "institution_name": "행복요양원",
  "history": [
    {
      "recorded_date": "2025-09-01",
      "capacity": 100,
      "current_headcount": 80
    },
    {
      "recorded_date": "2025-08-01",
      "capacity": 100,
      "current_headcount": 75
    },
    ...
  ]
}
```

#### 5.1.4 Get Statistics
```
GET /api/stats/

Response (200 OK):
{
  "total_institutions": 1500,
  "average_occupancy_rate": 78.5,
  "by_service_type": {
    "방문요양": 600,
    "주간보호": 400,
    "단기보호": 300,
    "기타": 200
  },
  "by_region": {
    "서울": 300,
    "경기": 400,
    "부산": 150,
    ...
  }
}
```

### 5.2 Error Responses

```json
// 404 Not Found
{
  "error": "Institution not found",
  "code": "INSTITUTION_NOT_FOUND"
}

// 400 Bad Request
{
  "error": "Invalid query parameter",
  "code": "INVALID_PARAMETER",
  "details": {
    "service_type": ["Invalid service type"]
  }
}

// 500 Internal Server Error
{
  "error": "Internal server error",
  "code": "INTERNAL_ERROR"
}
```

---

## 6. Technology Stack

### 6.1 Frontend Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Framework | Next.js | 14.2.4 | React 프레임워크, SSR |
| UI Library | React | 18 | 컴포넌트 기반 UI |
| Language | TypeScript | 5.x | 타입 안전성 |
| Styling | Tailwind CSS | 3.4.1 | 유틸리티 CSS |
| Component Library | shadcn/ui | Latest | UI 컴포넌트 |
| Maps | react-kakao-maps-sdk | 1.1.27 | 카카오 지도 |
| Charts | Recharts | 2.12.7 | 차트 라이브러리 |
| Icons | lucide-react | 0.395.0 | 아이콘 |
| State Management | React Hooks | - | 상태 관리 |

### 6.2 Backend Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Framework | Django | 4.x | 웹 프레임워크 |
| API | Django REST Framework | 3.x | RESTful API |
| Database ORM | Django ORM | - | 데이터베이스 추상화 |
| Database | PostgreSQL | 14+ | 관계형 데이터베이스 |
| API Docs | drf-spectacular | Latest | OpenAPI 문서화 |
| Testing | pytest-django | Latest | 테스트 프레임워크 |

### 6.3 Crawler Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Language | Python | 3.11+ | 스크립팅 |
| Web Automation | Selenium | 4.x | 웹 자동화 |
| HTML Parsing | BeautifulSoup4 | 4.x | HTML 파싱 |
| HTTP Client | Requests | 2.x | API 호출 |
| DB Driver | psycopg2 | 2.x | PostgreSQL 연결 |

### 6.4 Infrastructure

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Frontend Hosting | Vercel | Next.js 배포 |
| Backend Hosting | TBD (AWS/GCP) | Django 배포 |
| Database | Managed PostgreSQL | 데이터베이스 |
| Scheduler | Cron / Airflow | 크롤러 스케줄링 |
| Monitoring | TBD (Sentry) | 에러 트래킹 |

---

## 7. Security Architecture

### 7.1 API Security
- **CORS**: 허용된 도메인만 API 접근 가능
- **Rate Limiting**: API 요청 제한 (예: 100 req/min per IP)
- **Input Validation**: Django Serializer로 입력 검증
- **SQL Injection Prevention**: Django ORM 사용 (Parameterized Query)

### 7.2 Authentication & Authorization (Phase 2)
- Django Session 기반 인증
- Admin 페이지는 Django Admin 또는 커스텀 관리자 인터페이스
- JWT 토큰 고려 (Frontend-Backend 분리 환경)

### 7.3 Data Privacy
- 개인정보는 수집하지 않음 (공공 데이터만)
- HTTPS 통신 강제

### 7.4 Secret Management
```python
# .env (환경변수)
KAKAO_API_KEY=your_kakao_api_key
DB_HOST=your_db_host
DB_NAME=caremap_db
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DJANGO_SECRET_KEY=your_secret_key
```

---

## 8. Deployment Architecture

### 8.1 Development Environment
```
Frontend: localhost:3000 (Next.js dev server)
Backend: localhost:8000 (Django runserver)
Database: localhost:5432 (PostgreSQL)
```

### 8.2 Production Environment

#### Option 1: Vercel + AWS
```
Frontend (Vercel)
  ├── Next.js SSR/SSG
  └── CDN (Vercel Edge Network)

Backend (AWS EC2 / ECS)
  ├── Django + Gunicorn
  ├── Nginx (Reverse Proxy)
  └── Auto Scaling

Database (AWS RDS PostgreSQL)
  ├── Multi-AZ for HA
  └── Automated Backups

Crawler (AWS Lambda or EC2)
  └── Scheduled via CloudWatch Events
```

#### Option 2: All-in-One Cloud
```
Frontend: Vercel
Backend: Railway / Render
Database: Supabase / Railway
Crawler: Scheduled task on Railway
```

### 8.3 CI/CD Pipeline
```
Git Push → GitHub Actions
  ├── Frontend: Build & Deploy to Vercel
  ├── Backend: Run tests → Deploy to AWS/Railway
  └── Database: Run migrations
```

---

## 9. Performance & Scalability

### 9.1 Performance Targets
- 지도 초기 로딩: < 3초
- API 응답 시간: < 500ms (P95)
- 차트 렌더링: < 1초
- 동시 접속자: 100+

### 9.2 Optimization Strategies

#### Frontend
- **Code Splitting**: Next.js 자동 코드 분할
- **Image Optimization**: Next.js Image 컴포넌트
- **Lazy Loading**: 마커 클러스터링 (Phase 2)
- **Caching**: SWR 캐싱 전략

#### Backend
- **Database Indexing**: 위치, 코드, 서비스 타입 인덱스
- **Query Optimization**: N+1 문제 방지 (select_related, prefetch_related)
- **Pagination**: 기관 목록 페이지네이션 (100개/페이지)
- **Caching**: Redis 캐싱 (Phase 2)

#### Database
- **Connection Pooling**: pgBouncer 사용
- **Read Replica**: 읽기 부하 분산 (Phase 2)

### 9.3 Scalability Plan
- **Horizontal Scaling**: 백엔드 서버 오토스케일링
- **Load Balancing**: AWS ALB / Nginx
- **Clustering**: 지도 마커 클러스터링 (Phase 2)

---

## 10. Monitoring & Logging

### 10.1 Application Monitoring
- **Error Tracking**: Sentry (Frontend + Backend)
- **Performance Monitoring**: Vercel Analytics, Django Debug Toolbar

### 10.2 Infrastructure Monitoring
- **Server Metrics**: AWS CloudWatch / Railway Metrics
- **Database Metrics**: RDS Performance Insights

### 10.3 Logging Strategy

#### Crawler Logs
```python
# 로그 포맷
[2025-10-01 00:00:00] INFO: Crawling started
[2025-10-01 00:05:00] INFO: 1500 institutions crawled
[2025-10-01 00:05:30] ERROR: Failed to geocode address for institution A1234
[2025-10-01 00:10:00] INFO: Database sync completed
```

#### Backend Logs
```
Django 기본 로깅 + Custom middleware
- Request/Response 로깅
- 에러 스택 트레이스
```

#### Frontend Logs
```javascript
// 클라이언트 에러를 Sentry로 전송
console.error("Map loading failed", error);
```

---

## 11. Testing Strategy

### 11.1 Frontend Testing
- **Unit Tests**: Jest + React Testing Library
- **E2E Tests**: Playwright (Phase 2)

### 11.2 Backend Testing
- **Unit Tests**: pytest-django
- **API Tests**: DRF TestCase
- **Coverage Target**: 80%+

### 11.3 Integration Testing
- Crawler → Database 통합 테스트
- API → Frontend 통합 테스트

---

## 12. Future Enhancements

### Phase 2
- 마커 클러스터링 (성능 최적화)
- Redis 캐싱
- 사용자 계정 시스템
- 데이터 내보내기 (CSV/Excel)

### Phase 3
- 모바일 앱 (React Native)
- 실시간 알림 (WebSocket)
- AI 기반 트렌드 예측

---

## Appendix

### A. Development Setup

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

#### Database
```bash
# PostgreSQL 설치 및 DB 생성
createdb caremap_db
psql caremap_db < database/schema.sql
```

### B. Environment Variables

**.env.local (Frontend)**
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_KAKAO_APP_KEY=your_kakao_app_key
```

**.env (Backend)**
```
DJANGO_SECRET_KEY=your_secret_key
DB_HOST=localhost
DB_NAME=caremap_db
DB_USER=postgres
DB_PASSWORD=password
KAKAO_API_KEY=your_kakao_rest_api_key
```

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-10-20 | Claude (AI Architect) | Initial architecture document |
