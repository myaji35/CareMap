# CareMap 메뉴 트리 구조

## 📱 전체 메뉴 구조

```
CareMap
├── 🏠 메인 페이지 (/)
│   └── 랜딩 페이지
│
├── 📊 메인 메뉴
│   ├── 대시보드 (/dashboard)
│   │   └── 📈 전체 통계 및 현황
│   │
│   ├── 지도 뷰 (/dashboard/map-view)
│   │   ├── 🗺️ Kakao Maps 지도
│   │   ├── 📍 기관 마커 (파이차트)
│   │   ├── 🔍 클러스터링 (줌 레벨별)
│   │   ├── 📋 기관 상세 정보 팝업
│   │   ├── 📊 이력 다이얼로그
│   │   └── 🌏 지역 선택 패널
│   │
│   └── 이력 분석 (/dashboard/analytics) ⚠️ 미구현
│       └── 월별 변경 이력 분석
│
├── ⚙️ 관리 메뉴
│   ├── 크롤러 관리 (/admin)
│   │   ├── 📦 크롤러 목록
│   │   ├── ▶️ 크롤링 실행
│   │   ├── 📊 실시간 진행률
│   │   ├── 📝 작업 이력
│   │   └── 💾 DB 저장
│   │
│   ├── DB 관리 (/admin/database)
│   │   ├── 📊 데이터베이스 상태
│   │   ├── 🌍 좌표 일괄 업데이트
│   │   ├── 📋 좌표 미설정 기관 목록
│   │   └── 📅 최근 추가된 기관
│   │
│   └── 크롤러 상세 (동적 라우트) ⚠️ 사용 안 함
│       ├── /admin/crawlers/[id]/run
│       └── /admin/crawlers/[id]/history
│
└── 👤 사용자 메뉴 (드롭다운)
    ├── 설정 (/dashboard/settings) ⚠️ 미구현
    └── 테마 (라이트/다크 토글)
```

---

## 📋 상세 메뉴 정보

### 1. 메인 메뉴 (navigation)

| 메뉴명 | 경로 | 아이콘 | 상태 | 설명 |
|--------|------|--------|------|------|
| 대시보드 | `/dashboard` | LayoutDashboard | ✅ 구현 | 전체 통계 및 현황 대시보드 |
| 지도 뷰 | `/dashboard/map-view` | Map | ✅ 구현 | Kakao Maps 기반 지도 시각화 |
| 이력 분석 | `/dashboard/analytics` | TrendingUp | ⚠️ 미구현 | 월별 변경 이력 분석 |

**소스 위치**: `src/components/layout/Sidebar.tsx:22-26`

```typescript
const navigation = [
  { name: '대시보드', href: '/dashboard', icon: LayoutDashboard },
  { name: '지도 뷰', href: '/dashboard/map-view', icon: Map },
  { name: '이력 분석', href: '/dashboard/analytics', icon: TrendingUp },
];
```

---

### 2. 관리 메뉴 (adminNavigation)

| 메뉴명 | 경로 | 아이콘 | 상태 | 설명 |
|--------|------|--------|------|------|
| 크롤러 관리 | `/admin` | Database | ✅ 구현 | 데이터 크롤링 및 작업 관리 |
| DB 관리 | `/admin/database` | Settings | ✅ 구현 | 좌표 업데이트 및 DB 상태 관리 |

**소스 위치**: `src/components/layout/Sidebar.tsx:28-31`

```typescript
const adminNavigation = [
  { name: '크롤러 관리', href: '/admin', icon: Database },
  { name: 'DB 관리', href: '/admin/database', icon: Settings },
];
```

---

### 3. 사용자 메뉴 (드롭다운)

| 메뉴명 | 경로 | 아이콘 | 상태 | 설명 |
|--------|------|--------|------|------|
| 설정 | `/dashboard/settings` | Settings | ⚠️ 미구현 | 사용자 설정 |
| 테마 | - | Sun/Moon | ✅ 구현 | 라이트/다크 모드 토글 |

**소스 위치**: `src/components/layout/Sidebar.tsx:215-234`

---

## 📁 페이지 파일 구조

```
src/app/
├── page.tsx                                    # / (메인 랜딩)
│
├── dashboard/
│   ├── page.tsx                                # /dashboard (대시보드)
│   ├── map-view/
│   │   └── page.tsx                            # /dashboard/map-view (지도 뷰)
│   └── settings/                               ⚠️ 미구현
│       └── page.tsx
│
└── admin/
    ├── page.tsx                                # /admin (크롤러 관리)
    ├── database/
    │   └── page.tsx                            # /admin/database (DB 관리)
    └── crawlers/                               ⚠️ 사용 안 함
        └── [id]/
            ├── run/
            │   └── page.tsx
            └── history/
                └── page.tsx
```

---

## 🎨 UI 특징

### 사이드바 기능
- ✅ **접기/펼치기**: 256px ↔ 64px
- ✅ **모바일 반응형**: 햄버거 메뉴
- ✅ **다크 모드**: 전체 지원
- ✅ **활성 상태**: 현재 페이지 하이라이트
- ✅ **툴팁**: 접힌 상태에서 메뉴명 표시

### 메뉴 섹션
1. **메인 메뉴**: 사용자 대시보드 및 분석
2. **관리**: 관리자 전용 기능
3. **사용자**: 설정 및 테마

---

## 🔗 주요 URL 매핑

| URL | 페이지 | 파일 경로 |
|-----|--------|-----------|
| `/` | 메인 랜딩 | `src/app/page.tsx` |
| `/dashboard` | 대시보드 | `src/app/dashboard/page.tsx` |
| `/dashboard/map-view` | 지도 뷰 | `src/app/dashboard/map-view/page.tsx` |
| `/dashboard/analytics` | 이력 분석 | ⚠️ 미구현 |
| `/dashboard/settings` | 설정 | ⚠️ 미구현 |
| `/admin` | 크롤러 관리 | `src/app/admin/page.tsx` |
| `/admin/database` | DB 관리 | `src/app/admin/database/page.tsx` |

---

## 🎯 각 페이지 주요 기능

### 📊 대시보드 (`/dashboard`)
```typescript
- 총 기관 수 통계
- 이력 레코드 수
- 최근 변경 사항
- 마지막 크롤러 작업 정보
- 서비스 유형별 통계
- 정원/현원 통계
```

### 🗺️ 지도 뷰 (`/dashboard/map-view`)
```typescript
- Kakao Maps API 연동
- 파이차트 마커 (정원/현원 비율)
- 줌 레벨별 클러스터링
  - Level 13-11: 광역시/도 단위
  - Level 10-8: 시/군/구 단위
  - Level 7 이하: 개별 마커
- 기관 정보 팝업 (호버)
- 이력 다이얼로그
- 지역 선택 패널
```

### ⚙️ 크롤러 관리 (`/admin`)
```typescript
- 크롤러 목록
- 준비 다이얼로그 (전체 페이지 수 확인)
- 실행 버튼 → 백그라운드 크롤링
- 실시간 진행률 (%) 및 프로그레스 바
- 작업 결과 (수집/신규/업데이트/실패)
- 작업 이력 테이블 (최근 10개)
- 자동 갱신 (3초마다)
```

### 🌍 DB 관리 (`/admin/database`)
```typescript
- 데이터베이스 상태 카드
  - 총 기관 수
  - 좌표 설정 완료 (%)
  - 좌표 미설정
- 좌표 일괄 업데이트
  - 50개 업데이트
  - 100개 업데이트
  - 전체 업데이트
- Kakao Geocoding API 연동
- 업데이트 결과 표시
- 좌표 미설정 기관 목록 (20개)
- 최근 추가된 기관
```

---

## 🚀 다음 구현 예정

### 우선순위 1: 이력 분석 페이지
```
/dashboard/analytics
- 월별 변경 추이 차트
- 기관별 이력 비교
- 통계 분석
```

### 우선순위 2: 설정 페이지
```
/dashboard/settings
- 사용자 프로필
- 알림 설정
- 표시 옵션
```

### 우선순위 3: 인증 시스템
```
- 로그인/회원가입
- 사용자 권한 관리
- 세션 관리
```

---

## 📝 메뉴 추가 방법

### 1. 메인 메뉴에 추가
`src/components/layout/Sidebar.tsx`의 `navigation` 배열에 추가:

```typescript
const navigation = [
  { name: '대시보드', href: '/dashboard', icon: LayoutDashboard },
  { name: '지도 뷰', href: '/dashboard/map-view', icon: Map },
  { name: '이력 분석', href: '/dashboard/analytics', icon: TrendingUp },
  { name: '새 메뉴', href: '/dashboard/new-menu', icon: NewIcon }, // 추가
];
```

### 2. 관리 메뉴에 추가
`adminNavigation` 배열에 추가:

```typescript
const adminNavigation = [
  { name: '크롤러 관리', href: '/admin', icon: Database },
  { name: 'DB 관리', href: '/admin/database', icon: Settings },
  { name: '새 관리 메뉴', href: '/admin/new-menu', icon: NewIcon }, // 추가
];
```

### 3. 페이지 파일 생성
```bash
# 메인 메뉴용
src/app/dashboard/new-menu/page.tsx

# 관리 메뉴용
src/app/admin/new-menu/page.tsx
```

---

**마지막 업데이트**: 2025-10-22
