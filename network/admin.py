from django.contrib import admin

from .models import Post, User, Profile, Like


class PostAdmin(admin.ModelAdmin):
    list_display = ("author", "body")
    fields = ("author", "body", "number_of_likes")

admin.site.register(User)
admin.site.register(Profile)
admin.site.register(Post, PostAdmin)
admin.site.register(Like)
