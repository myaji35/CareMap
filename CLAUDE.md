# CareMap 프로젝트

> **Vibe:** 데이터의 역사와 흐름을 시각화하여, 사용자가 깊은 통찰력을 얻을 수 있도록 돕는 모던 데이터 대시보드

## 디렉토리 구조

```
caremap/
├── prd.md                   # PRD 문서 (bmad-method)
├── CLAUDE.md                # 현재 파일 (구현 가이드)
├── README.md                # 프로젝트 개요
├── src/                     # Next.js 14 소스 코드
│   ├── app/                 # App Router 페이지
│   │   ├── page.tsx         # 메인 랜딩 페이지
│   │   ├── admin/           # 관리자 크롤러 페이지
│   │   └── dashboard/       # 대시보드 (지도 뷰 등)
│   ├── components/          # React 컴포넌트
│   │   ├── map/             # 지도 관련 컴포넌트
│   │   └── ui/              # shadcn/ui 컴포넌트
│   ├── lib/                 # 유틸리티 함수
│   │   ├── prisma.ts        # Prisma 클라이언트
│   │   ├── crawler.ts       # 크롤링 로직 (Playwright)
│   │   └── geocoding.ts     # Kakao Geocoding API
│   └── generated/           # Prisma Client 생성 파일
├── prisma/                  # Prisma 스키마
│   └── schema.prisma        # DB 모델 정의
└── .env                     # 환경 변수
```

## 프로젝트 개요

### 목적
전국 장기요양기관의 데이터를 수집, 분석하여 사용자에게 직관적인 시각 자료(지도, 차트)로 제공하고, 기관 데이터의 '월별 변경 이력'을 추적하여 데이터의 신뢰성과 깊이를 더하는 분석 플랫폼

### 주요 기능
1. **데이터 수집**: Playwright로 기관 정보 크롤링 및 DB 동기화
2. **지도 시각화**: Kakao Maps에 파이차트 마커로 정원/현원 표시
3. **이력 관리**: InstitutionHistory 모델로 월별 변경 추적
4. **관리자 대시보드**: 크롤링 제어 및 데이터 관리

### Tech Stack
- **Framework**: Next.js 14 (App Router), React, TypeScript
- **UI**: Tailwind CSS, shadcn/ui (New York, Slate)
- **Database**: Neon.tech (Serverless Postgres) + Prisma ORM
- **Maps**: Kakao Maps API (`react-kakao-maps-sdk`)
- **Charts**: Recharts
- **Crawler**: Playwright (Chromium)

### 개발 방법론
- **bmad-method v4.44.0** 적용
- PRD 기반 요구사항 정의
- Epic → User Story → Task 단위 개발

## 완성된 기능

### Phase 1: 데이터베이스 설계 (완료)
✅ Prisma 스키마 정의 (Institution, InstitutionHistory)
✅ Neon.tech PostgreSQL 연동 준비
✅ Prisma Client 생성 및 유틸리티 설정

### Phase 2: 크롤러 시스템 (완료)
✅ Playwright 기반 크롤링 엔진 구현 (`src/lib/crawler.ts`)
✅ 전체 페이지 수 자동 감지 기능
✅ 관리자 크롤링 페이지 (`src/app/admin/page.tsx`)
✅ 실시간 진행 상태 및 로그 표시
✅ API 엔드포인트: `/api/admin/crawler/*`

### Phase 3: 지도 시각화 (완료)
✅ Kakao Maps SDK 연동 (`react-kakao-maps-sdk`)
✅ 파이차트 마커 (`CustomPieMarker`) - 정원/현원 숫자 표시
✅ 초과 현원 시 경고 색상(빨강) 표시
✅ 기관 정보 Popover 및 호버 효과
✅ 이력 다이얼로그 (`HistoryDialog`)

### Phase 4: API 및 데이터 관리 (완료)
✅ `/api/institutions` - 기관 목록 조회
✅ `/api/institutions/[id]/history` - 기관 이력 조회
✅ `/api/admin/crawler/total-pages` - 전체 페이지 수 조회
✅ `/api/admin/crawler/start` - 크롤링 시작
✅ Kakao Geocoding API 연동 (`src/lib/geocoding.ts`)

## 데이터베이스 모델

### Institution (기관 최신 정보)
```prisma
model Institution {
  id                String                @id @default(cuid())
  institutionCode   String                @unique
  name              String
  serviceType       String
  capacity          Int
  currentHeadcount  Int
  address           String
  latitude          Float
  longitude         Float
  createdAt         DateTime              @default(now())
  updatedAt         DateTime              @updatedAt
  history           InstitutionHistory[]
}
```

### InstitutionHistory (변경 이력)
```prisma
model InstitutionHistory {
  id                String      @id @default(cuid())
  institutionId     String
  recordedDate      DateTime    @default(now())
  name              String
  address           String
  capacity          Int
  currentHeadcount  Int
  institution       Institution @relation(fields: [institutionId], references: [id], onDelete: Cascade)
}
```

## 환경 변수

`.env` 파일에 다음 변수를 설정하세요:

```bash
# Database (Neon.tech 또는 로컬 Postgres)
DATABASE_URL="postgresql://..."

# Kakao Maps API
NEXT_PUBLIC_KAKAO_MAP_API_KEY="a63d90809c12a1ab306437407ee04834"
KAKAO_REST_API_KEY="83022bf07d136c31285491b85c6ee6aa"

# Crawler
CRAWLER_TARGET_URL="https://www.longtermcare.or.kr/npbs/r/a/201/selectXLtcoSrch"
```

## 실행 방법

### 1. 의존성 설치
```bash
npm install
npx playwright install chromium  # 크롤러용 브라우저
```

### 2. 환경 변수 설정
`.env` 파일을 생성하고 위의 환경 변수를 설정합니다.

### 3. 데이터베이스 설정
```bash
# Prisma Client 생성
npx prisma generate

# 데이터베이스 스키마 적용 (Neon.tech 또는 로컬 Postgres)
npx prisma db push
```

### 4. 개발 서버 실행
```bash
npm run dev
# http://localhost:3000 에서 웹 UI 제공
```

### 5. 주요 페이지
- **메인 페이지**: http://localhost:3000
- **지도 뷰**: http://localhost:3000/dashboard/map-view
- **관리자 크롤러**: http://localhost:3000/admin

## 사용 시나리오

### 1. 관리자: 크롤링 실행
1. http://localhost:3000/admin 접속
2. "전체 페이지 수 확인" 버튼 클릭 (10-20초 소요)
3. 전체 페이지 수가 표시되면 크롤링할 페이지 수 입력
4. "크롤링 시작" 버튼 클릭
5. 실시간 로그 및 진행률 확인
6. 완료 후 "데이터 가져오기" 버튼으로 DB에 저장

### 2. 사용자: 지도에서 기관 확인
1. http://localhost:3000/dashboard/map-view 접속
2. 지도에 표시된 파이차트 마커 확인
   - 파란색: 정상 입소율
   - 빨간색: 정원 초과
   - 마커 내부: 현원/정원 숫자 표시
3. 마커에 마우스 오버하여 기관 정보 팝업 확인
4. "이력 보기" 버튼 클릭하여 변경 이력 차트 확인

### 3. 데이터 분석: 이력 조회
1. 기관 마커 클릭 → "이력 보기"
2. 월별 정원/현원 변화 추이 차트 확인
3. 테이블에서 구체적인 변경 내역 확인

## 다음 개발 단계

### Phase 5: SaaS UI 템플릿 적용 (예정)
- [ ] SaaS UI 템플릿 분석 및 통합
- [ ] 좌측 고정 사이드바 구현
- [ ] 라이트/다크 모드 토글
- [ ] 메뉴 커스터마이징 (지도 뷰, 이력 분석 등)

### Phase 6: 이력 관리 강화 (예정)
- [ ] 크롤링 데이터 비교 로직 구현 (USR-002, USR-003)
- [ ] 변경 감지 시 InstitutionHistory 자동 백업
- [ ] 월별 이력 차트 개선 (Recharts)
- [ ] 이력 통계 대시보드

### Phase 7: 인증 시스템 (예정)
- [ ] NextAuth.js 또는 Clerk 통합
- [ ] 사용자 등급별 권한 관리 (Admin/Manager/User)
- [ ] 로그인/회원가입 페이지

### Phase 8: 배포 및 운영 (예정)
- [ ] Vercel 배포 (Frontend + API Routes)
- [ ] Neon.tech Production DB 설정
- [ ] 크롤링 스케줄러 (월 1회 자동 실행)
- [ ] 모니터링 및 로깅

## 주요 파일 설명

| 파일 경로 | 설명 |
|----------|------|
| `src/app/admin/page.tsx` | 관리자 크롤링 페이지 |
| `src/app/dashboard/map-view/page.tsx` | 지도 뷰 페이지 |
| `src/components/map/CustomPieMarker.tsx` | 파이차트 마커 컴포넌트 |
| `src/components/map/HistoryDialog.tsx` | 이력 다이얼로그 |
| `src/lib/crawler.ts` | Playwright 크롤링 엔진 |
| `src/lib/geocoding.ts` | Kakao Geocoding API |
| `src/lib/prisma.ts` | Prisma Client 싱글톤 |
| `prisma/schema.prisma` | 데이터베이스 스키마 |

## 참고 문서

- **PRD 문서**: `prd.md` (bmad-method v4.44.0)
- **Prisma 문서**: https://www.prisma.io/docs
- **Next.js 문서**: https://nextjs.org/docs
- **Playwright 문서**: https://playwright.dev/docs/intro
- **Kakao Maps API**: https://apis.map.kakao.com/web/

## 버전 정보

- **bmad-method**: v4.44.0
- **Next.js**: 15.1.4
- **React**: 19.0.0
- **Prisma**: 6.17.1
- **Playwright**: 1.49.1
- **Node.js**: 18+

## 라이선스

MIT License
