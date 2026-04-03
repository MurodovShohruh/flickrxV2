from rest_framework.response import Response
from rest_framework import status


class SuccessResponseMixin:
    """Standart success response formati."""
    def success(self, data=None, message='', status_code=status.HTTP_200_OK):
        return Response({
            'success': True,
            'message': message,
            'data': data,
        }, status=status_code)

    def created(self, data=None, message='Muvaffaqiyatli yaratildi'):
        return self.success(data, message, status.HTTP_201_CREATED)


class PaginatedResponseMixin:
    """Paginatsiya bilan response."""
    def paginated(self, queryset, serializer_class, request):
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = serializer_class(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)
        serializer = serializer_class(queryset, many=True, context={'request': request})
        return Response(serializer.data)
