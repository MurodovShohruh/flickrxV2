from django.urls import path, include
from django.http import JsonResponse
from api.v1.users.urls import auth_urlpatterns, user_urlpatterns

# API root uchun view
def api_root(request):
    return JsonResponse({
        "auth": "/api/v1/auth/",
        "users": "/api/v1/users/",
        "posts": "/api/v1/posts/",
        "interactions": "/api/v1/interactions/",
        "chat": "/api/v1/chat/",
        "notifications": "/api/v1/notifications/"
    })

urlpatterns = [
    path('', api_root, name='api-root'),  # <-- bu qo‘shildi
    path('auth/', include(auth_urlpatterns)),
    path('users/', include(user_urlpatterns)),
    path('posts/', include('api.v1.posts.urls')),
    path('interactions/', include('api.v1.interactions.urls')),
    path('chat/', include('api.v1.chat.urls')),
    path('notifications/', include('api.v1.notifications.urls')),
]