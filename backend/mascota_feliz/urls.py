from django.urls import include, path
from rest_framework import routers

from .views import (
    CitaViewSet,
    ConfirmarPagoOrdenView,
    ConfirmarPagoView,
    CrearPagoOrdenView,
    CrearPagoView,
    CustomTokenObtainPairView,
    CustomTokenRefreshView,
    MascotaViewSet,
    MedicamentoViewSet,
    OrdenItemViewSet,
    OrdenViewSet,
    RegistroUsuarioView,
    RutaMovilViewSet,
    UsuarioPerfilView,
    UsuarioViewSet,
)

router = routers.DefaultRouter()
router.register(r"usuarios", UsuarioViewSet)
router.register(r"mascotas", MascotaViewSet)
router.register(r"citas", CitaViewSet)
router.register(r"medicamentos", MedicamentoViewSet)
router.register(r"rutas-movil", RutaMovilViewSet, basename="rutas-movil")
router.register(r"ordenes", OrdenViewSet)
router.register(r"orden-items", OrdenItemViewSet)

urlpatterns = [
    path("", include(router.urls)),
    path("perfil/", UsuarioPerfilView.as_view(), name="perfil"),
    path("registro/", RegistroUsuarioView.as_view(), name="registro"),
    path("token/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", CustomTokenRefreshView.as_view(), name="token_refresh"),
    path("pago/", CrearPagoView.as_view(), name="crear_pago"),
    path("pago/commit/", ConfirmarPagoView.as_view(), name="confirmar_pago"),
    path("pago/orden/", CrearPagoOrdenView.as_view(), name="crear_pago_orden"),
    path("pago/orden/commit/", ConfirmarPagoOrdenView.as_view(), name="confirmar_pago_orden"),
]
