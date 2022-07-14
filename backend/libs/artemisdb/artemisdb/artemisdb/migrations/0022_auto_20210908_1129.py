# Generated by Django 3.2.5 on 2021-09-08 11:29

import django.db.models.deletion
from django.db import migrations, models


def set_to_null(apps, schema_editor):
    allowlistitem = apps.get_model("artemisdb", "allowlistitem")
    allowlistitem.objects.update(created=None)
    allowlistitem.objects.update(updated=None)


class Migration(migrations.Migration):

    atomic = False

    dependencies = [
        ("artemisdb", "0021_user_scope_lowercase"),
    ]

    operations = [
        migrations.AddField(
            model_name="allowlistitem",
            name="created",
            field=models.DateTimeField(auto_now_add=True, null=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="allowlistitem",
            name="updated_by",
            field=models.ForeignKey(
                null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="updated_by", to="artemisdb.user"
            ),
        ),
        migrations.AddField(
            model_name="allowlistitem",
            name="updated",
            field=models.DateTimeField(auto_now=True, null=True),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name="allowlistitem",
            name="created_by",
            field=models.ForeignKey(
                null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="created_by", to="artemisdb.user"
            ),
        ),
        migrations.RunPython(code=set_to_null, reverse_code=migrations.RunPython.noop),
    ]