from django.db import models
from django.conf import settings
from common.models import BaseModel
from common.validators import validate_video_size, validate_image_size


class Post(BaseModel):
    MEDIA_VIDEO = 'video'
    MEDIA_PHOTO = 'photo'
    MEDIA_CHOICES = [(MEDIA_VIDEO, 'Video'), (MEDIA_PHOTO, 'Photo')]

    STATUS_PROCESSING = 'processing'
    STATUS_PUBLISHED = 'published'
    STATUS_REMOVED = 'removed'
    STATUS_CHOICES = [
        (STATUS_PROCESSING, 'Processing'),
        (STATUS_PUBLISHED, 'Published'),
        (STATUS_REMOVED, 'Removed'),
    ]

    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='posts'
    )
    media_type = models.CharField(max_length=10, choices=MEDIA_CHOICES)
    media_file = models.FileField(upload_to='posts/',null=True,blank=True)
    thumbnail = models.ImageField(upload_to='thumbnails/%Y/%m/', null=True, blank=True)
    caption = models.TextField(max_length=2200, blank=True)
    hashtags = models.JSONField(default=list, blank=True)
    location = models.CharField(max_length=100, blank=True)

    likes_count = models.PositiveIntegerField(default=0)
    comments_count = models.PositiveIntegerField(default=0)
    views_count = models.PositiveIntegerField(default=0)
    saves_count = models.PositiveIntegerField(default=0)
    duration_sec = models.PositiveIntegerField(null=True, blank=True)

    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default=STATUS_PUBLISHED
    )
    is_comments_disabled = models.BooleanField(default=False)

    class Meta:
        db_table = 'posts'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['author', 'status']),
            models.Index(fields=['status', '-created_at']),
            models.Index(fields=['-likes_count', '-views_count']),
        ]

    def __str__(self):
        return f'{self.author.username} - {self.media_type} ({self.status})'

    @property
    def media_url(self):
        return self.media_file.url if self.media_file else None

    @property
    def thumbnail_url(self):
        return self.thumbnail.url if self.thumbnail else None

    def is_video(self):
        return self.media_type == self.MEDIA_VIDEO
