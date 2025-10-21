# CareMap 프로젝트 루트 디렉토리

> **상위 디렉토리의 내용을 상속받습니다.**

## 디렉토리 구조

```
CareMap/
├── README.md                # 프로젝트 전체 개요 및 설치 가이드
├── claude.md                # 현재 파일 (루트 구현 내용)
├── docs/                    # bmad-method 문서 (claude.md 참조)
├── frontend/                # Next.js 프론트엔드 (claude.md 참조)
├── backend/                 # Django 백엔드 (claude.md 참조)
└── crawler/                 # 데이터 크롤러 (claude.md 참조)
```

## 프로젝트 개요

### 목적
전국 장기요양기관 정보를 크롤링하여 데이터베이스에 저장하고, 지도 위에 시각화하는 SaaS 플랫폼 구축

### 주요 기능
1. **데이터 수집**: Python 크롤러로 기관 정보 수집 및 DB 동기화
2. **지도 시각화**: Kakao Maps에 파이차트 마커로 입소율 표시
3. **인증 시스템**: SaaS 방식의 다중 사용자 로그인 (Admin/Manager/User)
4. **REST API**: Django REST Framework 기반 백엔드 API

### 개발 방법론
- **bmad-method v4.44.0** 적용
- Epic → User Story → Task 단위로 개발
- 문서 기반 요구사항 정의 및 아키텍처 설계

## 완성된 기능

### Phase 1: 프로젝트 기본 구조 (완료)
✅ bmad-method 문서 작성 (PRD, Architecture, Epic 분해)
✅ Frontend Next.js 14 프로젝트 설정
✅ Backend Django 4.2.11 프로젝트 설정
✅ Crawler 기본 구조 및 DB 연동

### Phase 2: 인증 시스템 (완료)
✅ Custom User 모델 (user_type: admin/manager/user)
✅ Token 기반 인증 API
✅ 로그인/회원가입 페이지
✅ AuthContext로 전역 인증 상태 관리
✅ 관리자 계정 생성 스크립트 (Admin/admdnjs!00)

### Phase 3: 지도 시각화 (완료)
✅ Kakao Maps SDK 연동
✅ 파이차트 마커 렌더링 (입소율 색상 구분)
✅ 마커 호버 시 정보 카드 표시
✅ Mock 데이터 기반 프로토타입

### Phase 4: 크롤러 기본 구조 (완료)
✅ DatabaseManager 클래스 (UPSERT, 이력 관리)
✅ Kakao Geocoding API 연동
✅ 샘플 데이터 기반 동작 확인

## 환경 변수

### 공통 설정
- **Kakao JavaScript Key**: 837719
- **Kakao REST API Key**: (미설정, .env 파일에 추가 필요)
- **API Base URL**: http://localhost:8000/api

### 각 디렉토리별 환경 변수
- `frontend/.env.local`: NEXT_PUBLIC_KAKAO_APP_KEY, NEXT_PUBLIC_API_URL
- `backend/caremap/settings.py`: SECRET_KEY, DATABASE_URL, ALLOWED_HOSTS
- `crawler/.env`: KAKAO_REST_API_KEY, DB_* (PostgreSQL 연결 정보)

## 실행 방법

### 전체 시스템 실행 (3개 터미널 필요)

**터미널 1: Backend**
```bash
cd backend
source venv/bin/activate
python manage.py runserver
# http://localhost:8000/api 에서 API 제공
```

**터미널 2: Frontend**
```bash
cd frontend
npm run dev
# http://localhost:3000 에서 웹 UI 제공
```

**터미널 3: Crawler (필요 시)**
```bash
cd crawler
source venv/bin/activate
python main.py
# 크롤링 실행 및 DB 동기화
```

## 테스트 시나리오

### 1. 회원가입 및 로그인
1. http://localhost:3000 접속
2. "로그인" 버튼 클릭
3. 테스트 계정으로 로그인: Admin / admdnjs!00
4. 메인 페이지에서 "환영합니다, Admin (관리자)" 확인
5. 로그아웃 버튼으로 로그아웃 테스트

### 2. 지도 시각화
1. 메인 페이지에서 Kakao 지도 확인
2. 6개 샘플 기관 마커 표시 확인
3. 마커에 마우스 오버 시 정보 카드 표시
4. 입소율에 따른 색상 구분 확인 (녹색/주황/빨강)

### 3. API 테스트
```bash
# 회원가입
curl -X POST http://localhost:8000/api/accounts/register/ \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@test.com","password":"testpass123","password_confirm":"testpass123"}'

# 로그인
curl -X POST http://localhost:8000/api/accounts/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"Admin","password":"admdnjs!00"}'

# 프로필 조회 (token 필요)
curl -X GET http://localhost:8000/api/accounts/profile/ \
  -H "Authorization: Token YOUR_TOKEN_HERE"
```

## 다음 개발 단계

### 진행 예정 작업
1. **기관 API 구현**: institutions 앱에 CRUD API 추가
2. **실제 크롤링**: 실제 웹사이트에서 데이터 수집 로직 구현
3. **API 연동**: Frontend에서 Mock 데이터 대신 실제 API 호출
4. **기관 상세 페이지**: 클릭 시 상세 정보 및 이력 차트 표시

### 개선 사항
- PostgreSQL 마이그레이션 (현재 SQLite 사용 중)
- 검색 및 필터링 기능 추가
- 관리자 대시보드 구현
- 배포 환경 구축 (Docker, Nginx 등)

## 참고 문서

- **bmad-method 문서**: `/docs/` 디렉토리 참조
- **Frontend 구현**: `/frontend/claude.md` 참조
- **Backend 구현**: `/backend/claude.md` 참조
- **Crawler 구현**: `/crawler/claude.md` 참조

## 버전 관리

- bmad-method: v4.44.0
- Next.js: 14.2
- Django: 4.2.11
- Python: 3.11+
- Node.js: 18+

## 라이선스

MIT License
