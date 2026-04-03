from django.contrib import admin
from .models import Like, Comment, SavedPost

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['user', 'post', 'text', 'created_at']
    search_fields = ['user__username', 'text']
    raw_id_fields = ['user', 'post', 'parent']

admin.site.register(Like)
admin.site.register(SavedPost)
