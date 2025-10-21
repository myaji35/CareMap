# Technology Stack

## Frontend Stack

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

## Backend Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Framework | Django | 4.x | 웹 프레임워크 |
| API | Django REST Framework | 3.x | RESTful API |
| Database ORM | Django ORM | - | 데이터베이스 추상화 |
| Database | PostgreSQL | 14+ | 관계형 데이터베이스 |
| API Docs | drf-spectacular | Latest | OpenAPI 문서화 |
| Testing | pytest-django | Latest | 테스트 프레임워크 |

## Crawler Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Language | Python | 3.11+ | 스크립팅 |
| Web Automation | Selenium | 4.x | 웹 자동화 |
| HTML Parsing | BeautifulSoup4 | 4.x | HTML 파싱 |
| HTTP Client | Requests | 2.x | API 호출 |
| DB Driver | psycopg2 | 2.x | PostgreSQL 연결 |

## Infrastructure

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Frontend Hosting | Vercel | Next.js 배포 |
| Backend Hosting | TBD (AWS/GCP) | Django 배포 |
| Database | Managed PostgreSQL | 데이터베이스 |
| Scheduler | Cron / Airflow | 크롤러 스케줄링 |
| Monitoring | TBD (Sentry) | 에러 트래킹 |
