from rest_framework import serializers
from django.contrib.auth import get_user_model
from apps.users.models import Follow

User = get_user_model()


class UserPublicSerializer(serializers.ModelSerializer):
    """Boshqa foydalanuvchilar uchun umumiy ma'lumot."""
    profile_image_url = serializers.SerializerMethodField()
    is_following = serializers.BooleanField(read_only=True, default=False)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'full_name', 'bio', 'website',
            'profile_image_url', 'followers_count', 'following_count',
            'posts_count', 'is_verified', 'is_private', 'is_following',
            'created_at',
        ]
        read_only_fields = fields

    def get_profile_image_url(self, obj):
        request = self.context.get('request')
        if obj.profile_image and request:
            return request.build_absolute_uri(obj.profile_image.url)
        return None


class UserMeSerializer(UserPublicSerializer):
    """O'z profili uchun — email, phone ham ko'rinadi."""
    class Meta(UserPublicSerializer.Meta):
        fields = UserPublicSerializer.Meta.fields + ['email', 'phone', 'is_admin']


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(min_length=3, max_length=50)
    email = serializers.EmailField()
    password = serializers.CharField(min_length=8, write_only=True)
    confirm_password = serializers.CharField(write_only=True)
    full_name = serializers.CharField(max_length=100, required=False, default='')

    def validate_username(self, value):
        import re
        if not re.match(r'^[a-zA-Z0-9_]+$', value):
            raise serializers.ValidationError('Faqat harf, raqam va _ ishlatish mumkin')
        return value.lower()

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({'confirm_password': 'Parollar mos emas'})
        return data


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class UpdateProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'full_name', 'bio', 'phone', 'website']

    def validate_username(self, value):
        import re
        if not re.match(r'^[a-zA-Z0-9_]+$', value):
            raise serializers.ValidationError('Faqat harf, raqam va _ ishlatish mumkin')
        return value.lower()


class TokenResponseSerializer(serializers.Serializer):
    """JWT token response."""
    access = serializers.CharField()
    refresh = serializers.CharField()
    user = UserMeSerializer()
