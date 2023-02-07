from django.contrib import admin

from .models import Post, User, Profile


class UserAdmin(admin.ModelAdmin):
    pass


class ProfileAdmin(admin.ModelAdmin):
    pass


class PostAdmin(admin.ModelAdmin):
    list_display = ("author", "body")
    fields = ("author", "body")

admin.site.register(User, UserAdmin)
admin.site.register(Profile, ProfileAdmin)
admin.site.register(Post, PostAdmin)
