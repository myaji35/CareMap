# Dashboard 페이지

상위 디렉토리 조건을 승계한다.

## 개요

대시보드는 CareMap의 메인 페이지로, 전국 장기요양기관의 전체 통계와 현황을 한눈에 확인할 수 있는 종합 현황판입니다.

---

## 주요 기능 (완성)

### 1. 실시간 통계 카드
- ✅ **총 기관 수**: 데이터베이스에 등록된 전체 기관 수
- ✅ **총 이력 기록**: InstitutionHistory 테이블의 전체 레코드 수
- ✅ **최근 30일 변경**: 최근 한 달간 변경된 기관 수
- ✅ **전체 입소율**: 총 현원 / 총 정원 × 100 (퍼센트)

### 2. 정원 현황 상세
- ✅ **총 정원**: 전체 기관의 정원 합계
- ✅ **총 현원**: 전체 기관의 현원 합계
- ✅ **정원 초과 기관**: 현원 > 정원인 기관 수 (경고 표시)

### 3. 마지막 크롤링 정보
- ✅ **완료 시간**: 가장 최근 크롤링 작업의 완료 시각
- ✅ **수집 개수**: 크롤링된 총 기관 수
- ✅ **신규 생성**: 새로 추가된 기관 수
- ✅ **업데이트**: 기존 기관 업데이트 수

### 4. 서비스 유형별 현황
- ✅ **유형별 분류**: 노인요양시설, 주야간보호시설 등
- ✅ **개수 표시**: 각 서비스 유형별 기관 수
- ✅ **반응형 그리드**: 화면 크기에 따라 2~5열 자동 조정

### 5. UI/UX 기능
- ✅ **다크 모드**: 전체 페이지 다크 모드 지원
- ✅ **로딩 상태**: 스켈레톤 UI로 로딩 상태 표시
- ✅ **에러 처리**: 데이터 로드 실패 시 에러 메시지
- ✅ **반응형 디자인**: 모바일/태블릿/데스크톱 최적화
- ✅ **클릭 가능 카드**: 총 기관 수 카드 클릭 시 지도 뷰로 이동
- ✅ **아이콘**: Lucide Icons로 시각적 가독성 향상

---

## 파일 구조

### Frontend
```
src/app/dashboard/
├── page.tsx                    # 대시보드 메인 페이지
├── layout.tsx                  # Dashboard 레이아웃
├── map-view/
│   ├── page.tsx                # 지도 뷰 페이지
│   └── claude.md               # 지도 뷰 문서
├── analytics/                  ⚠️ 미구현
│   └── page.tsx                # 이력 분석 페이지
└── CLAUDE.md                   # 현재 문서
```

### Backend API
```
src/app/api/dashboard/
└── stats/
    └── route.ts                # 대시보드 통계 API
```

---

## 데이터 모델

### DashboardStats (통계 데이터)
```typescript
interface DashboardStats {
  // 기본 통계
  totalInstitutions: number;        // 총 기관 수
  totalHistoryRecords: number;      // 총 이력 기록 수
  recentChanges: number;            // 최근 30일 변경 건수

  // 마지막 크롤링 정보
  lastCrawlerJob: {
    completedAt: string;            // 완료 시간 (ISO 8601)
    crawledCount: number;           // 수집 개수
    createdCount: number;           // 신규 생성 개수
    updatedCount: number;           // 업데이트 개수
  } | null;

  // 서비스 유형별 통계
  serviceTypeStats: Array<{
    serviceType: string;            // 서비스 유형 (예: "노인요양시설")
    count: number;                  // 해당 유형 기관 수
  }>;

  // 정원/현원 통계
  capacityStats: {
    totalCapacity: number;          // 총 정원
    totalCurrentHeadcount: number;  // 총 현원
    occupancyRate: number;          // 입소율 (%)
    overCapacityCount: number;      // 정원 초과 기관 수
  };
}
```

---

## 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI**: Tailwind CSS, shadcn/ui, Lucide Icons
- **Data Fetching**: Fetch API, useEffect
- **Database**: Prisma ORM, SQLite (dev) / Neon.tech (production)
- **State Management**: React useState

---

## 사용 흐름

### 1단계: 페이지 로드
1. `/dashboard` 페이지 접속
2. 스켈레톤 UI 표시 (로딩 중)
3. `/api/dashboard/stats` API 호출
4. 데이터 수신 및 렌더링

### 2단계: 통계 확인
1. **통계 카드**: 4개의 주요 지표 확인
2. **정원 현황**: 상세 정원/현원 정보 확인
3. **크롤링 정보**: 최근 크롤링 결과 확인
4. **서비스 유형**: 유형별 분포 확인

### 3단계: 네비게이션
1. **총 기관 수 카드 클릭** → 지도 뷰로 이동
2. **사이드바 메뉴** → 다른 페이지로 이동

---

## 데이터 흐름

```
[페이지 로드]
    ↓
[Loading State: true]
    → 스켈레톤 UI 표시
    ↓
[API 호출: GET /api/dashboard/stats]
    → Prisma로 데이터베이스 쿼리
    → Institution 테이블 집계
    → InstitutionHistory 테이블 집계
    → CrawlerJob 테이블 조회 (최근 완료 작업)
    ↓
[응답 수신]
    → DashboardStats 객체 반환
    ↓
[State 업데이트: stats, loading]
    → stats: 수신한 데이터
    → loading: false
    ↓
[UI 렌더링]
    → 통계 카드 표시
    → 정원 현황 표시
    → 크롤링 정보 표시
    → 서비스 유형 그리드 표시
```

---

## API 엔드포인트

### 대시보드 통계 조회
```
GET /api/dashboard/stats
```

**응답 예시**:
```json
{
  "totalInstitutions": 1250,
  "totalHistoryRecords": 3456,
  "recentChanges": 89,
  "lastCrawlerJob": {
    "completedAt": "2025-10-22T09:30:00.000Z",
    "crawledCount": 100,
    "createdCount": 5,
    "updatedCount": 15
  },
  "serviceTypeStats": [
    { "serviceType": "노인요양시설", "count": 450 },
    { "serviceType": "주야간보호시설", "count": 320 },
    { "serviceType": "방문요양", "count": 280 },
    { "serviceType": "방문목욕", "count": 150 },
    { "serviceType": "방문간호", "count": 50 }
  ],
  "capacityStats": {
    "totalCapacity": 5000,
    "totalCurrentHeadcount": 4200,
    "occupancyRate": 84.0,
    "overCapacityCount": 12
  }
}
```

---

## UI 컴포넌트 구조

### 1. 헤더
```tsx
<div>
  <h1>대시보드</h1>
  <p>전국 장기요양기관 현황을 한눈에 확인하세요</p>
</div>
```

### 2. 통계 카드 그리드 (4개)
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {/* 총 기관 수 (클릭 가능) */}
  <Link href="/dashboard/map-view">
    <StatCard icon={Building2} label="총 기관 수" value={stats.totalInstitutions} />
  </Link>

  {/* 총 이력 기록 */}
  <StatCard icon={History} label="총 이력 기록" value={stats.totalHistoryRecords} />

  {/* 최근 30일 변경 */}
  <StatCard icon={TrendingUp} label="최근 30일 변경" value={stats.recentChanges} />

  {/* 전체 입소율 */}
  <StatCard icon={Users} label="전체 입소율" value={stats.capacityStats.occupancyRate + "%"} />
</div>
```

### 3. 상세 통계 그리드 (2개)
```tsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  {/* 정원 현황 */}
  <DetailCard title="정원 현황">
    <StatRow label="총 정원" value={stats.capacityStats.totalCapacity + "명"} />
    <StatRow label="총 현원" value={stats.capacityStats.totalCurrentHeadcount + "명"} />
    <StatRow label="정원 초과 기관" value={stats.capacityStats.overCapacityCount + "개"} warning />
  </DetailCard>

  {/* 마지막 크롤링 */}
  <DetailCard title="마지막 크롤링">
    <StatRow label="완료 시간" value={formattedDate} icon={Calendar} />
    <StatRow label="수집 개수" value={stats.lastCrawlerJob.crawledCount + "개"} />
    <StatRow label="신규 생성" value={stats.lastCrawlerJob.createdCount + "개"} success />
    <StatRow label="업데이트" value={stats.lastCrawlerJob.updatedCount + "개"} info />
  </DetailCard>
</div>
```

### 4. 서비스 유형별 현황
```tsx
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
  {stats.serviceTypeStats.map((stat) => (
    <ServiceTypeCard
      key={stat.serviceType}
      serviceType={stat.serviceType}
      count={stat.count}
    />
  ))}
</div>
```

---

## 색상 테마

### 아이콘 및 배경색
- **총 기관 수**: 파란색 (blue-600 / blue-100)
- **총 이력 기록**: 보라색 (purple-600 / purple-100)
- **최근 30일 변경**: 초록색 (green-600 / green-100)
- **전체 입소율**: 호박색 (amber-600 / amber-100)

### 상태별 색상
- **일반**: slate-600 (다크: slate-400)
- **성공/신규**: green-600 (다크: green-400)
- **정보/업데이트**: blue-600 (다크: blue-400)
- **경고/초과**: red-600 (다크: red-400)

---

## 반응형 디자인

### 통계 카드 그리드
- **모바일 (< 768px)**: 1열 (grid-cols-1)
- **태블릿 (768px ~ 1024px)**: 2열 (md:grid-cols-2)
- **데스크톱 (≥ 1024px)**: 4열 (lg:grid-cols-4)

### 상세 통계 그리드
- **모바일/태블릿**: 1열 (grid-cols-1)
- **데스크톱**: 2열 (lg:grid-cols-2)

### 서비스 유형 그리드
- **모바일**: 2열 (grid-cols-2)
- **태블릿**: 3열 (md:grid-cols-3)
- **데스크톱**: 5열 (lg:grid-cols-5)

---

## 성능 최적화

### 1. 데이터 로딩
- ✅ **초기 로드 시 한 번만 API 호출**
- ✅ **스켈레톤 UI로 로딩 상태 표시**
- ✅ **에러 처리로 사용자 경험 개선**

### 2. 렌더링 최적화
- ✅ **조건부 렌더링**: stats가 null일 때 에러 메시지만 표시
- ✅ **숫자 포맷팅**: toLocaleString()으로 쉼표 표시
- ✅ **날짜 포맷팅**: toLocaleString('ko-KR')로 한국 시간 표시

### 3. UI 최적화
- ✅ **다크 모드 지원**: 모든 요소에 dark: 클래스 적용
- ✅ **호버 효과**: 클릭 가능한 카드에 hover:shadow-lg
- ✅ **트랜지션**: transition-shadow로 부드러운 애니메이션

---

## 향후 개선 사항

### 우선순위 1: 실시간 데이터 갱신
- [ ] **자동 갱신**: 30초마다 통계 데이터 자동 갱신
- [ ] **수동 갱신**: "새로고침" 버튼 추가
- [ ] **WebSocket**: 실시간 데이터 스트리밍

### 우선순위 2: 시각화 강화
- [ ] **차트 추가**: Recharts로 추세 그래프 표시
- [ ] **입소율 차트**: 월별 입소율 변화 추이
- [ ] **지역별 분포**: 지도 위에 히트맵 오버레이

### 우선순위 3: 필터링 및 검색
- [ ] **기간 선택**: 날짜 범위 선택으로 통계 필터링
- [ ] **서비스 유형 필터**: 특정 유형만 표시
- [ ] **지역 필터**: 시/도별 통계 조회

### 우선순위 4: 내보내기 기능
- [ ] **PDF 내보내기**: 현재 통계를 PDF로 저장
- [ ] **엑셀 내보내기**: 상세 데이터를 Excel로 다운로드
- [ ] **이미지 내보내기**: 대시보드 스크린샷 저장

---

## 문제 해결

### Q1: 통계가 표시되지 않아요
**A:**
1. 데이터베이스에 기관 데이터가 있는지 확인
2. `/api/dashboard/stats` API가 정상 응답하는지 확인
3. 브라우저 콘솔에서 에러 메시지 확인
4. 크롤링을 먼저 실행하여 데이터 수집

### Q2: "크롤링 기록이 없습니다" 메시지가 나와요
**A:**
- 아직 크롤링을 한 번도 실행하지 않았습니다
- `/admin` 페이지에서 크롤링 실행 필요

### Q3: 입소율이 100%를 초과해요
**A:**
- 정상입니다. 일부 기관이 정원을 초과한 경우
- "정원 초과 기관" 항목에서 개수 확인 가능

### Q4: 로딩이 너무 오래 걸려요
**A:**
1. 데이터베이스 연결 상태 확인
2. 데이터 양이 많은 경우 인덱스 추가 고려
3. API 응답 시간 확인 (개발자 도구 → Network 탭)

---

## 최근 업데이트 (2025-10-22)

### 대시보드 페이지 구현 ✅
- 4개 주요 통계 카드 (총 기관 수, 이력 기록, 최근 변경, 입소율)
- 정원 현황 상세 카드
- 마지막 크롤링 정보 카드
- 서비스 유형별 현황 그리드

### 다크 모드 지원 ✅
- 전체 페이지 다크 모드 완벽 지원
- 모든 카드 및 텍스트 다크 모드 스타일 적용

### 반응형 디자인 ✅
- 모바일/태블릿/데스크톱 최적화
- 적응형 그리드 레이아웃

### UX 개선 ✅
- 스켈레톤 UI 로딩 상태
- 에러 처리
- 클릭 가능한 카드 (지도 뷰 연결)
- 아이콘 및 색상 테마

---

## 연관 페이지

- **지도 뷰** (`/dashboard/map-view`): 기관 위치 시각화
- **이력 분석** (`/dashboard/analytics`): 월별 변경 추이 분석 (미구현)
- **크롤러 관리** (`/admin`): 데이터 수집
- **DB 관리** (`/admin/database`): 좌표 업데이트

---

**마지막 업데이트**: 2025-10-22
**작성자**: Claude Code
**버전**: 1.0.0
