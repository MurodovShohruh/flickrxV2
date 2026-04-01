from django.db.models import Q, F, Exists, OuterRef
from django.contrib.auth import get_user_model
from .models import Post

User = get_user_model()


class PostRepository:
    """Post uchun barcha DB so'rovlar."""

    @staticmethod
    def get_by_id(post_id: str, current_user_id=None) -> Post | None:
        qs = Post.objects.filter(
            id=post_id, status=Post.STATUS_PUBLISHED
        ).select_related('author')

        if current_user_id:
            from apps.interactions.models import Like, SavedPost
            qs = qs.annotate(
                is_liked=Exists(Like.objects.filter(user_id=current_user_id, post=OuterRef('pk'))),
                is_saved=Exists(SavedPost.objects.filter(user_id=current_user_id, post=OuterRef('pk'))),
            )
        return qs.first()

    @staticmethod
    def get_feed(user_id: str, following_ids: list, page=1, page_size=20):
        """Home feed: following + o'z postlari."""
        offset = (page - 1) * page_size
        from apps.interactions.models import Like, SavedPost
        return Post.objects.filter(
            Q(author_id__in=following_ids) | Q(author_id=user_id),
            status=Post.STATUS_PUBLISHED
        ).select_related('author').annotate(
            is_liked=Exists(Like.objects.filter(user_id=user_id, post=OuterRef('pk'))),
            is_saved=Exists(SavedPost.objects.filter(user_id=user_id, post=OuterRef('pk'))),
        ).order_by('-created_at')[offset:offset + page_size]

    @staticmethod
    def get_trending(page=1, page_size=20):
        """Trending: likes + views asosida."""
        offset = (page - 1) * page_size
        return Post.objects.filter(
            status=Post.STATUS_PUBLISHED
        ).select_related('author').order_by(
            F('likes_count').desc(), F('views_count').desc()
        )[offset:offset + page_size]

    @staticmethod
    def get_user_posts(username: str, page=1, page_size=20):
        offset = (page - 1) * page_size
        return Post.objects.filter(
            author__username__iexact=username,
            status=Post.STATUS_PUBLISHED
        ).select_related('author')[offset:offset + page_size]

    @staticmethod
    def search(query: str, page=1, page_size=20):
        """Hashtag yoki caption bo'yicha qidirish."""
        offset = (page - 1) * page_size
        term = query.lstrip('#').lower()
        return Post.objects.filter(
            Q(caption__icontains=term) | Q(hashtags__contains=[term]),
            status=Post.STATUS_PUBLISHED
        ).select_related('author').order_by('-created_at')[offset:offset + page_size]

    @staticmethod
    def increment_views(post_id: str):
        Post.objects.filter(id=post_id).update(views_count=F('views_count') + 1)
