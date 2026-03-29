from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.conf import settings
import logging, traceback, requests
from .models import Cita, Transaccion

from .models import Usuario, Mascota, Cita, Medicamento, RutaMovil, Orden, OrdenItem
from .serializers import (
    UsuarioSerializer, MascotaSerializer, CitaSerializer,
    MedicamentoSerializer, RutaMovilSerializer,
    OrdenSerializer, OrdenItemSerializer, UsuarioRegistroSerializer, PagoSerializer
)

import logging, traceback
logger = logging.getLogger(__name__)


class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [IsAuthenticated]


class MascotaViewSet(viewsets.ModelViewSet):
    queryset = Mascota.objects.all()
    serializer_class = MascotaSerializer
    permission_classes = [IsAuthenticated]


class CitaViewSet(viewsets.ModelViewSet):
    queryset = Cita.objects.all()
    serializer_class = CitaSerializer
    permission_classes = [IsAuthenticated]


class MedicamentoViewSet(viewsets.ModelViewSet):
    queryset = Medicamento.objects.all()
    serializer_class = MedicamentoSerializer
    permission_classes = [IsAuthenticated]


class RutaMovilViewSet(viewsets.ModelViewSet):
    queryset = RutaMovil.objects.all()
    serializer_class = RutaMovilSerializer
    permission_classes = [AllowAny]


class OrdenViewSet(viewsets.ModelViewSet):
    queryset = Orden.objects.all()
    serializer_class = OrdenSerializer
    permission_classes = [IsAuthenticated]


class OrdenItemViewSet(viewsets.ModelViewSet):
    queryset = OrdenItem.objects.all()
    serializer_class = OrdenItemSerializer
    permission_classes = [IsAuthenticated]


class UsuarioPerfilView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UsuarioSerializer(request.user)
        return Response(serializer.data)


class RegistroUsuarioView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UsuarioRegistroSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UsuarioSerializer(user).data, status=status.HTTP_201_CREATED)


class CustomTokenObtainPairView(TokenObtainPairView):
    permission_classes = [AllowAny]


class CustomTokenRefreshView(TokenRefreshView):
    permission_classes = [AllowAny]


class CrearPagoView(APIView):
    permission_classes = [IsAuthenticated]
    PRECIOS = {'revision': 20000, 'aseo': 15000, 'cirugia': 50000}

    def post(self, request):
        cita_id = request.data.get('cita_id')
        if not cita_id:
            return Response({'detail': 'cita_id faltante'}, status=400)

        # valida que la cita pertenezca al usuario
        cita = get_object_or_404(Cita, pk=cita_id, mascota__usuario=request.user)
        servicio = cita.subservicio
        if servicio not in self.PRECIOS:
            return Response({'detail': f'Subservicio "{servicio}" sin precio'}, status=400)
        monto = self.PRECIOS[servicio]

        payload = {
            "buy_order":  str(cita.id),
            "session_id": str(request.user.id),
            "amount":     monto,
            "return_url": f"{settings.FRONTEND_URL}/pago/exito"
        }
        headers = {
            "Tbk-Api-Key-Id":     settings.WEBPAY_API_KEY_ID,
            "Tbk-Api-Key-Secret": settings.WEBPAY_API_KEY_SECRET,
            "Content-Type":       "application/json",
        }

        try:
            url = f"{settings.WEBPAY_HOST}/rswebpaytransaction/api/webpay/v1.2/transactions"
            logger.info("[CrearPago] → POST %s  payload=%s", url, payload)
            resp = requests.post(url, json=payload, headers=headers, timeout=10)
            resp.raise_for_status()
            data = resp.json()
            logger.info("[CrearPago] ← 200 %s", data)
        except Exception:
            logger.error("[CrearPago] EXCEPTION\n%s", traceback.format_exc())
            return Response({'detail': 'Error comunicándose con Webpay'}, status=502)

        # registra transacción
        Transaccion.objects.create(
            cita      = cita,
            tbk_token = data['token'],
            url_pago  = data['url'],
            estado    = 'INIT'
        )
        return Response({'url_pago': data['url'], 'token': data['token']})


class ConfirmarPagoView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token_ws = request.data.get('token_ws')
        if not token_ws:
            return Response({'detail': 'token_ws faltante'}, status=400)

        trans = Transaccion.objects.filter(tbk_token=token_ws).first()
        if not trans:
            return Response({'detail': 'Transacción no hallada'}, status=404)

        trans.estado = 'OK'
        trans.save(update_fields=['estado'])
        cita = trans.cita

        return Response({
            'cita_id'    : cita.id,
            'subservicio': cita.subservicio,
            'tipo'       : cita.tipo,
            'mascota'    : cita.mascota.nombre,
            'fecha'      : cita.fecha.isoformat(),
            'motivo'     : cita.motivo,
            'estado_pago': 'AUTHORIZED'
        })
