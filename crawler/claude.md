# Crawler 디렉토리

> **상위 디렉토리의 내용을 상속받습니다.**

## 개요

Python 기반의 장기요양기관 데이터 크롤링 및 데이터베이스 동기화 시스템입니다.

## 기술 스택

- **Language**: Python 3.11+
- **Web Scraping**: Selenium 4.18, BeautifulSoup 4.12
- **HTTP Client**: Requests 2.31
- **Database**: PostgreSQL (psycopg2-binary 2.9.9)
- **Geocoding**: Kakao REST API

## 디렉토리 구조

```
crawler/
├── main.py              # 메인 실행 스크립트
├── db_manager.py        # 데이터베이스 관리 클래스
├── geocoding.py         # Kakao Geocoding API 연동
├── config.py            # 설정 관리
├── requirements.txt     # Python 패키지 목록
├── .env                 # 환경 변수 (Kakao API Key, DB 정보)
├── .env.example         # 환경 변수 예시
├── logs/
│   └── crawler.log      # 크롤러 실행 로그
└── venv/                # 가상환경
```

## 완성된 기능

### 1. 메인 실행 스크립트 (main.py)

#### 주요 기능
- 데이터베이스 연결 및 테이블 생성
- 샘플 데이터 (8개 기관) 정의
- Kakao Geocoding API로 주소 → 좌표 변환
- 데이터베이스 동기화 (UPSERT)
- 로깅 (파일 + 콘솔)

#### 실행 흐름
```python
1. 로거 설정 (logs/crawler.log)
2. DatabaseManager 초기화
3. 테이블 생성 (institutions, institution_history)
4. 샘플 데이터 준비
5. 각 기관 주소 → 좌표 변환 (geocoding.py)
6. 변환된 데이터 DB 동기화 (db_manager.py)
7. 연결 종료
```

#### 샘플 데이터 (8개 기관)
```python
sample_institutions = [
    {
        'institution_code': 'INST-001',
        'name': '서울 행복요양원',
        'service_type': '노인요양시설',
        'capacity': 50,
        'current_headcount': 42,
        'address': '서울특별시 강남구 테헤란로 123',
        'operating_hours': '24시간'
    },
    # ... 7개 더
]
```

**지역 분포**: 서울(3), 경기(2), 인천, 부산, 대전

### 2. 데이터베이스 관리자 (db_manager.py)

#### DatabaseManager 클래스

##### 초기화
```python
def __init__(self, host, port, database, user, password):
    self.conn = psycopg2.connect(...)
    self.cursor = self.conn.cursor()
```

##### create_tables()
- `institutions` 테이블 생성:
  - 필드: id, institution_code (UNIQUE), name, service_type, capacity, current_headcount, address, operating_hours, latitude, longitude, occupancy_rate, last_updated_at
- `institution_history` 테이블 생성:
  - 필드: id, institution_id (FK), change_type, changed_fields, old_values, new_values, changed_at

##### upsert_institution(data: dict) → bool
- **UPSERT 로직**:
  1. institution_code로 기존 데이터 조회
  2. 변경 감지 (capacity, current_headcount, address 등)
  3. 변경 사항 있으면 institution_history에 기록
  4. institutions 테이블에 INSERT 또는 UPDATE (ON CONFLICT DO UPDATE)
- **입소율 자동 계산**: `occupancy_rate = (current_headcount / capacity) * 100`
- **반환값**: 성공 시 True, 실패 시 False

##### sync_institutions(institutions: list) → dict
- **배치 동기화**:
  - 여러 기관 데이터를 한 번에 처리
  - 트랜잭션 사용 (전체 성공 or 전체 롤백)
- **반환값**: `{'success': int, 'failed': int, 'total': int}`

##### close()
- 커서 및 연결 종료

### 3. Geocoding 모듈 (geocoding.py)

#### Kakao Geocoding API 연동

##### geocode_address(address: str) → dict | None
```python
def geocode_address(address: str) -> dict:
    url = "https://dapi.kakao.com/v2/local/search/address.json"
    headers = {"Authorization": f"KakaoAK {KAKAO_REST_API_KEY}"}
    params = {"query": address}

    response = requests.get(url, headers=headers, params=params)
    data = response.json()

    if data['documents']:
        return {
            'lat': float(data['documents'][0]['y']),
            'lng': float(data['documents'][0]['x'])
        }
    return None
```

- **입력**: 주소 문자열 (예: "서울특별시 강남구 테헤란로 123")
- **출력**: `{'lat': float, 'lng': float}` 또는 None
- **Rate Limiting**: 0.1초 대기 (time.sleep)

##### batch_geocode(institutions: list) → list
- 여러 기관 주소를 배치로 처리
- 각 주소마다 0.1초 대기 (API 제한 준수)
- 실패 시 latitude, longitude를 None으로 설정

### 4. 설정 관리 (config.py)

#### 환경 변수 로드
```python
from dotenv import load_dotenv
import os

load_dotenv()

# Kakao API
KAKAO_REST_API_KEY = os.getenv('KAKAO_REST_API_KEY', '')

# Database
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': os.getenv('DB_PORT', '5432'),
    'database': os.getenv('DB_NAME', 'caremap'),
    'user': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASSWORD', '')
}

# Crawling
CRAWL_DELAY = float(os.getenv('CRAWL_DELAY', '0.1'))
MAX_RETRY = int(os.getenv('MAX_RETRY', '3'))
```

### 5. 로깅 시스템

#### 로거 설정 (main.py)
```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/crawler.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)
```

- **로그 레벨**: INFO
- **로그 포맷**: 시간 - 레벨 - 메시지
- **출력**: 파일 (logs/crawler.log) + 콘솔
- **인코딩**: UTF-8

## 환경 변수

### .env 파일 예시
```
# Kakao API
KAKAO_REST_API_KEY=your_kakao_rest_api_key_here

# PostgreSQL Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=caremap
DB_USER=postgres
DB_PASSWORD=your_password

# Crawling Settings
CRAWL_DELAY=0.1
MAX_RETRY=3
```

**중요**: `.env` 파일은 git에 커밋하지 않습니다 (.gitignore 추가)

## 데이터베이스 스키마

### institutions 테이블
```sql
CREATE TABLE IF NOT EXISTS institutions (
    id SERIAL PRIMARY KEY,
    institution_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    service_type VARCHAR(100),
    capacity INTEGER,
    current_headcount INTEGER,
    address TEXT,
    operating_hours VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    occupancy_rate DECIMAL(5, 2),
    last_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### institution_history 테이블
```sql
CREATE TABLE IF NOT EXISTS institution_history (
    id SERIAL PRIMARY KEY,
    institution_id INTEGER REFERENCES institutions(id),
    change_type VARCHAR(50),
    changed_fields TEXT,
    old_values TEXT,
    new_values TEXT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 실행 방법

### 1. 가상환경 설정
```bash
cd crawler
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

### 2. 패키지 설치
```bash
pip install -r requirements.txt
```

### 3. 환경 변수 설정
```bash
# .env 파일 생성
cp .env.example .env

# .env 파일 편집
# KAKAO_REST_API_KEY, DB_* 등 필수 값 입력
```

### 4. PostgreSQL 데이터베이스 준비
```bash
# PostgreSQL 설치 및 실행
# 데이터베이스 생성
createdb caremap

# 또는 psql에서
psql -U postgres
CREATE DATABASE caremap;
```

### 5. 크롤러 실행
```bash
python main.py
```

## requirements.txt

```
selenium==4.18.1
beautifulsoup4==4.12.3
requests==2.31.0
psycopg2-binary==2.9.9
python-dotenv==1.0.0
```

## 변경 이력 추적

### 이력 기록 조건
- capacity (정원) 변경
- current_headcount (현원) 변경
- address (주소) 변경

### 이력 데이터 형식
```python
{
    'institution_id': 1,
    'change_type': 'update',
    'changed_fields': 'current_headcount',
    'old_values': '42',
    'new_values': '45',
    'changed_at': '2025-10-20 12:00:00'
}
```

### 이력 활용
- 시계열 분석: 기관별 입소율 변화 추이
- 데이터 품질 관리: 변경 내역 추적
- 통계 분석: 월별/분기별 변동 분석

## 실행 로그 예시

```
2025-10-20 12:00:00 - INFO - 크롤러를 시작합니다.
2025-10-20 12:00:01 - INFO - 데이터베이스에 연결되었습니다.
2025-10-20 12:00:01 - INFO - 테이블을 생성했습니다.
2025-10-20 12:00:02 - INFO - 주소 변환 중: 서울특별시 강남구 테헤란로 123
2025-10-20 12:00:03 - INFO - 좌표: (37.5012, 127.0396)
2025-10-20 12:00:04 - INFO - 8개 기관 정보를 동기화했습니다.
2025-10-20 12:00:04 - INFO - 성공: 8, 실패: 0
2025-10-20 12:00:04 - INFO - 크롤러 실행이 완료되었습니다.
```

## 다음 개발 단계

### 진행 예정 작업
1. **실제 웹사이트 크롤링 구현**:
   - 실제 장기요양기관 정보 공개 사이트 접속
   - Selenium으로 페이지 탐색 및 데이터 추출
   - BeautifulSoup으로 HTML 파싱
   - 페이지네이션 처리
2. **크롤러 API 연동**:
   - Django Backend에 크롤러 실행 API 추가
   - subprocess 또는 Celery로 비동기 실행
   - 실행 상태 및 로그 실시간 전송
3. **스케줄링**:
   - Cron 또는 APScheduler로 정기 실행
   - 예: 매월 1일 자동 크롤링
4. **에러 핸들링 강화**:
   - 재시도 로직 (MAX_RETRY 활용)
   - 네트워크 오류 대응
   - 타임아웃 설정

### 개선 사항
- 크롤링 속도 최적화 (멀티스레딩, 비동기)
- 중복 데이터 필터링
- 데이터 검증 (유효성 체크)
- 크롤링 대상 사이트 다양화
- 로그 로테이션 (파일 크기 제한)

## 참고 사항

- Kakao Geocoding API는 하루 300,000건 제한이 있습니다
- PostgreSQL 연결 정보는 반드시 .env 파일로 관리하세요
- 크롤링 대상 사이트의 robots.txt를 확인하고 준수하세요
- 크롤링 간격(CRAWL_DELAY)을 너무 짧게 설정하면 차단될 수 있습니다
- 데이터베이스 트랜잭션을 사용하여 데이터 무결성을 보장합니다

## 테스트 시나리오

### 1. 데이터베이스 연결 테스트
```bash
python main.py
# 로그에서 "데이터베이스에 연결되었습니다." 확인
```

### 2. Geocoding 테스트
```python
from geocoding import geocode_address

result = geocode_address("서울특별시 강남구 테헤란로 123")
print(result)  # {'lat': 37.5012, 'lng': 127.0396}
```

### 3. UPSERT 테스트
- 첫 실행: 8개 기관 신규 등록 (INSERT)
- 두 번째 실행: 변경 사항 없으면 업데이트 안 함
- current_headcount 수정 후 실행: UPDATE + History 기록

## 크롤링 대상 사이트 (예정)

- 국민건강보험공단 장기요양기관 찾기
- 복지부 사회서비스 전자바우처
- 지역별 보건복지부 홈페이지

## 보안 고려사항

- .env 파일을 git에 커밋하지 않음 (.gitignore 추가)
- 데이터베이스 비밀번호는 강력하게 설정
- API 키는 정기적으로 갱신
- 크롤링 시 User-Agent 헤더 설정 권장
