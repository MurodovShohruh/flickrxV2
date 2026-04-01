from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
from drf_spectacular.utils import extend_schema, OpenApiParameter
from common.mixins import SuccessResponseMixin
from apps.posts.services import PostService
from apps.posts.repositories import PostRepository
from .serializers import PostSerializer, PostListSerializer, PostCreateSerializer, PostUpdateSerializer


@extend_schema(tags=['Posts'])
class FeedView(SuccessResponseMixin, APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Home feed",
        description="Following foydalanuvchilar va o'z postlari.",
        parameters=[
            OpenApiParameter('page', int, OpenApiParameter.QUERY, default=1),
            OpenApiParameter('limit', int, OpenApiParameter.QUERY, default=20),
        ],
        responses={200: PostListSerializer(many=True)},
    )
    def get(self, request):
        page = int(request.query_params.get('page', 1))
        posts = PostService.get_feed(str(request.user.id), page)
        return self.success({
            'results': PostListSerializer(posts, many=True, context={'request': request}).data,
            'page': page,
        })


@extend_schema(tags=['Posts'])
class TrendingView(SuccessResponseMixin, APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        summary="Trending postlar",
        parameters=[OpenApiParameter('page', int, OpenApiParameter.QUERY, default=1)],
        responses={200: PostListSerializer(many=True)},
    )
    def get(self, request):
        page = int(request.query_params.get('page', 1))
        posts = PostRepository.get_trending(page)
        return self.success({
            'results': PostListSerializer(posts, many=True, context={'request': request}).data,
            'page': page,
        })


@extend_schema(tags=['Posts'])
class SearchView(SuccessResponseMixin, APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        summary="Qidirish — hashtag, caption, username",
        parameters=[OpenApiParameter('q', str, OpenApiParameter.QUERY, required=True)],
    )
    def get(self, request):
        q = request.query_params.get('q', '').strip()
        if not q:
            return self.success({'posts': [], 'users': []})
        page = int(request.query_params.get('page', 1))
        posts = PostRepository.search(q, page)
        from apps.users.repositories import UserRepository
        from api.v1.users.serializers import UserPublicSerializer
        users = UserRepository.search(q, limit=10)
        return self.success({
            'posts': PostListSerializer(posts, many=True, context={'request': request}).data,
            'users': UserPublicSerializer(users, many=True, context={'request': request}).data,
        })


@extend_schema(tags=['Posts'])
class PostCreateView(SuccessResponseMixin, APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    @extend_schema(
        summary="Post yaratish (video yoki rasm)",
        request=PostCreateSerializer,
        responses={201: PostSerializer},
    )
    def post(self, request):
        serializer = PostCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        post = PostService.create_post(
            author=request.user,
            media_file=data['file'],
            caption=data.get('caption', ''),
            hashtags_str=data.get('hashtags_str', ''),
            location=data.get('location', ''),
        )
        return self.created(PostSerializer(post, context={'request': request}).data)


@extend_schema(tags=['Posts'])
class PostDetailView(SuccessResponseMixin, APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    @extend_schema(summary="Bitta post", responses={200: PostSerializer})
    def get(self, request, post_id):
        current_id = str(request.user.id) if request.user.is_authenticated else None
        post = PostService.get_post_detail(str(post_id), current_id)
        return self.success(PostSerializer(post, context={'request': request}).data)

    @extend_schema(summary="Postni yangilash", request=PostUpdateSerializer, responses={200: PostSerializer})
    def put(self, request, post_id):
        serializer = PostUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        post = PostService.update_post(
            post_id=str(post_id),
            user_id=str(request.user.id),
            **serializer.validated_data,
        )
        return self.success(PostSerializer(post, context={'request': request}).data, message='Post yangilandi')

    @extend_schema(summary="Postni o'chirish", responses={200: None})
    def delete(self, request, post_id):
        PostService.delete_post(
            post_id=str(post_id),
            user_id=str(request.user.id),
            is_admin=request.user.is_admin,
        )
        return self.success(message="Post o'chirildi")


@extend_schema(tags=['Posts'])
class UserPostsView(SuccessResponseMixin, APIView):
    permission_classes = [AllowAny]

    @extend_schema(summary="Foydalanuvchi postlari", responses={200: PostListSerializer(many=True)})
    def get(self, request, username):
        page = int(request.query_params.get('page', 1))
        posts = PostRepository.get_user_posts(username, page)
        return self.success({
            'results': PostListSerializer(posts, many=True, context={'request': request}).data,
            'page': page,
        })


@extend_schema(tags=['Posts'])
class SavedPostsView(SuccessResponseMixin, APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(summary="Saqlangan postlar", responses={200: PostListSerializer(many=True)})
    def get(self, request):
        from apps.interactions.repositories import SavedPostRepository
        page = int(request.query_params.get('page', 1))
        posts = SavedPostRepository.get_saved_posts(str(request.user.id), page)
        return self.success({
            'results': PostListSerializer(posts, many=True, context={'request': request}).data,
            'page': page,
        })
