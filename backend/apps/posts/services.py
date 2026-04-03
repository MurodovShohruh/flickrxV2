from django.db import transaction
from django.db.models import F
from common.exceptions import NotFoundException, PermissionDeniedException
from common.utils import generate_video_thumbnail, get_video_duration, parse_hashtags
from .models import Post
from .repositories import PostRepository


class PostService:

    @staticmethod
    @transaction.atomic
    def create_post(author, media_file, caption='', hashtags_str='', location='') -> Post:
        content_type = getattr(media_file, 'content_type', '')
        is_video = content_type.startswith('video/')
        media_type = Post.MEDIA_VIDEO if is_video else Post.MEDIA_PHOTO

        # Hashtaglar
        hashtags = parse_hashtags(caption)
        if hashtags_str:
            extra = [t.strip().lstrip('#').lower() for t in hashtags_str.split(',') if t.strip()]
            hashtags = list(set(hashtags + extra))

        post = Post.objects.create(
            author=author,
            media_file=media_file,
            media_type=media_type,
            caption=caption,
            hashtags=hashtags,
            location=location,
            status=Post.STATUS_PUBLISHED,
        )

        # Video thumbnail (background task)
        if is_video:
            try:
                from apps.posts.tasks import process_video_task
                process_video_task.delay(str(post.id))
            except Exception:
                # Celery yo'q bo'lsa sync bajar
                try:
                    thumb_name = generate_video_thumbnail(post.media_file.name)
                    if thumb_name:
                        post.thumbnail = thumb_name
                    duration = get_video_duration(post.media_file.name)
                    if duration:
                        post.duration_sec = duration
                    post.save(update_fields=['thumbnail', 'duration_sec'])
                except Exception:
                    pass

        # Posts count
        from django.contrib.auth import get_user_model
        get_user_model().objects.filter(id=author.id).update(
            posts_count=F('posts_count') + 1
        )

        return post

    @staticmethod
    @transaction.atomic
    def update_post(post_id: str, user_id: str, caption=None, hashtags_str=None, location=None, is_comments_disabled=None) -> Post:
        post = PostRepository.get_by_id(post_id)
        if not post:
            raise NotFoundException('Post topilmadi')
        if str(post.author_id) != str(user_id):
            raise PermissionDeniedException('Faqat egasi o\'zgartira oladi')

        update_fields = ['updated_at']

        if caption is not None:
            post.caption = caption
            post.hashtags = parse_hashtags(caption)
            update_fields += ['caption', 'hashtags']

        if hashtags_str is not None:
            extra = [t.strip().lstrip('#').lower() for t in hashtags_str.split(',') if t.strip()]
            post.hashtags = list(set(post.hashtags + extra))
            if 'hashtags' not in update_fields:
                update_fields.append('hashtags')

        if location is not None:
            post.location = location
            update_fields.append('location')

        if is_comments_disabled is not None:
            post.is_comments_disabled = is_comments_disabled
            update_fields.append('is_comments_disabled')

        post.save(update_fields=update_fields)
        return post

    @staticmethod
    @transaction.atomic
    def delete_post(post_id: str, user_id: str, is_admin: bool = False) -> bool:
        try:
            post = Post.objects.get(id=post_id)
        except Post.DoesNotExist:
            raise NotFoundException('Post topilmadi')

        if str(post.author_id) != str(user_id) and not is_admin:
            raise PermissionDeniedException('Ruxsat yo\'q')

        author_id = post.author_id

        # Media faylni o'chirish
        if post.media_file:
            post.media_file.delete(save=False)
        if post.thumbnail:
            post.thumbnail.delete(save=False)

        post.delete()

        from django.contrib.auth import get_user_model
        get_user_model().objects.filter(id=author_id).update(
            posts_count=F('posts_count') - 1
        )
        return True

    @staticmethod
    def get_feed(user_id: str, page: int = 1) -> list:
        from apps.users.models import Follow
        following_ids = list(
            Follow.objects.filter(follower_id=user_id).values_list('following_id', flat=True)
        )
        return PostRepository.get_feed(user_id, following_ids, page)

    @staticmethod
    def get_post_detail(post_id: str, current_user_id=None) -> Post:
        post = PostRepository.get_by_id(post_id, current_user_id)
        if not post:
            raise NotFoundException('Post topilmadi')
        PostRepository.increment_views(post_id)
        return post
