# 🚀 CareMap Crawler 설치 및 실행 가이드

## 📋 사전 준비사항

### 1. PostgreSQL 설치

#### macOS (Homebrew)
```bash
brew install postgresql@14
brew services start postgresql@14
```

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

#### Windows
https://www.postgresql.org/download/windows/ 에서 설치

---

## 🔧 설정 단계

### Step 1: PostgreSQL 데이터베이스 생성

```bash
# PostgreSQL 접속
psql -U postgres

# 데이터베이스 생성
CREATE DATABASE caremap_db;

# 사용자 확인 (필요시 비밀번호 설정)
\password postgres

# 종료
\q
```

---

### Step 2: Kakao REST API 키 발급

1. **Kakao Developers 접속**: https://developers.kakao.com/
2. **로그인** 후 "내 애플리케이션" 클릭
3. **"애플리케이션 추가하기"** 클릭
   - 앱 이름: `CareMap`
   - 사업자명: 개인 이름
4. **"앱 키"** 탭에서 **"REST API 키"** 복사
   - ⚠️ JavaScript 키가 아닌 **REST API 키**입니다!

---

### Step 3: Crawler 환경 설정

```bash
cd /Users/gangseungsig/Documents/GitHub/CareMap/crawler

# Python 가상환경 생성
python3 -m venv venv

# 가상환경 활성화
source venv/bin/activate  # macOS/Linux
# Windows: venv\Scripts\activate

# 패키지 설치
pip install -r requirements.txt
```

---

### Step 4: 환경 변수 설정

`crawler/.env` 파일 편집:

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=caremap_db
DB_USER=postgres
DB_PASSWORD=your_postgres_password  # ← 실제 PostgreSQL 비밀번호

# Kakao API (for Geocoding)
KAKAO_REST_API_KEY=your_kakao_rest_api_key  # ← Step 2에서 복사한 REST API 키
```

---

## 🏃 실행

### 크롤러 실행

```bash
cd crawler
source venv/bin/activate  # 가상환경 활성화
python main.py
```

### 예상 출력

```
============================================================
CareMap Crawler Started
Start Time: 2025-10-20 15:30:00
============================================================

[Step 1] Connecting to database...
2025-10-20 15:30:01 - Database connected successfully

[Step 2] Creating tables...
2025-10-20 15:30:01 - Tables created successfully

[Step 3] Loading sample data...
2025-10-20 15:30:01 - Loaded 8 institutions

[Step 4] Geocoding addresses...
2025-10-20 15:30:02 - Geocoding 1/8: 서울특별시 강남구 테헤란로 123
2025-10-20 15:30:02 - Geocoded: 서울특별시 강남구 테헤란로 123 -> (37.5088, 127.0454)
...
2025-10-20 15:30:05 - Geocoding complete: 8/8 successful

[Step 5] Syncing to database...
2025-10-20 15:30:05 - Sync completed: 8 success, 0 failed, 8 total

Sync Result:
  - Total: 8
  - Success: 8
  - Failed: 0

[Step 6] Database Statistics:
  - Total Institutions: 8
  - By Service Type:
    * 방문요양: 4
    * 주간보호: 2
    * 단기보호: 1

============================================================
CareMap Crawler Completed
End Time: 2025-10-20 15:30:06
============================================================
```

---

## 🔍 데이터 확인

### PostgreSQL에서 데이터 확인

```bash
psql -U postgres -d caremap_db

# 전체 기관 조회
SELECT id, name, service_type, capacity, current_headcount, address
FROM institutions;

# 통계 조회
SELECT service_type, COUNT(*) as count
FROM institutions
GROUP BY service_type;

# 종료
\q
```

---

## 🎯 Frontend에서 데이터 연동

크롤러 실행 후 Frontend에서 데이터베이스의 실제 데이터를 사용하려면:

### 1. Backend API 구현 (다음 단계)
```bash
cd backend
source venv/bin/activate
python manage.py runserver
```

### 2. Frontend에서 API 호출
```typescript
// Mock 데이터 대신 실제 API 호출
const response = await fetch('http://localhost:8000/api/institutions/');
const data = await response.json();
```

---

## 🐛 문제 해결

### 1. Database connection failed

```bash
# PostgreSQL 실행 확인
pg_isready

# PostgreSQL 재시작
brew services restart postgresql@14  # macOS
sudo systemctl restart postgresql    # Linux
```

### 2. Geocoding failed

- Kakao REST API 키 확인
- `.env` 파일의 `KAKAO_REST_API_KEY` 값 확인
- API 일일 할당량 확인 (https://developers.kakao.com/console/app)

### 3. ModuleNotFoundError

```bash
# 가상환경 활성화 확인
which python  # venv/bin/python이어야 함

# 패키지 재설치
pip install -r requirements.txt
```

### 4. 로그 확인

```bash
# 실시간 로그 보기
tail -f logs/crawler.log
```

---

## 📊 현재 상태

### ✅ 완료된 기능
- PostgreSQL 데이터베이스 자동 생성
- 샘플 데이터 (8개 기관) 로드
- Kakao Geocoding API 연동
- 주소 → 위도/경도 자동 변환
- 데이터베이스 UPSERT (자동 업데이트)
- 변경 이력 추적
- 통계 조회

### 🚧 다음 단계
1. **실제 웹사이트 크롤링**: Selenium으로 공공 데이터 수집
2. **Backend API 연동**: Django REST API 구현
3. **Frontend 연동**: Mock 데이터 → 실제 DB 데이터
4. **스케줄링**: 매월 자동 실행

---

## 📞 지원

문제가 발생하면:
1. `logs/crawler.log` 파일 확인
2. 에러 메시지 복사
3. 이슈 등록 또는 문의

---

**축하합니다! 🎉 크롤러가 준비되었습니다!**

이제 `python main.py`를 실행하여 데이터를 수집하세요!
