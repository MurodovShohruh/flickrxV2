from django.db import models
from django.conf import settings
from common.models import BaseModel


class ChatMessage(BaseModel):
    TYPE_TEXT = 'text'
    TYPE_IMAGE = 'image'
    TYPE_VIDEO = 'video'
    TYPE_CHOICES = [
        (TYPE_TEXT, 'Text'), (TYPE_IMAGE, 'Image'), (TYPE_VIDEO, 'Video'),
    ]

    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_messages'
    )
    receiver = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='received_messages'
    )
    message_type = models.CharField(max_length=10, choices=TYPE_CHOICES, default=TYPE_TEXT)
    text = models.TextField(blank=True)
    media_file = models.FileField(upload_to='chat/%Y/%m/', null=True, blank=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        db_table = 'chat_messages'
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['sender', 'receiver', 'created_at']),
            models.Index(fields=['receiver', 'is_read']),
        ]

    def __str__(self):
        return f'{self.sender} -> {self.receiver}: {self.text[:30]}'

    @property
    def media_url(self):
        return self.media_file.url if self.media_file else None
