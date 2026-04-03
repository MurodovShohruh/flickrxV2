from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import logging

logger = logging.getLogger(__name__)


class NotificationService:
    """Bildirishnomalar yaratish va real-time yuborish."""

    @staticmethod
    def _create_and_send(user_id: str, actor, notif_type: str, content: str, post=None):
        from .models import Notification
        notif = Notification.objects.create(
            user_id=user_id,
            actor=actor,
            type=notif_type,
            content=content,
            post=post,
        )
        # Real-time yuborish
        NotificationService._send_ws(user_id, notif)
        return notif

    @staticmethod
    def _send_ws(user_id: str, notif):
        """WebSocket orqali real-time bildirishnoma."""
        try:
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f'notifications_{user_id}',
                {
                    'type': 'notification_message',
                    'data': {
                        'id': str(notif.id),
                        'type': notif.type,
                        'content': notif.content,
                        'is_read': notif.is_read,
                        'created_at': notif.created_at.isoformat(),
                        'actor': {
                            'id': str(notif.actor.id),
                            'username': notif.actor.username,
                            'profile_image_url': notif.actor.profile_image_url,
                        } if notif.actor else None,
                    }
                }
            )
        except Exception as e:
            logger.warning(f'WS bildirishnoma yuborib bo\'lmadi: {e}')

    @classmethod
    def notify_like(cls, user_id: str, actor, post):
        cls._create_and_send(
            user_id=user_id,
            actor=actor,
            notif_type='like',
            content=f'@{actor.username} sizning postingizni like qildi',
            post=post,
        )

    @classmethod
    def notify_comment(cls, user_id: str, actor, post, text: str):
        cls._create_and_send(
            user_id=user_id,
            actor=actor,
            notif_type='comment',
            content=f'@{actor.username} izoh qoldirdi: "{text[:50]}"',
            post=post,
        )

    @classmethod
    def notify_follow(cls, user_id: str, actor):
        cls._create_and_send(
            user_id=user_id,
            actor=actor,
            notif_type='follow',
            content=f'@{actor.username} sizni kuzata boshladi',
        )
