# backend/mascota_feliz/serializers.py

from rest_framework import serializers
from .models import Cliente, Mascota, Cita, Medicamento, RutaMovil, Usuario

class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = '_all_'


class MascotaSerializer(serializers.ModelSerializer):
    # Serializamos anidado para lectura y usamos cliente_id para escritura
    cliente = ClienteSerializer(read_only=True)
    cliente_id = serializers.PrimaryKeyRelatedField(
        queryset=Cliente.objects.all(),
        source='cliente',
        write_only=True
    )

    class Meta:
        model = Mascota
        fields = [
            'id', 'nombre', 'especie', 'raza',
            'edad', 'peso', 'cliente', 'cliente_id'
        ]


class CitaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cita
        fields = [
            'id',
            'fecha',
            'tipo',
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


class UsuarioSerializer(serializers.ModelSerializer):
    # No exponer la contraseña en las respuestas
    extra_kwargs = {'password': {'write_only': True}}

    class Meta:
        model = Usuario
        fields = ['id', 'username', 'email', 'rol', 'password']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        user = Usuario(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            rol=validated_data.get('rol', 'cliente')
        )
        user.set_password(validated_data['password'])
        user.save()
        return user