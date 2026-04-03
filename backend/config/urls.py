# config/urls.py
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.shortcuts import redirect
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)

# Root URL / ga kirilsa, API root /api/v1/ ga yo‘naltirish
def redirect_to_api(request):
    return redirect('/api/v1/')

urlpatterns = [
    path('', redirect_to_api),  # Root URL redirect qilinadi
    path('admin/', admin.site.urls),
    path('api/v1/', include('api.v1.urls')),

    # Swagger / OpenAPI
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)