from django.db import migrations


def normalize_subservicio_forward(apps, schema_editor):
    Cita = apps.get_model("mascota_feliz", "Cita")
    Cita.objects.filter(subservicio="cirugia").update(subservicio="quirurgico")


def normalize_subservicio_backward(apps, schema_editor):
    Cita = apps.get_model("mascota_feliz", "Cita")
    Cita.objects.filter(subservicio="quirurgico").update(subservicio="cirugia")


class Migration(migrations.Migration):
    dependencies = [
        ("mascota_feliz", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(normalize_subservicio_forward, normalize_subservicio_backward),
    ]
