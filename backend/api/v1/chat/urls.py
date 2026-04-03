from django.urls import path
from .views import ConversationsView, MessagesView, SendMediaView

urlpatterns = [
    path('conversations/', ConversationsView.as_view(), name='conversations'),
    path('messages/<uuid:partner_id>/', MessagesView.as_view(), name='messages'),
    path('messages/<uuid:partner_id>/media/', SendMediaView.as_view(), name='send_media'),
]
