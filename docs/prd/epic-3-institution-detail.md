# Epic 3: 기관 상세 페이지 (Institution Detail Page)

**Epic Owner**: Frontend Team
**Priority**: P0 (Critical)
**Estimated Duration**: 2 weeks
**Dependencies**: Epic 1 (데이터 수집), Backend API

---

## Epic Overview

사용자가 특정 기관을 선택하면 해당 기관의 상세 정보와 월별 정원/현원 변동 내역을 시계열 그래프로 확인할 수 있는 페이지를 제공합니다.

---

## User Stories

### User Story 3.1: 기관 기본 정보 표시

**As a** 사용자
**I want to** 기관의 상세 정보를 확인
**So that** 해당 기관에 대한 종합적인 정보를 얻을 수 있다

**Priority**: P0
**Story Points**: 3
**Assigned to**: Frontend Dev

**Acceptance Criteria**:
- [ ] 기관명, 급여종류, 정원, 현원, 주소, 운영시간 표시
- [ ] 정원 대비 현원 비율을 프로그레스 바로 시각화
- [ ] 지도 상 위치 미니맵 표시 (선택사항)
- [ ] 마지막 업데이트 시간 표시
- [ ] 뒤로 가기 버튼

**Technical Requirements**:
- Next.js Dynamic Route (`/institution/[id]`)
- shadcn/ui 컴포넌트 (Card, Badge 등)
- API 연동

**Implementation Notes**:
```typescript
// app/institution/[id]/page.tsx
import { notFound } from 'next/navigation';
import { InstitutionDetailCard } from '@/components/InstitutionDetailCard';

async function getInstitution(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/institutions/${id}/`, {
    cache: 'no-store'
  });

  if (!res.ok) {
    return null;
  }

  return res.json();
}

export default async function InstitutionDetailPage({ params }: { params: { id: string } }) {
  const institution = await getInstitution(params.id);

  if (!institution) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <InstitutionDetailCard institution={institution} />
    </div>
  );
}
```

```typescript
// components/InstitutionDetailCard.tsx
import { Institution } from '@/types/institution';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export function InstitutionDetailCard({ institution }: { institution: Institution }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">{institution.name}</CardTitle>
          <Badge>{institution.service_type}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">정원/현원</h3>
          <div className="flex items-center gap-4">
            <Progress value={institution.occupancy_rate} className="flex-1" />
            <span className="text-sm font-medium">
              {institution.current_headcount} / {institution.capacity}
              ({institution.occupancy_rate?.toFixed(1)}%)
            </span>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-1">주소</h3>
          <p className="text-sm text-gray-600">{institution.address}</p>
        </div>

        <div>
          <h3 className="font-semibold mb-1">운영시간</h3>
          <p className="text-sm text-gray-600">{institution.operating_hours}</p>
        </div>

        <div className="text-xs text-gray-400">
          최종 업데이트: {new Date(institution.last_updated_at).toLocaleDateString('ko-KR')}
        </div>
      </CardContent>
    </Card>
  );
}
```

**Definition of Done**:
- [ ] 상세 페이지 라우팅 작동
- [ ] 기관 정보 정확히 표시
- [ ] 프로그레스 바 정상 작동
- [ ] 404 페이지 처리 (존재하지 않는 ID)
- [ ] 모바일 반응형 확인
- [ ] Code review 완료

---

### User Story 3.2: 정원/현원 시계열 그래프

**As a** 사용자
**I want to** 기관의 월별 정원/현원 변동 내역을 그래프로 확인
**So that** 기관의 운영 추세를 분석할 수 있다

**Priority**: P0
**Story Points**: 5
**Assigned to**: Frontend Dev

**Acceptance Criteria**:
- [ ] Recharts를 사용한 라인 차트
- [ ] X축: 월별 날짜 (recorded_date)
- [ ] Y축: 정원, 현원 (두 개 라인)
- [ ] 데이터 포인트 호버 시 수치 표시
- [ ] 최근 12개월 데이터 기본 표시
- [ ] 전체 기간 옵션 제공 (드롭다운 또는 버튼)
- [ ] 데이터가 없는 경우 "데이터 없음" 메시지 표시

**Technical Requirements**:
- Recharts 2.12.7
- API 엔드포인트: `GET /api/institutions/:id/history/`
- Date formatting (date-fns 또는 Intl.DateTimeFormat)

**Implementation Notes**:
```typescript
// components/TimeSeriesChart.tsx
'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { InstitutionHistory } from '@/types/institution';

interface TimeSeriesChartProps {
  institutionId: string;
}

export function TimeSeriesChart({ institutionId }: TimeSeriesChartProps) {
  const [history, setHistory] = useState<InstitutionHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<'12m' | 'all'>('12m');

  useEffect(() => {
    async function fetchHistory() {
      try {
        const params = new URLSearchParams();
        if (period === '12m') {
          const startDate = new Date();
          startDate.setMonth(startDate.getMonth() - 12);
          params.append('start_date', startDate.toISOString().split('T')[0]);
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/institutions/${institutionId}/history/?${params}`
        );
        const data = await response.json();
        setHistory(data.history || []);
      } catch (error) {
        console.error('Failed to fetch history:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchHistory();
  }, [institutionId, period]);

  if (isLoading) {
    return <div>Loading chart...</div>;
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        변경 이력 데이터가 없습니다.
      </div>
    );
  }

  const chartData = history.map(item => ({
    date: new Date(item.recorded_date).toLocaleDateString('ko-KR', { year: '2-digit', month: 'numeric' }),
    정원: item.capacity,
    현원: item.current_headcount
  }));

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg">정원/현원 변동 추이</h3>
        <div className="space-x-2">
          <button
            onClick={() => setPeriod('12m')}
            className={`px-3 py-1 text-sm rounded ${
              period === '12m' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            최근 12개월
          </button>
          <button
            onClick={() => setPeriod('all')}
            className={`px-3 py-1 text-sm rounded ${
              period === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            전체 기간
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="정원" stroke="#8884d8" strokeWidth={2} />
          <Line type="monotone" dataKey="현원" stroke="#82ca9d" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

```typescript
// types/institution.ts
export interface InstitutionHistory {
  recorded_date: string;
  capacity: number;
  current_headcount: number;
  name?: string;
  address?: string;
}
```

**Definition of Done**:
- [ ] TimeSeriesChart 컴포넌트 구현 완료
- [ ] 라인 차트 정상 렌더링
- [ ] 호버 툴팁 작동
- [ ] 기간 필터 (12개월/전체) 작동
- [ ] 데이터 없는 경우 처리
- [ ] 모바일 반응형 확인
- [ ] Code review 완료

---

## Epic Acceptance Criteria

- [ ] 상세 페이지 정상 작동
- [ ] 기관 정보 정확히 표시
- [ ] 시계열 그래프 렌더링 성공
- [ ] 차트 로딩 시간 1초 이내
- [ ] 모든 User Story의 DoD 완료

---

## Technical Risks

| Risk | Mitigation |
|------|------------|
| 히스토리 데이터 부족 | 안내 메시지 표시 |
| 차트 렌더링 성능 | 데이터 포인트 제한, 최적화 |

---

## Dependencies

- Backend API `/api/institutions/:id/` 구현
- Backend API `/api/institutions/:id/history/` 구현
- Epic 1 (데이터 수집 및 히스토리 저장) 완료

---

## Notes

- 미니맵은 Phase 2 고려사항
- PDF/이미지 내보내기는 Phase 2
