# backend/mascota_feliz/serializers.py

from rest_framework import serializers
from .models import Mascota, Cita, Medicamento, RutaMovil, Orden, OrdenItem, Usuario

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'username', 'email', 'rol', 'password']
        extra_kwargs = {
            'password': {'write_only': True}
        }

class MascotaSerializer(serializers.ModelSerializer):
    usuario = UsuarioSerializer(read_only=True)
    usuario_id = serializers.PrimaryKeyRelatedField(
        queryset=Usuario.objects.all(),
        source='usuario',
        write_only=True
    )

    class Meta:
        model = Mascota
        fields = [
            'id',
            'nombre',
            'especie',
            'raza',
            'edad',
            'peso',
            'usuario',     # <-- campo para lectura
            'usuario_id'   # <-- campo para asignar al crear
        ]

class CitaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cita
        fields = [
            'id',
            'fecha',
            'tipo',
            'subservicio',
            'mascota',
            'motivo',
            'direccion',     # ← añade esto
            'atendida',
        ]

        def validate(self, data):
            if data.get('tipo') == 'movil' and not data.get('direccion'):
                raise serializers.ValidationError({
                    'direccion': 'La dirección es obligatoria para citas móviles.'
                })
            return data

class MedicamentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medicamento
        fields = '_all_'

class RutaMovilSerializer(serializers.ModelSerializer):
    class Meta:
        model = RutaMovil
        fields = '_all_'

    def create(self, validated_data):
        user = Usuario(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            rol=validated_data.get('rol', 'cliente')
        )
        user.set_password(validated_data['password'])
        user.save()
        return user
    
class OrdenItemSerializer(serializers.ModelSerializer):
    medicamento = MedicamentoSerializer(read_only=True)
    medicamento_id = serializers.PrimaryKeyRelatedField(
        queryset=Medicamento.objects.all(), source='medicamento', write_only=True
    )
    class Meta:
        model = OrdenItem
        fields = ['id', 'medicamento', 'medicamento_id', 'cantidad', 'subtotal']

class OrdenSerializer(serializers.ModelSerializer):
    items = OrdenItemSerializer(source='ordenitem_set', many=True)
    class Meta:
        model = Orden
        fields = ['id', 'cliente', 'fecha', 'items', 'total']

    def create(self, validated_data):
        items_data = validated_data.pop('ordenitem_set')
        orden = Orden.objects.create(**validated_data)
        total = 0
        for item_data in items_data:
            medicamento = item_data['medicamento']
            cantidad = item_data['cantidad']
            subtotal = medicamento.precio * cantidad
            OrdenItem.objects.create(
                orden=orden, medicamento=medicamento, cantidad=cantidad, subtotal=subtotal
            )
            total += subtotal
        orden.total = total
        orden.save()
        return orden
    
class UsuarioRegistroSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    class Meta:
        model = Usuario
        fields = ['username', 'password', 'nombre', 'rut', 'correo', 'telefono', 'direccion', 'rol']
        extra_kwargs = {'rol': {'read_only': True}}

    def create(self, validated_data):
        user = Usuario.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            nombre=validated_data['nombre'],
            rut=validated_data['rut'],
            correo=validated_data['correo'],
            telefono=validated_data['telefono'],
            direccion=validated_data['direccion'],
            rol='cliente'
        )
        return user