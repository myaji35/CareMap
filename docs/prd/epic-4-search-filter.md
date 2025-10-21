# Epic 4: 검색 및 필터링 (Search & Filtering)

**Epic Owner**: Frontend Team
**Priority**: P1
**Estimated Duration**: 1 week
**Dependencies**: Epic 2 (지도 시각화)

---

## Epic Overview

사용자가 기관명, 급여종류, 지역별로 검색 및 필터링하여 원하는 기관을 빠르게 찾을 수 있는 기능을 제공합니다.

---

## User Stories

### User Story 4.1: 기관명 검색

**As a** 사용자
**I want to** 기관명으로 검색
**So that** 특정 기관을 빠르게 찾을 수 있다

**Priority**: P1
**Story Points**: 2
**Assigned to**: Frontend Dev

**Acceptance Criteria**:
- [ ] 검색창에 키워드 입력 시 실시간 필터링
- [ ] 부분 일치 지원
- [ ] 검색 결과를 지도에 하이라이트 (선택된 마커만 표시)
- [ ] 검색 초기화 버튼

**Implementation Notes**:
```typescript
// components/SearchFilter.tsx
'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchFilterProps {
  onSearch: (keyword: string) => void;
}

export function SearchFilter({ onSearch }: SearchFilterProps) {
  const [keyword, setKeyword] = useState('');

  const handleSearch = (value: string) => {
    setKeyword(value);
    onSearch(value);
  };

  const handleReset = () => {
    setKeyword('');
    onSearch('');
  };

  return (
    <div className="flex items-center gap-2">
      <Input
        type="text"
        placeholder="기관명 검색..."
        value={keyword}
        onChange={(e) => handleSearch(e.target.value)}
        className="flex-1"
      />
      {keyword && (
        <Button variant="outline" onClick={handleReset}>
          초기화
        </Button>
      )}
    </div>
  );
}
```

**Definition of Done**:
- [ ] 검색 기능 구현 완료
- [ ] 실시간 필터링 작동
- [ ] 검색 결과 하이라이트
- [ ] 초기화 버튼 작동
- [ ] Code review 완료

---

### User Story 4.2: 급여종류 필터

**As a** 사용자
**I want to** 급여종류(방문요양, 주간보호 등)로 필터링
**So that** 원하는 서비스 유형의 기관만 확인할 수 있다

**Priority**: P1
**Story Points**: 3
**Assigned to**: Frontend Dev

**Acceptance Criteria**:
- [ ] 드롭다운 또는 체크박스 필터
- [ ] 다중 선택 지원
- [ ] 필터 적용 시 지도 마커 업데이트
- [ ] 선택된 필터 표시 (Badge)

**Implementation Notes**:
```typescript
// components/ServiceTypeFilter.tsx
'use client';

import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface ServiceTypeFilterProps {
  serviceTypes: string[];
  onFilter: (selected: string[]) => void;
}

export function ServiceTypeFilter({ serviceTypes, onFilter }: ServiceTypeFilterProps) {
  const [selected, setSelected] = useState<string[]>([]);

  const handleToggle = (type: string) => {
    const newSelected = selected.includes(type)
      ? selected.filter(t => t !== type)
      : [...selected, type];

    setSelected(newSelected);
    onFilter(newSelected);
  };

  return (
    <div className="space-y-2">
      <h3 className="font-semibold">급여종류</h3>
      {serviceTypes.map(type => (
        <div key={type} className="flex items-center space-x-2">
          <Checkbox
            id={type}
            checked={selected.includes(type)}
            onCheckedChange={() => handleToggle(type)}
          />
          <Label htmlFor={type}>{type}</Label>
        </div>
      ))}

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selected.map(type => (
            <Badge key={type} variant="secondary">
              {type}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
```

**Definition of Done**:
- [ ] 급여종류 필터 구현 완료
- [ ] 다중 선택 작동
- [ ] 지도 마커 업데이트 확인
- [ ] Badge 표시 확인
- [ ] Code review 완료

---

### User Story 4.3: 지역별 필터

**As a** 사용자
**I want to** 시/도, 시/군/구 단위로 필터링
**So that** 특정 지역의 기관만 확인할 수 있다

**Priority**: P1
**Story Points**: 3
**Assigned to**: Frontend Dev

**Acceptance Criteria**:
- [ ] 2단계 선택 (시/도 → 시/군/구)
- [ ] 지역 선택 시 지도 자동 이동 및 줌
- [ ] 전체 선택 옵션

**Implementation Notes**:
```typescript
// components/RegionFilter.tsx
'use client';

import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface RegionFilterProps {
  onFilter: (region: string) => void;
  onMapMove: (lat: number, lng: number, level: number) => void;
}

const REGIONS = {
  '서울': { lat: 37.5665, lng: 126.9780, districts: ['강남구', '서초구', '송파구', '...'] },
  '경기': { lat: 37.4138, lng: 127.5183, districts: ['수원시', '성남시', '...'] },
  // ... more regions
};

export function RegionFilter({ onFilter, onMapMove }: RegionFilterProps) {
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');

  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
    setSelectedDistrict('');
    onFilter(region);

    if (region && REGIONS[region]) {
      const { lat, lng } = REGIONS[region];
      onMapMove(lat, lng, 8);
    }
  };

  return (
    <div className="space-y-2">
      <Select value={selectedRegion} onValueChange={handleRegionChange}>
        <SelectTrigger>
          <SelectValue placeholder="시/도 선택" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">전체</SelectItem>
          {Object.keys(REGIONS).map(region => (
            <SelectItem key={region} value={region}>{region}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedRegion && selectedRegion !== 'all' && (
        <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
          <SelectTrigger>
            <SelectValue placeholder="시/군/구 선택" />
          </SelectTrigger>
          <SelectContent>
            {REGIONS[selectedRegion]?.districts.map(district => (
              <SelectItem key={district} value={district}>{district}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
```

**Definition of Done**:
- [ ] 지역 필터 구현 완료
- [ ] 2단계 선택 작동
- [ ] 지도 자동 이동 확인
- [ ] 전체 선택 옵션 확인
- [ ] Code review 완료

---

## Epic Acceptance Criteria

- [ ] 검색 기능 정상 작동
- [ ] 급여종류 필터 정상 작동
- [ ] 지역 필터 정상 작동
- [ ] 필터 조합 가능 (예: 서울 + 방문요양)
- [ ] 필터 초기화 가능
- [ ] 모든 User Story의 DoD 완료

---

## Technical Risks

| Risk | Mitigation |
|------|------------|
| 필터 성능 저하 | Debouncing, 최적화 |
| 복잡한 필터 조합 | 상태 관리 명확화 |

---

## Dependencies

- Epic 2 (지도 시각화) 완료
- Backend API 필터 파라미터 지원

---

## Notes

- 고급 필터(정원 범위 등)는 Phase 2
- 저장된 검색 조건은 Phase 2
