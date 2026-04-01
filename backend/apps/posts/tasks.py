from celery import shared_task
import logging

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def process_video_task(self, post_id: str):
    """Video thumbnail va davomiylikni background da ishlash."""
    try:
        from .models import Post
        from common.utils import generate_video_thumbnail, get_video_duration

        post = Post.objects.get(id=post_id)
        video_name = post.media_file.name  # masalan: posts/2024/01/abc.mp4

        thumb_name = generate_video_thumbnail(video_name)
        if thumb_name:
            post.thumbnail = thumb_name

        duration = get_video_duration(video_name)
        if duration:
            post.duration_sec = duration

        post.save(update_fields=['thumbnail', 'duration_sec'])
        logger.info(f'Video qayta ishlandi: {post_id}')
        return {'status': 'ok', 'post_id': post_id}

    except Exception as e:
        logger.error(f'Video qayta ishlashda xato {post_id}: {e}')
        self.retry(countdown=60, exc=e)
