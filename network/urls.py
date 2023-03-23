from django.urls import path
from django.contrib.auth import views as auth_views
from . import views


urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("profile/<str:username>", views.profile, name="profile"),
    path("new_post", views.new_post, name="new_post"),
    path("edit_post/<int:id>", views.edit_post, name="edit_post"),
    path("following", views.following, name="following"),
    path("follow", views.follow, name="follow"),
    path("unfollow", views.unfollow, name="unfollow"),
    path("like_post", views.like_post, name="like_post"),
]
