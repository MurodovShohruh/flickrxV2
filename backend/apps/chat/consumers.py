from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
import json


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope.get('user')
        if not self.user or not self.user.is_authenticated:
            await self.close(code=4001)
            return

        self.group_name = f'chat_{self.user.id}'
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, code):
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            msg_type = data.get('type', 'text')

            if msg_type in ('text', 'emoji'):
                await self._handle_text(data)
            elif msg_type in ('image', 'video'):
                await self._handle_media_url(data)
        except Exception as e:
            await self.send(text_data=json.dumps({'error': str(e)}))

    async def _handle_text(self, data):
        receiver_id = data.get('receiver_id')
        text = data.get('text', '').strip()
        if not receiver_id or not text:
            return

        msg = await self._save_message(receiver_id, text=text, msg_type='text')
        if not msg:
            return

        payload = self._build_payload(msg, receiver_id)

        receiver_group = f'chat_{receiver_id}'
        await self.channel_layer.group_send(
            receiver_group,
            {'type': 'chat_message', 'message': {**payload, 'is_mine': False}}
        )
        await self.send(text_data=json.dumps({**payload, 'is_mine': True}))

    async def _handle_media_url(self, data):
        receiver_id = data.get('receiver_id')
        media_url = data.get('media_url', '')
        media_type = data.get('media_type', 'image')
        if not receiver_id or not media_url:
            return

        msg = await self._save_message(receiver_id, text=media_url, msg_type=media_type)
        if not msg:
            return

        payload = self._build_payload(msg, receiver_id)
        receiver_group = f'chat_{receiver_id}'
        await self.channel_layer.group_send(
            receiver_group,
            {'type': 'chat_message', 'message': {**payload, 'is_mine': False}}
        )
        await self.send(text_data=json.dumps({**payload, 'is_mine': True}))

    def _build_payload(self, msg, receiver_id):
        return {
            'id': str(msg.id),
            'sender_id': str(self.user.id),
            'sender_username': self.user.username,
            'sender_profile_image': self.user.profile_image_url,
            'receiver_id': str(receiver_id),
            'message_type': msg.message_type,
            'text': msg.text,
            'is_read': msg.is_read,
            'created_at': msg.created_at.isoformat(),
        }

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event['message']))

    @database_sync_to_async
    def _save_message(self, receiver_id, text='', msg_type='text'):
        from apps.chat.repositories import ChatRepository
        from django.contrib.auth import get_user_model
        User = get_user_model()
        if not User.objects.filter(id=receiver_id, is_active=True).exists():
            return None
        return ChatRepository.save_message(
            sender_id=self.user.id,
            receiver_id=receiver_id,
            text=text,
            message_type=msg_type,
        )
