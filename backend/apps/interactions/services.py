from django.db import transaction
from common.exceptions import NotFoundException
from apps.posts.models import Post
from .repositories import LikeRepository, CommentRepository, SavedPostRepository


class InteractionService:

    @staticmethod
    @transaction.atomic
    def toggle_like(user, post_id: str) -> dict:
        post = Post.objects.filter(id=post_id, status='published').select_related('author').first()
        if not post:
            raise NotFoundException('Post topilmadi')

        liked = LikeRepository.toggle(user.id, post_id)

        if liked and str(post.author_id) != str(user.id):
            try:
                from apps.notifications.services import NotificationService
                NotificationService.notify_like(
                    user_id=str(post.author_id),
                    actor=user,
                    post=post,
                )
            except Exception:
                pass

        return {'liked': liked}

    @staticmethod
    @transaction.atomic
    def add_comment(user, post_id: str, text: str, parent_id=None):
        post = Post.objects.filter(id=post_id, status='published').select_related('author').first()
        if not post:
            raise NotFoundException('Post topilmadi')

        if post.is_comments_disabled:
            raise NotFoundException('Izohlar o\'chirilgan')

        comment = CommentRepository.create(user.id, post_id, text, parent_id)

        if str(post.author_id) != str(user.id):
            try:
                from apps.notifications.services import NotificationService
                NotificationService.notify_comment(
                    user_id=str(post.author_id),
                    actor=user,
                    post=post,
                    text=text,
                )
            except Exception:
                pass

        return comment

    @staticmethod
    @transaction.atomic
    def toggle_save(user_id: str, post_id: str) -> dict:
        if not Post.objects.filter(id=post_id, status='published').exists():
            raise NotFoundException('Post topilmadi')
        saved = SavedPostRepository.toggle(user_id, post_id)
        return {'saved': saved}

    @staticmethod
    def delete_comment(comment_id: str, user_id: str) -> bool:
        from common.exceptions import NotFoundException
        deleted = CommentRepository.delete(comment_id, user_id)
        if not deleted:
            raise NotFoundException('Izoh topilmadi yoki ruxsat yo\'q')
        return True
