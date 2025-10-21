# CareMap Crawler

장기요양기관 데이터를 수집하여 PostgreSQL 데이터베이스에 저장하는 크롤러입니다.

## 🚀 빠른 시작

### 1. 환경 설정

```bash
cd crawler

# Python 가상환경 생성
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 패키지 설치
pip install -r requirements.txt
```

### 2. 환경 변수 설정

`.env` 파일 생성:

```bash
cp .env.example .env
```

`.env` 파일 편집:

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=caremap_db
DB_USER=postgres
DB_PASSWORD=your_password

# Kakao REST API Key (Geocoding용)
KAKAO_REST_API_KEY=your_kakao_rest_api_key
```

### 3. PostgreSQL 데이터베이스 생성

```bash
# PostgreSQL 접속
psql -U postgres

# 데이터베이스 생성
CREATE DATABASE caremap_db;

# 종료
\q
```

### 4. 크롤러 실행

```bash
python main.py
```

## 📁 파일 구조

```
crawler/
├── main.py              # 메인 실행 스크립트
├── config.py            # 설정 파일
├── db_manager.py        # 데이터베이스 관리
├── geocoding.py         # 주소 → 좌표 변환
├── requirements.txt     # Python 패키지
├── .env.example         # 환경 변수 예시
├── .env                 # 환경 변수 (직접 생성)
├── logs/                # 로그 파일 (자동 생성)
└── README.md            # 이 파일
```

## 🔧 주요 기능

### 1. 데이터 수집
- 샘플 데이터 로드 (실제 크롤링 전 테스트용)
- 기관 코드, 이름, 급여종류, 정원, 현원, 주소, 운영시간 수집

### 2. Geocoding
- Kakao API를 사용하여 주소 → 위도/경도 변환
- 배치 처리 지원 (Rate limiting 포함)

### 3. 데이터베이스 동기화
- PostgreSQL 자동 연결
- 테이블 자동 생성
- UPSERT (삽입/업데이트)
- 변경 이력 자동 기록

### 4. 통계
- 전체 기관 수
- 급여종류별 분포

## 📊 데이터베이스 스키마

### institutions 테이블
```sql
- id: 기관 ID (자동 증가)
- institution_code: 기관 코드 (UNIQUE)
- name: 기관명
- service_type: 급여종류
- capacity: 정원
- current_headcount: 현원
- address: 주소
- operating_hours: 운영시간
- latitude: 위도
- longitude: 경도
- last_updated_at: 최종 업데이트 시간
```

### institution_history 테이블
```sql
- id: 이력 ID
- institution_id: 기관 ID (FK)
- recorded_date: 기록 날짜
- name: 변경 당시 기관명
- address: 변경 당시 주소
- capacity: 변경 당시 정원
- current_headcount: 변경 당시 현원
```

## 🔑 Kakao REST API Key 발급

1. https://developers.kakao.com/ 접속
2. 로그인 후 "내 애플리케이션" → "애플리케이션 추가하기"
3. 앱 생성 후 "앱 키" → **"REST API 키"** 복사
4. `.env` 파일에 붙여넣기

## 📝 로그

실행 로그는 `logs/crawler.log`에 저장됩니다.

```bash
# 로그 확인
tail -f logs/crawler.log
```

## 🧪 테스트

현재는 샘플 데이터로 테스트합니다:
- 8개 샘플 기관 데이터
- 서울, 경기, 인천, 부산, 대전 지역

## 🔄 스케줄링 (추후)

매월 1일 자동 실행:

```bash
# crontab 설정
0 0 1 * * cd /path/to/crawler && /path/to/venv/bin/python main.py
```

## ⚠️ 주의사항

1. **PostgreSQL 설치 필요**: https://www.postgresql.org/
2. **Kakao REST API Key 필요**: Geocoding 기능에 필수
3. **API 호출 제한**: Kakao API 일일 할당량 확인
4. **실제 크롤링**: 현재는 샘플 데이터, 실제 웹사이트 크롤링은 추가 구현 필요

## 📞 문의

문제가 발생하면 로그 파일을 확인하거나 이슈를 등록해주세요.
