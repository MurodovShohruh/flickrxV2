from rest_framework import serializers
from apps.chat.models import ChatMessage
from api.v1.users.serializers import UserPublicSerializer


class ChatMessageSerializer(serializers.ModelSerializer):
    sender = UserPublicSerializer(read_only=True)
    media_url = serializers.SerializerMethodField()
    is_mine = serializers.SerializerMethodField()

    class Meta:
        model = ChatMessage
        fields = ['id', 'sender', 'message_type', 'text', 'media_url', 'is_read', 'is_mine', 'created_at']

    def get_media_url(self, obj):
        request = self.context.get('request')
        if obj.media_file and request:
            return request.build_absolute_uri(obj.media_file.url)
        return None

    def get_is_mine(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return str(obj.sender_id) == str(request.user.id)
        return False


class LastMessageSerializer(serializers.Serializer):
    text = serializers.CharField()
    message_type = serializers.CharField()
    media_url = serializers.SerializerMethodField()
    is_mine = serializers.SerializerMethodField()
    created_at = serializers.DateTimeField()

    def get_media_url(self, obj):
        request = self.context.get('request')
        if hasattr(obj, 'media_file') and obj.media_file and request:
            return request.build_absolute_uri(obj.media_file.url)
        return None

    def get_is_mine(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return str(obj.sender_id) == str(request.user.id)
        return False


class ConversationSerializer(serializers.Serializer):
    partner = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.IntegerField()

    def get_partner(self, obj):
        return UserPublicSerializer(
            obj['partner'],
            context=self.context
        ).data

    def get_last_message(self, obj):
        msg = obj.get('last_message')
        if not msg:
            return None
        request = self.context.get('request')
        return {
            'text': msg.text,
            'message_type': msg.message_type,
            'media_url': request.build_absolute_uri(msg.media_file.url) if msg.media_file and request else None,
            'is_mine': str(msg.sender_id) == str(request.user.id) if request and request.user.is_authenticated else False,
            'created_at': msg.created_at.isoformat(),
        }


class SendMediaSerializer(serializers.Serializer):
    file = serializers.FileField()

    def validate_file(self, value):
        content_type = getattr(value, 'content_type', '')
        if not (content_type.startswith('image/') or content_type.startswith('video/')):
            raise serializers.ValidationError('Faqat rasm yoki video')
        return value
