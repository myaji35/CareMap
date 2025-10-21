#!/usr/bin/env python
"""
Admin 계정 생성 스크립트
Username: Admin
Password: admdnjs!00
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'caremap.settings')
django.setup()

from accounts.models import User

# 기존 Admin 계정 확인
if User.objects.filter(username='Admin').exists():
    print("⚠️  'Admin' 계정이 이미 존재합니다.")
    admin_user = User.objects.get(username='Admin')
else:
    # Admin 계정 생성
    admin_user = User.objects.create_superuser(
        username='Admin',
        email='admin@caremap.com',
        password='admdnjs!00',
        user_type='admin'
    )
    print("✅ Admin 계정이 생성되었습니다!")

print("\n" + "="*50)
print("시스템 관리자 계정 정보")
print("="*50)
print(f"Username: Admin")
print(f"Password: admdnjs!00")
print(f"Email: {admin_user.email}")
print(f"User Type: {admin_user.get_user_type_display()}")
print(f"Is Superuser: {admin_user.is_superuser}")
print(f"Is Staff: {admin_user.is_staff}")
print("="*50)
print("\n✨ Django Admin: http://localhost:8000/admin/")
print("✨ API Login: http://localhost:8000/api/accounts/login/")
