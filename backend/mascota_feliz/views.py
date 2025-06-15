from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from .models import Cliente, Mascota, Cita, Medicamento, RutaMovil, Usuario
from .serializers import (
    ClienteSerializer, MascotaSerializer, CitaSerializer,
    MedicamentoSerializer, RutaMovilSerializer, UsuarioSerializer
)

class ClienteViewSet(viewsets.ModelViewSet):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer
    permission_classes = [AllowAny]   # ← cualquiera

class MascotaViewSet(viewsets.ModelViewSet):
    queryset = Mascota.objects.all()
    serializer_class = MascotaSerializer
    permission_classes = [AllowAny]

class CitaViewSet(viewsets.ModelViewSet):
    queryset = Cita.objects.all()
    serializer_class = CitaSerializer
    permission_classes = [AllowAny]

class MedicamentoViewSet(viewsets.ModelViewSet):
    queryset = Medicamento.objects.all()
    serializer_class = MedicamentoSerializer
    permission_classes = [AllowAny]

class RutaMovilViewSet(viewsets.ModelViewSet):
    queryset = RutaMovil.objects.all()
    serializer_class = RutaMovilSerializer
    permission_classes = [AllowAny]

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [AllowAny]