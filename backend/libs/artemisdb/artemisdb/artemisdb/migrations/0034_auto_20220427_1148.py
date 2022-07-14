# Generated by Django 3.2.13 on 2022-04-27 11:48

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("artemisdb", "0033_auto_20220322_1358"),
    ]

    operations = [
        migrations.AddField(
            model_name="scan",
            name="description",
            field=models.CharField(max_length=1024, null=True),
        ),
        migrations.CreateModel(
            name="ScanBatch",
            fields=[
                ("id", models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("batch_id", models.UUIDField(unique=True)),
                ("description", models.CharField(max_length=1024)),
                ("created", models.DateTimeField(auto_now_add=True)),
                (
                    "created_by",
                    models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to="artemisdb.user"),
                ),
            ],
        ),
        migrations.AddField(
            model_name="scan",
            name="batch",
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to="artemisdb.scanbatch"),
        ),
    ]