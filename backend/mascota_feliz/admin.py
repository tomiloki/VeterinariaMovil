from django.contrib import admin
from .models import Usuario, Mascota, Cita, Medicamento, RutaMovil, Orden, OrdenItem

@admin.register(Usuario)
class UsuarioAdmin(admin.ModelAdmin):
    list_display = ('username', 'nombre', 'rut', 'rol', 'email', 'telefono')
    search_fields = ('username', 'nombre', 'rut', 'email')

@admin.register(Mascota)
class MascotaAdmin(admin.ModelAdmin):
    list_display  = ('nombre', 'especie', 'usuario')
    search_fields = ('nombre', 'usuario__nombre', 'usuario__username')
    list_filter   = ('especie',)

@admin.register(Cita)
class CitaAdmin(admin.ModelAdmin):
    list_display  = ('mascota', 'fecha', 'tipo', 'atendida')
    list_filter   = ('tipo', 'atendida', 'fecha')

@admin.register(Medicamento)
class MedicamentoAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'stock', 'precio')
    list_filter  = ('stock',)

@admin.register(RutaMovil)
class RutaMovilAdmin(admin.ModelAdmin):
    list_display = ('nombre_ruta', 'comuna', 'fecha', 'activo')
    list_filter  = ('activo',)

@admin.register(Orden)
class OrdenAdmin(admin.ModelAdmin):
    list_display = ('id', 'usuario', 'fecha', 'total')
    list_filter  = ('fecha',)
    search_fields = ('usuario__username', 'usuario__nombre')

@admin.register(OrdenItem)
class OrdenItemAdmin(admin.ModelAdmin):
    list_display = ('orden', 'medicamento', 'cantidad', 'subtotal')
    list_filter  = ('medicamento',)
