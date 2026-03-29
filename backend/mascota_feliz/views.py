import logging

import requests
from django.conf import settings
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import SAFE_METHODS, AllowAny, BasePermission, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .models import Cita, Mascota, Medicamento, Orden, OrdenItem, RoleChoices, RutaMovil, Transaccion, TransaccionOrden, Usuario
from .serializers import (
    CitaSerializer,
    MascotaSerializer,
    MedicamentoSerializer,
    OrdenItemSerializer,
    OrdenSerializer,
    PagoOrdenSerializer,
    PagoSerializer,
    RutaMovilSerializer,
    UsuarioRegistroSerializer,
    UsuarioSerializer,
)

logger = logging.getLogger(__name__)


def is_admin(user):
    return user.is_authenticated and (user.is_staff or user.rol == RoleChoices.ADMIN)


def is_veterinario(user):
    return user.is_authenticated and user.rol == RoleChoices.VETERINARIO


def is_cliente(user):
    return user.is_authenticated and user.rol == RoleChoices.CLIENTE


def webpay_headers():
    return {
        "Tbk-Api-Key-Id": settings.WEBPAY_API_KEY_ID,
        "Tbk-Api-Key-Secret": settings.WEBPAY_API_KEY_SECRET,
        "Content-Type": "application/json",
    }


def webpay_transactions_url(token=None):
    base = f"{settings.WEBPAY_HOST}/rswebpaytransaction/api/webpay/v1.2/transactions"
    return f"{base}/{token}" if token else base


def is_webpay_authorized(payload):
    status_value = payload.get("status")
    response_code = payload.get("response_code")
    return status_value == "AUTHORIZED" and str(response_code) in {"0", "0.0"}


class IsAdminRole(BasePermission):
    def has_permission(self, request, view):
        return is_admin(request.user)


class IsAuthenticatedReadAdminWrite(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return request.user and request.user.is_authenticated
        return is_admin(request.user)


class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if is_admin(self.request.user):
            return Usuario.objects.all()
        return Usuario.objects.filter(id=self.request.user.id)

    def perform_create(self, serializer):
        if not is_admin(self.request.user):
            raise PermissionDenied("Solo administradores pueden crear usuarios por este endpoint.")
        serializer.save()

    def perform_update(self, serializer):
        if not is_admin(self.request.user) and serializer.instance != self.request.user:
            raise PermissionDenied("No puedes modificar otro usuario.")
        serializer.save()

    def perform_destroy(self, instance):
        if not is_admin(self.request.user):
            raise PermissionDenied("Solo administradores pueden eliminar usuarios.")
        instance.delete()


class MascotaViewSet(viewsets.ModelViewSet):
    queryset = Mascota.objects.all()
    serializer_class = MascotaSerializer
    permission_classes = [IsAuthenticated]
    VET_ALLOWED_UPDATE_FIELDS = {"edad", "peso", "raza"}

    def get_queryset(self):
        user = self.request.user
        if is_admin(user) or is_veterinario(user):
            return Mascota.objects.all().order_by("id")
        return Mascota.objects.filter(usuario=user).order_by("id")

    def perform_create(self, serializer):
        user = self.request.user
        if is_veterinario(user):
            raise PermissionDenied("Veterinario no puede crear mascotas por este endpoint.")
        if not (is_cliente(user) or is_admin(user)):
            raise PermissionDenied("Rol no autorizado para crear mascotas.")
        serializer.save()

    def perform_update(self, serializer):
        user = self.request.user
        instance = serializer.instance

        if is_admin(user):
            serializer.save()
            return

        if is_veterinario(user):
            payload_fields = set(self.request.data.keys())
            if not payload_fields.issubset(self.VET_ALLOWED_UPDATE_FIELDS):
                raise PermissionDenied("Veterinario solo puede actualizar campos clinicos definidos.")
            serializer.save()
            return

        if instance.usuario != user:
            raise PermissionDenied("No puedes modificar mascotas de otro cliente.")
        serializer.save()

    def perform_destroy(self, instance):
        user = self.request.user
        if is_admin(user) or instance.usuario == user:
            instance.delete()
            return
        raise PermissionDenied("No puedes eliminar mascotas de otro cliente.")


class CitaViewSet(viewsets.ModelViewSet):
    queryset = Cita.objects.all()
    serializer_class = CitaSerializer
    permission_classes = [IsAuthenticated]
    VET_ALLOWED_UPDATE_FIELDS = {"atendida", "motivo", "subservicio"}

    def get_queryset(self):
        user = self.request.user
        if is_admin(user) or is_veterinario(user):
            return Cita.objects.select_related("mascota", "mascota__usuario").order_by("id")
        return Cita.objects.select_related("mascota", "mascota__usuario").filter(mascota__usuario=user).order_by("id")

    def perform_create(self, serializer):
        user = self.request.user
        if is_veterinario(user):
            raise PermissionDenied("Veterinario no puede crear citas por este endpoint.")
        if not (is_cliente(user) or is_admin(user)):
            raise PermissionDenied("Rol no autorizado para crear citas.")

        mascota = serializer.validated_data["mascota"]
        if is_cliente(user) and mascota.usuario != user:
            raise PermissionDenied("No puedes crear citas para mascotas de otro cliente.")
        serializer.save()

    def perform_update(self, serializer):
        user = self.request.user
        cita = serializer.instance

        if is_admin(user):
            serializer.save()
            return

        if is_veterinario(user):
            payload_fields = set(self.request.data.keys())
            if not payload_fields.issubset(self.VET_ALLOWED_UPDATE_FIELDS):
                raise PermissionDenied("Veterinario solo puede actualizar campos clinicos definidos.")
            serializer.save()
            return

        if cita.mascota.usuario != user:
            raise PermissionDenied("No puedes modificar citas de otro cliente.")
        if "atendida" in serializer.validated_data:
            raise PermissionDenied("Cliente no puede marcar una cita como atendida.")
        serializer.save()

    def perform_destroy(self, instance):
        if is_admin(self.request.user) or instance.mascota.usuario == self.request.user:
            instance.delete()
            return
        raise PermissionDenied("No puedes eliminar citas de otro cliente.")


class MedicamentoViewSet(viewsets.ModelViewSet):
    queryset = Medicamento.objects.all()
    serializer_class = MedicamentoSerializer
    permission_classes = [IsAuthenticatedReadAdminWrite]
    pagination_class = None


class RutaMovilViewSet(viewsets.ModelViewSet):
    queryset = RutaMovil.objects.all().order_by("id")
    serializer_class = RutaMovilSerializer

    def get_permissions(self):
        if self.request.method in SAFE_METHODS:
            return [AllowAny()]
        return [IsAuthenticated(), IsAdminRole()]


class OrdenViewSet(viewsets.ModelViewSet):
    queryset = Orden.objects.all()
    serializer_class = OrdenSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if is_admin(user):
            return Orden.objects.all().order_by("id")
        if is_cliente(user):
            return Orden.objects.filter(usuario=user).order_by("id")
        return Orden.objects.none()

    def perform_create(self, serializer):
        if not (is_cliente(self.request.user) or is_admin(self.request.user)):
            raise PermissionDenied("Solo clientes o administradores pueden crear ordenes.")
        serializer.save()

    def perform_update(self, serializer):
        if not is_admin(self.request.user):
            raise PermissionDenied("Solo administradores pueden modificar ordenes.")
        serializer.save()

    def perform_destroy(self, instance):
        if not is_admin(self.request.user):
            raise PermissionDenied("Solo administradores pueden eliminar ordenes.")
        instance.delete()


class OrdenItemViewSet(viewsets.ModelViewSet):
    queryset = OrdenItem.objects.all()
    serializer_class = OrdenItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if is_admin(self.request.user):
            return OrdenItem.objects.all()
        return OrdenItem.objects.none()

    def perform_create(self, serializer):
        if not is_admin(self.request.user):
            raise PermissionDenied("Solo administradores pueden crear items de orden manualmente.")
        serializer.save()

    def perform_update(self, serializer):
        if not is_admin(self.request.user):
            raise PermissionDenied("Solo administradores pueden modificar items de orden.")
        serializer.save()

    def perform_destroy(self, instance):
        if not is_admin(self.request.user):
            raise PermissionDenied("Solo administradores pueden eliminar items de orden.")
        instance.delete()


class UsuarioPerfilView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UsuarioSerializer(request.user).data)


class RegistroUsuarioView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UsuarioRegistroSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UsuarioSerializer(user).data, status=status.HTTP_201_CREATED)


class CustomTokenObtainPairView(TokenObtainPairView):
    permission_classes = [AllowAny]
    throttle_scope = "auth"


class CustomTokenRefreshView(TokenRefreshView):
    permission_classes = [AllowAny]
    throttle_scope = "auth"


class CrearPagoView(APIView):
    permission_classes = [IsAuthenticated]
    throttle_scope = "payment_init"
    PRECIOS = {
        Cita.Servicio.REVISION: 20000,
        Cita.Servicio.ASEO: 15000,
        Cita.Servicio.QUIRURGICO: 50000,
    }

    def post(self, request):
        serializer = PagoSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        cita_id = serializer.validated_data["cita_id"]

        cita = get_object_or_404(Cita, pk=cita_id, mascota__usuario=request.user)
        servicio = cita.subservicio
        if servicio == "cirugia":
            servicio = Cita.Servicio.QUIRURGICO

        if servicio not in self.PRECIOS:
            return Response({"detail": f'Subservicio "{servicio}" sin precio configurado.'}, status=400)

        payload = {
            "buy_order": str(cita.id),
            "session_id": str(request.user.id),
            "amount": self.PRECIOS[servicio],
            "return_url": f"{settings.FRONTEND_URL}/pago/exito",
        }

        try:
            response = requests.post(webpay_transactions_url(), json=payload, headers=webpay_headers(), timeout=15)
            response.raise_for_status()
            data = response.json()
        except requests.RequestException as exc:
            logger.exception("Error comunicandose con Webpay en init pago de cita.")
            return Response(
                {"detail": "Error comunicandose con Webpay.", "estado_pago": "FAILED", "error": str(exc)},
                status=502,
            )

        token = data.get("token")
        url_pago = data.get("url")
        if not token or not url_pago:
            return Response(
                {"detail": "Respuesta inesperada de Webpay al iniciar pago.", "estado_pago": "FAILED"},
                status=502,
            )

        Transaccion.objects.create(cita=cita, tbk_token=token, url_pago=url_pago, estado="INIT")
        return Response({"url_pago": url_pago, "token": token, "estado_pago": "INIT"})


class ConfirmarPagoView(APIView):
    permission_classes = [AllowAny]
    throttle_scope = "payment_commit"

    @staticmethod
    def _response_payload(cita, estado_pago, detalle="", webpay_status=None, response_code=None):
        return {
            "cita_id": cita.id,
            "subservicio": cita.subservicio,
            "tipo": cita.tipo,
            "mascota": cita.mascota.nombre,
            "fecha": cita.fecha.isoformat(),
            "motivo": cita.motivo,
            "estado_pago": estado_pago,
            "detalle": detalle,
            "webpay_status": webpay_status,
            "response_code": response_code,
        }

    def post(self, request):
        token_ws = request.data.get("token_ws")
        if not token_ws:
            return Response({"detail": "token_ws faltante", "estado_pago": "FAILED"}, status=400)

        transaccion = Transaccion.objects.filter(tbk_token=token_ws).select_related("cita", "cita__mascota").first()
        if not transaccion:
            return Response({"detail": "Transaccion no hallada", "estado_pago": "FAILED"}, status=404)

        if transaccion.estado == "OK":
            payload = self._response_payload(
                transaccion.cita,
                estado_pago="AUTHORIZED",
                detalle="Pago ya confirmado previamente.",
            )
            return Response(payload, status=200)

        if transaccion.estado == "FAIL":
            payload = self._response_payload(
                transaccion.cita,
                estado_pago="FAILED",
                detalle="Pago previamente rechazado.",
            )
            return Response(payload, status=402)

        try:
            response = requests.put(webpay_transactions_url(token_ws), headers=webpay_headers(), timeout=15)
            response.raise_for_status()
            data = response.json()
        except requests.RequestException as exc:
            Transaccion.objects.filter(pk=transaccion.pk, estado="INIT").update(estado="FAIL")
            logger.exception("Error comunicandose con Webpay en commit pago de cita.")
            payload = self._response_payload(
                transaccion.cita,
                estado_pago="FAILED",
                detalle="Error comunicandose con Webpay.",
            )
            payload["error"] = str(exc)
            return Response(payload, status=502)

        webpay_status = data.get("status")
        response_code = data.get("response_code")
        authorized = is_webpay_authorized(data)

        next_status = "OK" if authorized else "FAIL"
        updated = Transaccion.objects.filter(pk=transaccion.pk, estado="INIT").update(estado=next_status)
        if updated == 0:
            transaccion.refresh_from_db()
            if transaccion.estado == "OK":
                payload = self._response_payload(
                    transaccion.cita,
                    estado_pago="AUTHORIZED",
                    detalle="Pago ya confirmado previamente.",
                    webpay_status=webpay_status,
                    response_code=response_code,
                )
                return Response(payload, status=200)
            payload = self._response_payload(
                transaccion.cita,
                estado_pago="FAILED",
                detalle="Pago previamente rechazado.",
                webpay_status=webpay_status,
                response_code=response_code,
            )
            return Response(payload, status=402)

        if authorized:
            payload = self._response_payload(
                transaccion.cita,
                estado_pago="AUTHORIZED",
                detalle="Pago confirmado correctamente.",
                webpay_status=webpay_status,
                response_code=response_code,
            )
            return Response(payload, status=200)

        payload = self._response_payload(
            transaccion.cita,
            estado_pago="FAILED",
            detalle="Pago rechazado o no autorizado.",
            webpay_status=webpay_status,
            response_code=response_code,
        )
        return Response(payload, status=402)


class CrearPagoOrdenView(APIView):
    permission_classes = [IsAuthenticated]
    throttle_scope = "payment_init"

    def post(self, request):
        serializer = PagoOrdenSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        orden_id = serializer.validated_data["orden_id"]

        orden = get_object_or_404(Orden, pk=orden_id, usuario=request.user)

        if orden.estado_pago == Orden.EstadoPago.PAGADA:
            return Response({"detail": "La orden ya fue pagada.", "estado_pago": "AUTHORIZED"}, status=400)

        if float(orden.total) <= 0:
            return Response({"detail": "La orden no tiene monto valido para pago.", "estado_pago": "FAILED"}, status=400)

        payload = {
            "buy_order": f"ORD-{orden.id}",
            "session_id": str(request.user.id),
            "amount": int(round(float(orden.total))),
            "return_url": f"{settings.FRONTEND_URL}/pago/orden/exito",
        }

        try:
            response = requests.post(webpay_transactions_url(), json=payload, headers=webpay_headers(), timeout=15)
            response.raise_for_status()
            data = response.json()
        except requests.RequestException as exc:
            logger.exception("Error comunicandose con Webpay en init pago de orden.")
            return Response(
                {"detail": "Error comunicandose con Webpay.", "estado_pago": "FAILED", "error": str(exc)},
                status=502,
            )

        token = data.get("token")
        url_pago = data.get("url")
        if not token or not url_pago:
            return Response(
                {"detail": "Respuesta inesperada de Webpay al iniciar pago de orden.", "estado_pago": "FAILED"},
                status=502,
            )

        TransaccionOrden.objects.create(orden=orden, tbk_token=token, url_pago=url_pago, estado="INIT")
        if orden.estado_pago != Orden.EstadoPago.PENDIENTE:
            orden.estado_pago = Orden.EstadoPago.PENDIENTE
            orden.save(update_fields=["estado_pago"])

        return Response({"url_pago": url_pago, "token": token, "estado_pago": "INIT", "orden_id": orden.id})


class ConfirmarPagoOrdenView(APIView):
    permission_classes = [AllowAny]
    throttle_scope = "payment_commit"

    @staticmethod
    def _response_payload(orden, estado_pago, detalle="", webpay_status=None, response_code=None):
        return {
            "orden_id": orden.id,
            "total": str(orden.total),
            "fecha": orden.fecha.isoformat(),
            "estado_pago": estado_pago,
            "detalle": detalle,
            "webpay_status": webpay_status,
            "response_code": response_code,
        }

    def post(self, request):
        token_ws = request.data.get("token_ws")
        if not token_ws:
            return Response({"detail": "token_ws faltante", "estado_pago": "FAILED"}, status=400)

        transaccion = TransaccionOrden.objects.filter(tbk_token=token_ws).select_related("orden").first()
        if not transaccion:
            return Response({"detail": "Transaccion no hallada", "estado_pago": "FAILED"}, status=404)
        orden = transaccion.orden

        if transaccion.estado == "OK" or orden.estado_pago == Orden.EstadoPago.PAGADA:
            payload = self._response_payload(
                orden,
                estado_pago="AUTHORIZED",
                detalle="Pago de orden ya confirmado previamente.",
            )
            return Response(payload, status=200)

        if transaccion.estado == "FAIL" and orden.estado_pago == Orden.EstadoPago.FALLIDA:
            payload = self._response_payload(
                orden,
                estado_pago="FAILED",
                detalle="Pago de orden previamente rechazado.",
            )
            return Response(payload, status=402)

        try:
            response = requests.put(webpay_transactions_url(token_ws), headers=webpay_headers(), timeout=15)
            response.raise_for_status()
            data = response.json()
        except requests.RequestException as exc:
            TransaccionOrden.objects.filter(pk=transaccion.pk, estado="INIT").update(estado="FAIL")

            if orden.estado_pago != Orden.EstadoPago.PAGADA:
                orden.estado_pago = Orden.EstadoPago.FALLIDA
                orden.save(update_fields=["estado_pago"])

            logger.exception("Error comunicandose con Webpay en commit pago de orden.")
            payload = self._response_payload(orden, estado_pago="FAILED", detalle="Error comunicandose con Webpay.")
            payload["error"] = str(exc)
            return Response(payload, status=502)

        authorized = is_webpay_authorized(data)
        webpay_status = data.get("status")
        response_code = data.get("response_code")

        next_status = "OK" if authorized else "FAIL"
        updated = TransaccionOrden.objects.filter(pk=transaccion.pk, estado="INIT").update(estado=next_status)
        if updated == 0:
            transaccion.refresh_from_db()
            orden.refresh_from_db()
            if transaccion.estado == "OK" or orden.estado_pago == Orden.EstadoPago.PAGADA:
                payload = self._response_payload(
                    orden,
                    estado_pago="AUTHORIZED",
                    detalle="Pago de orden ya confirmado previamente.",
                    webpay_status=webpay_status,
                    response_code=response_code,
                )
                return Response(payload, status=200)

            payload = self._response_payload(
                orden,
                estado_pago="FAILED",
                detalle="Pago de orden previamente rechazado.",
                webpay_status=webpay_status,
                response_code=response_code,
            )
            return Response(payload, status=402)

        if authorized:
            if orden.estado_pago != Orden.EstadoPago.PAGADA:
                orden.estado_pago = Orden.EstadoPago.PAGADA
                orden.pagada_at = timezone.now()
                orden.save(update_fields=["estado_pago", "pagada_at"])

            payload = self._response_payload(
                orden,
                estado_pago="AUTHORIZED",
                detalle="Pago de orden confirmado correctamente.",
                webpay_status=webpay_status,
                response_code=response_code,
            )
            return Response(payload, status=200)

        if orden.estado_pago != Orden.EstadoPago.PAGADA:
            orden.estado_pago = Orden.EstadoPago.FALLIDA
            orden.save(update_fields=["estado_pago"])
        else:
            payload = self._response_payload(
                orden,
                estado_pago="AUTHORIZED",
                detalle="Pago de orden ya confirmado previamente.",
                webpay_status=webpay_status,
                response_code=response_code,
            )
            return Response(payload, status=200)

        payload = self._response_payload(
            orden,
            estado_pago="FAILED",
            detalle="Pago rechazado o no autorizado.",
            webpay_status=webpay_status,
            response_code=response_code,
        )
        return Response(payload, status=402)
