from rest_framework import serializers
from apps.notifications.models import Notification
from api.v1.users.serializers import UserPublicSerializer


class NotificationSerializer(serializers.ModelSerializer):
    actor = UserPublicSerializer(read_only=True)

    class Meta:
        model = Notification
        fields = ['id', 'type', 'content', 'actor', 'is_read', 'created_at']
        read_only_fields = fields
