# CareMap - 장기요양기관 데이터 플랫폼

전국 장기요양기관의 데이터를 수집, 분석하여 직관적인 지도와 차트로 제공하는 모던 데이터 대시보드입니다.

## 🌟 주요 기능

- **지도 기반 시각화**: 전국 요양기관을 지도 위에 표시하고, 정원 대비 현원 비율을 파이 차트 마커로 시각화
- **시계열 데이터 분석**: 월별 정원, 현원, 입소율 변화를 차트로 추적
- **변동 이력 추적**: 기관의 모든 변경 사항을 기록하여 데이터 신뢰성 확보
- **반응형 디자인**: 데스크톱과 모바일 모두 최적화된 UX

## 🛠 기술 스택

- **Frontend**: Next.js 15 (App Router, Turbopack), React 19, TypeScript
- **UI**: Tailwind CSS 4, shadcn/ui (New York, Slate)
- **Database**: Neon.tech (Serverless PostgreSQL)
- **ORM**: Prisma
- **Maps**: Kakao Maps (`react-kakao-maps-sdk`)
- **Charts**: Recharts

## 🚀 시작하기

### 1. 환경 변수 설정

`.env` 파일을 생성하고 다음 환경 변수를 설정하세요:

```bash
# 데이터베이스 (Neon.tech 또는 PostgreSQL)
DATABASE_URL="your_database_url_here"

# Kakao Maps API Key
# https://developers.kakao.com/ 에서 발급
NEXT_PUBLIC_KAKAO_MAP_API_KEY="your_kakao_map_api_key_here"
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 데이터베이스 설정

```bash
# Prisma 스키마를 데이터베이스에 동기화
npx prisma db push

# Prisma Client 생성
npx prisma generate
```

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 📦 프로젝트 구조

```
caremap/
├── prisma/
│   └── schema.prisma          # Prisma 데이터베이스 스키마
├── src/
│   ├── app/
│   │   ├── api/               # Next.js API Routes
│   │   │   └── institutions/  # 기관 데이터 API
│   │   ├── dashboard/         # 대시보드 페이지
│   │   │   ├── layout.tsx     # SaaS 레이아웃
│   │   │   ├── page.tsx       # 대시보드 홈
│   │   │   └── map-view/      # 지도 뷰 페이지
│   │   ├── layout.tsx         # Root 레이아웃
│   │   └── page.tsx           # 랜딩 페이지
│   ├── components/
│   │   ├── layout/            # 레이아웃 컴포넌트
│   │   │   └── Sidebar.tsx    # 사이드바
│   │   ├── map/               # 지도 관련 컴포넌트
│   │   │   ├── CustomPieMarker.tsx
│   │   │   ├── InstitutionPopover.tsx
│   │   │   └── HistoryDialog.tsx
│   │   └── ui/                # shadcn/ui 컴포넌트
│   ├── lib/
│   │   ├── prisma.ts          # Prisma Client 싱글톤
│   │   └── utils.ts           # 유틸리티 함수
│   └── generated/
│       └── prisma/            # 생성된 Prisma Client
├── .env                       # 환경 변수 (gitignored)
├── .env.example               # 환경 변수 예시
└── CLAUDE.md                  # Claude Code 가이드
```

## 🗄 데이터 모델

### Institution (최신 정보)
- 기관의 현재 상태를 저장
- `institutionCode`로 고유 식별

### InstitutionHistory (변경 이력)
- 모든 데이터 변경 사항을 기록
- `recordedDate`로 시계열 추적

## 📱 주요 화면

### 1. 랜딩 페이지 (`/`)
- 제품 소개 및 핵심 기능 안내
- CTA 버튼으로 대시보드 진입

### 2. 대시보드 홈 (`/dashboard`)
- 프로젝트 소개 및 네비게이션

### 3. 지도 뷰 (`/dashboard/map-view`)
- Kakao Maps 기반 전국 기관 시각화
- 커스텀 파이 차트 마커
- 기관 정보 Popover
- 변동 이력 Dialog

## 🎨 디자인 시스템

- **테마**: New York (shadcn/ui)
- **컬러**: Slate
- **폰트**: Geist Sans, Geist Mono
- **스타일링**: Tailwind CSS 4

## 🚢 배포

### Vercel 배포

1. Vercel에 프로젝트 연결
2. 환경 변수 설정:
   - `DATABASE_URL` (Neon.tech)
   - `NEXT_PUBLIC_KAKAO_MAP_API_KEY`
3. 자동 배포 완료

### 환경 변수 설정 확인 사항
- Kakao Maps 플랫폼 설정에서 배포 도메인 추가
- Neon.tech 데이터베이스 연결 풀 설정

## 🔧 개발 가이드

### 빌드

```bash
npm run build
```

### 프로덕션 실행

```bash
npm start
```

### 린트

```bash
npm run lint
```

### Prisma Studio (DB GUI)

```bash
npx prisma studio
```

## 📄 라이선스

이 프로젝트는 개인 프로젝트입니다.

## 🙏 기술 스택 크레딧

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Prisma](https://www.prisma.io/)
- [Neon.tech](https://neon.tech/)
- [Recharts](https://recharts.org/)
- [Kakao Maps](https://apis.map.kakao.com/)
