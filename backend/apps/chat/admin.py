from django.contrib import admin
from .models import ChatMessage

@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ['sender', 'receiver', 'message_type', 'is_read', 'created_at']
    list_filter = ['message_type', 'is_read']
    raw_id_fields = ['sender', 'receiver']
