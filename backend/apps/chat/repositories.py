from django.db.models import Q
from django.contrib.auth import get_user_model
from .models import ChatMessage

User = get_user_model()


class ChatRepository:

    @staticmethod
    def get_conversations(user_id: str) -> list:
        sent_ids = list(ChatMessage.objects.filter(
            sender_id=user_id
        ).values_list('receiver_id', flat=True).distinct())

        recv_ids = list(ChatMessage.objects.filter(
            receiver_id=user_id
        ).values_list('sender_id', flat=True).distinct())

        partner_ids = list(set(sent_ids + recv_ids))

        conversations = []
        for pid in partner_ids:
            partner = User.objects.filter(id=pid, is_active=True).first()
            if not partner:
                continue

            last = ChatMessage.objects.filter(
                Q(sender_id=user_id, receiver_id=pid) |
                Q(sender_id=pid, receiver_id=user_id)
            ).order_by('-created_at').first()

            unread = ChatMessage.objects.filter(
                sender_id=pid,
                receiver_id=user_id,
                is_read=False
            ).count()

            conversations.append({
                'partner': partner,
                'last_message': last,
                'unread_count': unread,
            })

        conversations.sort(
            key=lambda x: x['last_message'].created_at if x['last_message'] else '',
            reverse=True
        )
        return conversations

    @staticmethod
    def get_messages(user_id: str, partner_id: str, page: int = 1, page_size: int = 50):
        offset = (page - 1) * page_size
        msgs = list(ChatMessage.objects.filter(
            Q(sender_id=user_id, receiver_id=partner_id) |
            Q(sender_id=partner_id, receiver_id=user_id)
        ).select_related('sender').order_by('created_at')[offset:offset + page_size])

        # O'qilgan deb belgilash
        ChatMessage.objects.filter(
            sender_id=partner_id,
            receiver_id=user_id,
            is_read=False
        ).update(is_read=True)

        return msgs

    @staticmethod
    def save_message(sender_id, receiver_id, text='', media_file=None, message_type='text') -> ChatMessage:
        return ChatMessage.objects.create(
            sender_id=sender_id,
            receiver_id=receiver_id,
            message_type=message_type,
            text=text,
            media_file=media_file,
        )
