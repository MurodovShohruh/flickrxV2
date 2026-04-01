from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView, LoginView, LogoutView,
    MeView, AvatarView, ProfileView,
    FollowView, FollowersView, FollowingView, SearchUsersView,
)

auth_urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

user_urlpatterns = [
    path('me/', MeView.as_view(), name='me'),
    path('me/avatar/', AvatarView.as_view(), name='avatar'),
    path('search/', SearchUsersView.as_view(), name='search_users'),
    path('<str:username>/', ProfileView.as_view(), name='profile'),
    path('<uuid:user_id>/follow/', FollowView.as_view(), name='follow'),
    path('<uuid:user_id>/followers/', FollowersView.as_view(), name='followers'),
    path('<uuid:user_id>/following/', FollowingView.as_view(), name='following'),
]
