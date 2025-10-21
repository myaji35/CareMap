from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'user_type', 'organization', 'is_active', 'created_at')
    list_filter = ('user_type', 'is_active', 'is_staff')
    search_fields = ('username', 'email', 'organization')

    fieldsets = BaseUserAdmin.fieldsets + (
        ('추가 정보', {'fields': ('user_type', 'phone_number', 'organization')}),
    )

    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('추가 정보', {'fields': ('user_type', 'phone_number', 'organization')}),
    )
