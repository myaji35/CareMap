# Backend 디렉토리

> **상위 디렉토리의 내용을 상속받습니다.**

## 개요

Django 4.2.11 기반의 REST API 백엔드 서버입니다.

## 기술 스택

- **Framework**: Django 4.2.11
- **API**: Django REST Framework 3.14
- **Database**: SQLite (개발), PostgreSQL (프로덕션 예정)
- **Authentication**: Token-based (DRF authtoken)
- **CORS**: django-cors-headers

## 디렉토리 구조

```
backend/
├── caremap/                  # 프로젝트 설정
│   ├── settings.py          # Django 설정 (DB, 앱, CORS, DRF)
│   ├── urls.py              # 메인 URL 설정
│   ├── wsgi.py
│   └── asgi.py
├── accounts/                 # 인증 앱
│   ├── models.py            # Custom User 모델
│   ├── serializers.py       # DRF Serializers
│   ├── views.py             # API Views
│   ├── urls.py              # API URL 라우팅
│   ├── admin.py             # Django Admin 설정
│   ├── apps.py
│   └── migrations/          # DB 마이그레이션
├── institutions/             # 기관 관리 앱 (예정)
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   ├── urls.py
│   └── migrations/
├── create_admin.py          # 관리자 계정 생성 스크립트
├── manage.py
├── requirements.txt         # Python 패키지 목록
├── db.sqlite3               # SQLite 데이터베이스
└── venv/                    # 가상환경
```

## 완성된 기능

### 1. Custom User 모델 (accounts/models.py)

#### User 모델
```python
class User(AbstractUser):
    USER_TYPE_CHOICES = (
        ('admin', '시스템 관리자'),
        ('manager', '기관 관리자'),
        ('user', '일반 사용자'),
    )
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES, default='user')
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    organization = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def is_admin(self):
        return self.user_type == 'admin' or self.is_superuser
```

**필드 설명**:
- `user_type`: 사용자 등급 (admin/manager/user)
- `phone_number`: 전화번호 (선택)
- `organization`: 소속 기관 (선택)
- `created_at`: 생성 일시
- `updated_at`: 수정 일시

**상속**: Django의 `AbstractUser`를 확장하여 기본 필드 (username, email, password 등) 포함

### 2. Serializers (accounts/serializers.py)

#### UserSerializer
- User 모델을 JSON으로 직렬화
- 필드: id, username, email, user_type, phone_number, organization, created_at

#### RegisterSerializer
- 회원가입용 Serializer
- 비밀번호 확인 검증
- password는 write_only (응답에 포함 안 됨)
- create() 메서드로 User 생성 및 Token 발급

#### LoginSerializer
- 로그인용 Serializer
- username/password 검증
- authenticate() 함수로 인증

#### ChangePasswordSerializer
- 비밀번호 변경용 Serializer
- 기존 비밀번호 확인
- 새 비밀번호/확인 검증

### 3. API Views (accounts/views.py)

#### RegisterView (POST /api/accounts/register/)
- 회원가입 처리
- RegisterSerializer로 유효성 검사
- User 생성 및 Token 발급
- 응답: user 정보 + token

#### LoginView (POST /api/accounts/login/)
- 로그인 처리
- LoginSerializer로 인증
- Token 발급 (기존 토큰 있으면 삭제 후 재발급)
- 응답: user 정보 + token

#### LogoutView (POST /api/accounts/logout/)
- 로그아웃 처리
- 인증 필요 (IsAuthenticated)
- Token 삭제

#### UserProfileView (GET/PUT /api/accounts/profile/)
- GET: 현재 사용자 프로필 조회
- PUT: 프로필 수정 (username, email, phone_number, organization 등)
- 인증 필요 (IsAuthenticated)

#### ChangePasswordView (POST /api/accounts/change-password/)
- 비밀번호 변경
- 기존 비밀번호 확인
- 인증 필요 (IsAuthenticated)

#### UserListView (GET /api/accounts/users/)
- 전체 사용자 목록 조회
- 관리자 전용 (is_admin 체크)
- 검색 가능 (username, email)

### 4. URL 라우팅

#### accounts/urls.py
```python
urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('users/', UserListView.as_view(), name='user-list'),
]
```

#### caremap/urls.py
```python
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/accounts/', include('accounts.urls')),
    path('api/institutions/', include('institutions.urls')),  # 예정
]
```

### 5. Django 설정 (caremap/settings.py)

#### INSTALLED_APPS
```python
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',
    'accounts',
    'institutions',
]
```

#### REST_FRAMEWORK 설정
```python
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
}
```

#### CORS 설정
```python
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
]
CORS_ALLOW_CREDENTIALS = True
```

#### Custom User 모델 설정
```python
AUTH_USER_MODEL = 'accounts.User'
```

#### 언어 및 시간대
```python
LANGUAGE_CODE = 'ko-kr'
TIME_ZONE = 'Asia/Seoul'
USE_I18N = True
USE_TZ = True
```

### 6. Django Admin (accounts/admin.py)

#### UserAdmin
- Django Admin에 User 모델 등록
- list_display: username, email, user_type, organization, is_active, created_at
- list_filter: user_type, is_active, is_staff
- search_fields: username, email, organization
- fieldsets에 '추가 정보' 섹션 추가 (user_type, phone_number, organization)

### 7. 관리자 생성 스크립트 (create_admin.py)

```python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'caremap.settings')
django.setup()

from accounts.models import User

# 기존 Admin 계정 확인
if User.objects.filter(username='Admin').exists():
    print('Admin 계정이 이미 존재합니다.')
else:
    admin_user = User.objects.create_superuser(
        username='Admin',
        email='admin@caremap.com',
        password='admdnjs!00',
        user_type='admin'
    )
    print('Admin 계정이 생성되었습니다.')
    print(f'Username: {admin_user.username}')
    print(f'Email: {admin_user.email}')
    print(f'User Type: {admin_user.user_type}')
```

**실행 방법**: `python create_admin.py`

## API 엔드포인트

### 인증 API

| 메서드 | 엔드포인트 | 인증 | 설명 |
|--------|-----------|------|------|
| POST | /api/accounts/register/ | 불필요 | 회원가입 |
| POST | /api/accounts/login/ | 불필요 | 로그인 |
| POST | /api/accounts/logout/ | 필요 | 로그아웃 |
| GET | /api/accounts/profile/ | 필요 | 프로필 조회 |
| PUT | /api/accounts/profile/ | 필요 | 프로필 수정 |
| POST | /api/accounts/change-password/ | 필요 | 비밀번호 변경 |
| GET | /api/accounts/users/ | 관리자 | 사용자 목록 |

### 요청/응답 예시

#### 회원가입
```bash
POST /api/accounts/register/
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "testpass123",
  "password_confirm": "testpass123",
  "phone_number": "010-1234-5678",
  "organization": "테스트 요양원"
}

# 응답
{
  "user": {
    "id": 2,
    "username": "testuser",
    "email": "test@example.com",
    "user_type": "user",
    "phone_number": "010-1234-5678",
    "organization": "테스트 요양원",
    "created_at": "2025-10-20T12:00:00Z"
  },
  "token": "a1b2c3d4e5f6...",
  "message": "회원가입이 완료되었습니다."
}
```

#### 로그인
```bash
POST /api/accounts/login/
Content-Type: application/json

{
  "username": "Admin",
  "password": "admdnjs!00"
}

# 응답
{
  "user": {
    "id": 1,
    "username": "Admin",
    "email": "admin@caremap.com",
    "user_type": "admin",
    "phone_number": null,
    "organization": null,
    "created_at": "2025-10-20T10:00:00Z"
  },
  "token": "a1b2c3d4e5f6...",
  "message": "로그인되었습니다."
}
```

#### 프로필 조회
```bash
GET /api/accounts/profile/
Authorization: Token a1b2c3d4e5f6...

# 응답
{
  "id": 1,
  "username": "Admin",
  "email": "admin@caremap.com",
  "user_type": "admin",
  "phone_number": null,
  "organization": null,
  "created_at": "2025-10-20T10:00:00Z"
}
```

## 데이터베이스

### 현재 사용 중
- **SQLite**: db.sqlite3 (개발 환경)

### 마이그레이션 적용 상태
- accounts 앱: Custom User 모델 마이그레이션 완료
- institutions 앱: 모델 미구현

### 마이그레이션 명령어
```bash
# 마이그레이션 파일 생성
python manage.py makemigrations

# 마이그레이션 적용
python manage.py migrate

# 특정 앱만 마이그레이션
python manage.py makemigrations accounts
python manage.py migrate accounts
```

## 실행 방법

### 1. 가상환경 설정
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

### 2. 패키지 설치
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### 3. 데이터베이스 마이그레이션
```bash
python manage.py makemigrations
python manage.py migrate
```

### 4. 관리자 계정 생성
```bash
python create_admin.py
```

### 5. 서버 실행
```bash
python manage.py runserver
# http://localhost:8000 에서 실행
```

## requirements.txt

```
Django==4.2.11
djangorestframework==3.14.0
django-cors-headers==4.3.1
psycopg2-binary==2.9.9
```

## 다음 개발 단계

### 진행 예정 작업
1. **institutions 앱 구현**:
   - Institution 모델 (id, name, service_type, capacity, current_headcount, address, latitude, longitude 등)
   - InstitutionHistory 모델 (변경 이력)
   - CRUD API (List, Retrieve, Create, Update, Delete)
   - Serializers 및 ViewSets 구현
2. **크롤러 API 엔드포인트**:
   - POST /api/crawler/start - 크롤링 시작
   - GET /api/crawler/status - 크롤링 상태 조회
   - GET /api/crawler/logs - 로그 조회
3. **PostgreSQL 마이그레이션**:
   - settings.py DATABASE 설정 변경
   - 데이터 마이그레이션

### 개선 사항
- JWT 인증 도입 고려 (Token 만료 기능)
- API 문서 자동 생성 (drf-spectacular)
- 페이지네이션 추가
- 필터링 및 검색 기능 강화
- 테스트 코드 작성

## 참고 사항

- Custom User 모델은 프로젝트 초기에 설정되어야 합니다 (마이그레이션 전)
- Token 인증은 HTTP Authorization 헤더에 `Token {token}` 형식으로 전송됩니다
- CORS는 localhost:3000 (프론트엔드)만 허용되도록 설정되어 있습니다
- 관리자 권한 확인은 `user.is_admin` 속성으로 체크합니다
