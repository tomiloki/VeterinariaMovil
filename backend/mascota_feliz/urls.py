from django.urls import path, include
from django.contrib import admin
from rest_framework import routers
from .views import (
    UsuarioViewSet, MascotaViewSet, CitaViewSet,
    MedicamentoViewSet, RutaMovilViewSet,
    OrdenViewSet, OrdenItemViewSet,
    UsuarioPerfilView, RegistroUsuarioView,
    CustomTokenObtainPairView, CustomTokenRefreshView, 
    CrearPagoView, ConfirmarPagoView
)

router = routers.DefaultRouter()
router.register(r'usuarios', UsuarioViewSet)
router.register(r'mascotas', MascotaViewSet)
router.register(r'citas', CitaViewSet)
router.register(r'medicamentos', MedicamentoViewSet)
router.register(r'rutas-movil', RutaMovilViewSet, basename='rutas-movil')
router.register(r'ordenes', OrdenViewSet)
router.register(r'orden-items', OrdenItemViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include((router.urls, 'api'), namespace='api')),
    path('api/perfil/', UsuarioPerfilView.as_view(), name='perfil'),
    path('api/registro/', RegistroUsuarioView.as_view(), name='registro'),
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('api/pago/', CrearPagoView.as_view(), name='crear_pago'),
    path('api/pago/commit/', ConfirmarPagoView.as_view(), name='confirmar_pago'),
]
