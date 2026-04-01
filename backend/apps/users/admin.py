from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Follow

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'email', 'full_name', 'followers_count', 'is_verified', 'is_active']
    list_filter = ['is_verified', 'is_active', 'is_admin', 'is_private']
    search_fields = ['username', 'email', 'full_name']
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'updated_at', 'followers_count', 'following_count', 'posts_count']
    fieldsets = (
        (None, {'fields': ('email', 'username', 'password')}),
        ('Shaxsiy', {'fields': ('full_name', 'bio', 'phone', 'website', 'profile_image')}),
        ('Statistika', {'fields': ('followers_count', 'following_count', 'posts_count')}),
        ('Huquqlar', {'fields': ('is_active', 'is_staff', 'is_superuser', 'is_admin', 'is_verified', 'is_private')}),
        ('Vaqtlar', {'fields': ('created_at', 'updated_at')}),
    )
    add_fieldsets = (
        (None, {'fields': ('email', 'username', 'full_name', 'password1', 'password2')}),
    )

@admin.register(Follow)
class FollowAdmin(admin.ModelAdmin):
    list_display = ['follower', 'following', 'created_at']
    raw_id_fields = ['follower', 'following']
