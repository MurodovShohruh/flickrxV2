from rest_framework.exceptions import APIException
from rest_framework import status


class ServiceException(APIException):
    """Service layer xatolari uchun."""
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'Xato yuz berdi'
    default_code = 'service_error'


class NotFoundException(APIException):
    status_code = status.HTTP_404_NOT_FOUND
    default_detail = 'Topilmadi'
    default_code = 'not_found'


class PermissionDeniedException(APIException):
    status_code = status.HTTP_403_FORBIDDEN
    default_detail = 'Ruxsat yo\'q'
    default_code = 'permission_denied'


class ConflictException(APIException):
    status_code = status.HTTP_409_CONFLICT
    default_detail = 'Konflikt'
    default_code = 'conflict'
