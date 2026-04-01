from django.db import models
from django.conf import settings
from common.models import BaseModel


class Notification(BaseModel):
    TYPE_LIKE = 'like'
    TYPE_COMMENT = 'comment'
    TYPE_FOLLOW = 'follow'
    TYPE_MESSAGE = 'message'
    TYPE_CHOICES = [
        (TYPE_LIKE, 'Like'),
        (TYPE_COMMENT, 'Comment'),
        (TYPE_FOLLOW, 'Follow'),
        (TYPE_MESSAGE, 'Message'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications'
    )
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name='actor_notifications'
    )
    post = models.ForeignKey(
        'posts.Post', on_delete=models.SET_NULL, null=True, blank=True
    )
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    content = models.TextField()
    is_read = models.BooleanField(default=False)

    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']
        indexes = [models.Index(fields=['user', 'is_read', '-created_at'])]
