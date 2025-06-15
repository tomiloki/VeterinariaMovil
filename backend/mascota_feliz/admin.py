from django.contrib import admin
from .models import (
    Usuario, Cliente, Mascota, Cita,
    Medicamento, RutaMovil
)

@admin.register(Usuario)
class UsuarioAdmin(admin.ModelAdmin):
    list_display = ('username','rol','email')
    list_filter  = ('rol',)

@admin.register(Cliente)
class ClienteAdmin(admin.ModelAdmin):
    list_display  = ('nombre','rut','correo')
    search_fields = ('nombre','rut')

@admin.register(Mascota)
class MascotaAdmin(admin.ModelAdmin):
    list_display  = ('nombre','especie','cliente')
    search_fields = ('nombre','cliente__nombre')

@admin.register(Cita)
class CitaAdmin(admin.ModelAdmin):
    list_display  = ('mascota','fecha','tipo','atendida')
    list_filter   = ('tipo','atendida')

@admin.register(Medicamento)
class MedicamentoAdmin(admin.ModelAdmin):
    list_display = ('nombre','stock','precio')
    list_filter  = ('stock',)

@admin.register(RutaMovil)
class RutaMovilAdmin(admin.ModelAdmin):
    list_display = ('nombre_ruta','comuna','fecha','activo')
    list_filter  = ('activo',)