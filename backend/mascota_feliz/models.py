from django.db import models
from django.contrib.auth.models import AbstractUser

class RoleChoices(models.TextChoices):
    CLIENTE = 'cliente', 'Cliente'
    VETERINARIO = 'veterinario', 'Veterinario'
    RECEPCIONISTA = 'recepcionista', 'Recepcionista'
    ADMIN = 'admin', 'Administrador'

class Usuario(AbstractUser):
    email     = models.EmailField('email address', unique=True)
    rol       = models.CharField(max_length=20, choices=RoleChoices.choices,
                                 default=RoleChoices.CLIENTE)
    nombre    = models.CharField(max_length=100, blank=True)
    rut       = models.CharField(max_length=12, unique=True,
                                 null=True, blank=True)
    direccion = models.TextField(blank=True)
    telefono  = models.CharField(max_length=15, blank=True)

    EMAIL_FIELD    = 'email'
    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']


    def __str__(self):
        return f"{self.username} ({self.rol})"

class Mascota(models.Model):
    nombre   = models.CharField(max_length=100)
    especie  = models.CharField(max_length=50)
    raza     = models.CharField(max_length=50, blank=True)
    edad     = models.PositiveIntegerField()
    peso     = models.FloatField()
    usuario  = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='mascotas')

    def __str__(self):
        return f"{self.nombre} ({self.especie})"

class Cita(models.Model):
    class TipoCita(models.TextChoices):
        PRESENCIAL = 'presencial', 'Presencial'
        MOVIL      = 'movil', 'Móvil'

    class Servicio(models.TextChoices):
        REVISION    = 'revision', 'Revisión clínica'
        ASEO        = 'aseo', 'Arreglos y aseo'
        QUIRURGICO  = 'quirurgico', 'Intervenciones quirúrgicas'

    subservicio = models.CharField(max_length=20, choices=Servicio.choices, default=Servicio.REVISION)
    fecha       = models.DateTimeField()
    tipo        = models.CharField(max_length=20, choices=TipoCita.choices)
    direccion   = models.CharField(max_length=255, blank=True, null=True)
    mascota     = models.ForeignKey(Mascota, on_delete=models.CASCADE, related_name='citas')
    motivo      = models.TextField()
    atendida    = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.mascota.nombre} - {self.fecha:%d/%m/%Y %H:%M}"

class Medicamento(models.Model):
    nombre      = models.CharField(max_length=100)
    descripcion = models.TextField()
    stock       = models.PositiveIntegerField()
    precio      = models.DecimalField(max_digits=10, decimal_places=2)  # Mejor para manejar centavos

    def __str__(self):
        return self.nombre

class RutaMovil(models.Model):
    nombre_ruta = models.CharField(max_length=100)
    comuna      = models.CharField(max_length=100)
    fecha       = models.DateField()
    activo      = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.nombre_ruta} ({self.comuna})"

class Orden(models.Model):
    usuario      = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='ordenes')
    fecha        = models.DateTimeField(auto_now_add=True)
    medicamentos = models.ManyToManyField(Medicamento, through='OrdenItem')
    total        = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"Orden #{self.id} - {self.usuario.nombre}"

    class Meta:
        indexes = [
            models.Index(fields=['usuario']),
        ]

class OrdenItem(models.Model):
    orden       = models.ForeignKey(Orden, on_delete=models.CASCADE)
    medicamento = models.ForeignKey(Medicamento, on_delete=models.CASCADE)
    cantidad    = models.PositiveIntegerField()
    subtotal    = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        indexes = [
            models.Index(fields=['orden', 'medicamento']),
        ]

class Transaccion(models.Model):
    ESTADOS = [
        ('INIT', 'Iniciada'),
        ('OK',   'Pagada'),
        ('FAIL', 'Fallida'),
    ]
    cita      = models.ForeignKey('Cita', on_delete=models.CASCADE, related_name='transacciones')
    tbk_token = models.CharField(max_length=100, unique=True)
    url_pago  = models.URLField()
    estado    = models.CharField(max_length=4, choices=ESTADOS, default='INIT')
    created   = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Transacción {self.tbk_token} ({self.estado})"