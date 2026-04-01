from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from drf_spectacular.utils import extend_schema, OpenApiParameter
from common.mixins import SuccessResponseMixin
from apps.interactions.services import InteractionService
from apps.interactions.repositories import CommentRepository
from .serializers import CommentSerializer, CommentCreateSerializer


@extend_schema(tags=['Interactions'])
class LikeView(SuccessResponseMixin, APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(summary="Like / Unlike (toggle)", responses={200: {'type': 'object', 'properties': {'liked': {'type': 'boolean'}}}})
    def post(self, request, post_id):
        result = InteractionService.toggle_like(request.user, str(post_id))
        msg = 'Like qo\'shildi' if result['liked'] else 'Like olib tashlandi'
        return self.success(result, message=msg)


@extend_schema(tags=['Interactions'])
class CommentListView(SuccessResponseMixin, APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    @extend_schema(summary="Izohlarni ko'rish", responses={200: CommentSerializer(many=True)})
    def get(self, request, post_id):
        page = int(request.query_params.get('page', 1))
        comments = CommentRepository.get_for_post(str(post_id), page)
        return self.success(CommentSerializer(comments, many=True, context={'request': request}).data)

    @extend_schema(summary="Izoh qo'shish", request=CommentCreateSerializer, responses={201: CommentSerializer})
    def post(self, request, post_id):
        serializer = CommentCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        comment = InteractionService.add_comment(
            user=request.user, post_id=str(post_id), text=data['text'],
            parent_id=str(data['parent_id']) if data.get('parent_id') else None,
        )
        return self.created(CommentSerializer(comment, context={'request': request}).data)


@extend_schema(tags=['Interactions'])
class CommentDeleteView(SuccessResponseMixin, APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(summary="Izohni o'chirish", responses={200: None})
    def delete(self, request, comment_id):
        InteractionService.delete_comment(str(comment_id), str(request.user.id))
        return self.success(message="Izoh o'chirildi")


@extend_schema(tags=['Interactions'])
class SaveView(SuccessResponseMixin, APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(summary="Save / Unsave (toggle)", responses={200: {'type': 'object', 'properties': {'saved': {'type': 'boolean'}}}})
    def post(self, request, post_id):
        result = InteractionService.toggle_save(str(request.user.id), str(post_id))
        msg = 'Saqlandi' if result['saved'] else 'Saqlamdan olib tashlandi'
        return self.success(result, message=msg)
