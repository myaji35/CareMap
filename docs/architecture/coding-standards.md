# Coding Standards

## General Principles
1. **Clean Code**: 읽기 쉽고 유지보수 가능한 코드 작성
2. **DRY (Don't Repeat Yourself)**: 코드 중복 최소화
3. **KISS (Keep It Simple, Stupid)**: 단순하고 명확한 구현
4. **YAGNI (You Aren't Gonna Need It)**: 필요한 기능만 구현

## Frontend Coding Standards

### TypeScript
- 모든 컴포넌트와 함수에 타입 정의
- `any` 사용 금지 (불가피한 경우 주석 필수)
- Interface 우선 사용 (Type alias는 특정 경우에만)

```typescript
// Good
interface InstitutionProps {
  id: string;
  name: string;
  capacity: number;
}

// Bad
const handleClick = (data: any) => { ... }
```

### React Components
- Functional Components + Hooks 사용
- 컴포넌트는 하나의 책임만 (Single Responsibility)
- Props는 interface로 명시

```typescript
// Good
interface KakaoMapProps {
  institutions: Institution[];
  onMarkerClick: (id: string) => void;
}

export function KakaoMap({ institutions, onMarkerClick }: KakaoMapProps) {
  // ...
}
```

### File Naming
- 컴포넌트: PascalCase (예: `KakaoMap.tsx`)
- 유틸리티: camelCase (예: `api.ts`)
- 타입 정의: PascalCase (예: `institution.ts`)

### Styling
- Tailwind CSS 유틸리티 클래스 우선 사용
- 복잡한 스타일은 `cn()` 헬퍼 사용

```typescript
import { cn } from "@/lib/utils";

<div className={cn(
  "base-class",
  isActive && "active-class",
  className
)} />
```

## Backend Coding Standards

### Python (Django)
- PEP 8 스타일 가이드 준수
- Django 네이밍 컨벤션 따르기
- Docstring 필수 (함수, 클래스)

```python
# Good
class Institution(models.Model):
    """장기요양기관 모델"""

    def get_occupancy_rate(self) -> float:
        """정원 대비 현원 비율 계산"""
        if self.capacity and self.capacity > 0:
            return (self.current_headcount / self.capacity) * 100
        return 0.0
```

### Django Models
- 명확한 필드 이름 사용
- `null=True`, `blank=True` 명시적으로 설정
- Meta 클래스에 `db_table`, `ordering` 정의

### Django Views
- Class-Based Views (CBV) 우선 사용
- DRF ViewSet 활용
- 비즈니스 로직은 모델 또는 별도 서비스로 분리

## Database Standards

### SQL
- 테이블명: 소문자 + 언더스코어 (예: `institution_history`)
- 인덱스 명: `idx_` 접두사 (예: `idx_institution_code`)
- Foreign Key: 명확한 `ON DELETE` 정책 명시

### Migrations
- 하나의 마이그레이션은 하나의 변경사항
- 마이그레이션 파일 설명 명확히

## Testing Standards

### Frontend Tests
- 컴포넌트당 최소 1개 테스트
- 핵심 기능은 E2E 테스트 작성

### Backend Tests
- API 엔드포인트당 테스트 케이스 작성
- Coverage 80% 이상 목표

## Git Commit Standards

### Commit Message Format
```
type(scope): subject

body (optional)
```

### Types
- `feat`: 새로운 기능
- `fix`: 버그 수정
- `docs`: 문서 수정
- `style`: 코드 포맷팅
- `refactor`: 리팩토링
- `test`: 테스트 추가/수정
- `chore`: 빌드, 설정 변경

### Examples
```
feat(map): add institution marker clustering
fix(api): resolve geocoding API timeout issue
docs(readme): update installation instructions
```

## Code Review Checklist

- [ ] 코드가 요구사항을 충족하는가?
- [ ] 타입 안전성이 보장되는가?
- [ ] 테스트가 작성되었는가?
- [ ] 성능 이슈가 없는가?
- [ ] 보안 취약점이 없는가?
- [ ] 문서화가 충분한가?
