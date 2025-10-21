# Product Requirement Document (PRD)
# 장기요양기관 데이터 시각화 및 분석 플랫폼 (CareMap)

**Version**: 1.0
**Date**: 2025-10-20
**Status**: Draft
**Owner**: Product Team

---

## Executive Summary

장기요양기관의 데이터를 수집하고 시각화하여, 사용자가 전국 요양기관의 현황과 변동 추이를 한눈에 파악할 수 있는 웹 기반 분석 플랫폼입니다. 지도 기반 인터랙티브 시각화와 시계열 분석을 통해 기관의 정원/현원 변화를 추적하고 의사결정을 지원합니다.

---

## 1. Project Vision & Goals

### 1.1 Vision
> 데이터의 역사와 흐름을 시각화하여, 사용자가 깊은 통찰력을 얻을 수 있도록 돕는 장기요양기관 분석 플랫폼

### 1.2 Business Goals
- 전국 장기요양기관 정보의 중앙화된 접근 제공
- 기관별 정원/현원 데이터의 실시간 시각화
- 월별 데이터 변경 이력을 통한 트렌드 분석
- 사용자 친화적인 인터페이스로 복잡한 데이터 단순화

### 1.3 Success Metrics
- 전국 장기요양기관 데이터 커버리지: 95% 이상
- 데이터 업데이트 주기: 매월 1일 자동 갱신
- 지도 로딩 시간: 3초 이내
- 차트 렌더링 시간: 1초 이내
- 사용자 만족도: 4.0/5.0 이상

---

## 2. Target Users & Personas

### 2.1 Primary Users

#### Persona 1: 요양기관 관리자
- **배경**: 요양원, 주간보호센터 등을 운영하는 관리자
- **목표**: 지역 내 경쟁 기관의 정원/현원 현황 파악
- **Pain Points**:
  - 경쟁사 정보를 개별적으로 검색해야 함
  - 시장 트렌드를 파악하기 어려움
- **필요 기능**: 지역별 필터링, 기관 비교 분석

#### Persona 2: 정책 입안자 / 연구자
- **배경**: 보건복지부, 연구기관 소속
- **목표**: 전국 요양기관 운영 현황 분석, 정책 수립 근거 마련
- **Pain Points**:
  - 전체 데이터를 한눈에 보기 어려움
  - 시계열 분석 데이터 부족
- **필요 기능**: 통계 대시보드, CSV 내보내기, 시계열 차트

#### Persona 3: 일반 시민 / 보호자
- **배경**: 요양 서비스가 필요한 가족을 둔 보호자
- **목표**: 거주지 근처 요양기관 찾기, 정원/현원 확인
- **Pain Points**:
  - 어떤 기관이 여유가 있는지 파악 어려움
  - 신뢰할 수 있는 정보원 부족
- **필요 기능**: 지도 검색, 기관 상세 정보 조회

---

## 3. Core Features & Requirements

### 3.1 Epic 1: 데이터 수집 및 저장 (Data Collection & Storage)

#### User Story 1.1: 장기요양기관 데이터 크롤링
**As a** 시스템
**I want to** 공공 웹사이트에서 전국 장기요양기관 정보를 자동으로 수집
**So that** 최신 데이터를 데이터베이스에 저장할 수 있다

**Acceptance Criteria**:
- [ ] Selenium을 사용하여 대상 웹사이트에 접속
- [ ] 기관명, 급여종류, 정원, 현원, 주소, 운영시간 등 필수 정보 추출
- [ ] 크롤링 중 에러 발생 시 로그 기록 및 재시도 로직
- [ ] 크롤링 완료 후 수집된 데이터 개수 리포트

**Technical Notes**:
- 웹사이트 구조 변경에 대비한 에러 핸들링 필요
- Rate limiting 고려 (서버 부하 방지)

---

#### User Story 1.2: 주소 → 위도/경도 변환 (Geocoding)
**As a** 시스템
**I want to** 기관 주소를 위도/경도 좌표로 변환
**So that** 지도 위에 정확한 위치를 표시할 수 있다

**Acceptance Criteria**:
- [ ] Kakao Geocoding API 연동
- [ ] 주소 변환 성공률 95% 이상
- [ ] 변환 실패 시 로그 기록 및 수동 확인 알림
- [ ] API 호출 제한 관리 (일일 제한 고려)

**Dependencies**:
- Kakao API Key 발급 필요

---

#### User Story 1.3: 데이터 변경 이력 추적
**As a** 시스템
**I want to** 기관 정보 변경 시 이전 데이터를 히스토리 테이블에 저장
**So that** 월별 변동 추이를 분석할 수 있다

**Acceptance Criteria**:
- [ ] 정원, 현원, 주소, 기관명 변경 감지
- [ ] 변경 발생 시 `institution_history` 테이블에 기록 (recorded_date = 크롤링 실행일)
- [ ] 신규 기관은 히스토리 없이 `institutions` 테이블에만 삽입
- [ ] 변경 없는 기관은 업데이트 스킵 (성능 최적화)

---

#### User Story 1.4: 매월 자동 크롤링 스케줄링
**As a** 시스템 관리자
**I want to** 매월 1일 자동으로 크롤러가 실행되도록 설정
**So that** 수동 개입 없이 데이터가 최신 상태로 유지된다

**Acceptance Criteria**:
- [ ] Cron job 또는 스케줄러 설정 (매월 1일 00:00)
- [ ] 실행 성공/실패 알림 (이메일 또는 슬랙)
- [ ] 실행 로그 저장

---

### 3.2 Epic 2: 지도 기반 시각화 (Map Visualization)

#### User Story 2.1: 전국 요양기관 지도 표시
**As a** 사용자
**I want to** 전국 장기요양기관의 위치를 지도 위에서 확인
**So that** 지역별 기관 분포를 한눈에 파악할 수 있다

**Acceptance Criteria**:
- [ ] Kakao Maps API를 사용하여 지도 렌더링
- [ ] 각 기관 위치에 커스텀 마커 표시
- [ ] 지도 줌/팬 기능 지원
- [ ] 초기 로딩 시 전국 전체 뷰 제공

**UI/UX Requirements**:
- 지도 로딩 스피너 표시
- 모바일 반응형 지원

---

#### User Story 2.2: 기관별 정원/현원 비율 파이차트 마커
**As a** 사용자
**I want to** 지도 마커가 정원/현원 비율을 시각적으로 표현
**So that** 클릭 없이도 기관의 여유 여부를 직관적으로 파악할 수 있다

**Acceptance Criteria**:
- [ ] 마커를 파이차트 형태로 렌더링 (정원 대비 현원 비율)
- [ ] 색상 코드:
  - 여유 있음 (현원/정원 < 70%): 녹색
  - 보통 (70% ~ 90%): 주황색
  - 포화 (90% 이상): 빨간색
- [ ] 마커 크기: 기관 규모(정원)에 비례 (옵션)

**Technical Notes**:
- Canvas 또는 SVG를 사용한 동적 마커 생성

---

#### User Story 2.3: 마우스 오버 시 기관 상세 정보 표시
**As a** 사용자
**I want to** 마커에 마우스를 올리면 기관 정보 팝업 표시
**So that** 클릭 없이 빠르게 정보를 확인할 수 있다

**Acceptance Criteria**:
- [ ] 마우스 오버 시 툴팁/인포윈도우 표시
- [ ] 표시 정보: 기관명, 급여종류, 정원, 현원, 주소
- [ ] 마우스 아웃 시 자동 닫힘

---

#### User Story 2.4: 마커 클릭 시 상세 페이지 이동
**As a** 사용자
**I want to** 마커를 클릭하면 해당 기관의 상세 페이지로 이동
**So that** 더 많은 정보와 시계열 그래프를 확인할 수 있다

**Acceptance Criteria**:
- [ ] 마커 클릭 이벤트 처리
- [ ] 상세 페이지 라우팅 (예: `/institution/[id]`)
- [ ] 뒤로 가기 버튼으로 지도 복귀

---

### 3.3 Epic 3: 기관 상세 페이지 (Institution Detail Page)

#### User Story 3.1: 기관 기본 정보 표시
**As a** 사용자
**I want to** 기관의 상세 정보를 확인
**So that** 해당 기관에 대한 종합적인 정보를 얻을 수 있다

**Acceptance Criteria**:
- [ ] 기관명, 급여종류, 정원, 현원, 주소, 운영시간 표시
- [ ] 지도 상 위치 미니맵 표시
- [ ] 마지막 업데이트 시간 표시

---

#### User Story 3.2: 정원/현원 시계열 그래프
**As a** 사용자
**I want to** 기관의 월별 정원/현원 변동 내역을 그래프로 확인
**So that** 기관의 운영 추세를 분석할 수 있다

**Acceptance Criteria**:
- [ ] Chart.js 또는 Recharts를 사용한 라인 차트
- [ ] X축: 월별 날짜 (recorded_date)
- [ ] Y축: 정원, 현원 (두 개 라인)
- [ ] 데이터 포인트 호버 시 수치 표시
- [ ] 최근 12개월 데이터 기본 표시, 전체 기간 옵션 제공

**Edge Cases**:
- 데이터가 없는 경우 "데이터 없음" 메시지 표시
- 신규 기관의 경우 히스토리 부족 안내

---

### 3.4 Epic 4: 검색 및 필터링 (Search & Filtering)

#### User Story 4.1: 기관명 검색
**As a** 사용자
**I want to** 기관명으로 검색
**So that** 특정 기관을 빠르게 찾을 수 있다

**Acceptance Criteria**:
- [ ] 검색창에 키워드 입력 시 실시간 필터링
- [ ] 부분 일치 지원
- [ ] 검색 결과를 지도에 하이라이트

---

#### User Story 4.2: 급여종류 필터
**As a** 사용자
**I want to** 급여종류(방문요양, 주간보호 등)로 필터링
**So that** 원하는 서비스 유형의 기관만 확인할 수 있다

**Acceptance Criteria**:
- [ ] 드롭다운 또는 체크박스 필터
- [ ] 다중 선택 지원
- [ ] 필터 적용 시 지도 마커 업데이트

---

#### User Story 4.3: 지역별 필터
**As a** 사용자
**I want to** 시/도, 시/군/구 단위로 필터링
**So that** 특정 지역의 기관만 확인할 수 있다

**Acceptance Criteria**:
- [ ] 2단계 선택 (시/도 → 시/군/구)
- [ ] 지역 선택 시 지도 자동 이동 및 줌

---

### 3.5 Epic 5: 관리자 기능 (Admin Features) - Phase 2

#### User Story 5.1: 대시보드 통계
**As a** 관리자
**I want to** 전체 기관 통계를 대시보드에서 확인
**So that** 시스템 운영 현황을 모니터링할 수 있다

**Acceptance Criteria**:
- [ ] 총 기관 수, 평균 정원/현원 비율 표시
- [ ] 지역별 분포 차트
- [ ] 최근 크롤링 실행 이력

---

#### User Story 5.2: 수동 데이터 수정
**As a** 관리자
**I want to** 잘못된 데이터를 수동으로 수정
**So that** 크롤링 오류를 즉시 보정할 수 있다

**Acceptance Criteria**:
- [ ] 기관 검색 및 편집 UI
- [ ] 수정 이력 로그 저장
- [ ] 권한 관리 (관리자만 접근)

---

## 4. Non-Functional Requirements

### 4.1 Performance
- 지도 초기 로딩: 3초 이내
- API 응답 시간: 500ms 이내 (95 percentile)
- 동시 접속자 100명 이상 지원

### 4.2 Security
- API 엔드포인트 CORS 설정
- SQL Injection 방지 (Parameterized Query)
- Kakao API Key 환경변수 관리

### 4.3 Scalability
- PostgreSQL 인덱싱 최적화 (institution_code, latitude/longitude)
- 캐싱 전략 (Redis 고려 - Phase 2)

### 4.4 Usability
- 모바일 반응형 디자인
- 접근성 준수 (WCAG 2.1 AA 수준)
- 한국어 UI

### 4.5 Reliability
- 크롤러 실패 시 재시도 로직 (최대 3회)
- 에러 로깅 및 모니터링
- 데이터베이스 백업 (일 1회)

---

## 5. Technical Constraints

### 5.1 Technology Stack
- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Python 3.x, Django
- **Database**: PostgreSQL
- **Crawler**: Selenium, BeautifulSoup4
- **APIs**: Kakao Maps API, Kakao Geocoding API
- **Charts**: Recharts

### 5.2 Infrastructure
- Hosting: TBD (Vercel for Frontend, AWS/GCP for Backend)
- Database: Managed PostgreSQL (AWS RDS, Supabase 등)

---

## 6. Out of Scope (Phase 1)

- 사용자 계정 및 로그인
- 즐겨찾기 기능
- 모바일 앱
- 데이터 내보내기 (CSV/Excel)
- 알림 기능 (기관 정원 변경 시 알림)
- 다국어 지원

---

## 7. Assumptions & Dependencies

### Assumptions
- 크롤링 대상 웹사이트가 안정적으로 유지됨
- Kakao API의 일일 할당량이 충분함
- 사용자 인터넷 연결 속도가 최소 3G 이상

### Dependencies
- Kakao API Key 발급
- 크롤링 대상 웹사이트 접근 가능
- PostgreSQL 데이터베이스 서버

---

## 8. Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| 웹사이트 구조 변경으로 크롤러 작동 중단 | High | Medium | 정기 모니터링, 에러 알림 설정 |
| Kakao API 제한 초과 | Medium | Low | API 호출 최적화, 캐싱 |
| 대용량 데이터로 지도 성능 저하 | High | Medium | 클러스터링 적용 (Phase 2) |
| 개인정보 보호법 위반 우려 | High | Low | 공공 데이터만 수집, 개인정보 제외 |

---

## 9. Release Plan

### Phase 1 (MVP) - 2개월
- Epic 1: 데이터 수집 및 저장 (4주)
- Epic 2: 지도 기반 시각화 (3주)
- Epic 3: 기관 상세 페이지 (2주)
- Epic 4: 검색 및 필터링 (1주)

### Phase 2 - 1개월
- Epic 5: 관리자 기능
- 성능 최적화 (클러스터링, 캐싱)
- 모니터링 및 알림

### Phase 3 - Future
- 사용자 계정
- 데이터 내보내기
- 모바일 앱

---

## 10. Approval & Sign-off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Product Owner | TBD | | |
| Tech Lead | TBD | | |
| Stakeholder | TBD | | |

---

## Appendix

### A. Glossary
- **정원**: 기관이 수용 가능한 최대 인원
- **현원**: 현재 이용 중인 인원
- **급여종류**: 방문요양, 주간보호, 단기보호 등 서비스 유형
- **장기요양기관**: 노인장기요양보험법에 따른 인증 기관

### B. References
- 노인장기요양보험 공식 웹사이트
- Kakao Maps API Documentation
- bmad-method Framework

---

**Document History**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-10-20 | Claude (AI PM) | Initial PRD creation |
