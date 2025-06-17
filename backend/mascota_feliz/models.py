from django.db import models
from django.contrib.auth.models import AbstractUser

# Roles de usuario
ROLES = [
    ('cliente', 'Cliente'),
    ('veterinario', 'Veterinario'),
    ('recepcionista', 'Recepcionista'),
    ('admin', 'Administrador'),
]

class Usuario(AbstractUser):
    rol       = models.CharField(max_length=20, choices=ROLES, default='cliente')
    nombre    = models.CharField(max_length=100)
    rut       = models.CharField(max_length=12, unique=True)
    direccion = models.TextField()
    telefono  = models.CharField(max_length=15)
    correo    = models.EmailField(unique=True)

    def _str_(self):
        return f"{self.username} ({self.rol})"

class Mascota(models.Model):
    nombre  = models.CharField(max_length=100)
    especie = models.CharField(max_length=50)
    raza    = models.CharField(max_length=50, blank=True)
    edad    = models.PositiveIntegerField()
    peso    = models.FloatField()
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='mascotas')
    def _str_(self):
        return f"{self.nombre} ({self.especie})"

class Cita(models.Model):
    PRESENCIAL = 'presencial'
    MOVIL      = 'movil'
    TIPO_CITA  = [(PRESENCIAL,'Presencial'),(MOVIL,'Móvil')]
    SERVICIOS = [
        ('revision', 'Revisión clínica'),
        ('aseo',     'Arreglos y aseo'),
        ('quirurgico','Intervenciones quirúrgicas'),
    ]

    subservicio = models.CharField(max_length=20, choices=SERVICIOS, default='revision')
    fecha    = models.DateTimeField()
    tipo     = models.CharField(max_length=20, choices=TIPO_CITA)
    direccion = models.CharField(max_length=255, blank=True)
    mascota  = models.ForeignKey(Mascota, on_delete=models.CASCADE, related_name='citas')
    motivo   = models.TextField()
    atendida = models.BooleanField(default=False)
    def _str_(self):
        return f"{self.mascota.nombre} - {self.fecha:%d/%m/%Y %H:%M}"

class Medicamento(models.Model):
    nombre      = models.CharField(max_length=100)
    descripcion = models.TextField()
    stock       = models.PositiveIntegerField()
    precio      = models.PositiveIntegerField()  # CLP
    def _str_(self):
        return self.nombre

class RutaMovil(models.Model):
    nombre_ruta = models.CharField(max_length=100)
    comuna      = models.CharField(max_length=100)
    fecha       = models.DateField()
    activo      = models.BooleanField(default=True)
    def _str_(self):
        return f"{self.nombre_ruta} ({self.comuna})"
    
class Orden(models.Model):
    usuario = models.ForeignKey('Usuario', on_delete=models.CASCADE, related_name='ordenes')
    fecha = models.DateTimeField(auto_now_add=True)
    medicamentos = models.ManyToManyField(Medicamento, through='OrdenItem')
    total = models.PositiveIntegerField()

    def _str_(self):
        return f"Orden #{self.id} - {self.cliente.nombre}"

class OrdenItem(models.Model):
    orden = models.ForeignKey(Orden, on_delete=models.CASCADE)
    medicamento = models.ForeignKey(Medicamento, on_delete=models.CASCADE)
    cantidad = models.PositiveIntegerField()
    subtotal = models.PositiveIntegerField()