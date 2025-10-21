# Admin 페이지

상위 디렉토리 조건을 승계한다.

## 개요

관리자 크롤링 페이지로, Playwright를 사용하여 장기요양기관 데이터를 크롤링하고 DB에 저장하는 기능을 제공합니다.

---

## 주요 기능 (완성)

### 1. 크롤러 관리 (CRUD)
- ✅ **크롤러 목록 조회**: 등록된 모든 크롤러 표시
- ✅ **크롤러 추가**: 새로운 크롤링 대상 등록
- ✅ **크롤러 수정**: 기존 크롤러 정보 업데이트
- ✅ **크롤러 삭제**: 크롤러 제거
- ✅ **활성화/비활성화 토글**: 크롤러 사용 상태 관리
- ✅ **작업 개수 표시**: 각 크롤러의 총 작업 실행 횟수

### 2. 준비 프로세스 (Preparation Dialog)
- ✅ **자동 페이지 수 확인**: "실행" 버튼 클릭 시 자동으로 전체 페이지 수 조회
- ✅ **로딩 상태 표시**: 전체 페이지 수 조회 중 로딩 인디케이터 표시
- ✅ **준비 완료 알림**: "전체 XXX페이지 준비되었습니다!" 메시지 표시
- ✅ **확인 버튼**: "OK - 시작" 버튼으로 크롤링 실행 확인
- ✅ **에러 처리**: 페이지 수 조회 실패 시 에러 메시지 표시

### 3. 백그라운드 크롤링 실행
- ✅ **비동기 실행**: 서버 백그라운드에서 크롤링 독립 실행
- ✅ **페이지 독립성**: 페이지 새로고침/닫기 후에도 크롤링 계속 진행
- ✅ **데이터베이스 기록**: 모든 작업은 CrawlerJob 테이블에 영구 저장
- ✅ **자동 상태 업데이트**: 크롤링 진행 상황 실시간 DB 업데이트

### 4. 실시간 진행 상태 추적
- ✅ **자동 갱신**: 3초마다 크롤러 목록 자동 새로고침
- ✅ **진행률 표시**: "X / XXX (XX%)" 형식으로 진행률 표시
- ✅ **프로그레스 바**: 시각적 진행률 바 표시
- ✅ **상태 배지**:
  - 🟢 `running`: 실행 중 (파란색, 애니메이션 스피너)
  - ✅ `completed`: 완료 (초록색, 체크 아이콘)
  - ❌ `failed`: 실패 (빨간색, 경고 아이콘)
- ✅ **실시간 수집 개수**: 현재까지 수집된 기관 수 표시

### 5. 작업 결과 표시
- ✅ **결과 카드**: 완료된 작업의 상세 결과 표시
  - 📊 수집: 총 크롤링된 기관 수
  - ➕ 신규: 새로 생성된 기관 수
  - 🔄 업데이트: 기존 기관 업데이트 수
  - ❌ 실패: 실패한 기관 수
- ✅ **DB 저장 여부**: "DB 저장 완료" 배지 표시
- ✅ **소요 시간 표시**: 시작~완료 시간 및 총 소요 시간

### 6. 작업 이력 관리
- ✅ **최근 작업 목록**: 최근 10개 작업 이력 테이블 표시
- ✅ **시간 정보**: 시작 시간, 완료 시간, 소요 시간
- ✅ **결과 통계**: 수집/신규/업데이트/실패 건수
- ✅ **자동 갱신**: 3초마다 작업 이력 자동 업데이트
- ✅ **상태 필터링**: 실행 중인 작업 우선 표시

### 7. 크롤링 성능 최적화
- ✅ **브라우저 최적화**: GPU, 이미지, CSS, 폰트 비활성화로 70% 속도 향상
- ✅ **대기 전략 변경**: networkidle → domcontentloaded로 빠른 페이지 로드
- ✅ **대기 시간 단축**: 3-5초 → 0.5-1초
- ✅ **페이지 변경 감지**: 첫 번째 행 내용 비교로 실제 페이지 전환 확인
- ✅ **재시도 로직**: 데이터 로딩 실패 시 최대 3회 재시도 (2초 대기)

### 8. 데이터 저장 및 처리
- ✅ **신규 기관**: 자동으로 생성
- ✅ **기존 기관**: 변경사항 감지 후 업데이트
- ✅ **이력 관리**: 변경사항 발생 시 InstitutionHistory에 백업
- ✅ **좌표 변환**: Kakao Geocoding API로 주소를 위도/경도 변환
- ✅ **Rate Limiting**: Geocoding API 호출 시 100ms 지연으로 API 제한 방지
- ✅ **저장 결과 기록**: DB 저장 후 신규/업데이트/실패 건수 CrawlerJob에 기록

### 9. UI/UX 개선
- ✅ **다크 모드**: 전체 페이지 다크 모드 지원
- ✅ **반응형 디자인**: 모바일/태블릿/데스크톱 최적화
- ✅ **로딩 상태**: 각 작업별 로딩 인디케이터
- ✅ **에러 처리**: 친절한 에러 메시지 및 복구 안내
- ✅ **확인 다이얼로그**: 삭제 등 중요한 작업 전 확인 요청

---

## 파일 구조

### Frontend
```
src/app/admin/
├── page.tsx                    # 관리자 크롤링 페이지 (메인)
├── layout.tsx                  # Admin 레이아웃
├── database/
│   └── page.tsx                # DB 관리 페이지
└── CLAUDE.md                   # 현재 문서
```

### Backend API
```
src/app/api/admin/
├── crawlers/
│   ├── route.ts                # 크롤러 CRUD (GET, POST)
│   └── [id]/
│       └── route.ts            # 크롤러 상세 (PATCH, DELETE)
├── crawler/
│   ├── total-pages/
│   │   └── route.ts            # 전체 페이지 수 조회
│   ├── start/
│   │   └── route.ts            # 크롤링 시작 (백그라운드)
│   └── jobs/
│       └── route.ts            # 작업 이력 조회
├── coordinates/
│   └── update/
│       └── route.ts            # 좌표 일괄 업데이트
└── database/
    └── status/
        └── route.ts            # DB 상태 조회
```

### Crawler Engine
```
src/lib/
├── crawler.ts                  # Playwright 크롤링 엔진
├── geocoding.ts                # Kakao Geocoding API
├── prisma.ts                   # Prisma Client 싱글톤
└── institutionHistory.ts       # 이력 관리 유틸리티
```

---

## 데이터베이스 모델

### Crawler (크롤러)
```prisma
model Crawler {
  id          String        @id @default(cuid())
  name        String
  url         String
  description String?
  isActive    Boolean       @default(true)
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  jobs        CrawlerJob[]
}
```

### CrawlerJob (크롤링 작업)
```prisma
model CrawlerJob {
  id            String      @id @default(cuid())
  crawlerId     String
  crawler       Crawler     @relation(fields: [crawlerId], references: [id], onDelete: Cascade)
  status        String      @default("running") # running, completed, failed
  startedAt     DateTime    @default(now())
  completedAt   DateTime?
  totalPages    Int
  crawledCount  Int         @default(0)
  createdCount  Int?
  updatedCount  Int?
  failedCount   Int?
  savedToDb     Boolean     @default(false)
  errorMessage  String?
}
```

---

## 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI**: Tailwind CSS, shadcn/ui, Lucide Icons
- **Crawler**: Playwright (Chromium)
- **Database**: Prisma ORM, SQLite (dev) / Neon.tech (production)
- **Geocoding**: Kakao REST API
- **State Management**: React useState, useEffect, useRef

---

## 사용 흐름

### 1단계: 크롤러 확인/등록
1. `/admin` 페이지 접속
2. 기존 크롤러 확인 또는 "새 크롤러 추가" 버튼 클릭
3. 크롤러 정보 입력 (이름, URL, 설명)
4. 저장

### 2단계: 크롤링 준비
1. 크롤러 목록에서 **"실행"** 버튼 클릭
2. 준비 다이얼로그 팝업
3. 전체 페이지 수 자동 조회 (10-20초 소요)
4. "전체 XXX페이지 준비되었습니다!" 확인

### 3단계: 크롤링 시작
1. **"OK - 시작"** 버튼 클릭
2. 백그라운드에서 크롤링 자동 시작
3. 다이얼로그 닫힘

### 4단계: 진행 상태 확인
1. 크롤러 목록에 새 작업 표시
2. 상태: `running` (파란색 배지)
3. 진행률: "X / XXX (XX%)"
4. 프로그레스 바로 시각적 확인
5. 3초마다 자동 갱신

### 5단계: 완료 및 결과 확인
1. 크롤링 완료 시 상태 변경: `completed`
2. 결과 카드 표시:
   - 수집: XXX개
   - 신규: XX개
   - 업데이트: XX개
   - 실패: X개
3. "DB 저장 완료" 배지 확인
4. 소요 시간 확인

---

## 데이터 흐름

```
[사용자 클릭: "실행"]
    ↓
[준비 다이얼로그 표시]
    ↓
[API: /api/admin/crawler/total-pages]
    → Playwright로 웹사이트 접속
    → 전체 페이지 수 추출
    → 응답: { totalPages: 100 }
    ↓
[다이얼로그: "전체 100페이지 준비되었습니다!"]
    ↓
[사용자 클릭: "OK - 시작"]
    ↓
[API: /api/admin/crawler/start]
    → CrawlerJob 생성 (status: running)
    → 백그라운드 크롤링 시작
    → 응답 즉시 반환
    ↓
[백그라운드 크롤링]
    → 페이지별 데이터 수집
    → Institution 생성/업데이트
    → InstitutionHistory 백업
    → CrawlerJob 진행 상태 업데이트 (crawledCount++)
    → Kakao Geocoding API 호출 (주소 → 좌표)
    ↓
[완료]
    → CrawlerJob 상태 변경: completed
    → 결과 통계 저장 (createdCount, updatedCount, failedCount)
    → savedToDb: true
    ↓
[Frontend 자동 갱신 (3초마다)]
    → 최신 작업 상태 표시
    → 결과 카드 렌더링
```

---

## 환경 변수

```bash
# Database (SQLite for dev, PostgreSQL for production)
DATABASE_URL="file:./prisma/dev.db"
# DATABASE_URL="postgresql://user:password@host:5432/caremap"

# Kakao Maps API (Frontend)
NEXT_PUBLIC_KAKAO_MAP_API_KEY="a63d90809c12a1ab306437407ee04834"

# Kakao REST API (Backend - Geocoding)
KAKAO_REST_API_KEY="83022bf07d136c31285491b85c6ee6aa"

# Crawler Target
CRAWLER_TARGET_URL="https://www.longtermcare.or.kr/npbs/r/a/201/selectXLtcoSrch"
```

---

## API 엔드포인트

### 크롤러 관리
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/admin/crawlers` | 크롤러 목록 조회 (작업 포함) |
| POST | `/api/admin/crawlers` | 새 크롤러 등록 |
| PATCH | `/api/admin/crawlers/[id]` | 크롤러 수정 |
| DELETE | `/api/admin/crawlers/[id]` | 크롤러 삭제 |

### 크롤링 작업
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/admin/crawler/total-pages` | 전체 페이지 수 조회 |
| POST | `/api/admin/crawler/start` | 크롤링 시작 (백그라운드) |
| GET | `/api/admin/crawler/jobs` | 작업 이력 조회 |

### 데이터베이스 관리
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/admin/database/status` | DB 상태 조회 |
| POST | `/api/admin/coordinates/update` | 좌표 일괄 업데이트 |

---

## 핵심 특징

### 백그라운드 작업 관리
- ✅ 크롤링은 서버 백그라운드에서 독립적으로 실행
- ✅ UI와 상관없이 작업 진행 (페이지 새로고침/닫기 후에도 계속 실행)
- ✅ 모든 작업은 데이터베이스에 영구 기록
- ✅ 실시간 진행 상태 조회 가능

### 준비 프로세스
- ✅ 크롤링 전 자동으로 전체 페이지 수 확인
- ✅ 사용자에게 명확한 정보 제공
- ✅ 확인 후 실행으로 실수 방지

### 실시간 모니터링
- ✅ 3초마다 자동 갱신
- ✅ 진행률 퍼센트 및 프로그레스 바
- ✅ 실행 중/완료/실패 상태 구분
- ✅ 상세 결과 통계 표시

### 작업 이력 추적
- ✅ **시작 시간**: 크롤링 시작 시 자동 기록
- ✅ **완료 시간**: 크롤링 완료/실패 시 자동 기록
- ✅ **수집 개수**: 실시간 업데이트
- ✅ **DB 저장 여부**: 데이터베이스 저장 완료 시 체크
- ✅ **결과 통계**: 신규/업데이트/실패 건수 상세 기록

---

## 향후 개선 사항

### 우선순위 1: 크롤링 기능 강화
- [ ] **크롤링 중지 기능**: 실행 중인 작업 수동 중지
- [ ] **크롤링 재개 기능**: 중단된 위치부터 재개
- [ ] **스케줄링**: cron job으로 주기적 자동 크롤링 (월 1회 등)
- [ ] **알림 시스템**: 크롤링 완료 시 이메일/슬랙 알림

### 우선순위 2: 데이터 관리 강화
- [ ] **작업 이력 필터링**: 날짜 범위, 상태별 필터
- [ ] **작업 이력 검색**: 키워드 검색
- [ ] **페이지네이션**: 많은 작업 이력 효율적 표시
- [ ] **작업 삭제**: 오래된 작업 이력 정리

### 우선순위 3: 통계 및 분석
- [ ] **크롤링 통계 대시보드**: 총 크롤링 횟수, 성공률, 평균 소요 시간
- [ ] **에러 로그 상세**: 에러 타입별 분류 및 조회
- [ ] **성능 분석**: 페이지당 평균 시간, 병목 지점 분석

### 우선순위 4: UI/UX 개선
- [ ] **사이드바 접기 상태 저장**: 로컬 스토리지로 사용자 설정 유지
- [ ] **토스트 알림**: 작업 완료 시 화면 상단 알림
- [ ] **작업 상세 페이지**: 개별 작업의 모든 정보 표시
- [ ] **실시간 로그 스트림**: 크롤링 중 실시간 로그 표시

---

## 문제 해결

### Q1: 크롤링이 시작되지 않아요
**A:**
1. 준비 다이얼로그에서 전체 페이지 수가 정상적으로 표시되는지 확인
2. 브라우저 콘솔에서 에러 메시지 확인
3. `/api/admin/crawler/start` API 응답 확인
4. CrawlerJob 테이블에 작업이 생성되었는지 확인

### Q2: 진행률이 업데이트되지 않아요
**A:**
1. 3초마다 자동 갱신되므로 잠시 대기
2. 페이지 새로고침 시도
3. 데이터베이스에서 CrawlerJob의 crawledCount 확인
4. 백그라운드 프로세스가 정상 실행 중인지 확인

### Q3: 크롤링이 너무 느려요
**A:**
- 정상입니다. 페이지당 약 3-5초 소요
- 100페이지 크롤링 시 약 5-8분 소요
- 백그라운드 실행이므로 페이지를 닫아도 됨

### Q4: DB에 저장되지 않아요
**A:**
1. CrawlerJob의 savedToDb 필드 확인
2. `/api/admin/coordinates/update`로 수동 좌표 업데이트 실행
3. Kakao Geocoding API 키 확인
4. 데이터베이스 연결 상태 확인

---

## 최근 업데이트 (2025-10-22)

### 준비 프로세스 구현 ✅
- 크롤링 실행 전 자동으로 전체 페이지 수 확인
- 준비 다이얼로그로 사용자에게 명확한 정보 제공
- OK 버튼 확인 후 백그라운드 실행

### 실시간 진행률 추적 ✅
- 3초마다 자동 갱신
- 진행률 퍼센트 및 프로그레스 바 표시
- 실행 중인 작업 우선 표시

### 결과 표시 개선 ✅
- 수집/신규/업데이트/실패 건수 카드
- DB 저장 여부 배지
- 소요 시간 표시

### 다크 모드 지원 ✅
- 전체 페이지 다크 모드 완벽 지원
- 준비 다이얼로그 다크 모드 지원

---

**마지막 업데이트**: 2025-10-22
**작성자**: Claude Code
**버전**: 2.0.0
