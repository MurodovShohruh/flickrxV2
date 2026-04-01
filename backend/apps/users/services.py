from django.db import transaction
from django.db.models import F
from common.exceptions import (
    ServiceException, NotFoundException,
    ConflictException, PermissionDeniedException
)
from .models import User, Follow
from .repositories import UserRepository, FollowRepository


class AuthService:

    @staticmethod
    @transaction.atomic
    def register(username: str, email: str, password: str, full_name: str = '') -> User:
        if UserRepository.exists_email(email):
            raise ConflictException('Bu email allaqachon ro\'yxatdan o\'tgan')
        if UserRepository.exists_username(username):
            raise ConflictException('Bu username band')
        return User.objects.create_user(
            email=email,
            username=username,
            password=password,
            full_name=full_name,
        )

    @staticmethod
    def authenticate(email: str, password: str) -> User:
        user = UserRepository.get_by_email(email)
        if not user:
            raise ServiceException('Email yoki parol noto\'g\'ri')
        if not user.check_password(password):
            raise ServiceException('Email yoki parol noto\'g\'ri')
        if not user.is_active:
            raise PermissionDeniedException('Hisob bloklangan')
        return user


class UserService:

    @staticmethod
    @transaction.atomic
    def update_profile(user: User, **kwargs) -> User:
        username = kwargs.get('username')
        if username and username.lower() != user.username.lower():
            if UserRepository.exists_username(username, exclude_id=user.id):
                raise ConflictException('Bu username band')

        allowed = ['username', 'full_name', 'bio', 'phone', 'website']
        for field in allowed:
            if field in kwargs and kwargs[field] is not None:
                val = kwargs[field].lower() if field == 'username' else kwargs[field]
                setattr(user, field, val)
        user.save()
        return user

    @staticmethod
    def update_avatar(user: User, image_file) -> User:
        if user.profile_image:
            user.profile_image.delete(save=False)
        user.profile_image = image_file
        user.save(update_fields=['profile_image', 'updated_at'])
        return user

    @staticmethod
    def get_profile(username: str, current_user_id=None) -> User:
        user = UserRepository.get_with_follow_status(username, current_user_id)
        if not user:
            raise NotFoundException(f'@{username} topilmadi')
        return user


class FollowService:

    @staticmethod
    @transaction.atomic
    def follow(follower_id: str, following_id: str) -> dict:
        if str(follower_id) == str(following_id):
            raise ServiceException('O\'zingizni follow qila olmaysiz')

        following_user = UserRepository.get_by_id(following_id)
        if not following_user:
            raise NotFoundException('Foydalanuvchi topilmadi')

        if FollowRepository.get(follower_id, following_id):
            raise ConflictException('Allaqachon follow qilgansiz')

        FollowRepository.create(follower_id, following_id)

        User.objects.filter(id=follower_id).update(following_count=F('following_count') + 1)
        User.objects.filter(id=following_id).update(followers_count=F('followers_count') + 1)

        # Bildirishnoma
        try:
            from apps.notifications.services import NotificationService
            follower = UserRepository.get_by_id(follower_id)
            if follower:
                NotificationService.notify_follow(user_id=following_id, actor=follower)
        except Exception:
            pass

        return {'following': True}

    @staticmethod
    @transaction.atomic
    def unfollow(follower_id: str, following_id: str) -> dict:
        deleted = FollowRepository.delete(follower_id, following_id)
        if not deleted:
            raise NotFoundException('Follow topilmadi')

        User.objects.filter(id=follower_id).update(following_count=F('following_count') - 1)
        User.objects.filter(id=following_id).update(followers_count=F('followers_count') - 1)

        return {'following': False}
