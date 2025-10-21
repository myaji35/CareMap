from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from django.contrib.auth import login, logout
from .models import User
from .serializers import (
    UserSerializer,
    RegisterSerializer,
    LoginSerializer,
    ChangePasswordSerializer
)


class RegisterView(generics.CreateAPIView):
    """회원가입 API"""
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Token 생성
        token, _ = Token.objects.get_or_create(user=user)

        return Response({
            'user': UserSerializer(user).data,
            'token': token.key,
            'message': '회원가입이 완료되었습니다.'
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    """로그인 API"""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data['user']
        login(request, user)

        # Token 생성 또는 가져오기
        token, _ = Token.objects.get_or_create(user=user)

        return Response({
            'user': UserSerializer(user).data,
            'token': token.key,
            'message': '로그인되었습니다.'
        })


class LogoutView(APIView):
    """로그아웃 API"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        # Token 삭제
        try:
            request.user.auth_token.delete()
        except Exception:
            pass

        logout(request)

        return Response({
            'message': '로그아웃되었습니다.'
        })


class UserProfileView(generics.RetrieveUpdateAPIView):
    """사용자 프로필 조회/수정 API"""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):
    """비밀번호 변경 API"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user

        # 기존 비밀번호 확인
        if not user.check_password(serializer.validated_data['old_password']):
            return Response({
                'error': '기존 비밀번호가 올바르지 않습니다.'
            }, status=status.HTTP_400_BAD_REQUEST)

        # 새 비밀번호 설정
        user.set_password(serializer.validated_data['new_password'])
        user.save()

        return Response({
            'message': '비밀번호가 변경되었습니다.'
        })


class UserListView(generics.ListAPIView):
    """사용자 목록 조회 API (관리자 전용)"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]
