from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from datetime import datetime
import json

from .models import User, Profile, Post
from .forms import PostForm


def index(request):
     # if this is a POST request we need to process the form data
    if request.method == 'POST':
        # create a form instance and populate it with data from the request:
        form = PostForm(request.POST)
        # check whether it's valid:
        if form.is_valid():
            post = form.save(commit=False)
            post.author = request.user
            post.save()

            messages.info(request, f'Your message is here')
            return HttpResponseRedirect(reverse("index"))
            

    # if a GET (or any other method) we'll create a blank form
    else:
        form = PostForm()

    return render(request, "network/index.html", {
        "posts": Post.objects.order_by('-created_at'),
        "form": form
    })


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


def profile(request, id):
    user = request.user
    user_profile = Profile.objects.get(user=user)
    user_follows = user_profile.follows.all()
    user_followers = user_profile.followed_by.all()

    followers_count = user_followers.count()
    return render(request, "network/profile.html", {
        user: user,
        user_followers: user_followers,
        user_follows: user_follows, 
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
