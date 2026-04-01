from rest_framework import serializers
from apps.posts.models import Post
from api.v1.users.serializers import UserPublicSerializer


class PostSerializer(serializers.ModelSerializer):
    """Post response — barcha ma'lumotlar."""
    author = UserPublicSerializer(read_only=True)
    media_url = serializers.SerializerMethodField()
    thumbnail_url = serializers.SerializerMethodField()
    is_liked = serializers.BooleanField(read_only=True, default=False)
    is_saved = serializers.BooleanField(read_only=True, default=False)

    class Meta:
        model = Post
        fields = [
            'id', 'author', 'media_type', 'media_url', 'thumbnail_url',
            'caption', 'hashtags', 'location',
            'likes_count', 'comments_count', 'views_count', 'saves_count',
            'duration_sec', 'status', 'is_comments_disabled',
            'is_liked', 'is_saved', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'author', 'media_type', 'likes_count',
                            'comments_count', 'views_count', 'saves_count',
                            'duration_sec', 'status', 'created_at', 'updated_at']

    def get_media_url(self, obj):
        request = self.context.get('request')
        if obj.media_file and request:
            return request.build_absolute_uri(obj.media_file.url)
        return None

    def get_thumbnail_url(self, obj):
        request = self.context.get('request')
        if obj.thumbnail and request:
            return request.build_absolute_uri(obj.thumbnail.url)
        return None


class PostCreateSerializer(serializers.Serializer):
    """Post yaratish uchun input."""
    file = serializers.FileField()
    caption = serializers.CharField(max_length=2200, required=False, default='')
    hashtags_str = serializers.CharField(max_length=500, required=False, default='')
    location = serializers.CharField(max_length=100, required=False, default='')

    def validate_file(self, value):
        content_type = getattr(value, 'content_type', '')
        allowed = ['video/', 'image/']
        if not any(content_type.startswith(t) for t in allowed):
            raise serializers.ValidationError('Faqat video yoki rasm')
        if content_type.startswith('image/') and value.size > 10 * 1024 * 1024:
            raise serializers.ValidationError('Rasm 10MB dan katta bo\'lmasligi kerak')
        if content_type.startswith('video/') and value.size > 500 * 1024 * 1024:
            raise serializers.ValidationError('Video 500MB dan katta bo\'lmasligi kerak')
        return value


class PostUpdateSerializer(serializers.Serializer):
    """Post tahrirlash."""
    caption = serializers.CharField(max_length=2200, required=False)
    hashtags_str = serializers.CharField(max_length=500, required=False)
    location = serializers.CharField(max_length=100, required=False)
    is_comments_disabled = serializers.BooleanField(required=False)


class PostListSerializer(PostSerializer):
    """Feed uchun — media_url qisqaroq."""
    class Meta(PostSerializer.Meta):
        fields = [
            'id', 'author', 'media_type', 'media_url', 'thumbnail_url',
            'caption', 'hashtags', 'likes_count', 'comments_count',
            'views_count', 'duration_sec', 'is_liked', 'is_saved', 'created_at',
        ]
