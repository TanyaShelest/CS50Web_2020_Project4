from django.contrib.auth.models import AbstractUser
from django.db import models
from django.dispatch import receiver
from django.db.models.signals import post_save

class User(AbstractUser):
    first_name = models.CharField(max_length=50, unique=False)
    last_name = models.CharField(max_length=50, unique=False)

    def __str__(self):
        return f"{self.id}: {self.first_name} {self.last_name}"

    def full_name(self):
        return f"{self.first_name} {self.last_name}"

class Profile(models.Model):
    user = models.OneToOneField("User", on_delete=models.CASCADE)
    follows = models.ManyToManyField("self", related_name="followed_by", symmetrical=False, blank=True)

    @receiver(post_save, sender=User)
    def create_profile(sender, created, instance, **kwargs):
        if created:
            profile = Profile(user=instance)
            profile.save()
            profile.follows.set([])
            profile.save()

    def __str__(self):
            return self.user.username

class Post(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=50)
    body = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

class Like(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    