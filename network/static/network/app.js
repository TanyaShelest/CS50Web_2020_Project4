// This piece of code is taken from w3schools
function getCookie(cname) {
  let name = cname + "="
  let decodedCookie = decodeURIComponent(document.cookie)
  let ca = decodedCookie.split(";")
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) == " ") {
      c = c.substring(1)
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length)
    }
  }
  return ""
}

// Simple error handler (just to avoid code duplication)
function handleError(error) {
  alert("Something went wrong")
  console.log(error)
}

function showEditForm(postContainer, postId) {
  // Create HTML edit form
  let editForm = `<form action="/edit_post/${postId}" method="put" id="editForm">    
                    <textarea name="body" cols="40" rows="10" id="editPost"></textarea>
                    <input class="btn btn-success rounded-pill" id="saveChanges" data-id="${postId}" type="submit" value="Save">
                    <input class="btn btn-outline-success rounded-pill" id="cancelChanges" type="submit" value="Cancel">
                  </form>`

  // Insert the form into the post container
  postContainer.insertAdjacentHTML("beforeend", editForm)

  let newText = postContainer.querySelector("#editPost")
  let oldText = postContainer.querySelector(".post-body").innerText

  // Pre-fill textarea with the existing post content
  newText.textContent = oldText

  // Clear the existing post content
  postContainer.querySelector(".post-body").innerText = ""

  // Hide the edit button
  postContainer.querySelector(".edit-post").style.display = "none"
}

function hideEditForm(postContainer) {
  postContainer.querySelector("#editForm").remove()
  postContainer.querySelector(".edit-post").style.display = "initial"
}

function saveEditedPost(postContainer, postId) {
  const csrftoken = getCookie("csrftoken")

  // Get new text from textarea
  newText = postContainer.querySelector("#editPost").value

  fetch(`http://127.0.0.1:8000/edit_post/${postId}`, {
    method: "PUT",
    mode: "same-origin",
    headers: {
      "X-CSRFToken": csrftoken,
    },
    body: JSON.stringify({ data: newText }),
  })
    .then(response => response.json())
    .then(() => {
      // Update post content with the new text
      postContainer.querySelector(".post-body").innerText = newText
    })
    .then(hideEditForm(postContainer)) // Hide the edit form
    .catch(error => handleError(error))
}

function editPost(event) {
  // Get elements of the post to edit
  let postContainer = event.target.parentElement
  let postId = event.target.dataset.post_id

  // Get the existing post content
  let oldText = postContainer.querySelector(".post-body").innerText

  showEditForm(postContainer, postId)

  // Handle save changes
  postContainer
    .querySelector("#saveChanges")
    .addEventListener("click", event => {
      event.preventDefault()

      saveEditedPost(postContainer, postId)
    })

  // Handle edit undo
  postContainer
    .querySelector("#cancelChanges")
    .addEventListener("click", event => {
      event.preventDefault()

      // Hide the edit form and restore the original post content
      hideEditForm(postContainer)
      postContainer.querySelector(".post-body").innerText = oldText
    })
}

function likePost(event) {
  event.preventDefault()
  // Get elements of the post to like
  postContainer = event.target.parentElement
  postId = postContainer.dataset.post_id
  likesCounter = postContainer.querySelector(".likes-counter")

  const csrftoken = getCookie("csrftoken")

  fetch("http://127.0.0.1:8000/like_post", {
    method: "POST",
    headers: {
      "X-CSRFToken": csrftoken,
    },
    body: JSON.stringify({ data: postId }),
  })
    .then(response => response.json())
    .then(data => {
      // Update the likes counter and toggle the active class on the like icon
      likesCounter.innerText = data.number_of_likes
      event.target.classList.toggle("active")
    })
    .catch(error => handleError(error))
}

// Handle likes on posts
let likeIcons = document.querySelectorAll("ion-icon")
likeIcons.forEach(likeIcon =>
  likeIcon.addEventListener("click", event => likePost(event)),
)

// Follow/unfollow a user
function follow(event) {
  event.preventDefault()
  const csrftoken = getCookie("csrftoken")

  fetch("http://127.0.0.1:8000/follow", {
    method: "POST",
    headers: {
      "X-CSRFToken": csrftoken,
    },
    body: JSON.stringify({ data: event.target.dataset.user_profile }),
  })
    .then(response => response.json())
    .then(data => {
      // Update the follow button value and the number of followers
      event.target.value = data.value
      event.target.parentElement.querySelector(".followers span").innerText =
        +data.number_of_followers
    })
    .catch(error => handleError(error))
}

// Create and show new post
function createPost(event) {
  event.preventDefault()
  const csrftoken = getCookie("csrftoken")
  let newPost = event.target.parentElement.querySelector("textarea")
  let posts = document.querySelector("#posts")

  fetch("http://127.0.0.1:8000/new_post", {
    method: "POST",
    headers: {
      "X-CSRFToken": csrftoken,
    },
    body: JSON.stringify({ data: newPost.value }),
  })
    .then(response => response.json())
    .then(data => {
      // Add created post to the page
      showNewPost(data, posts)
    })
    // Clear the form
    .then((newPost.value = ""))
    .catch(error => handleError(error))
}

function showNewPost(post, container) {
  // Create HTML for new post
  let newPostHTML = `<li class="list-group-item bg-light mb-2">
            <div class="post-container" data-post_id="${post.id}">
              <p>
                <a href="/profile/${post.author}" class="h5">${post.author}</a>
              </p>
              <small>${post.created_at}</small>
              <div class="post-body">${post.body}</div>
              <small class="likes-counter">0</small>
              <ion-icon name="heart" role="img" aria-label="heart">
                <div class="red-bg"></div>
              </ion-icon>
              <a href="#" class="btn btn-md btn-success rounded-pill m-2 edit-post" data-post_id="${post.id}" onclick="editPost(event)">Edit</a>
            </div>
          </li>`

  // Add new post to the page
  container.insertAdjacentHTML("beforebegin", newPostHTML)
}
