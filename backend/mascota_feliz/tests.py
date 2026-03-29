from datetime import timedelta
from decimal import Decimal
from unittest.mock import Mock, patch

import requests
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APITestCase

from .models import Cita, Mascota, Medicamento, Orden, OrdenItem, RoleChoices, RutaMovil, Transaccion, TransaccionOrden, Usuario
from .serializers import CitaSerializer


class CitaSerializerTests(TestCase):
    def setUp(self):
        self.owner = Usuario.objects.create_user(
            username="cliente_serializer",
            email="cliente_serializer@test.cl",
            password="Pass12345",
            rol=RoleChoices.CLIENTE,
        )
        self.mascota = Mascota.objects.create(
            nombre="Luna",
            especie="gato",
            raza="siames",
            edad=2,
            peso=3.5,
            usuario=self.owner,
        )

    def test_maps_cirugia_to_quirurgico(self):
        serializer = CitaSerializer(
            data={
                "subservicio": "cirugia",
                "fecha": (timezone.now() + timedelta(days=1)).isoformat(),
                "tipo": Cita.TipoCita.PRESENCIAL,
                "mascota": self.mascota.id,
                "motivo": "Control general",
            }
        )
        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertEqual(serializer.validated_data["subservicio"], Cita.Servicio.QUIRURGICO)


class RolePermissionTests(APITestCase):
    def setUp(self):
        self.cliente_a = Usuario.objects.create_user(
            username="cliente_a",
            email="cliente_a@test.cl",
            password="Pass12345",
            rol=RoleChoices.CLIENTE,
        )
        self.cliente_b = Usuario.objects.create_user(
            username="cliente_b",
            email="cliente_b@test.cl",
            password="Pass12345",
            rol=RoleChoices.CLIENTE,
        )
        self.veterinario = Usuario.objects.create_user(
            username="veterinario_1",
            email="veterinario@test.cl",
            password="Pass12345",
            rol=RoleChoices.VETERINARIO,
        )
        self.admin = Usuario.objects.create_user(
            username="admin_1",
            email="admin@test.cl",
            password="Pass12345",
            rol=RoleChoices.ADMIN,
            is_staff=True,
        )

        self.mascota_a = Mascota.objects.create(
            nombre="Toby",
            especie="perro",
            raza="mestizo",
            edad=5,
            peso=12.0,
            usuario=self.cliente_a,
        )
        self.mascota_b = Mascota.objects.create(
            nombre="Mora",
            especie="gato",
            raza="angora",
            edad=3,
            peso=4.2,
            usuario=self.cliente_b,
        )
        self.cita_a = Cita.objects.create(
            subservicio=Cita.Servicio.REVISION,
            fecha=timezone.now() + timedelta(days=1),
            tipo=Cita.TipoCita.PRESENCIAL,
            mascota=self.mascota_a,
            motivo="Chequeo",
        )
        self.cita_b = Cita.objects.create(
            subservicio=Cita.Servicio.ASEO,
            fecha=timezone.now() + timedelta(days=2),
            tipo=Cita.TipoCita.PRESENCIAL,
            mascota=self.mascota_b,
            motivo="Aseo",
        )
        self.orden_a = Orden.objects.create(usuario=self.cliente_a, total=Decimal("10000.00"))
        self.orden_b = Orden.objects.create(usuario=self.cliente_b, total=Decimal("20000.00"))
        medicamento = Medicamento.objects.create(
            nombre="Antiparasitario",
            descripcion="Uso oral",
            stock=20,
            precio=Decimal("10000.00"),
        )
        OrdenItem.objects.create(
            orden=self.orden_a,
            medicamento=medicamento,
            cantidad=1,
            subtotal=Decimal("10000.00"),
        )

    def test_cliente_only_sees_own_mascotas(self):
        self.client.force_authenticate(user=self.cliente_a)
        response = self.client.get("/api/mascotas/")
        self.assertEqual(response.status_code, 200)
        results = response.data["results"]
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["id"], self.mascota_a.id)

    def test_veterinario_can_read_all_citas(self):
        self.client.force_authenticate(user=self.veterinario)
        response = self.client.get("/api/citas/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["results"]), 2)

    def test_cliente_cannot_edit_other_cliente_cita(self):
        self.client.force_authenticate(user=self.cliente_a)
        response = self.client.patch(f"/api/citas/{self.cita_b.id}/", {"motivo": "Cambio"}, format="json")
        self.assertIn(response.status_code, [403, 404])

    def test_cliente_only_sees_own_ordenes(self):
        self.client.force_authenticate(user=self.cliente_a)
        response = self.client.get("/api/ordenes/")
        self.assertEqual(response.status_code, 200)
        results = response.data["results"]
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["id"], self.orden_a.id)

    def test_veterinario_can_update_allowed_mascota_fields(self):
        self.client.force_authenticate(user=self.veterinario)
        response = self.client.patch(
            f"/api/mascotas/{self.mascota_a.id}/",
            {"peso": 13.4, "edad": 6},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.mascota_a.refresh_from_db()
        self.assertEqual(self.mascota_a.edad, 6)
        self.assertEqual(self.mascota_a.peso, 13.4)

    def test_veterinario_cannot_create_mascota(self):
        self.client.force_authenticate(user=self.veterinario)
        response = self.client.post(
            "/api/mascotas/",
            {
                "nombre": "Neo",
                "especie": "perro",
                "raza": "mestizo",
                "edad": 2,
                "peso": 8.2,
            },
            format="json",
        )
        self.assertEqual(response.status_code, 403)

    def test_veterinario_cannot_update_restricted_mascota_fields(self):
        self.client.force_authenticate(user=self.veterinario)
        response = self.client.patch(
            f"/api/mascotas/{self.mascota_a.id}/",
            {"nombre": "Otro Nombre"},
            format="json",
        )
        self.assertEqual(response.status_code, 403)
        self.mascota_a.refresh_from_db()
        self.assertEqual(self.mascota_a.nombre, "Toby")

    def test_cliente_cannot_mark_own_cita_as_atendida(self):
        self.client.force_authenticate(user=self.cliente_a)
        response = self.client.patch(
            f"/api/citas/{self.cita_a.id}/",
            {"atendida": True},
            format="json",
        )
        self.assertEqual(response.status_code, 403)
        self.cita_a.refresh_from_db()
        self.assertFalse(self.cita_a.atendida)

    def test_veterinario_can_update_cita_clinical_fields(self):
        self.client.force_authenticate(user=self.veterinario)
        response = self.client.patch(
            f"/api/citas/{self.cita_a.id}/",
            {"motivo": "Control evolucion favorable", "atendida": True},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.cita_a.refresh_from_db()
        self.assertEqual(self.cita_a.motivo, "Control evolucion favorable")
        self.assertTrue(self.cita_a.atendida)

    def test_veterinario_cannot_create_cita(self):
        self.client.force_authenticate(user=self.veterinario)
        response = self.client.post(
            "/api/citas/",
            {
                "subservicio": Cita.Servicio.REVISION,
                "fecha": (timezone.now() + timedelta(days=5)).isoformat(),
                "tipo": Cita.TipoCita.PRESENCIAL,
                "mascota": self.mascota_a.id,
                "motivo": "Intento no permitido",
            },
            format="json",
        )
        self.assertEqual(response.status_code, 403)

    def test_ruta_movil_public_read(self):
        RutaMovil.objects.create(
            nombre_ruta="Ruta Centro",
            comuna="Santiago",
            fecha=timezone.now().date(),
            activo=True,
        )
        response = self.client.get("/api/rutas-movil/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["results"]), 1)

    def test_ruta_movil_write_requires_admin(self):
        payload = {
            "nombre_ruta": "Ruta Sur",
            "comuna": "La Florida",
            "fecha": str(timezone.now().date()),
            "activo": True,
        }

        self.client.force_authenticate(user=self.cliente_a)
        cliente_response = self.client.post("/api/rutas-movil/", payload, format="json")
        self.assertEqual(cliente_response.status_code, 403)

        self.client.force_authenticate(user=self.admin)
        admin_response = self.client.post("/api/rutas-movil/", payload, format="json")
        self.assertEqual(admin_response.status_code, 201)


class OrdenFlowTests(APITestCase):
    def setUp(self):
        self.cliente = Usuario.objects.create_user(
            username="cliente_orden",
            email="cliente_orden@test.cl",
            password="Pass12345",
            rol=RoleChoices.CLIENTE,
        )
        self.medicamento = Medicamento.objects.create(
            nombre="Analgesico",
            descripcion="Uso oral",
            stock=5,
            precio=Decimal("9000.00"),
        )

    def test_crear_orden_descuenta_stock(self):
        self.client.force_authenticate(user=self.cliente)
        response = self.client.post(
            "/api/ordenes/",
            {
                "items": [
                    {
                        "medicamento": self.medicamento.id,
                        "cantidad": 2,
                    }
                ]
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        self.medicamento.refresh_from_db()
        self.assertEqual(self.medicamento.stock, 3)
        self.assertEqual(Decimal(str(response.data["total"])), Decimal("18000.00"))
        self.assertEqual(response.data["estado_pago"], Orden.EstadoPago.PENDIENTE)

    def test_crear_orden_falla_si_stock_insuficiente(self):
        self.client.force_authenticate(user=self.cliente)
        response = self.client.post(
            "/api/ordenes/",
            {
                "items": [
                    {
                        "medicamento": self.medicamento.id,
                        "cantidad": 6,
                    }
                ]
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.medicamento.refresh_from_db()
        self.assertEqual(self.medicamento.stock, 5)
        self.assertIn("Stock insuficiente", str(response.data))


class PagoFlowTests(APITestCase):
    def setUp(self):
        self.cliente = Usuario.objects.create_user(
            username="cliente_pago",
            email="cliente_pago@test.cl",
            password="Pass12345",
            rol=RoleChoices.CLIENTE,
        )
        self.mascota = Mascota.objects.create(
            nombre="Kira",
            especie="perro",
            raza="beagle",
            edad=4,
            peso=10.5,
            usuario=self.cliente,
        )
        self.cita = Cita.objects.create(
            subservicio=Cita.Servicio.QUIRURGICO,
            fecha=timezone.now() + timedelta(days=1),
            tipo=Cita.TipoCita.PRESENCIAL,
            mascota=self.mascota,
            motivo="Cirugia menor",
        )

    @patch("mascota_feliz.views.requests.post")
    def test_crear_pago_persiste_transaccion_init(self, mock_post):
        mock_response = Mock()
        mock_response.raise_for_status.return_value = None
        mock_response.json.return_value = {"token": "token_init_123", "url": "https://webpay/init"}
        mock_post.return_value = mock_response

        self.client.force_authenticate(user=self.cliente)
        response = self.client.post("/api/pago/", {"cita_id": self.cita.id}, format="json")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["estado_pago"], "INIT")
        self.assertTrue(
            Transaccion.objects.filter(tbk_token="token_init_123", cita=self.cita, estado="INIT").exists()
        )

    @patch("mascota_feliz.views.requests.put")
    def test_commit_pago_authorized(self, mock_put):
        transaccion = Transaccion.objects.create(
            cita=self.cita,
            tbk_token="token_commit_ok",
            url_pago="https://webpay/init",
            estado="INIT",
        )

        mock_response = Mock()
        mock_response.raise_for_status.return_value = None
        mock_response.json.return_value = {"status": "AUTHORIZED", "response_code": 0}
        mock_put.return_value = mock_response

        response = self.client.post("/api/pago/commit/", {"token_ws": transaccion.tbk_token}, format="json")
        transaccion.refresh_from_db()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["estado_pago"], "AUTHORIZED")
        self.assertEqual(transaccion.estado, "OK")

    @patch("mascota_feliz.views.requests.put")
    def test_commit_pago_failed(self, mock_put):
        transaccion = Transaccion.objects.create(
            cita=self.cita,
            tbk_token="token_commit_fail",
            url_pago="https://webpay/init",
            estado="INIT",
        )

        mock_response = Mock()
        mock_response.raise_for_status.return_value = None
        mock_response.json.return_value = {"status": "FAILED", "response_code": -1}
        mock_put.return_value = mock_response

        response = self.client.post("/api/pago/commit/", {"token_ws": transaccion.tbk_token}, format="json")
        transaccion.refresh_from_db()

        self.assertEqual(response.status_code, 402)
        self.assertEqual(response.data["estado_pago"], "FAILED")
        self.assertEqual(transaccion.estado, "FAIL")

    def test_commit_pago_requires_token(self):
        response = self.client.post("/api/pago/commit/", {}, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["estado_pago"], "FAILED")

    def test_commit_pago_not_found(self):
        response = self.client.post("/api/pago/commit/", {"token_ws": "token_inexistente"}, format="json")
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.data["estado_pago"], "FAILED")

    @patch("mascota_feliz.views.requests.put")
    def test_commit_pago_idempotent_when_already_ok(self, mock_put):
        transaccion = Transaccion.objects.create(
            cita=self.cita,
            tbk_token="token_commit_already_ok",
            url_pago="https://webpay/init",
            estado="OK",
        )
        response = self.client.post("/api/pago/commit/", {"token_ws": transaccion.tbk_token}, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["estado_pago"], "AUTHORIZED")
        mock_put.assert_not_called()

    @patch("mascota_feliz.views.requests.put")
    def test_commit_pago_idempotent_when_already_fail(self, mock_put):
        transaccion = Transaccion.objects.create(
            cita=self.cita,
            tbk_token="token_commit_already_fail",
            url_pago="https://webpay/init",
            estado="FAIL",
        )
        response = self.client.post("/api/pago/commit/", {"token_ws": transaccion.tbk_token}, format="json")
        self.assertEqual(response.status_code, 402)
        self.assertEqual(response.data["estado_pago"], "FAILED")
        mock_put.assert_not_called()

    @patch("mascota_feliz.views.requests.put")
    def test_commit_pago_webpay_request_exception_sets_fail(self, mock_put):
        transaccion = Transaccion.objects.create(
            cita=self.cita,
            tbk_token="token_commit_error",
            url_pago="https://webpay/init",
            estado="INIT",
        )
        mock_put.side_effect = requests.RequestException("timeout")

        response = self.client.post("/api/pago/commit/", {"token_ws": transaccion.tbk_token}, format="json")
        transaccion.refresh_from_db()

        self.assertEqual(response.status_code, 502)
        self.assertEqual(response.data["estado_pago"], "FAILED")
        self.assertEqual(transaccion.estado, "FAIL")


class PagoOrdenFlowTests(APITestCase):
    def setUp(self):
        self.cliente = Usuario.objects.create_user(
            username="cliente_pago_orden",
            email="cliente_pago_orden@test.cl",
            password="Pass12345",
            rol=RoleChoices.CLIENTE,
        )
        self.medicamento = Medicamento.objects.create(
            nombre="Producto pago orden",
            descripcion="Medicamento demo",
            stock=10,
            precio=Decimal("12000.00"),
        )
        self.orden = Orden.objects.create(usuario=self.cliente, total=Decimal("24000.00"))
        OrdenItem.objects.create(
            orden=self.orden,
            medicamento=self.medicamento,
            cantidad=2,
            subtotal=Decimal("24000.00"),
        )

    @patch("mascota_feliz.views.requests.post")
    def test_crear_pago_orden_init(self, mock_post):
        mock_response = Mock()
        mock_response.raise_for_status.return_value = None
        mock_response.json.return_value = {"token": "orden_token_init", "url": "https://webpay/init"}
        mock_post.return_value = mock_response

        self.client.force_authenticate(user=self.cliente)
        response = self.client.post("/api/pago/orden/", {"orden_id": self.orden.id}, format="json")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["estado_pago"], "INIT")
        self.assertTrue(
            TransaccionOrden.objects.filter(tbk_token="orden_token_init", orden=self.orden, estado="INIT").exists()
        )

    @patch("mascota_feliz.views.requests.put")
    def test_commit_pago_orden_authorized(self, mock_put):
        transaccion = TransaccionOrden.objects.create(
            orden=self.orden,
            tbk_token="orden_token_ok",
            url_pago="https://webpay/init",
            estado="INIT",
        )

        mock_response = Mock()
        mock_response.raise_for_status.return_value = None
        mock_response.json.return_value = {"status": "AUTHORIZED", "response_code": 0}
        mock_put.return_value = mock_response

        response = self.client.post("/api/pago/orden/commit/", {"token_ws": transaccion.tbk_token}, format="json")

        transaccion.refresh_from_db()
        self.orden.refresh_from_db()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["estado_pago"], "AUTHORIZED")
        self.assertEqual(transaccion.estado, "OK")
        self.assertEqual(self.orden.estado_pago, Orden.EstadoPago.PAGADA)
        self.assertIsNotNone(self.orden.pagada_at)

    @patch("mascota_feliz.views.requests.put")
    def test_commit_pago_orden_failed(self, mock_put):
        transaccion = TransaccionOrden.objects.create(
            orden=self.orden,
            tbk_token="orden_token_fail",
            url_pago="https://webpay/init",
            estado="INIT",
        )

        mock_response = Mock()
        mock_response.raise_for_status.return_value = None
        mock_response.json.return_value = {"status": "FAILED", "response_code": -1}
        mock_put.return_value = mock_response

        response = self.client.post("/api/pago/orden/commit/", {"token_ws": transaccion.tbk_token}, format="json")

        transaccion.refresh_from_db()
        self.orden.refresh_from_db()

        self.assertEqual(response.status_code, 402)
        self.assertEqual(response.data["estado_pago"], "FAILED")
        self.assertEqual(transaccion.estado, "FAIL")
        self.assertEqual(self.orden.estado_pago, Orden.EstadoPago.FALLIDA)

    def test_commit_pago_orden_requires_token(self):
        response = self.client.post("/api/pago/orden/commit/", {}, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["estado_pago"], "FAILED")

    def test_commit_pago_orden_not_found(self):
        response = self.client.post("/api/pago/orden/commit/", {"token_ws": "token_inexistente"}, format="json")
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.data["estado_pago"], "FAILED")

    @patch("mascota_feliz.views.requests.put")
    def test_commit_pago_orden_idempotent_when_already_ok(self, mock_put):
        self.orden.estado_pago = Orden.EstadoPago.PAGADA
        self.orden.pagada_at = timezone.now()
        self.orden.save(update_fields=["estado_pago", "pagada_at"])

        transaccion = TransaccionOrden.objects.create(
            orden=self.orden,
            tbk_token="orden_token_already_ok",
            url_pago="https://webpay/init",
            estado="OK",
        )
        response = self.client.post("/api/pago/orden/commit/", {"token_ws": transaccion.tbk_token}, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["estado_pago"], "AUTHORIZED")
        mock_put.assert_not_called()

    @patch("mascota_feliz.views.requests.put")
    def test_commit_pago_orden_failed_does_not_downgrade_paid_order(self, mock_put):
        self.orden.estado_pago = Orden.EstadoPago.PAGADA
        self.orden.pagada_at = timezone.now()
        self.orden.save(update_fields=["estado_pago", "pagada_at"])

        transaccion = TransaccionOrden.objects.create(
            orden=self.orden,
            tbk_token="orden_token_paid_init",
            url_pago="https://webpay/init",
            estado="INIT",
        )
        mock_response = Mock()
        mock_response.raise_for_status.return_value = None
        mock_response.json.return_value = {"status": "FAILED", "response_code": -1}
        mock_put.return_value = mock_response

        response = self.client.post("/api/pago/orden/commit/", {"token_ws": transaccion.tbk_token}, format="json")

        transaccion.refresh_from_db()
        self.orden.refresh_from_db()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["estado_pago"], "AUTHORIZED")
        self.assertEqual(self.orden.estado_pago, Orden.EstadoPago.PAGADA)
        self.assertEqual(transaccion.estado, "INIT")

    @patch("mascota_feliz.views.requests.put")
    def test_commit_pago_orden_webpay_request_exception_sets_fallida(self, mock_put):
        transaccion = TransaccionOrden.objects.create(
            orden=self.orden,
            tbk_token="orden_token_error",
            url_pago="https://webpay/init",
            estado="INIT",
        )
        mock_put.side_effect = requests.RequestException("timeout")

        response = self.client.post("/api/pago/orden/commit/", {"token_ws": transaccion.tbk_token}, format="json")
        transaccion.refresh_from_db()
        self.orden.refresh_from_db()

        self.assertEqual(response.status_code, 502)
        self.assertEqual(response.data["estado_pago"], "FAILED")
        self.assertEqual(transaccion.estado, "FAIL")
        self.assertEqual(self.orden.estado_pago, Orden.EstadoPago.FALLIDA)


class DemoSmokeFlowTests(APITestCase):
    def setUp(self):
        self.password = "Pass12345"
        self.username = "cliente_smoke"
        self.email = "cliente_smoke@test.cl"
        self.medicamento = Medicamento.objects.create(
            nombre="Antibiotico demo",
            descripcion="Uso con receta veterinaria",
            stock=15,
            precio=Decimal("8000.00"),
        )

    def authenticate_cliente_via_jwt(self):
        registro_response = self.client.post(
            "/api/registro/",
            {
                "username": self.username,
                "password": self.password,
                "email": self.email,
                "rol": RoleChoices.CLIENTE,
                "nombre": "Cliente Demo",
            },
            format="json",
        )
        self.assertEqual(registro_response.status_code, 201)

        token_response = self.client.post(
            "/api/token/",
            {
                "username": self.username,
                "password": self.password,
            },
            format="json",
        )
        self.assertEqual(token_response.status_code, 200)
        access_token = token_response.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")

    def test_cliente_flujo_reserva_pago_y_farmacia_pago_orden(self):
        self.authenticate_cliente_via_jwt()

        mascota_response = self.client.post(
            "/api/mascotas/",
            {
                "nombre": "Nina",
                "especie": "perro",
                "raza": "mestizo",
                "edad": 2,
                "peso": 7.3,
            },
            format="json",
        )
        self.assertEqual(mascota_response.status_code, 201)
        mascota_id = mascota_response.data["id"]

        cita_response = self.client.post(
            "/api/citas/",
            {
                "subservicio": "cirugia",
                "fecha": (timezone.now() + timedelta(days=2)).isoformat(),
                "tipo": Cita.TipoCita.PRESENCIAL,
                "mascota": mascota_id,
                "motivo": "Revision pre operatoria",
            },
            format="json",
        )
        self.assertEqual(cita_response.status_code, 201)
        self.assertEqual(cita_response.data["subservicio"], Cita.Servicio.QUIRURGICO)
        cita_id = cita_response.data["id"]

        with patch("mascota_feliz.views.requests.post") as mock_post:
            init_response = Mock()
            init_response.raise_for_status.return_value = None
            init_response.json.return_value = {"token": "smoke_cita_token", "url": "https://webpay/init"}
            mock_post.return_value = init_response

            pago_init_response = self.client.post("/api/pago/", {"cita_id": cita_id}, format="json")

        self.assertEqual(pago_init_response.status_code, 200)
        self.assertEqual(pago_init_response.data["estado_pago"], "INIT")

        with patch("mascota_feliz.views.requests.put") as mock_put:
            commit_response = Mock()
            commit_response.raise_for_status.return_value = None
            commit_response.json.return_value = {"status": "AUTHORIZED", "response_code": 0}
            mock_put.return_value = commit_response

            pago_commit_response = self.client.post("/api/pago/commit/", {"token_ws": "smoke_cita_token"}, format="json")

        self.assertEqual(pago_commit_response.status_code, 200)
        self.assertEqual(pago_commit_response.data["estado_pago"], "AUTHORIZED")

        orden_response = self.client.post(
            "/api/ordenes/",
            {
                "items": [
                    {
                        "medicamento": self.medicamento.id,
                        "cantidad": 2,
                    }
                ]
            },
            format="json",
        )
        self.assertEqual(orden_response.status_code, 201)
        orden_id = orden_response.data["id"]

        self.medicamento.refresh_from_db()
        self.assertEqual(self.medicamento.stock, 13)

        with patch("mascota_feliz.views.requests.post") as mock_post:
            init_orden_response = Mock()
            init_orden_response.raise_for_status.return_value = None
            init_orden_response.json.return_value = {"token": "smoke_orden_token", "url": "https://webpay/init"}
            mock_post.return_value = init_orden_response

            pago_orden_init_response = self.client.post("/api/pago/orden/", {"orden_id": orden_id}, format="json")

        self.assertEqual(pago_orden_init_response.status_code, 200)
        self.assertEqual(pago_orden_init_response.data["estado_pago"], "INIT")

        with patch("mascota_feliz.views.requests.put") as mock_put:
            commit_orden_response = Mock()
            commit_orden_response.raise_for_status.return_value = None
            commit_orden_response.json.return_value = {"status": "AUTHORIZED", "response_code": 0}
            mock_put.return_value = commit_orden_response

            pago_orden_commit_response = self.client.post(
                "/api/pago/orden/commit/",
                {"token_ws": "smoke_orden_token"},
                format="json",
            )

        self.assertEqual(pago_orden_commit_response.status_code, 200)
        self.assertEqual(pago_orden_commit_response.data["estado_pago"], "AUTHORIZED")

        orden_detail_response = self.client.get(f"/api/ordenes/{orden_id}/")
        self.assertEqual(orden_detail_response.status_code, 200)
        self.assertEqual(orden_detail_response.data["estado_pago"], Orden.EstadoPago.PAGADA)

    def test_cliente_no_puede_iniciar_pago_de_orden_de_otro_cliente(self):
        otro_cliente = Usuario.objects.create_user(
            username="cliente_ajeno_smoke",
            email="cliente_ajeno_smoke@test.cl",
            password=self.password,
            rol=RoleChoices.CLIENTE,
        )
        orden_ajena = Orden.objects.create(usuario=otro_cliente, total=Decimal("12000.00"))

        self.authenticate_cliente_via_jwt()

        response = self.client.post("/api/pago/orden/", {"orden_id": orden_ajena.id}, format="json")
        self.assertEqual(response.status_code, 404)
