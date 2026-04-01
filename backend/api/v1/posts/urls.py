from django.urls import path
from .views import (
    FeedView, TrendingView, SearchView,
    PostCreateView, PostDetailView,
    UserPostsView, SavedPostsView,
)

urlpatterns = [
    path('feed/', FeedView.as_view(), name='feed'),
    path('trending/', TrendingView.as_view(), name='trending'),
    path('search/', SearchView.as_view(), name='search'),
    path('create/', PostCreateView.as_view(), name='post_create'),
    path('saved/', SavedPostsView.as_view(), name='saved'),
    path('user/<str:username>/', UserPostsView.as_view(), name='user_posts'),
    path('<uuid:post_id>/', PostDetailView.as_view(), name='post_detail'),
]
