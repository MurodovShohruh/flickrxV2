from rest_framework import serializers
from apps.interactions.models import Comment
from api.v1.users.serializers import UserPublicSerializer


class CommentSerializer(serializers.ModelSerializer):
    author = UserPublicSerializer(source='user', read_only=True)
    replies_count = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ['id', 'author', 'text', 'likes_count', 'replies_count', 'parent', 'created_at']
        read_only_fields = ['id', 'author', 'likes_count', 'replies_count', 'created_at']

    def get_replies_count(self, obj):
        return obj.replies.count()


class CommentCreateSerializer(serializers.Serializer):
    text = serializers.CharField(min_length=1, max_length=1000)
    parent_id = serializers.UUIDField(required=False, allow_null=True)


class LikeResponseSerializer(serializers.Serializer):
    liked = serializers.BooleanField()


class SaveResponseSerializer(serializers.Serializer):
    saved = serializers.BooleanField()
