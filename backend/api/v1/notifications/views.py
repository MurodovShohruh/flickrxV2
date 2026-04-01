from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema
from apps.notifications.models import Notification
from common.mixins import SuccessResponseMixin
from .serializers import NotificationSerializer


@extend_schema(tags=['Notifications'])
class NotificationsView(SuccessResponseMixin, APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(summary="Bildirishnomalar ro'yxati", responses={200: NotificationSerializer(many=True)})
    def get(self, request):
        notifs = Notification.objects.filter(user=request.user).select_related('actor', 'post').order_by('-created_at')[:50]
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return self.success(NotificationSerializer(notifs, many=True, context={'request': request}).data)

    @extend_schema(summary="Barcha bildirishnomalarni o'chirish", responses={200: None})
    def delete(self, request):
        Notification.objects.filter(user=request.user).delete()
        return self.success(message="Barcha bildirishnomalar o'chirildi")
