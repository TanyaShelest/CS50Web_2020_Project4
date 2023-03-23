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

function showEditForm(postContainer, postId) {
  let editForm = `<form action="/edit_post/${postId}" method="put" id="editForm">    
                    <textarea name="body" cols="40" rows="10" id="editPost"></textarea>
                        <input class="btn btn-primary" id="saveChanges" data-id="${postId}" type="submit" value="Save">
                        <input class="btn btn-primary" id="cancelChanges" type="submit" value="Cancel">
                    </form>`
  postContainer.insertAdjacentHTML("beforeend", editForm)
  let newText = postContainer.querySelector("#editPost")
  let oldText = postContainer.querySelector(".post-body").innerText
  newText.textContent = oldText
  postContainer.querySelector(".post-body").innerText = ""
  postContainer.querySelector(".edit-post").style.display = "none"
}

function hideEditForm(postContainer) {
  postContainer.querySelector("#editForm").remove()
  postContainer.querySelector(".edit-post").style.display = "initial"
}

function editPost(event) {
  let postContainer = event.target.parentElement
  let postId = event.target.dataset.post_id
  let oldText = postContainer.querySelector(".post-body").innerText
  showEditForm(postContainer, postId)

  postContainer
    .querySelector("#saveChanges")
    .addEventListener("click", (event) => {
      event.preventDefault()
      const csrftoken = getCookie("csrftoken")
      newText = postContainer.querySelector("#editPost").value

      fetch(`http://127.0.0.1:8000/edit_post/${postId}`, {
        method: "PUT",
        mode: "same-origin",
        headers: {
          "X-CSRFToken": csrftoken,
          "Content-Type": "text/plain",
        },
        body: JSON.stringify({ data: newText }),
      })
        .then((response) => response.json())
        .then((postContainer.querySelector(".post-body").innerText = newText))
        .then(hideEditForm(postContainer))
    })

  postContainer
    .querySelector("#cancelChanges")
    .addEventListener("click", (event) => {
      event.preventDefault()
      hideEditForm(postContainer)
      postContainer.querySelector(".post-body").innerText = oldText
    })
}


let likeIcons = document.querySelectorAll("ion-icon")
likeIcons.forEach((likeIcon) =>
  likeIcon.addEventListener("click", (event) => {
    event.preventDefault()
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
      .then((response) => response.text())
      .then(text => {
        try {
            const data = JSON.parse(text)
            likesCounter.innerText = data["number_of_likes"]
            likeIcon.classList.toggle("active")
        } catch(error) {
            alert("Something went wrong")
        }
      })
  })
)

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
    .then((response) => response.json())
    .then((event.target.value = "unfollow"))
}

function unfollow(event) {
  event.preventDefault()
  const csrftoken = getCookie("csrftoken")

  fetch("http://127.0.0.1:8000/unfollow", {
    method: "POST",
    headers: {
      "X-CSRFToken": csrftoken,
    },
    body: JSON.stringify({ data: event.target.dataset.user_profile }),
  })
    .then((response) => response.json())
    .then((event.target.value = "follow"))
}

document.querySelector("form#newPost").addEventListener("submit", (event) => {
  event.preventDefault()
  const csrftoken = getCookie("csrftoken")
  let formData = event.target.parentElement.querySelector("textarea")

  let posts = document.querySelector("#posts")

  fetch("http://127.0.0.1:8000/new_post", {
    method: "POST",
    headers: {
      "X-CSRFToken": csrftoken,
      "Content-Type": "text/plain",
    },
    body: JSON.stringify({ data: formData.value }),
  })
    .then((response) => response.json())
    .then((data) => {
      let newPostItem = document.createElement("li")
      posts.prepend(newPostItem)
      let newPostContainer = document.createElement("div")
      newPostContainer.classList.add("post-container")
      newPostItem.appendChild(newPostContainer)
      let author = document.createElement("p")
      author.textContent = data.author
      let createdAt = document.createElement("small")
      createdAt.textContent = data.created_at
      let postBody = document.createElement("div")
      postBody.textContent = data.body
      let editButton = document.createElement("a")
      editButton.textContent = "Edit"

      editButton.setAttribute("href", "#")
      editButton.setAttribute("class", "btn btn-sm btn-primary edit-post")
      editButton.setAttribute("onclick", "editPost(event)")
      editButton.setAttribute("data-post_id", "data.id")
      newPostContainer.append(author, createdAt, postBody, editButton)
    })
    .then((formData.value = ""))
})
