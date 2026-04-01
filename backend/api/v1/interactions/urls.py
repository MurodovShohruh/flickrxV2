from django.urls import path
from .views import LikeView, CommentListView, CommentDeleteView, SaveView

urlpatterns = [
    path('posts/<uuid:post_id>/like/', LikeView.as_view(), name='like'),
    path('posts/<uuid:post_id>/comments/', CommentListView.as_view(), name='comments'),
    path('comments/<uuid:comment_id>/', CommentDeleteView.as_view(), name='comment_delete'),
    path('posts/<uuid:post_id>/save/', SaveView.as_view(), name='save'),
]
