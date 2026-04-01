from django.db import models
from django.conf import settings
from common.models import BaseModel


class Like(BaseModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='likes')
    post = models.ForeignKey('posts.Post', on_delete=models.CASCADE, related_name='likes')

    class Meta:
        db_table = 'likes'
        unique_together = ('user', 'post')
        indexes = [models.Index(fields=['user', 'post'])]


class Comment(BaseModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='comments')
    post = models.ForeignKey('posts.Post', on_delete=models.CASCADE, related_name='comments')
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')
    text = models.TextField(max_length=1000)
    likes_count = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = 'comments'
        ordering = ['-created_at']
        indexes = [models.Index(fields=['post', '-created_at'])]

    def __str__(self):
        return f'{self.user.username}: {self.text[:40]}'


class SavedPost(BaseModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='saved_posts')
    post = models.ForeignKey('posts.Post', on_delete=models.CASCADE, related_name='saves')

    class Meta:
        db_table = 'saved_posts'
        unique_together = ('user', 'post')
