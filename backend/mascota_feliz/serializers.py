from rest_framework import serializers
from django.db import transaction
from django.utils import timezone
from .models import Usuario, Mascota, Cita, Medicamento, RutaMovil, Orden, OrdenItem, RoleChoices

class UsuarioSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)
    email = serializers.EmailField(read_only=True)
    rol = serializers.CharField(read_only=True)

    class Meta:
        model = Usuario
        fields = ['id', 'username', 'password', 'email', 'rol', 'nombre', 'rut', 'direccion', 'telefono']

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = Usuario(**validated_data)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance

class MascotaSerializer(serializers.ModelSerializer):
    usuario = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Mascota
        fields = ['id', 'nombre', 'especie', 'raza', 'edad', 'peso', 'usuario']

    def validate(self, data):
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        # Permitir modificaciones al dueño, al staff y a veterinarios
        if self.instance and user:
            if self.instance.usuario != user and not (user.is_staff or user.rol == RoleChoices.VETERINARIO):
                raise serializers.ValidationError("No tienes permiso para modificar esta mascota.")
        return data

    def create(self, validated_data):
        user = self.context['request'].user
        return Mascota.objects.create(usuario=user, **validated_data)

class CitaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cita
        fields = '__all__'

    def validate(self, data):
        tipo = data.get('tipo')
        direccion = data.get('direccion')
        if tipo == Cita.TipoCita.MOVIL and not direccion:
            raise serializers.ValidationError("La dirección es obligatoria para citas móviles.")
        return data

    def validate_fecha(self, value):
        if value < timezone.now():
            raise serializers.ValidationError("La fecha no puede estar en el pasado.")
        return value

class MedicamentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medicamento
        fields = '__all__'

class RutaMovilSerializer(serializers.ModelSerializer):
    class Meta:
        model = RutaMovil
        fields = '__all__'

class OrdenItemSerializer(serializers.ModelSerializer):
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = OrdenItem
        fields = ['id', 'medicamento', 'cantidad', 'subtotal']

class OrdenSerializer(serializers.ModelSerializer):
    items = OrdenItemSerializer(source='ordenitem_set', many=True)

    class Meta:
        model = Orden
        fields = ['id', 'usuario', 'fecha', 'items', 'total']
        read_only_fields = ['usuario', 'fecha', 'total']

    def create(self, validated_data):
        items_data = validated_data.pop('ordenitem_set')
        user = self.context['request'].user
        with transaction.atomic():
            orden = Orden.objects.create(usuario=user, total=0, **validated_data)
            total = 0
            for item in items_data:
                medicamento = item['medicamento']
                cantidad = item['cantidad']
                subtotal = medicamento.precio * cantidad
                OrdenItem.objects.create(orden=orden, medicamento=medicamento, cantidad=cantidad, subtotal=subtotal)
                total += subtotal
            orden.total = total
            orden.save()
        return orden

class UsuarioRegistroSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    email = serializers.EmailField(required=True)
    rol = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = Usuario
        fields = ['username', 'password', 'email', 'rol', 'nombre', 'rut', 'direccion', 'telefono']

    def create(self, validated_data):
        user = Usuario.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            rol=validated_data.get('rol', RoleChoices.CLIENTE),
            nombre=validated_data.get('nombre', ''),
            rut=validated_data.get('rut', ''),
            direccion=validated_data.get('direccion', ''),
            telefono=validated_data.get('telefono', '')
        )
        return user


class PagoSerializer(serializers.Serializer):
    cita_id = serializers.IntegerField()