# Map View - 지도 뷰 페이지

상위 디렉토리 조건을 승계한다.

## 개요

지도 뷰는 Kakao Maps API를 사용하여 전국 장기요양기관의 위치와 정보를 시각적으로 표현하는 페이지입니다. 줌 레벨에 따라 자동으로 클러스터링되며, 상세 뷰에서는 파이차트 마커로 각 기관의 정원/현원 비율을 직관적으로 표시합니다.

---

## 주요 기능 (완성)

### 1. Kakao Maps 통합
- ✅ **react-kakao-maps-sdk**: Kakao Maps를 React 컴포넌트로 사용
- ✅ **지도 초기화**: 한국 중심 좌표 (36.5, 127.5) 기준
- ✅ **실시간 좌표 데이터**: DB에서 좌표가 있는 기관만 조회
- ✅ **지도 컨트롤**: 줌인/줌아웃, 드래그 이동

### 2. 스마트 클러스터링
- ✅ **줌 레벨 기반 자동 클러스터링**:
  - **Level 13-11**: 광역시/도 단위 클러스터
    - 예: "서울특별시", "경기도", "부산광역시"
  - **Level 10-8**: 시/군/구 단위 클러스터
    - 예: "서울특별시 강남구", "경기도 성남시"
  - **Level 7 이하**: 개별 파이차트 마커 표시
- ✅ **클러스터 마커**: 해당 지역 기관 개수 표시
- ✅ **클러스터 클릭**: 클릭 시 자동 줌인 (3 레벨)

### 3. 파이차트 마커
- ✅ **시각적 표현**: SVG 기반 파이차트
- ✅ **정원/현원 비율**: 차트로 직관적 표시
- ✅ **색상 구분**:
  - 파란색: 정상 입소율 (현원 ≤ 정원)
  - 빨간색: 정원 초과 (현원 > 정원)
- ✅ **숫자 표시**: 마커 내부에 "현원/정원" 표시

### 4. 기관 정보 팝업
- ✅ **호버 팝업**: 마커에 마우스 오버 시 정보 표시
- ✅ **표시 정보**:
  - 기관명
  - 주소
  - 서비스 유형
  - 정원/현원
- ✅ **이력 보기 버튼**: 클릭 시 HistoryDialog 표시

### 5. 이력 다이얼로그
- ✅ **월별 변경 추이**: Recharts로 시각화
- ✅ **차트 유형**: 라인 차트 (정원, 현원)
- ✅ **데이터 테이블**: 상세 이력 목록
- ✅ **다크 모드 지원**: 전체 다이얼로그 다크 테마

### 6. 지역 선택 패널
- ✅ **우측 사이드 패널**: 시/도 및 시/군/구 선택
- ✅ **계층적 구조**: 시/도 선택 → 하위 시/군/구 표시
- ✅ **자동 이동**: 선택한 지역으로 지도 중심 이동
- ✅ **줌 레벨 자동 조정**: 지역 크기에 맞게 줌 조정
- ✅ **기관 개수 표시**: 각 지역의 기관 수 표시

### 7. 상단 헤더 오버레이
- ✅ **반투명 배경**: 지도 위 헤더 오버레이
- ✅ **정보 표시**:
  - 총 기관 수
  - 현재 줌 레벨
  - 현재 모드 (광역시/도, 시/군/구, 개별 마커)
- ✅ **다크 모드**: 배경 및 텍스트 다크 테마

### 8. UI/UX 기능
- ✅ **로딩 상태**: 스켈레톤 UI 및 스피너
- ✅ **에러 처리**: 데이터 로드 실패 시 친절한 에러 메시지
- ✅ **다크 모드**: 전체 페이지 다크 모드 지원
- ✅ **반응형 디자인**: 모바일/태블릿/데스크톱 최적화

---

## 파일 구조

### Frontend
```
src/app/dashboard/map-view/
├── page.tsx                    # 지도 뷰 메인 페이지
└── CLAUDE.md                   # 현재 문서
```

### Components
```
src/components/map/
├── CustomPieMarker.tsx         # 파이차트 마커 컴포넌트
├── InstitutionPopover.tsx      # 기관 정보 팝업
├── HistoryDialog.tsx           # 이력 다이얼로그
├── ClusterMarker.tsx           # 클러스터 마커
└── RegionSelector.tsx          # 지역 선택 패널
```

### Backend API
```
src/app/api/
├── institutions/
│   ├── route.ts                # 기관 목록 조회 (좌표 있는 것만)
│   └── [id]/
│       └── history/
│           └── route.ts        # 기관 이력 조회
```

---

## 데이터 모델

### Institution (기관 정보)
```typescript
interface Institution {
  id: string;                   // 기관 ID
  institutionCode: string;      // 기관 코드
  name: string;                 // 기관명
  serviceType: string;          // 서비스 유형
  capacity: number;             // 정원
  currentHeadcount: number;     // 현원
  address: string;              // 주소
  latitude: number;             // 위도
  longitude: number;            // 경도
}
```

### Cluster (클러스터 정보)
```typescript
interface Cluster {
  id: string;                   // 클러스터 ID (지역명)
  regionName: string;           // 지역명
  latitude: number;             // 중심 위도 (평균)
  longitude: number;            // 중심 경도 (평균)
  count: number;                // 기관 개수
  institutions: Institution[];  // 해당 지역 기관 목록
}
```

---

## 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript
- **Maps**: react-kakao-maps-sdk, Kakao Maps API
- **UI**: Tailwind CSS, shadcn/ui, Lucide Icons
- **Charts**: Recharts (이력 다이얼로그)
- **State Management**: React useState, useEffect, useMemo
- **Database**: Prisma ORM, SQLite (dev) / Neon.tech (production)

---

## 사용 흐름

### 1단계: 페이지 로드
1. `/dashboard/map-view` 접속
2. 로딩 스켈레톤 UI 표시
3. Kakao Maps SDK 로드
4. `/api/institutions` API 호출 (좌표 있는 기관만)

### 2단계: 지도 렌더링
1. 한국 중심 좌표로 지도 초기화
2. 줌 레벨 13으로 시작
3. 데이터 수신 후 클러스터 생성
4. 광역시/도 단위 클러스터 마커 표시

### 3단계: 상호작용
**클러스터 뷰 (줌 레벨 11-13)**:
1. 클러스터 마커 클릭 → 자동 줌인
2. 지역 선택 패널에서 시/도 선택 → 해당 지역으로 이동

**시/군/구 뷰 (줌 레벨 8-10)**:
1. 시/군/구 단위 클러스터 표시
2. 클러스터 클릭 → 추가 줌인

**상세 뷰 (줌 레벨 7 이하)**:
1. 개별 파이차트 마커 표시
2. 마커 호버 → 기관 정보 팝업
3. "이력 보기" 클릭 → HistoryDialog 표시
4. 차트 및 테이블에서 월별 변경 이력 확인

---

## 데이터 흐름

```
[페이지 로드]
    ↓
[Kakao Maps SDK 로드]
    ↓
[API 호출: GET /api/institutions]
    → Prisma: Institution.findMany({
        where: {
          AND: [
            { latitude: { not: 0 } },
            { longitude: { not: 0 } }
          ]
        }
      })
    ↓
[데이터 수신: Institution[]]
    ↓
[줌 레벨 확인: zoomLevel]
    ↓
[클러스터링 로직 (useMemo)]
    → Level 11-13: 광역시/도 단위 그룹화
    → Level 8-10: 시/군/구 단위 그룹화
    → Level ≤ 7: 클러스터링 없음
    ↓
[지도 렌더링]
    → Level 11-13: ClusterMarker 표시
    → Level 8-10: ClusterMarker 표시
    → Level ≤ 7: CustomPieMarker 표시
    ↓
[사용자 상호작용]
    → 클러스터 클릭: 줌인 + 중심 이동
    → 마커 호버: InstitutionPopover 표시
    → "이력 보기" 클릭: HistoryDialog 표시
```

---

## API 엔드포인트

### 1. 기관 목록 조회
```
GET /api/institutions
```

**쿼리 조건**:
- `latitude != 0 AND longitude != 0` (좌표가 있는 기관만)

**응답 예시**:
```json
[
  {
    "id": "cm3xyz...",
    "institutionCode": "INST001",
    "name": "서울요양원",
    "serviceType": "노인요양시설",
    "capacity": 100,
    "currentHeadcount": 85,
    "address": "서울특별시 강남구 테헤란로 123",
    "latitude": 37.5012,
    "longitude": 127.0396,
    "createdAt": "2025-10-22T00:00:00.000Z",
    "updatedAt": "2025-10-22T00:00:00.000Z"
  }
]
```

### 2. 기관 이력 조회
```
GET /api/institutions/[id]/history
```

**응답 예시**:
```json
[
  {
    "id": "hist123",
    "recordedDate": "2025-09-01T00:00:00.000Z",
    "capacity": 100,
    "currentHeadcount": 82
  },
  {
    "id": "hist124",
    "recordedDate": "2025-10-01T00:00:00.000Z",
    "capacity": 100,
    "currentHeadcount": 85
  }
]
```

---

## 환경 변수

```bash
# Kakao Maps API Key (Frontend)
NEXT_PUBLIC_KAKAO_MAP_API_KEY="a63d90809c12a1ab306437407ee04834"
```

---

## 클러스터링 알고리즘

### 광역시/도 단위 (Level 11-13)
```typescript
groupBy = (address: string) => {
  const match = address.match(/^([가-힣]+(?:특별시|광역시|특별자치시|도|특별자치도))/);
  return match ? match[1] : address.substring(0, 3);
};
```

**예시**:
- "서울특별시 강남구..." → "서울특별시"
- "경기도 성남시..." → "경기도"
- "부산광역시 해운대구..." → "부산광역시"

### 시/군/구 단위 (Level 8-10)
```typescript
groupBy = (address: string) => {
  const match = address.match(/^([가-힣]+(?:특별시|광역시|특별자치시|도|특별자치도))\s+([가-힣]+(?:시|군|구))/);
  if (match) return `${match[1]} ${match[2]}`;
  return address.substring(0, 6);
};
```

**예시**:
- "서울특별시 강남구..." → "서울특별시 강남구"
- "경기도 성남시..." → "경기도 성남시"
- "부산광역시 해운대구..." → "부산광역시 해운대구"

### 중심 좌표 계산
```typescript
const avgLat = institutions.reduce((sum, i) => sum + i.latitude, 0) / institutions.length;
const avgLng = institutions.reduce((sum, i) => sum + i.longitude, 0) / institutions.length;
```

---

## 컴포넌트 상세

### 1. CustomPieMarker
**위치**: `src/components/map/CustomPieMarker.tsx`

**Props**:
```typescript
{
  capacity: number;           // 정원
  currentHeadcount: number;   // 현원
}
```

**기능**:
- SVG 파이차트 렌더링
- 정원 초과 시 빨간색, 정상 시 파란색
- 중앙에 "현원/정원" 텍스트 표시

### 2. InstitutionPopover
**위치**: `src/components/map/InstitutionPopover.tsx`

**Props**:
```typescript
{
  institution: Institution;
  onViewHistory: () => void;
  children: React.ReactNode;
}
```

**기능**:
- 마커 호버 시 기관 정보 팝업
- "이력 보기" 버튼 제공

### 3. HistoryDialog
**위치**: `src/components/map/HistoryDialog.tsx`

**Props**:
```typescript
{
  institutionId: string;
  institutionName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
```

**기능**:
- Recharts 라인 차트로 월별 추이 표시
- 테이블로 상세 이력 표시
- 다크 모드 지원

### 4. ClusterMarker
**위치**: `src/components/map/ClusterMarker.tsx`

**Props**:
```typescript
{
  count: number;              // 기관 개수
}
```

**기능**:
- 원형 마커에 개수 표시
- 클릭 가능 스타일

### 5. RegionSelector
**위치**: `src/components/map/RegionSelector.tsx`

**Props**:
```typescript
{
  institutions: Institution[];
  onRegionSelect: (center: {lat, lng}, level: number) => void;
  selectedRegion: string | null;
}
```

**기능**:
- 시/도 목록 표시
- 시/도 선택 → 시/군/구 목록 표시
- 각 지역의 기관 개수 표시
- 선택 시 지도 중심 이동 및 줌 조정

---

## 성능 최적화

### 1. useMemo로 클러스터 계산 최적화
```typescript
const clusters = useMemo(() => {
  // 클러스터링 로직
}, [institutions, zoomLevel]);
```
- `institutions` 또는 `zoomLevel` 변경 시에만 재계산
- 불필요한 렌더링 방지

### 2. 조건부 렌더링
```typescript
{zoomLevel <= 7 ? (
  // 개별 마커 렌더링
) : (
  // 클러스터 마커 렌더링
)}
```
- 줌 레벨에 따라 필요한 마커만 렌더링

### 3. API 호출 최적화
- 페이지 로드 시 한 번만 기관 목록 조회
- 좌표가 있는 기관만 필터링하여 데이터 크기 감소

---

## 향후 개선 사항

### 우선순위 1: 필터링 기능
- [ ] **서비스 유형 필터**: 특정 서비스 유형만 표시
- [ ] **입소율 필터**: 특정 입소율 범위만 표시
- [ ] **정원 초과 필터**: 정원 초과 기관만 표시

### 우선순위 2: 검색 기능
- [ ] **기관명 검색**: 기관명으로 검색 및 자동 이동
- [ ] **주소 검색**: 주소로 검색
- [ ] **자동완성**: 검색어 입력 시 자동완성

### 우선순위 3: 즐겨찾기
- [ ] **즐겨찾기 추가/제거**: 기관을 즐겨찾기에 추가
- [ ] **즐겨찾기 목록**: 즐겨찾기한 기관 목록 표시
- [ ] **로컬 스토리지**: 즐겨찾기 로컬 저장

### 우선순위 4: 지도 스타일
- [ ] **다크 모드 지도**: 지도 자체를 다크 테마로 변경
- [ ] **위성 뷰**: 위성 사진 모드
- [ ] **커스텀 스타일**: 사용자 정의 색상 테마

### 우선순위 5: 고급 기능
- [ ] **경로 찾기**: 선택한 기관까지 경로 표시
- [ ] **내 위치**: 현재 위치 표시 및 주변 기관 검색
- [ ] **거리 측정**: 두 지점 간 거리 측정
- [ ] **인쇄/저장**: 현재 지도 이미지로 저장

---

## 문제 해결

### Q1: 지도에 마커가 표시되지 않아요
**A:**
1. 데이터베이스에 좌표가 있는 기관이 있는지 확인
2. `/admin/database`에서 좌표 업데이트 실행
3. `/api/institutions` API 응답 확인
4. 브라우저 콘솔에서 에러 확인

### Q2: 클러스터가 너무 많이 표시되어요
**A:**
- 줌 아웃하면 더 큰 단위로 클러스터링됩니다
- 또는 줌 인하여 개별 마커를 확인하세요

### Q3: 지도가 로드되지 않아요
**A:**
1. Kakao Maps API 키 확인 (.env 파일)
2. 인터넷 연결 확인
3. 브라우저 콘솔에서 스크립트 로드 에러 확인

### Q4: 특정 기관을 찾을 수 없어요
**A:**
1. 지역 선택 패널 사용
2. 검색 기능 (향후 구현 예정)
3. 대시보드에서 총 기관 수 확인

---

## 최근 업데이트 (2025-10-22)

### 지도 뷰 데이터 연동 ✅
- Mock 데이터 제거
- 실제 데이터베이스 연동
- 좌표 있는 기관만 필터링

### 다크 모드 지원 ✅
- 로딩 상태 다크 모드
- 에러 상태 다크 모드
- 헤더 오버레이 다크 모드

### 클러스터링 구현 ✅
- 줌 레벨별 자동 클러스터링
- 광역시/도, 시/군/구 단위 그룹화
- 클러스터 클릭 시 자동 줌인

### 지역 선택 패널 ✅
- 우측 사이드 패널
- 계층적 지역 선택
- 기관 개수 표시
- 자동 지도 이동

---

## 연관 페이지

- **대시보드** (`/dashboard`): 전체 통계 확인
- **이력 분석** (`/dashboard/analytics`): 월별 추이 분석 (미구현)
- **크롤러 관리** (`/admin`): 데이터 수집
- **DB 관리** (`/admin/database`): 좌표 업데이트

---

## 참고 문서

- [Kakao Maps Web API](https://apis.map.kakao.com/web/)
- [react-kakao-maps-sdk](https://github.com/JaeSeoKim/react-kakao-maps-sdk)
- [Recharts](https://recharts.org/)
- [프로젝트 PRD](../../../prd.md)
- [프로젝트 CLAUDE.md](../../../CLAUDE.md)

---

**마지막 업데이트**: 2025-10-22
**작성자**: Claude Code
**버전**: 2.0.0
