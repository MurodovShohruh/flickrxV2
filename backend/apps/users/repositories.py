from django.db.models import Q, Exists, OuterRef
from .models import User, Follow


class UserRepository:
    """User uchun barcha DB so'rovlar."""

    @staticmethod
    def get_by_id(user_id: str) -> User | None:
        return User.objects.filter(id=user_id, is_active=True).first()

    @staticmethod
    def get_by_email(email: str) -> User | None:
        return User.objects.filter(email__iexact=email, is_active=True).first()

    @staticmethod
    def get_by_username(username: str) -> User | None:
        return User.objects.filter(username__iexact=username, is_active=True).first()

    @staticmethod
    def exists_email(email: str) -> bool:
        return User.objects.filter(email__iexact=email).exists()

    @staticmethod
    def exists_username(username: str, exclude_id=None) -> bool:
        qs = User.objects.filter(username__iexact=username)
        if exclude_id:
            qs = qs.exclude(id=exclude_id)
        return qs.exists()

    @staticmethod
    def search(query: str, limit: int = 20):
        return User.objects.filter(
            Q(username__icontains=query) | Q(full_name__icontains=query),
            is_active=True
        ).order_by('-followers_count')[:limit]

    @staticmethod
    def get_with_follow_status(username: str, current_user_id=None) -> User | None:
        qs = User.objects.filter(username__iexact=username, is_active=True)
        if current_user_id:
            qs = qs.annotate(
                is_following=Exists(
                    Follow.objects.filter(
                        follower_id=current_user_id,
                        following=OuterRef('pk')
                    )
                )
            )
        return qs.first()


class FollowRepository:
    """Follow uchun DB so'rovlar."""

    @staticmethod
    def get(follower_id, following_id) -> Follow | None:
        return Follow.objects.filter(
            follower_id=follower_id,
            following_id=following_id
        ).first()

    @staticmethod
    def create(follower_id, following_id) -> Follow:
        return Follow.objects.create(
            follower_id=follower_id,
            following_id=following_id
        )

    @staticmethod
    def delete(follower_id, following_id) -> bool:
        deleted, _ = Follow.objects.filter(
            follower_id=follower_id,
            following_id=following_id
        ).delete()
        return deleted > 0

    @staticmethod
    def get_followers(user_id, limit=20, offset=0):
        return User.objects.filter(
            following_set__following_id=user_id,
            is_active=True
        )[offset:offset + limit]

    @staticmethod
    def get_following(user_id, limit=20, offset=0):
        return User.objects.filter(
            followers_set__follower_id=user_id,
            is_active=True
        )[offset:offset + limit]
