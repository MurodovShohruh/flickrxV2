from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework import status
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample
from common.mixins import SuccessResponseMixin
from apps.users.services import AuthService, UserService, FollowService
from apps.users.repositories import UserRepository, FollowRepository
from .serializers import (
    RegisterSerializer, LoginSerializer, UpdateProfileSerializer,
    UserPublicSerializer, UserMeSerializer, TokenResponseSerializer,
)


@extend_schema(tags=['Auth'])
class RegisterView(SuccessResponseMixin, APIView):
    permission_classes = [AllowAny]
    throttle_scope = 'auth'

    @extend_schema(
        summary="Ro'yxatdan o'tish",
        description="Yangi foydalanuvchi yaratish. Access va refresh token qaytaradi.",
        request=RegisterSerializer,
        responses={201: TokenResponseSerializer},
        examples=[OpenApiExample('Misol', value={
            'username': 'shoxrux', 'email': 'shoxrux@gmail.com',
            'password': 'parol1234', 'confirm_password': 'parol1234', 'full_name': 'Shoxrux Murodov'
        })]
    )
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        user = AuthService.register(
            username=data['username'], email=data['email'],
            password=data['password'], full_name=data.get('full_name', ''),
        )
        refresh = RefreshToken.for_user(user)
        return self.created({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserMeSerializer(user, context={'request': request}).data,
        })


@extend_schema(tags=['Auth'])
class LoginView(SuccessResponseMixin, APIView):
    permission_classes = [AllowAny]
    throttle_scope = 'auth'

    @extend_schema(
        summary="Kirish",
        description="Email va parol bilan kirish. JWT tokenlar qaytaradi.",
        request=LoginSerializer,
        responses={200: TokenResponseSerializer},
    )
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        user = AuthService.authenticate(data['email'], data['password'])
        refresh = RefreshToken.for_user(user)
        return self.success({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserMeSerializer(user, context={'request': request}).data,
        })


@extend_schema(tags=['Auth'])
class LogoutView(SuccessResponseMixin, APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Chiqish",
        description="Refresh tokenni blacklistga qo'shadi.",
        request={'application/json': {'type': 'object', 'properties': {'refresh': {'type': 'string'}}}},
        responses={200: None},
    )
    def post(self, request):
        try:
            token = RefreshToken(request.data.get('refresh'))
            token.blacklist()
        except (TokenError, KeyError):
            pass
        return self.success(message='Muvaffaqiyatli chiqildi')


@extend_schema(tags=['Users'])
class MeView(SuccessResponseMixin, APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(summary="O'z profili", responses={200: UserMeSerializer})
    def get(self, request):
        return self.success(UserMeSerializer(request.user, context={'request': request}).data)

    @extend_schema(summary="Profilni yangilash", request=UpdateProfileSerializer, responses={200: UserMeSerializer})
    def put(self, request):
        serializer = UpdateProfileSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        user = UserService.update_profile(request.user, **serializer.validated_data)
        return self.success(UserMeSerializer(user, context={'request': request}).data, message='Profil yangilandi')


@extend_schema(tags=['Users'])
class AvatarView(SuccessResponseMixin, APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Profil rasmini yangilash",
        request={'multipart/form-data': {'type': 'object', 'properties': {'file': {'type': 'string', 'format': 'binary'}}}},
        responses={200: UserMeSerializer},
    )
    def post(self, request):
        file = request.FILES.get('file')
        if not file:
            return Response({'error': 'Fayl yuborilmadi'}, status=400)
        user = UserService.update_avatar(request.user, file)
        return self.success(UserMeSerializer(user, context={'request': request}).data, message='Rasm yangilandi')


@extend_schema(tags=['Users'])
class ProfileView(SuccessResponseMixin, APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        summary="Foydalanuvchi profilini ko'rish",
        parameters=[OpenApiParameter('username', str, OpenApiParameter.PATH, description='Foydalanuvchi nomi')],
        responses={200: UserPublicSerializer},
    )
    def get(self, request, username):
        current_id = str(request.user.id) if request.user.is_authenticated else None
        user = UserService.get_profile(username, current_id)
        return self.success(UserPublicSerializer(user, context={'request': request}).data)


@extend_schema(tags=['Users'])
class FollowView(SuccessResponseMixin, APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(summary="Follow qilish")
    def post(self, request, user_id):
        result = FollowService.follow(follower_id=str(request.user.id), following_id=str(user_id))
        return self.success(result, message='Follow qilindi')

    @extend_schema(summary="Unfollow qilish")
    def delete(self, request, user_id):
        result = FollowService.unfollow(follower_id=str(request.user.id), following_id=str(user_id))
        return self.success(result, message='Unfollow qilindi')


@extend_schema(tags=['Users'])
class FollowersView(SuccessResponseMixin, APIView):
    permission_classes = [AllowAny]

    @extend_schema(summary="Followerlar ro'yxati", responses={200: UserPublicSerializer(many=True)})
    def get(self, request, user_id):
        users = FollowRepository.get_followers(str(user_id))
        return self.success(UserPublicSerializer(users, many=True, context={'request': request}).data)


@extend_schema(tags=['Users'])
class FollowingView(SuccessResponseMixin, APIView):
    permission_classes = [AllowAny]

    @extend_schema(summary="Following ro'yxati", responses={200: UserPublicSerializer(many=True)})
    def get(self, request, user_id):
        users = FollowRepository.get_following(str(user_id))
        return self.success(UserPublicSerializer(users, many=True, context={'request': request}).data)


@extend_schema(tags=['Users'])
class SearchUsersView(SuccessResponseMixin, APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        summary="Foydalanuvchi qidirish",
        parameters=[OpenApiParameter('q', str, OpenApiParameter.QUERY, description='Qidiruv so\'zi')],
        responses={200: UserPublicSerializer(many=True)},
    )
    def get(self, request):
        q = request.query_params.get('q', '').strip()
        if not q:
            return self.success([])
        users = UserRepository.search(q)
        return self.success(UserPublicSerializer(users, many=True, context={'request': request}).data)
