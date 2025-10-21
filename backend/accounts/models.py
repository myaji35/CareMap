from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom User Model
    """
    USER_TYPE_CHOICES = (
        ('admin', '시스템 관리자'),
        ('manager', '기관 관리자'),
        ('user', '일반 사용자'),
    )

    user_type = models.CharField(
        max_length=20,
        choices=USER_TYPE_CHOICES,
        default='user',
        verbose_name='사용자 유형'
    )
    phone_number = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        verbose_name='전화번호'
    )
    organization = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name='소속 기관'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='가입일')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='수정일')

    class Meta:
        verbose_name = '사용자'
        verbose_name_plural = '사용자 목록'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.username} ({self.get_user_type_display()})"

    @property
    def is_admin(self):
        return self.user_type == 'admin' or self.is_superuser

    @property
    def is_manager(self):
        return self.user_type == 'manager'
