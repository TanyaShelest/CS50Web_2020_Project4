# Generated by Django 4.1.2 on 2023-02-07 21:55

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('network', '0002_rename_user_id_profile_user'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='post',
            name='title',
        ),
    ]