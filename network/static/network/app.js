function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
        c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
        }
    }
    return "";
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
    

    postContainer.querySelector("#saveChanges").addEventListener("click", (event) => {
        event.preventDefault()
        const csrftoken = getCookie('csrftoken')
        newText = postContainer.querySelector("#editPost").value

        fetch(`http://127.0.0.1:8000/edit_post/${postId}`,{
                method: "PUT",
                mode: "same-origin",
                headers: {"X-CSRFToken": csrftoken,
                "Content-Type": "text/plain"},
                body: JSON.stringify({data: newText})
            })
            .then(response => response.json())
            .then(postContainer.querySelector(".post-body").innerText = newText)
            .then(hideEditForm(postContainer))        
    })

    postContainer.querySelector("#cancelChanges").addEventListener("click", (event) => {
        event.preventDefault()
        hideEditForm(postContainer)
        postContainer.querySelector(".post-body").innerText = oldText
    })
    
}