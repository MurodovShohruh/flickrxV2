from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from drf_spectacular.utils import extend_schema
from common.mixins import SuccessResponseMixin
from apps.chat.repositories import ChatRepository
from .serializers import ChatMessageSerializer, ConversationSerializer, SendMediaSerializer


@extend_schema(tags=['Chat'])
class ConversationsView(SuccessResponseMixin, APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(summary="Suhbatlar ro'yxati", responses={200: ConversationSerializer(many=True)})
    def get(self, request):
        conversations = ChatRepository.get_conversations(str(request.user.id))
        return self.success(ConversationSerializer(conversations, many=True, context={'request': request}).data)


@extend_schema(tags=['Chat'])
class MessagesView(SuccessResponseMixin, APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(summary="Suhbat xabarlari", responses={200: ChatMessageSerializer(many=True)})
    def get(self, request, partner_id):
        page = int(request.query_params.get('page', 1))
        messages = ChatRepository.get_messages(str(request.user.id), str(partner_id), page)
        return self.success(ChatMessageSerializer(messages, many=True, context={'request': request}).data)


@extend_schema(tags=['Chat'])
class SendMediaView(SuccessResponseMixin, APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    @extend_schema(
        summary="Media fayl yuborish (rasm/video)",
        request=SendMediaSerializer,
        responses={201: ChatMessageSerializer},
    )
    def post(self, request, partner_id):
        serializer = SendMediaSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        file = serializer.validated_data['file']
        content_type = getattr(file, 'content_type', '')
        msg_type = 'video' if content_type.startswith('video/') else 'image'
        msg = ChatRepository.save_message(
            sender_id=str(request.user.id), receiver_id=str(partner_id),
            media_file=file, message_type=msg_type,
        )
        return self.created(ChatMessageSerializer(msg, context={'request': request}).data)
