# CareMap Full Next.js Stack Migration Guide

## Overview

CareMap 프로젝트가 **Django + Next.js 분리 구조**에서 **Full Next.js Stack**으로 마이그레이션되었습니다.

### 변경 사항 요약

| 항목 | Before (Django + Next.js) | After (Full Next.js Stack) |
|------|---------------------------|----------------------------|
| **Backend** | Django 4.2.11 | Next.js 14 API Routes |
| **Database** | SQLite (Django ORM) | PostgreSQL (Prisma ORM) |
| **Authentication** | DRF Token Authentication | NextAuth.js v5 (JWT) |
| **API Structure** | `/api/accounts/*`, `/api/institutions/*` | Same endpoints, different implementation |
| **Deployment** | 2 servers (Django + Next.js) | 1 server (Next.js only) |

---

## 1. Database Migration

### Before: Django Models + SQLite
```python
# backend/accounts/models.py
class User(AbstractUser):
    user_type = models.CharField(...)
    phone_number = models.CharField(...)
```

### After: Prisma Schema + PostgreSQL
```prisma
// frontend/prisma/schema.prisma
model User {
  id           Int      @id @default(autoincrement())
  username     String   @unique
  userType     UserType @default(USER)
  phoneNumber  String?
}
```

### Migration Steps

#### Step 1: PostgreSQL 설정

**Option A: Local PostgreSQL**
```bash
# macOS (Homebrew)
brew install postgresql@14
brew services start postgresql@14
createdb caremap

# .env.local 업데이트
DATABASE_URL="postgresql://localhost:5432/caremap?schema=public"
```

**Option B: Cloud Database (권장)**
- [Neon](https://neon.tech) - Serverless PostgreSQL (무료 플랜)
- [Supabase](https://supabase.com) - PostgreSQL + 추가 기능
- [Railway](https://railway.app) - PostgreSQL 호스팅

```bash
# Neon 예시
DATABASE_URL="postgresql://username:password@ep-xxxx.region.aws.neon.tech/neondb?sslmode=require"
```

#### Step 2: Prisma 마이그레이션

```bash
cd frontend

# Prisma Client 생성
npx prisma generate

# 데이터베이스 마이그레이션 (테이블 생성)
npx prisma migrate dev --name init

# Prisma Studio로 DB 확인
npx prisma studio
```

#### Step 3: 기존 Django 데이터 마이그레이션 (선택)

Django SQLite에서 데이터를 옮기려면:

```bash
# 1. Django에서 데이터 export
cd ../backend
python manage.py dumpdata accounts.User --indent 2 > users.json
python manage.py dumpdata institutions.Institution --indent 2 > institutions.json

# 2. Next.js에서 import (별도 스크립트 필요)
cd ../frontend
# scripts/migrate-data.ts 작성 필요
```

---

## 2. Authentication Migration

### Before: Django REST Framework Token

```typescript
// frontend/lib/api/auth.ts
const response = await fetch('http://localhost:8000/api/accounts/login/', {
  method: 'POST',
  body: JSON.stringify({ username, password }),
})
const { token, user } = await response.json()
localStorage.setItem('auth_token', token)
```

### After: NextAuth.js

```typescript
// frontend/app/login/page.tsx
import { signIn } from 'next-auth/react'

const result = await signIn('credentials', {
  username,
  password,
  redirect: false,
})

// Session automatically managed
```

### Key Changes

1. **No more manual token management**: NextAuth handles JWT tokens automatically
2. **Server-side session access**: `await auth()` in API routes
3. **Client-side session access**: `useSession()` in components
4. **Automatic CSRF protection**: Built-in security

### Session Usage

**Client Component:**
```tsx
'use client'
import { useSession } from 'next-auth/react'

export default function Page() {
  const { data: session, status } = useSession()

  if (status === 'loading') return <div>Loading...</div>
  if (!session) return <div>Please log in</div>

  return <div>Hello {session.user.name}</div>
}
```

**Server Component / API Route:**
```typescript
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()

  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return Response.json({ user: session.user })
}
```

---

## 3. API Routes Migration

### Before: Django Views

```python
# backend/accounts/views.py
@api_view(['POST'])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        token = Token.objects.create(user=user)
        return Response({'token': token.key})
```

### After: Next.js API Routes

```typescript
// frontend/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'

export async function POST(request: NextRequest) {
  const body = await request.json()

  const hashedPassword = await bcrypt.hash(body.password, 10)

  const user = await prisma.user.create({
    data: {
      username: body.username,
      email: body.email,
      password: hashedPassword,
    },
  })

  return NextResponse.json({ user })
}
```

### API Endpoints Mapping

| Endpoint | Before (Django) | After (Next.js) | Status |
|----------|-----------------|-----------------|--------|
| `POST /api/auth/register` | `accounts/views.py` | `app/api/auth/register/route.ts` | ✅ |
| `POST /api/auth/[...nextauth]` | `accounts/views.py` (login) | `app/api/auth/[...nextauth]/route.ts` | ✅ |
| `GET /api/institutions` | `institutions/views.py` | `app/api/institutions/route.ts` | ✅ |
| `GET /api/institutions/[id]` | `institutions/views.py` | `app/api/institutions/[id]/route.ts` | ✅ |
| `POST /api/crawler/start` | N/A | `app/api/crawler/start/route.ts` | ✅ |

---

## 4. Frontend Changes

### Removed Dependencies

더 이상 필요 없는 코드:
- `contexts/AuthContext.tsx` → NextAuth로 대체
- `lib/api/auth.ts` → API Routes 직접 호출
- Django API URL 환경 변수 (`NEXT_PUBLIC_API_URL`)

### Updated Components

**Before:**
```tsx
import { useAuth } from '@/contexts/AuthContext'

const { user, token, login, logout } = useAuth()

if (user.user_type === 'admin') { ... }
```

**After:**
```tsx
import { useSession, signOut } from 'next-auth/react'

const { data: session } = useSession()

if (session?.user.userType === 'ADMIN') { ... }
```

---

## 5. Environment Variables

### .env.local (Frontend)

```bash
# Kakao Maps API
NEXT_PUBLIC_KAKAO_APP_KEY=a63d90809c12a1ab306437407ee04834

# Database (PostgreSQL)
DATABASE_URL="postgresql://username:password@host:5432/caremap?schema=public"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
```

### Generate NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

---

## 6. Deployment Changes

### Before: 2-Server Deployment

```
[Django Backend] → [PostgreSQL]
       ↓
[Next.js Frontend] → fetch("http://backend/api")
```

**Required:**
- Django server (Gunicorn, uWSGI)
- Next.js server (Node.js)
- PostgreSQL database
- CORS configuration

### After: 1-Server Deployment

```
[Next.js App]
  ├── API Routes → [PostgreSQL]
  └── Frontend Pages
```

**Required:**
- Next.js server (Node.js)
- PostgreSQL database

### Recommended Platform: Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel

# Environment variables
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
```

**Database Hosting:**
- Neon (recommended for Vercel)
- Supabase
- Railway

---

## 7. Running the Application

### Before (2 Terminals)

```bash
# Terminal 1: Django
cd backend
source venv/bin/activate
python manage.py runserver

# Terminal 2: Next.js
cd frontend
npm run dev
```

### After (1 Terminal)

```bash
cd frontend

# Install dependencies (if not done)
npm install

# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev

# Open http://localhost:3000
```

---

## 8. Initial Setup Checklist

- [ ] PostgreSQL database created (local or cloud)
- [ ] `DATABASE_URL` set in `.env.local`
- [ ] `NEXTAUTH_SECRET` generated and set
- [ ] `npm install` completed
- [ ] `npx prisma generate` completed
- [ ] `npx prisma migrate dev` completed
- [ ] Admin user created (via Prisma Studio or script)
- [ ] Application runs on `http://localhost:3000`

---

## 9. Creating Admin User

### Option 1: Prisma Studio

```bash
npx prisma studio
```

1. Open `http://localhost:5555`
2. Click "User" model
3. Click "Add record"
4. Fill in fields:
   - username: `Admin`
   - email: `admin@caremap.com`
   - password: `$2b$10$...` (bcrypt hash of `admdnjs!00`)
   - userType: `ADMIN`
5. Save

### Option 2: Seed Script

Create `frontend/prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('admdnjs!00', 10)

  const admin = await prisma.user.upsert({
    where: { username: 'Admin' },
    update: {},
    create: {
      username: 'Admin',
      email: 'admin@caremap.com',
      password: hashedPassword,
      userType: 'ADMIN',
    },
  })

  console.log({ admin })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

Run:
```bash
npx tsx prisma/seed.ts
```

---

## 10. Testing the Migration

### Test Checklist

1. **회원가입**
   - [ ] `/register` 페이지 접속
   - [ ] 새 계정 생성
   - [ ] 자동 로그인 확인

2. **로그인**
   - [ ] `/login` 페이지 접속
   - [ ] Admin 계정 로그인 (`Admin` / `admdnjs!00`)
   - [ ] 세션 유지 확인 (페이지 새로고침)

3. **메인 페이지**
   - [ ] 지도 표시 확인
   - [ ] 사용자 정보 표시 확인
   - [ ] 관리자 메뉴 표시 확인 (Admin만)

4. **크롤러 페이지** (Admin only)
   - [ ] `/crawler` 접속
   - [ ] 권한 체크 확인
   - [ ] UI 표시 확인

5. **API Endpoints**
   ```bash
   # Register
   curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"username":"test","email":"test@test.com","password":"test1234","passwordConfirm":"test1234"}'

   # Institutions (mock data)
   curl http://localhost:3000/api/institutions
   ```

---

## 11. Troubleshooting

### Common Issues

#### Issue 1: `Error: P1001: Can't reach database server`

**Solution:**
- PostgreSQL이 실행 중인지 확인
- `DATABASE_URL`이 올바른지 확인
- 네트워크 연결 확인 (cloud DB)

#### Issue 2: `Module not found: Can't resolve '@prisma/client'`

**Solution:**
```bash
npx prisma generate
```

#### Issue 3: NextAuth session is always null

**Solution:**
- `NEXTAUTH_SECRET` 설정 확인
- `SessionProvider`가 layout에 있는지 확인
- 브라우저 쿠키 삭제 후 재로그인

#### Issue 4: API route returns 401 Unauthorized

**Solution:**
```typescript
// Check if auth() is imported correctly
import { auth } from '@/lib/auth'

const session = await auth()
if (!session) {
  return Response.json({ error: 'Unauthorized' }, { status: 401 })
}
```

---

## 12. Rollback Plan (If Needed)

기존 Django 백엔드로 돌아가려면:

1. **Frontend 변경사항 되돌리기**
   ```bash
   git checkout main -- app/login app/register app/page.tsx
   git checkout main -- lib/api
   git checkout main -- contexts
   ```

2. **Django 서버 재시작**
   ```bash
   cd backend
   python manage.py runserver
   ```

3. **.env.local 복원**
   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   ```

---

## 13. Next Steps

Full Stack 마이그레이션 완료 후:

1. **Crawler 연동**: Python 크롤러 → Next.js API 통합
2. **Real Data**: Mock 데이터 → PostgreSQL 실제 데이터
3. **Institution Detail**: 상세 페이지 구현
4. **Search & Filter**: 검색 및 필터링 기능
5. **Production Deployment**: Vercel 배포

---

## 14. Benefits of Full Next.js Stack

| Before | After | Improvement |
|--------|-------|-------------|
| 2 servers | 1 server | **50% infrastructure reduction** |
| Django + DRF + Next.js | Next.js only | **Simpler stack** |
| CORS issues | No CORS | **Fewer errors** |
| Token management | Automatic JWT | **Better security** |
| 2 deployments | 1 deployment | **Faster deploys** |
| SQLite (dev) | PostgreSQL | **Production-ready** |

---

## Questions?

문제가 발생하면:
1. 이 가이드의 Troubleshooting 섹션 확인
2. Prisma Docs: https://www.prisma.io/docs
3. NextAuth Docs: https://next-auth.js.org
4. GitHub Issues 생성

---

**마이그레이션 완료를 축하합니다!** 🎉
