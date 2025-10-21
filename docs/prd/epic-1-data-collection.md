# Epic 1: 데이터 수집 및 저장 (Data Collection & Storage)

**Epic Owner**: Backend Team
**Priority**: P0 (Critical)
**Estimated Duration**: 4 weeks
**Dependencies**: None

---

## Epic Overview

공공 웹사이트에서 전국 장기요양기관 데이터를 자동으로 수집하고, 위도/경도 변환 후 PostgreSQL 데이터베이스에 저장합니다. 데이터 변경 이력을 추적하여 시계열 분석을 가능하게 합니다.

---

## User Stories

### User Story 1.1: 장기요양기관 데이터 크롤링

**As a** 시스템
**I want to** 공공 웹사이트에서 전국 장기요양기관 정보를 자동으로 수집
**So that** 최신 데이터를 데이터베이스에 저장할 수 있다

**Priority**: P0
**Story Points**: 5
**Assigned to**: Backend Dev

**Acceptance Criteria**:
- [ ] Selenium을 사용하여 대상 웹사이트에 접속
- [ ] 기관명, 급여종류, 정원, 현원, 주소, 운영시간 등 필수 정보 추출
- [ ] 크롤링 중 에러 발생 시 로그 기록 및 재시도 로직 (최대 3회)
- [ ] 크롤링 완료 후 수집된 데이터 개수 리포트 출력

**Technical Requirements**:
- Python 3.11+
- Selenium 4.x
- BeautifulSoup4 4.x
- 웹사이트 구조 변경에 대비한 에러 핸들링
- Rate limiting 고려 (서버 부하 방지)

**Implementation Notes**:
```python
# crawler/updater.py
from selenium import webdriver
from bs4 import BeautifulSoup
import time

def crawl_data_from_site():
    """웹사이트에서 장기요양기관 데이터 크롤링"""
    driver = webdriver.Chrome()
    try:
        driver.get(CRAWL_TARGET_URL)
        # 전체 검색 조건 설정
        # 데이터 로드 대기
        # 페이지 파싱
        # 데이터 추출
        return crawled_data
    except Exception as e:
        logging.error(f"Crawling failed: {e}")
        raise
    finally:
        driver.quit()
```

**Definition of Done**:
- [ ] 코드 작성 완료 및 커밋
- [ ] 단위 테스트 작성 (mock 사용)
- [ ] 실제 웹사이트 대상 수동 테스트 성공
- [ ] 로그 파일 생성 확인
- [ ] Code review 완료

---

### User Story 1.2: 주소 → 위도/경도 변환 (Geocoding)

**As a** 시스템
**I want to** 기관 주소를 위도/경도 좌표로 변환
**So that** 지도 위에 정확한 위치를 표시할 수 있다

**Priority**: P0
**Story Points**: 3
**Assigned to**: Backend Dev

**Acceptance Criteria**:
- [ ] Kakao Geocoding API 연동
- [ ] 주소 변환 성공률 95% 이상
- [ ] 변환 실패 시 로그 기록 및 null 값 저장
- [ ] API 호출 제한 관리 (일일 할당량 확인)
- [ ] 배치 처리 시 적절한 delay 추가 (초당 최대 10건)

**Technical Requirements**:
- Kakao REST API Key 필요
- Requests 라이브러리
- Retry 로직 구현

**API Specification**:
```
GET https://dapi.kakao.com/v2/local/search/address.json
Headers:
  Authorization: KakaoAK {REST_API_KEY}
Parameters:
  query: 서울특별시 강남구 테헤란로 123
```

**Implementation Notes**:
```python
# crawler/geocoding.py
import requests
import time

def geocode_address(address):
    """주소를 위도/경도로 변환"""
    url = "https://dapi.kakao.com/v2/local/search/address.json"
    headers = {"Authorization": f"KakaoAK {KAKAO_API_KEY}"}
    params = {"query": address}

    try:
        response = requests.get(url, headers=headers, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()

        if data['documents']:
            return {
                'lat': float(data['documents'][0]['y']),
                'lng': float(data['documents'][0]['x'])
            }
        else:
            logging.warning(f"Geocoding failed for address: {address}")
            return None
    except Exception as e:
        logging.error(f"Geocoding error: {e}")
        return None
```

**Dependencies**:
- Kakao API Key 발급 필요
- 환경변수 설정 (.env)

**Definition of Done**:
- [ ] Geocoding 함수 구현 완료
- [ ] 단위 테스트 (mock API 응답)
- [ ] 실제 API 호출 테스트 (10개 샘플 주소)
- [ ] API 제한 확인 (일일 호출 한도)
- [ ] 에러 핸들링 검증
- [ ] Code review 완료

---

### User Story 1.3: 데이터 변경 이력 추적

**As a** 시스템
**I want to** 기관 정보 변경 시 이전 데이터를 히스토리 테이블에 저장
**So that** 월별 변동 추이를 분석할 수 있다

**Priority**: P0
**Story Points**: 5
**Assigned to**: Backend Dev

**Acceptance Criteria**:
- [ ] 정원, 현원, 주소, 기관명 변경 감지
- [ ] 변경 발생 시 `institution_history` 테이블에 기록 (recorded_date = 크롤링 실행일)
- [ ] 신규 기관은 히스토리 없이 `institutions` 테이블에만 삽입
- [ ] 변경 없는 기관은 업데이트 스킵 (성능 최적화)
- [ ] Transaction 처리로 데이터 일관성 보장

**Technical Requirements**:
- PostgreSQL UPSERT (INSERT ... ON CONFLICT)
- psycopg2 또는 Django ORM
- Transaction 관리

**Implementation Notes**:
```python
# crawler/db_sync.py
import psycopg2
from datetime import date

def sync_database(crawled_data):
    """크롤링 데이터를 DB에 동기화"""
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()

    try:
        for data in crawled_data:
            # 기존 데이터 조회
            cur.execute(
                "SELECT id, name, address, capacity, current_headcount "
                "FROM institutions WHERE institution_code = %s",
                (data['code'],)
            )
            existing = cur.fetchone()

            if existing:
                # 변경 감지
                is_changed = (
                    existing[1] != data['name'] or
                    existing[2] != data['address'] or
                    existing[3] != data['capacity'] or
                    existing[4] != data['current']
                )

                if is_changed:
                    # 히스토리 기록
                    cur.execute(
                        "INSERT INTO institution_history "
                        "(institution_id, recorded_date, name, address, capacity, current_headcount) "
                        "VALUES (%s, %s, %s, %s, %s, %s)",
                        (existing[0], date.today(), existing[1], existing[2], existing[3], existing[4])
                    )

            # UPSERT
            cur.execute(
                """
                INSERT INTO institutions (institution_code, name, service_type, capacity,
                                         current_headcount, address, operating_hours,
                                         latitude, longitude)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (institution_code)
                DO UPDATE SET
                    name = EXCLUDED.name,
                    service_type = EXCLUDED.service_type,
                    capacity = EXCLUDED.capacity,
                    current_headcount = EXCLUDED.current_headcount,
                    address = EXCLUDED.address,
                    operating_hours = EXCLUDED.operating_hours,
                    latitude = EXCLUDED.latitude,
                    longitude = EXCLUDED.longitude,
                    last_updated_at = CURRENT_TIMESTAMP
                """,
                (data['code'], data['name'], data['type'], data['capacity'],
                 data['current'], data['address'], data['hours'],
                 data['lat'], data['lng'])
            )

        conn.commit()
        logging.info(f"Database sync completed. {len(crawled_data)} institutions processed.")
    except Exception as e:
        conn.rollback()
        logging.error(f"Database sync failed: {e}")
        raise
    finally:
        cur.close()
        conn.close()
```

**Definition of Done**:
- [ ] DB 동기화 함수 구현 완료
- [ ] 변경 감지 로직 테스트 (신규/변경/무변경 시나리오)
- [ ] 히스토리 테이블 데이터 확인
- [ ] Transaction rollback 테스트
- [ ] 성능 테스트 (1000건 처리 시간 측정)
- [ ] Code review 완료

---

### User Story 1.4: 매월 자동 크롤링 스케줄링

**As a** 시스템 관리자
**I want to** 매월 1일 자동으로 크롤러가 실행되도록 설정
**So that** 수동 개입 없이 데이터가 최신 상태로 유지된다

**Priority**: P1
**Story Points**: 2
**Assigned to**: Backend Dev / DevOps

**Acceptance Criteria**:
- [ ] Cron job 설정 (매월 1일 00:00)
- [ ] 실행 성공/실패 로그 저장
- [ ] 실행 완료 후 요약 리포트 생성 (이메일 또는 로그 파일)
- [ ] 에러 발생 시 알림 (옵션: Slack, 이메일)

**Technical Requirements**:
- Linux Cron 또는 Airflow
- 로그 파일 관리 (rotation)

**Cron Configuration**:
```bash
# crontab -e
0 0 1 * * /path/to/venv/bin/python /path/to/crawler/updater.py >> /var/log/crawler.log 2>&1
```

**Alternative: Airflow DAG**
```python
# dags/monthly_crawler.py
from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime

def run_crawler():
    # crawler 실행 로직
    pass

dag = DAG(
    'monthly_institution_crawler',
    schedule_interval='0 0 1 * *',  # 매월 1일 00:00
    start_date=datetime(2025, 10, 1),
    catchup=False
)

task = PythonOperator(
    task_id='crawl_institutions',
    python_callable=run_crawler,
    dag=dag
)
```

**Definition of Done**:
- [ ] Cron job 설정 완료 (또는 Airflow DAG)
- [ ] 테스트 실행 성공 (수동 트리거)
- [ ] 로그 파일 확인
- [ ] 알림 메커니즘 구현 (옵션)
- [ ] 문서화 (README에 스케줄링 정보 추가)

---

## Epic Acceptance Criteria

- [ ] 전체 크롤링 → DB 동기화 파이프라인 작동
- [ ] 최소 100개 이상의 기관 데이터 수집 성공
- [ ] Geocoding 성공률 95% 이상
- [ ] 데이터 변경 이력 정상 기록
- [ ] 스케줄러 정상 작동
- [ ] 모든 User Story의 DoD 완료

---

## Technical Risks

| Risk | Mitigation |
|------|------------|
| 웹사이트 구조 변경 | 정기 모니터링, 에러 알림 설정 |
| Kakao API 제한 초과 | API 호출 최적화, 캐싱 고려 |
| DB 성능 저하 | 인덱싱, 배치 처리 최적화 |

---

## Dependencies

- PostgreSQL 데이터베이스 설정 완료
- Kakao API Key 발급
- 크롤링 대상 웹사이트 접근 권한 확인

---

## Notes

- Phase 1에서는 수동 트리거도 지원
- 성능 최적화는 Phase 2에서 진행
- 에러 알림은 Phase 2 고려사항
