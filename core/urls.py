from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import routers
from token_jwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)
from core.views import index, previsao, corpo, menu, historico, irradiance
from api.viewsets import UserViewSet, BuscaPrevisao, HistoricoViewSet, BuscaIrradience

ROUTER = routers.SimpleRouter()
ROUTER.register(r'user', UserViewSet, basename="User")
ROUTER.register(r'buscaprevisao', BuscaPrevisao, basename="buscaprevisao")
ROUTER.register(r'historico', HistoricoViewSet, basename="historico")
ROUTER.register(r'irradiance', BuscaIrradience, basename="irradiance")

urlpatterns = [
    path('api/', include(ROUTER.urls)),
    path('admin/', admin.site.urls),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain'),
    path('api/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('', index),
    path('web/previsao', previsao, name='previsao'),
    path('web/corpo', corpo, name='corpo'),
    path('web/menu', menu, name='menu'),
    path('web/historico', historico, name='historico'),
    path('web/irradiance', irradiance, name='irradiance'),
]

urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
