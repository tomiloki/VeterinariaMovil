from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone

from mascota_feliz.models import Cita, Mascota, Medicamento, Orden, OrdenItem, RoleChoices, RutaMovil


class Command(BaseCommand):
    help = "Carga datos demo para portafolio (usuarios, mascotas, citas, farmacia y ordenes)."

    def add_arguments(self, parser):
        parser.add_argument(
            "--reset",
            action="store_true",
            help="Elimina catalogo/ordenes/rutas demo antes de recargar.",
        )

    def handle(self, *args, **options):
        User = get_user_model()

        if options["reset"]:
            OrdenItem.objects.all().delete()
            Orden.objects.all().delete()
            Medicamento.objects.all().delete()
            RutaMovil.objects.all().delete()
            self.stdout.write(self.style.WARNING("Catalogo demo reiniciado."))

        cliente, _ = User.objects.get_or_create(
            username="cliente_demo",
            defaults={
                "email": "cliente.demo@mascotafeliz.cl",
                "rol": RoleChoices.CLIENTE,
                "nombre": "Camila Soto",
                "rut": "11111111-1",
                "direccion": "Av. Providencia 1234, Santiago",
                "telefono": "56912345678",
            },
        )
        if not cliente.check_password("Demo1234"):
            cliente.set_password("Demo1234")
            cliente.save(update_fields=["password"])

        veterinario, _ = User.objects.get_or_create(
            username="veterinario_demo",
            defaults={
                "email": "veterinario.demo@mascotafeliz.cl",
                "rol": RoleChoices.VETERINARIO,
                "nombre": "Dr. Felipe Rojas",
                "telefono": "56998765432",
            },
        )
        if not veterinario.check_password("Demo1234"):
            veterinario.set_password("Demo1234")
            veterinario.save(update_fields=["password"])

        admin, _ = User.objects.get_or_create(
            username="admin_demo",
            defaults={
                "email": "admin.demo@mascotafeliz.cl",
                "rol": RoleChoices.ADMIN,
                "is_staff": True,
                "is_superuser": True,
                "nombre": "Admin MascotaFeliz",
            },
        )
        admin.is_staff = True
        admin.is_superuser = True
        if not admin.check_password("Demo1234"):
            admin.set_password("Demo1234")
            admin.save(update_fields=["password", "is_staff", "is_superuser"])
        else:
            admin.save(update_fields=["is_staff", "is_superuser"])

        mascota_1, _ = Mascota.objects.get_or_create(
            usuario=cliente,
            nombre="Luna",
            defaults={
                "especie": "gato",
                "raza": "Europeo",
                "edad": 3,
                "peso": 4.1,
            },
        )
        mascota_2, _ = Mascota.objects.get_or_create(
            usuario=cliente,
            nombre="Rocky",
            defaults={
                "especie": "perro",
                "raza": "Beagle",
                "edad": 6,
                "peso": 14.2,
            },
        )

        now = timezone.now()
        Cita.objects.get_or_create(
            mascota=mascota_1,
            fecha=now + timedelta(days=2),
            defaults={
                "tipo": Cita.TipoCita.PRESENCIAL,
                "subservicio": Cita.Servicio.REVISION,
                "motivo": "Control anual y vacunas.",
            },
        )
        Cita.objects.get_or_create(
            mascota=mascota_2,
            fecha=now + timedelta(days=4),
            defaults={
                "tipo": Cita.TipoCita.MOVIL,
                "subservicio": Cita.Servicio.ASEO,
                "direccion": cliente.direccion,
                "motivo": "Bano dermatologico y corte de unas.",
            },
        )

        medicamentos = [
            ("Simparica Trio 10-20kg", "Antiparasitario interno y externo para caninos.", 24, Decimal("19990")),
            ("Bravecto Spot On Gatos", "Pipeta antipulgas y garrapatas de larga duracion.", 18, Decimal("25990")),
            ("NexGard Spectra 7.5-15kg", "Proteccion mensual contra pulgas, garrapatas y parasitos internos.", 26, Decimal("23990")),
            ("Credelio Plus 11-22kg", "Comprimido palatable antiparasitario de amplio espectro.", 18, Decimal("21990")),
            ("Advantix Spot On 10-25kg", "Pipeta repelente de pulgas, garrapatas y mosquitos para perros.", 17, Decimal("18990")),
            ("Revolution Plus Gatos 2.5-5kg", "Antiparasitario topico para pulgas, acaros y nematodos.", 15, Decimal("22990")),
            ("Apoquel 16mg", "Control de prurito y dermatitis alergica en perros.", 14, Decimal("34990")),
            ("Atopica 25mg", "Inmunomodulador para dermatitis atopica canina.", 12, Decimal("38990")),
            ("Cytopoint 20mg", "Terapia biologica para prurito alergico en perros.", 8, Decimal("49990")),
            ("Otiflex Gotas 20ml", "Limpieza y tratamiento de otitis externas.", 22, Decimal("8990")),
            ("Shampoo Clorhexidina 250ml", "Higiene dermatologica para piel sensible.", 28, Decimal("7990")),
            ("Miconazol Shampoo 200ml", "Shampoo terapeutico antifungico y antibacteriano.", 20, Decimal("9990")),
            ("Espuma Clorhexivet 150ml", "Espuma dermatologica para piel sensible y pliegues.", 16, Decimal("11490")),
            ("Synulox 250mg", "Antibiotico de amplio espectro para infecciones bacterianas.", 20, Decimal("12990")),
            ("Doxiciclina Vet 100mg", "Antibiotico para infecciones respiratorias y vectoriales.", 22, Decimal("10990")),
            ("Marbofloxacino 50mg", "Antibiotico para infecciones urinarias y de piel.", 14, Decimal("17990")),
            ("Clavamox 250mg", "Amoxicilina con acido clavulanico para infecciones bacterianas.", 18, Decimal("13490")),
            ("Meloxicam Susp 15ml", "Antiinflamatorio y analgesico para dolor osteoarticular.", 16, Decimal("10990")),
            ("Carprofeno 50mg", "Analgesico antiinflamatorio para dolor osteoarticular.", 19, Decimal("13990")),
            ("Gabapentina 100mg", "Co-analgesico para dolor neuropatico y manejo multimodal.", 21, Decimal("8990")),
            ("Tramadol Gotas Vet 10ml", "Analgesia de apoyo en dolor moderado.", 24, Decimal("7590")),
            ("Hepatoprotector Vet", "Soporte hepatico en tratamientos prolongados.", 10, Decimal("16990")),
            ("Omega 3 EPA DHA Vet", "Suplemento para piel, articulaciones y salud cardiovascular.", 17, Decimal("15990")),
            ("Probiotico Enterogerm Vet", "Restablece flora intestinal en cuadros digestivos.", 19, Decimal("9490")),
            ("Probioticum Gastro Vet", "Suplemento probiotico para soporte digestivo diario.", 20, Decimal("10490")),
            ("Suplemento Articular Condroflex", "Glucosamina y condroitina para articulaciones.", 15, Decimal("22990")),
            ("Royal Canin Renal Canino 2kg", "Alimento medicado para soporte renal.", 12, Decimal("27990")),
            ("Royal Canin Renal Felino 2kg", "Alimento medicado renal para gatos adultos.", 11, Decimal("28490")),
            ("Royal Canin Gastrointestinal Canino 2kg", "Alimento medicado para sensibilidad digestiva.", 13, Decimal("28990")),
            ("Hills k/d Felino 1.8kg", "Dieta de soporte renal para gatos con enfermedad cronica.", 9, Decimal("31990")),
            ("Collar Isabelino M", "Proteccion postquirurgica para recuperacion segura.", 30, Decimal("6990")),
            ("Gasas Esteriles Pack", "Insumo para curaciones y control post operatorio.", 40, Decimal("3990")),
            ("Solucion Fisiologica 250ml", "Limpieza de heridas e hidratacion de apoyo.", 34, Decimal("2990")),
            ("Jeringa Oral 10ml Pack x5", "Administracion segura de medicamentos liquidos.", 35, Decimal("3490")),
            ("Vendas Cohesivas Vet Pack", "Fijacion para curaciones y soporte de vendajes.", 27, Decimal("5490")),
            ("Guantes Nitrilo M Pack x50", "Insumo de proteccion para curaciones domiciliarias.", 14, Decimal("6990")),
            ("Antiseptico Clorhexidina 2% 100ml", "Limpieza antiseptica de piel y zonas de curacion.", 23, Decimal("6490")),
            ("Lagrimas Artificiales Vet 15ml", "Lubricacion ocular para irritacion y resequedad.", 18, Decimal("8290")),
            ("Limpiador Auricular Suave 120ml", "Higiene preventiva de oidos en perros y gatos.", 25, Decimal("7790")),
        ]

        for nombre, descripcion, stock, precio in medicamentos:
            Medicamento.objects.update_or_create(
                nombre=nombre,
                defaults={
                    "descripcion": descripcion,
                    "stock": stock,
                    "precio": precio,
                },
            )

        rutas = [
            ("Ruta Oriente", "Las Condes", now.date() + timedelta(days=1), True),
            ("Ruta Centro", "Santiago", now.date() + timedelta(days=2), True),
            ("Ruta Sur", "La Florida", now.date() + timedelta(days=3), True),
        ]
        for nombre_ruta, comuna, fecha, activo in rutas:
            RutaMovil.objects.update_or_create(
                nombre_ruta=nombre_ruta,
                fecha=fecha,
                defaults={
                    "comuna": comuna,
                    "activo": activo,
                },
            )

        meds = list(Medicamento.objects.order_by("nombre")[:2])
        if meds:
            orden = Orden.objects.filter(usuario=cliente).order_by("id").first()
            if not orden:
                orden = Orden.objects.create(usuario=cliente, total=0)

            if orden.ordenitem_set.count() == 0:
                total = Decimal("0")
                for idx, med in enumerate(meds, start=1):
                    cantidad = idx
                    subtotal = med.precio * cantidad
                    OrdenItem.objects.create(
                        orden=orden,
                        medicamento=med,
                        cantidad=cantidad,
                        subtotal=subtotal,
                    )
                    total += subtotal
                orden.total = total
                orden.save(update_fields=["total"])

        self.stdout.write(self.style.SUCCESS("Datos demo cargados correctamente."))
        self.stdout.write("Usuarios demo: cliente_demo / veterinario_demo / admin_demo")
        self.stdout.write("Clave demo para todos: Demo1234")
