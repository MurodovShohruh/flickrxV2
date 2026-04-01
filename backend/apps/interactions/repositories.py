from django.db.models import F
from .models import Like, Comment, SavedPost


class LikeRepository:
    @staticmethod
    def toggle(user_id, post_id) -> bool:
        """True = like qo'shildi, False = olib tashlandi."""
        like = Like.objects.filter(user_id=user_id, post_id=post_id).first()
        if like:
            like.delete()
            from apps.posts.models import Post
            Post.objects.filter(id=post_id).update(likes_count=F('likes_count') - 1)
            return False
        else:
            Like.objects.create(user_id=user_id, post_id=post_id)
            from apps.posts.models import Post
            Post.objects.filter(id=post_id).update(likes_count=F('likes_count') + 1)
            return True

    @staticmethod
    def is_liked(user_id, post_id) -> bool:
        return Like.objects.filter(user_id=user_id, post_id=post_id).exists()


class CommentRepository:
    @staticmethod
    def get_for_post(post_id, page=1, page_size=20):
        offset = (page - 1) * page_size
        return Comment.objects.filter(
            post_id=post_id, parent=None
        ).select_related('user').order_by('-created_at')[offset:offset + page_size]

    @staticmethod
    def create(user_id, post_id, text, parent_id=None) -> Comment:
        comment = Comment.objects.create(
            user_id=user_id,
            post_id=post_id,
            text=text,
            parent_id=parent_id,
        )
        from apps.posts.models import Post
        Post.objects.filter(id=post_id).update(comments_count=F('comments_count') + 1)
        return comment

    @staticmethod
    def delete(comment_id, user_id) -> bool:
        comment = Comment.objects.filter(id=comment_id, user_id=user_id).first()
        if not comment:
            return False
        post_id = comment.post_id
        comment.delete()
        from apps.posts.models import Post
        Post.objects.filter(id=post_id).update(comments_count=F('comments_count') - 1)
        return True


class SavedPostRepository:
    @staticmethod
    def toggle(user_id, post_id) -> bool:
        saved = SavedPost.objects.filter(user_id=user_id, post_id=post_id).first()
        if saved:
            saved.delete()
            from apps.posts.models import Post
            Post.objects.filter(id=post_id).update(saves_count=F('saves_count') - 1)
            return False
        else:
            SavedPost.objects.create(user_id=user_id, post_id=post_id)
            from apps.posts.models import Post
            Post.objects.filter(id=post_id).update(saves_count=F('saves_count') + 1)
            return True

    @staticmethod
    def get_saved_posts(user_id, page=1, page_size=20):
        from apps.posts.models import Post
        offset = (page - 1) * page_size
        return Post.objects.filter(
            saves__user_id=user_id, status='published'
        ).select_related('author')[offset:offset + page_size]
