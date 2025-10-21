# Epic 2: 지도 기반 시각화 (Map Visualization)

**Epic Owner**: Frontend Team
**Priority**: P0 (Critical)
**Estimated Duration**: 3 weeks
**Dependencies**: Epic 1 (데이터 수집), Backend API

---

## Epic Overview

Kakao Maps API를 활용하여 전국 장기요양기관의 위치를 지도에 표시하고, 정원/현원 비율을 파이차트 형태의 커스텀 마커로 시각화합니다. 사용자는 마커에 마우스를 올리거나 클릭하여 기관 정보를 확인할 수 있습니다.

---

## User Stories

### User Story 2.1: 전국 요양기관 지도 표시

**As a** 사용자
**I want to** 전국 장기요양기관의 위치를 지도 위에서 확인
**So that** 지역별 기관 분포를 한눈에 파악할 수 있다

**Priority**: P0
**Story Points**: 3
**Assigned to**: Frontend Dev

**Acceptance Criteria**:
- [ ] Kakao Maps API를 사용하여 지도 렌더링
- [ ] 각 기관 위치에 기본 마커 표시
- [ ] 지도 줌/팬 기능 지원
- [ ] 초기 로딩 시 전국 전체 뷰 제공 (중심: 대한민국 중앙, 줌 레벨: 7)
- [ ] 로딩 중 스피너 표시

**Technical Requirements**:
- react-kakao-maps-sdk 1.1.27
- Kakao JavaScript App Key
- TypeScript 타입 안전성

**Implementation Notes**:
```typescript
// components/KakaoMap.tsx
'use client';

import { Map, MapMarker } from 'react-kakao-maps-sdk';
import { useEffect, useState } from 'react';
import { Institution } from '@/types/institution';

interface KakaoMapProps {
  institutions: Institution[];
  onMarkerClick: (id: string) => void;
}

export function KakaoMap({ institutions, onMarkerClick }: KakaoMapProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Kakao Maps SDK 로드 확인
    if (window.kakao && window.kakao.maps) {
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
    </div>;
  }

  return (
    <Map
      center={{ lat: 36.5, lng: 127.5 }}  // 대한민국 중앙
      style={{ width: '100%', height: '100vh' }}
      level={7}
    >
      {institutions.map((institution) => (
        <MapMarker
          key={institution.id}
          position={{ lat: institution.latitude, lng: institution.longitude }}
          onClick={() => onMarkerClick(institution.id)}
        />
      ))}
    </Map>
  );
}
```

**Environment Setup**:
```typescript
// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <script
          type="text/javascript"
          src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_APP_KEY}&autoload=false`}
        ></script>
      </head>
      <body>{children}</body>
    </html>
  );
}
```

**Definition of Done**:
- [ ] KakaoMap 컴포넌트 구현 완료
- [ ] API에서 기관 데이터 fetch 성공
- [ ] 기본 마커 표시 확인
- [ ] 줌/팬 기능 테스트
- [ ] 모바일 반응형 확인
- [ ] Code review 완료

---

### User Story 2.2: 기관별 정원/현원 비율 파이차트 마커

**As a** 사용자
**I want to** 지도 마커가 정원/현원 비율을 시각적으로 표현
**So that** 클릭 없이도 기관의 여유 여부를 직관적으로 파악할 수 있다

**Priority**: P0
**Story Points**: 5
**Assigned to**: Frontend Dev

**Acceptance Criteria**:
- [ ] 마커를 파이차트 형태로 렌더링 (정원 대비 현원 비율)
- [ ] 색상 코드:
  - 여유 있음 (현원/정원 < 70%): 녹색 (#10B981)
  - 보통 (70% ~ 90%): 주황색 (#F59E0B)
  - 포화 (90% 이상): 빨간색 (#EF4444)
- [ ] 마커 크기: 고정 크기 (30x30px)
- [ ] Canvas를 사용한 동적 마커 생성

**Technical Requirements**:
- HTML5 Canvas API
- Kakao Maps CustomOverlay

**Implementation Notes**:
```typescript
// components/InstitutionMarker.tsx
'use client';

import { useEffect, useRef } from 'react';
import { CustomOverlayMap } from 'react-kakao-maps-sdk';
import { Institution } from '@/types/institution';

interface InstitutionMarkerProps {
  institution: Institution;
  onClick: () => void;
}

export function InstitutionMarker({ institution, onClick }: InstitutionMarkerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { capacity, current_headcount } = institution;
    const occupancyRate = capacity > 0 ? (current_headcount / capacity) : 0;

    // 색상 결정
    let fillColor = '#10B981';  // 녹색 (여유)
    if (occupancyRate >= 0.9) {
      fillColor = '#EF4444';  // 빨간색 (포화)
    } else if (occupancyRate >= 0.7) {
      fillColor = '#F59E0B';  // 주황색 (보통)
    }

    const centerX = 15;
    const centerY = 15;
    const radius = 12;

    // 배경 원 (정원)
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fillStyle = '#E5E7EB';  // 회색 배경
    ctx.fill();

    // 파이 차트 (현원)
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + (2 * Math.PI * occupancyRate));
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();

    // 테두리
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [institution]);

  return (
    <CustomOverlayMap
      position={{ lat: institution.latitude, lng: institution.longitude }}
    >
      <div
        onClick={onClick}
        className="cursor-pointer hover:scale-110 transition-transform"
        style={{ width: '30px', height: '30px' }}
      >
        <canvas ref={canvasRef} width={30} height={30} />
      </div>
    </CustomOverlayMap>
  );
}
```

**Definition of Done**:
- [ ] InstitutionMarker 컴포넌트 구현 완료
- [ ] 파이차트 렌더링 정상 작동
- [ ] 색상 코드 정확도 확인 (70%, 90% 경계 테스트)
- [ ] 호버 효과 (scale) 적용
- [ ] 성능 테스트 (100개 마커 동시 렌더링)
- [ ] Code review 완료

---

### User Story 2.3: 마우스 오버 시 기관 상세 정보 표시

**As a** 사용자
**I want to** 마커에 마우스를 올리면 기관 정보 팝업 표시
**So that** 클릭 없이 빠르게 정보를 확인할 수 있다

**Priority**: P1
**Story Points**: 3
**Assigned to**: Frontend Dev

**Acceptance Criteria**:
- [ ] 마우스 오버 시 툴팁/인포윈도우 표시
- [ ] 표시 정보: 기관명, 급여종류, 정원/현원, 주소
- [ ] 마우스 아웃 시 자동 닫힘
- [ ] 툴팁 위치: 마커 상단 중앙
- [ ] 애니메이션 효과 (fade-in)

**Technical Requirements**:
- Kakao Maps InfoWindow 또는 Custom Tooltip
- CSS 애니메이션

**Implementation Notes**:
```typescript
// components/InstitutionInfoCard.tsx
import { Institution } from '@/types/institution';

interface InstitutionInfoCardProps {
  institution: Institution;
}

export function InstitutionInfoCard({ institution }: InstitutionInfoCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 min-w-[200px] animate-fadeIn">
      <h3 className="font-bold text-lg mb-2">{institution.name}</h3>
      <div className="text-sm text-gray-600 space-y-1">
        <p><span className="font-medium">급여종류:</span> {institution.service_type}</p>
        <p>
          <span className="font-medium">정원/현원:</span>{' '}
          {institution.current_headcount} / {institution.capacity}
          <span className="ml-2 text-xs">
            ({institution.occupancy_rate?.toFixed(1)}%)
          </span>
        </p>
        <p className="text-xs">{institution.address}</p>
      </div>
    </div>
  );
}
```

```typescript
// Update InstitutionMarker.tsx
export function InstitutionMarker({ institution, onClick }: InstitutionMarkerProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <>
      <CustomOverlayMap position={{ lat: institution.latitude, lng: institution.longitude }}>
        <div
          onClick={onClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="cursor-pointer hover:scale-110 transition-transform"
        >
          <canvas ref={canvasRef} width={30} height={30} />
        </div>
      </CustomOverlayMap>

      {isHovered && (
        <CustomOverlayMap
          position={{ lat: institution.latitude, lng: institution.longitude }}
          yAnchor={1.2}
        >
          <InstitutionInfoCard institution={institution} />
        </CustomOverlayMap>
      )}
    </>
  );
}
```

```css
/* styles/globals.css */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fadeIn {
  animation: fadeIn 0.2s ease-in-out;
}
```

**Definition of Done**:
- [ ] InstitutionInfoCard 컴포넌트 구현
- [ ] 마우스 오버/아웃 이벤트 정상 작동
- [ ] 툴팁 위치 정확도 확인
- [ ] 애니메이션 적용 확인
- [ ] 모바일 터치 이벤트 고려 (옵션)
- [ ] Code review 완료

---

### User Story 2.4: 마커 클릭 시 상세 페이지 이동

**As a** 사용자
**I want to** 마커를 클릭하면 해당 기관의 상세 페이지로 이동
**So that** 더 많은 정보와 시계열 그래프를 확인할 수 있다

**Priority**: P0
**Story Points**: 2
**Assigned to**: Frontend Dev

**Acceptance Criteria**:
- [ ] 마커 클릭 이벤트 처리
- [ ] 상세 페이지 라우팅 (예: `/institution/[id]`)
- [ ] 뒤로 가기 버튼으로 지도 복귀
- [ ] URL 파라미터로 기관 ID 전달

**Technical Requirements**:
- Next.js App Router
- useRouter hook

**Implementation Notes**:
```typescript
// app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { KakaoMap } from '@/components/KakaoMap';
import { Institution } from '@/types/institution';

export default function HomePage() {
  const router = useRouter();
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchInstitutions() {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/institutions/`);
        const data = await response.json();
        setInstitutions(data.results);
      } catch (error) {
        console.error('Failed to fetch institutions:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchInstitutions();
  }, []);

  const handleMarkerClick = (id: string) => {
    router.push(`/institution/${id}`);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <main>
      <KakaoMap institutions={institutions} onMarkerClick={handleMarkerClick} />
    </main>
  );
}
```

**Definition of Done**:
- [ ] 마커 클릭 → 상세 페이지 이동 확인
- [ ] URL 파라미터 정확도 확인
- [ ] 뒤로 가기 동작 테스트
- [ ] 404 에러 핸들링 (존재하지 않는 ID)
- [ ] Code review 완료

---

## Epic Acceptance Criteria

- [ ] 지도에 최소 100개 기관 마커 표시
- [ ] 파이차트 마커 정상 렌더링
- [ ] 마우스 오버 툴팁 작동
- [ ] 마커 클릭 → 상세 페이지 이동 성공
- [ ] 지도 로딩 시간 3초 이내
- [ ] 모바일 반응형 확인
- [ ] 모든 User Story의 DoD 완료

---

## Technical Risks

| Risk | Mitigation |
|------|------------|
| Kakao Maps SDK 로딩 지연 | 로딩 스피너, async 로드 |
| 대량 마커 렌더링 성능 저하 | 클러스터링 (Phase 2) |
| 모바일 터치 이벤트 충돌 | 이벤트 핸들링 최적화 |

---

## Dependencies

- Backend API 엔드포인트 `/api/institutions/` 구현 완료
- Kakao Maps JavaScript App Key 발급
- Epic 1 (데이터 수집) 완료

---

## UI/UX Notes

- 지도는 전체 화면 사용
- 검색/필터 UI는 Epic 4에서 추가
- 다크모드는 Phase 2 고려사항
