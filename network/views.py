from django.contrib.auth import authenticate, login, logout
from django.core.paginator import Paginator
from django.db import IntegrityError
from django.http import HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import ensure_csrf_cookie
from datetime import datetime
import json
from .models import User, Profile, Post, Like


def index(request):
    posts = Post.objects.order_by('-created_at')
    paginator = Paginator(posts, 10)

    current_page = request.GET.get('page')
    page = paginator.get_page(current_page)

    return render(request, "network/index.html", {
        "posts": page,
    })


@login_required
def new_post(request):
    if request.method == 'POST':

        data = json.loads(request.body)
        post = Post.objects.create(body=data.get('data'), author=request.user)
        post.save()
        post_obj = {
            "id": post.id, 
            "body": post.body, 
            "author": post.author.username, 
            "created_at": post.created_at.strftime("%B %d, %Y, %H:%M")
            }
        return JsonResponse(post_obj, status=202)

    else:
        return JsonResponse({"message": request.method}, status=404)


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")


@login_required
def profile(request, username):
    user = User.objects.get(username=username)
    user_profile = Profile.objects.get(user=user)
    user_follows = user_profile.follows.all()
    user_followers = user_profile.followed_by.all()
    user_posts = Post.objects.filter(author=user).order_by("-created_at")
    request_user_profile = Profile.objects.get(user=request.user)
    function_to_call = ''
    if request_user_profile.follows.contains(user.profile):
        function_to_call = "unfollow"
    else:
        function_to_call = "follow"

    return render(request, "network/profile.html", {
        "user_profile": user_profile,
        "user_followers": user_followers,
        "user_follows": user_follows,
        "user_posts": user_posts,
        "function_to_call": function_to_call
    })


@login_required
@ensure_csrf_cookie
def edit_post(request, id):
    if request.method == 'PUT':
        post = Post.objects.get(id=id)
        data = json.loads(request.body)
        post.body = data.get('data')
        post.author = request.user
        post.created_at = datetime.now()
        post.save()

        return JsonResponse({"message": "Ok"}, status=202)

    else:
        return JsonResponse({"message": request.method}, status=404)


@login_required
def following(request):
    user_profile = Profile.objects.get(user_id=request.user.id)
    posts = Post.objects.filter(
        author__in=user_profile.follows.all()
        .values("user")).order_by('-created_at')
    paginator = Paginator(posts, 10)
    current_page = request.GET.get('page')
    page = paginator.get_page(current_page)

    return render(request, "network/following.html", {
        "user_profile": user_profile,
        "posts": page,
    })


@ensure_csrf_cookie
@login_required
def follow(request):
    if request.method == "POST":
        request_user_profile = Profile.objects.get(user=request.user)
        data = json.loads(request.body)
        user_profile_id = data.get("data")
        user_profile = Profile.objects.get(id=user_profile_id)
        request_user_profile.follows.add(user_profile)


        return JsonResponse({"message": "Ok"}, status=202)
    else:
        return JsonResponse({"message": "Must be POST request"}, status=403)


@ensure_csrf_cookie
@login_required
def unfollow(request):
    if request.method == "POST":

        request_user_profile = Profile.objects.get(user=request.user)
        data = json.loads(request.body)
        user_profile_id = data.get("data")        
        user_profile = Profile.objects.get(id=user_profile_id)

        request_user_profile.follows.remove(user_profile)

        return JsonResponse({"message": "Ok"}, status=202)
    else:
        return JsonResponse({"message": "Must be POST request"}, status=403)


@login_required
def like_post(request):
    data = json.loads(request.body)
    post_id = data.get("data")
    post = Post.objects.get(id=post_id)

    liked = Like.objects.filter(post=post, author=request.user)

    if not liked: 
        like = Like.objects.create(post=post, author=request.user)
        like.save()
        post.number_of_likes += 1
        post.user_likes.add(request.user)
        post.save()
        return JsonResponse({"number_of_likes": post.number_of_likes}, status=200)
    else:
        liked.delete()
        post.number_of_likes -= 1
        post.user_likes.remove(request.user)
        post.save()
        return JsonResponse({"number_of_likes": post.number_of_likes}, status=200)


