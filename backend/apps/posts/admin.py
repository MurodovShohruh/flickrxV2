from django.contrib import admin
from .models import Post

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ['author', 'media_type', 'status', 'likes_count', 'views_count', 'created_at']
    list_filter = ['status', 'media_type', 'is_comments_disabled']
    search_fields = ['author__username', 'caption']
    readonly_fields = ['likes_count', 'comments_count', 'views_count', 'saves_count', 'created_at']
    raw_id_fields = ['author']
    actions = ['mark_removed', 'mark_published']

    def mark_removed(self, request, queryset):
        queryset.update(status='removed')
    mark_removed.short_description = 'O\'chirish (removed)'

    def mark_published(self, request, queryset):
        queryset.update(status='published')
    mark_published.short_description = 'Nashr qilish'
