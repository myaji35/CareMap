# Frontend 디렉토리

> **상위 디렉토리의 내용을 상속받습니다.**

## 개요

Next.js 14 (App Router)를 사용한 프론트엔드 애플리케이션입니다.

## 기술 스택

- **Framework**: Next.js 14.2
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3.4
- **Map SDK**: react-kakao-maps-sdk
- **State Management**: React Context API
- **HTTP Client**: Fetch API

## 디렉토리 구조

```
frontend/
├── app/                      # Next.js App Router 페이지
│   ├── layout.tsx           # 루트 레이아웃 (AuthProvider, Kakao SDK 로드)
│   ├── page.tsx             # 메인 페이지 (지도 + 헤더)
│   ├── login/
│   │   └── page.tsx         # 로그인 페이지
│   ├── register/
│   │   └── page.tsx         # 회원가입 페이지
│   ├── crawler/
│   │   └── page.tsx         # 크롤러 관리 페이지 (관리자 전용)
│   └── globals.css          # Tailwind 전역 스타일
├── components/
│   └── KakaoMap.tsx         # Kakao 지도 컴포넌트 (파이차트 마커)
├── contexts/
│   └── AuthContext.tsx      # 인증 상태 관리 Context
├── lib/
│   ├── api/
│   │   └── auth.ts          # 인증 API 함수들
│   └── mockData.ts          # Mock 기관 데이터
├── types/
│   └── institution.ts       # TypeScript 타입 정의
├── package.json
├── tsconfig.json            # TypeScript 설정 (path alias 포함)
├── tailwind.config.ts
├── next.config.mjs
└── .env.local               # 환경 변수 (Kakao Key, API URL)
```

## 완성된 기능

### 1. 인증 시스템 (app/login, app/register, contexts/AuthContext.tsx)

#### AuthContext (contexts/AuthContext.tsx)
- **기능**: 전역 인증 상태 관리
- **상태**: user, token, isAuthenticated, isAdmin
- **메서드**: login(), logout()
- **저장소**: localStorage (auth_token, auth_user)

```typescript
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}
```

#### 로그인 페이지 (app/login/page.tsx)
- **경로**: /login
- **기능**:
  - 아이디/비밀번호 입력
  - 로그인 API 호출 (POST /api/accounts/login/)
  - 로그인 성공 시 토큰 저장 및 메인 페이지 이동
  - 에러 메시지 표시
  - 테스트 계정 정보 표시 (Admin/admdnjs!00)
- **UI**: 그라디언트 배경, 카드 스타일, 로딩 상태

#### 회원가입 페이지 (app/register/page.tsx)
- **경로**: /register
- **기능**:
  - 아이디, 이메일, 비밀번호, 비밀번호 확인 입력
  - 전화번호, 소속 기관 (선택 사항)
  - 비밀번호 확인 검증
  - 회원가입 API 호출 (POST /api/accounts/register/)
  - 회원가입 성공 시 자동 로그인 및 메인 페이지 이동
- **UI**: 폼 유효성 검사, 에러 메시지, 로딩 상태

### 2. 지도 시각화 (components/KakaoMap.tsx, app/page.tsx)

#### KakaoMap 컴포넌트 (components/KakaoMap.tsx)
- **기능**:
  - Kakao Maps SDK 초기화
  - 기관 위치에 커스텀 파이차트 마커 표시
  - 입소율에 따른 색상 구분:
    - 녹색: 입소율 < 70%
    - 주황: 70% ≤ 입소율 < 90%
    - 빨강: 입소율 ≥ 90%
  - 마커 호버 시 기관 정보 카드 표시
  - 범례 및 기관 수 표시
- **Props**:
  - institutions: Institution[] (기관 목록)
  - onMarkerClick: (id: number) => void (마커 클릭 핸들러)

#### 파이차트 마커 생성 로직
```typescript
function createPieChartMarker(occupancyRate: number): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  // 색상 결정
  const color = occupancyRate >= 90 ? '#EF4444'
              : occupancyRate >= 70 ? '#F97316'
              : '#22C55E';

  // 파이차트 그리기
  ctx.beginPath();
  ctx.arc(20, 20, 18, -Math.PI / 2, (occupancyRate / 100) * 2 * Math.PI - Math.PI / 2);
  ctx.lineTo(20, 20);
  ctx.fillStyle = color;
  ctx.fill();

  // 나머지 부분
  ctx.beginPath();
  ctx.arc(20, 20, 18, (occupancyRate / 100) * 2 * Math.PI - Math.PI / 2, -Math.PI / 2);
  ctx.lineTo(20, 20);
  ctx.fillStyle = '#E5E7EB';
  ctx.fill();

  return canvas.toDataURL();
}
```

#### 메인 페이지 (app/page.tsx)
- **경로**: /
- **기능**:
  - 상단 헤더:
    - CareMap 로고
    - 관리자 로그인 시 "데이터 크롤링" 버튼 표시
    - 로그인 상태 표시 (사용자명, 사용자 유형)
    - 로그아웃 버튼
  - Kakao 지도 표시 (전체 화면)
  - Mock 데이터 (6개 기관) 마커 표시
- **인증 연동**:
  - useAuth() 훅으로 인증 상태 확인
  - 로그인 시 사용자 정보 표시
  - 로그아웃 시 API 호출 후 Context 상태 초기화

### 3. 크롤러 관리 페이지 (app/crawler/page.tsx)

#### 크롤러 페이지
- **경로**: /crawler
- **권한**: 관리자 전용 (user_type === 'admin')
- **기능**:
  - 관리자 권한 체크 (비관리자는 메인 페이지로 리다이렉트)
  - 크롤링 시작 버튼
  - 실시간 로그 출력 (info/success/error/warning)
  - 통계 카드 (총 처리, 성공, 업데이트, 실패)
  - 크롤링 상태 표시 (실행 중/대기)
- **UI**:
  - 4개 통계 카드 (그리드 레이아웃)
  - 로그 출력 영역 (최대 높이 96, 스크롤)
  - 색상별 로그 구분 (파란색/녹색/빨강/노랑)
- **TODO**: 실제 크롤러 API 엔드포인트 연동 필요

### 4. API 함수 (lib/api/auth.ts)

#### 구현된 API 함수
```typescript
// 로그인
async function login(data: LoginData): Promise<AuthResponse>
// POST /api/accounts/login/

// 회원가입
async function register(data: RegisterData): Promise<AuthResponse>
// POST /api/accounts/register/

// 로그아웃
async function logout(token: string): Promise<void>
// POST /api/accounts/logout/

// 프로필 조회
async function getProfile(token: string): Promise<User>
// GET /api/accounts/profile/
```

#### API Base URL
- 환경 변수: `NEXT_PUBLIC_API_URL`
- 기본값: http://localhost:8000/api

### 5. Mock 데이터 (lib/mockData.ts)

6개 샘플 기관 데이터:
1. 서울 행복요양원 (37.5665, 126.9780) - 입소율 85%
2. 경기 사랑요양센터 (37.2911, 127.0089) - 입소율 92%
3. 인천 평화요양원 (37.4563, 126.7052) - 입소율 68%
4. 부산 희망요양센터 (35.1796, 129.0756) - 입소율 76%
5. 대전 건강요양원 (36.3504, 127.3845) - 입소율 88%
6. 광주 미래요양센터 (35.1595, 126.8526) - 입소율 95%

## 환경 변수

### .env.local
```
NEXT_PUBLIC_KAKAO_APP_KEY=837719
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## 실행 방법

```bash
# 패키지 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build
npm start
```

## TypeScript 설정

### tsconfig.json
- **Path Alias**: `@/*` → `./*`
- 컴파일러 옵션: strict mode, ES2020, moduleResolution: bundler

## Tailwind CSS 설정

### 주요 유틸리티 클래스
- 색상: blue-600, green-600, red-500, gray-800 등
- 레이아웃: flex, grid, absolute, relative, z-20
- 간격: px-4, py-3, gap-4, mb-8
- 반응형: md:grid-cols-4, md:text-lg
- 효과: shadow-md, hover:bg-blue-700, transition

## 페이지 라우팅

| 경로 | 컴포넌트 | 권한 | 설명 |
|------|---------|------|------|
| `/` | app/page.tsx | 전체 | 메인 페이지 (지도) |
| `/login` | app/login/page.tsx | 비로그인 | 로그인 페이지 |
| `/register` | app/register/page.tsx | 비로그인 | 회원가입 페이지 |
| `/crawler` | app/crawler/page.tsx | 관리자 | 크롤러 관리 페이지 |

## 다음 개발 단계

### 진행 예정 작업
1. **Backend API 연동**:
   - Mock 데이터 대신 실제 기관 API 호출
   - GET /api/institutions/ 엔드포인트 연동
2. **크롤러 API 연동**:
   - POST /api/crawler/start 엔드포인트 구현
   - WebSocket 또는 Server-Sent Events로 실시간 로그 전송
3. **기관 상세 페이지**:
   - /institution/[id] 라우트 추가
   - 기관 상세 정보 및 이력 차트 표시
4. **검색 및 필터링**:
   - 검색 바 컴포넌트 추가
   - 서비스 유형, 지역별 필터링

### 개선 사항
- 로딩 스피너 컴포넌트 공통화
- 에러 핸들링 개선 (Toast 알림)
- 반응형 디자인 개선 (모바일)
- 접근성 향상 (ARIA 레이블)

## 참고 사항

- Kakao Maps SDK는 beforeInteractive 전략으로 로드됩니다 (app/layout.tsx)
- AuthContext는 모든 페이지에서 사용 가능합니다 (Provider로 감싸짐)
- 인증 토큰은 localStorage에 저장되며, 새로고침 시에도 유지됩니다
- 관리자 전용 메뉴는 user_type === 'admin' 조건으로 표시됩니다
