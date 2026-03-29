from django.db import transaction
from django.utils import timezone
from rest_framework import serializers

from .models import Cita, Mascota, Medicamento, Orden, OrdenItem, RoleChoices, RutaMovil, Usuario


class UsuarioSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)
    email = serializers.EmailField(read_only=True)
    rol = serializers.CharField(read_only=True)

    class Meta:
        model = Usuario
        fields = [
            "id",
            "username",
            "password",
            "email",
            "rol",
            "nombre",
            "rut",
            "direccion",
            "telefono",
        ]

    def create(self, validated_data):
        password = validated_data.pop("password", None)
        user = Usuario(**validated_data)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
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
        fields = ["id", "nombre", "especie", "raza", "edad", "peso", "usuario"]

    def validate(self, data):
        request = self.context.get("request")
        user = getattr(request, "user", None)
        if self.instance and user:
            is_owner = self.instance.usuario == user
            is_staff_or_vet = user.is_staff or user.rol == RoleChoices.VETERINARIO
            if not is_owner and not is_staff_or_vet:
                raise serializers.ValidationError("No tienes permiso para modificar esta mascota.")
        return data

    def create(self, validated_data):
        return Mascota.objects.create(usuario=self.context["request"].user, **validated_data)


class CitaSerializer(serializers.ModelSerializer):
    subservicio = serializers.CharField()

    class Meta:
        model = Cita
        fields = "__all__"

    def validate(self, data):
        subservicio = data.get("subservicio")
        if subservicio == "cirugia":
            data["subservicio"] = Cita.Servicio.QUIRURGICO

        valid_subservices = {choice for choice, _ in Cita.Servicio.choices}
        normalized_subservice = data.get("subservicio")
        if normalized_subservice and normalized_subservice not in valid_subservices:
            raise serializers.ValidationError("Subservicio no valido.")

        tipo = data.get("tipo")
        direccion = data.get("direccion")
        if tipo == Cita.TipoCita.MOVIL and not direccion:
            raise serializers.ValidationError("La direccion es obligatoria para citas moviles.")
        return data

    def validate_fecha(self, value):
        if value < timezone.now():
            raise serializers.ValidationError("La fecha no puede estar en el pasado.")
        return value


class MedicamentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medicamento
        fields = "__all__"


class RutaMovilSerializer(serializers.ModelSerializer):
    class Meta:
        model = RutaMovil
        fields = "__all__"


class OrdenItemSerializer(serializers.ModelSerializer):
    cantidad = serializers.IntegerField(min_value=1)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = OrdenItem
        fields = ["id", "medicamento", "cantidad", "subtotal"]


class OrdenSerializer(serializers.ModelSerializer):
    items = OrdenItemSerializer(source="ordenitem_set", many=True)

    class Meta:
        model = Orden
        fields = ["id", "usuario", "fecha", "items", "total", "estado_pago", "pagada_at"]
        read_only_fields = ["usuario", "fecha", "total", "estado_pago", "pagada_at"]

    def create(self, validated_data):
        items_data = validated_data.pop("ordenitem_set", [])
        if not items_data:
            raise serializers.ValidationError({"items": "Debes agregar al menos un medicamento."})

        user = self.context["request"].user

        cantidades_por_medicamento = {}
        for item in items_data:
            medicamento_id = item["medicamento"].id
            cantidades_por_medicamento[medicamento_id] = cantidades_por_medicamento.get(medicamento_id, 0) + item["cantidad"]

        with transaction.atomic():
            orden = Orden.objects.create(usuario=user, total=0, **validated_data)
            total = 0

            medicamentos = {
                medicamento.id: medicamento
                for medicamento in Medicamento.objects.select_for_update().filter(id__in=cantidades_por_medicamento.keys())
            }

            for medicamento_id, cantidad in cantidades_por_medicamento.items():
                medicamento = medicamentos.get(medicamento_id)
                if medicamento is None:
                    raise serializers.ValidationError({"items": f"Medicamento {medicamento_id} no encontrado."})

                if medicamento.stock < cantidad:
                    raise serializers.ValidationError(
                        {"items": f"Stock insuficiente para {medicamento.nombre}. Disponible: {medicamento.stock}."}
                    )

                subtotal = medicamento.precio * cantidad
                OrdenItem.objects.create(
                    orden=orden,
                    medicamento=medicamento,
                    cantidad=cantidad,
                    subtotal=subtotal,
                )

                medicamento.stock -= cantidad
                medicamento.save(update_fields=["stock"])
                total += subtotal

            orden.total = total
            orden.save(update_fields=["total"])
        return orden


class UsuarioRegistroSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    email = serializers.EmailField(required=True)
    rol = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = Usuario
        fields = [
            "username",
            "password",
            "email",
            "rol",
            "nombre",
            "rut",
            "direccion",
            "telefono",
        ]

    def create(self, validated_data):
        return Usuario.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
            rol=validated_data.get("rol", RoleChoices.CLIENTE),
            nombre=validated_data.get("nombre", ""),
            rut=validated_data.get("rut", ""),
            direccion=validated_data.get("direccion", ""),
            telefono=validated_data.get("telefono", ""),
        )


class PagoSerializer(serializers.Serializer):
    cita_id = serializers.IntegerField()


class PagoOrdenSerializer(serializers.Serializer):
    orden_id = serializers.IntegerField()
