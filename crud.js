"use strict";
const baseURL = "http://localhost:8080";

const postForm = $("#post-form");
const postTitle = $("#post-title");
const postBody = $("#post-body");
const notif = $("#notif");
const postsList = $(".list");

const updateBody = $("#body");
const updateTitle = $("#title");
const updateBtn = $("#form");

const modalWindow = $(".wrapper");
const closeBtn = $("#close-btn");

//-------------Data fetching------------------------

async function getPosts(URL) {
    try {
        const req = await fetch(URL);
        const res = await req.json();

        if (req.status === 200) {
            renderData(res);
        }

        if (req.status === 404) {
            renderError('not found 404!')
        }

    } catch (err) {
        renderError(err.message)
    }
}

async function getPostById(URL, id) {
    try {
        const req = await fetch(`${URL}/${id}`);
        const res = await req.json();

        if (req.status === 200) {
            updateBody.value = res.body
            updateTitle.value = res.title


        }

        if (req.status === 404) {
            renderError('not found 404!')
        }

    } catch (err) {
        renderError(err.message)
    }
}

getPosts(`${baseURL}/posts`);

//-------------render data ------------------------

function renderData(data) {
    if (data.length) {

        data.forEach(el => {
            const listItem = createElement('li', 'p-4 mb-2 border rounded list-item',
                `<h5>${el.title}</h5>
                <p class='bg-light py-3'>${el.body}</p>
                <select class='dropdown'>
                <option selected disabled>...</option>
                <option id="edit" value="${'EDIT+' + el.id}">Edit</option>
                <option id="delete" value="${'DELETE+' + el.id}">Delete</option>

                </select>
                `
            );
            postsList.appendChild(listItem);
        });
    } else {
        postsList.innerHTML = "<h3 class='text-denger text-center'>NOT FOUND POSTS</h3>"
    }
}


//-------------render error ui -------------------

function renderError(err) {
    notif.textContent = err;
}

//-------------creat new post ---------------------

async function createPost(URL) {

    const newPost = {
        id: String(Date.now()),
        title: postTitle.value,
        body: postBody.value,
    }

    try {

        if (newPost.title.trim().length === 0 || newPost.body.trim().length === 0) {
            notif.textContent = 'Title and Body must not be empty!';
        } else {
            const req = await fetch(URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newPost),
            });

            if (req.status === 404) {
                renderError("Not found 404")
            }

        }

    } catch (err) {
        renderError(err.message)

    }
}

//-------------creat action== ---------------------

postForm.addEventListener('submit', (e) => {

    e.preventDefault();
    createPost(`${baseURL}/posts`);

});



async function deletePost(URL, id) {
    try {
         await fetch(`${URL}/${id}`, { method: 'DELETE' });
    } catch (err) {
        console.log(err.message);
    }
}


async function updatePost(URL, id,) {

    const updatePost = {
        title: updateTitle.value,
        body: updateBody.value,
    }

    try {
        const req = await fetch(`${URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatePost)
        })

        if (req.status === '201') {
            modalWindow.style.display = 'none';
        }

    } catch (err) {
        console.log(err.message);
    }
}


postsList.addEventListener('change', (e) => {

    e.preventDefault();

    console.log(e.target.nodeName);

    if (e.target.nodeName === "SELECT") {

        const id = e.target.value;
        const actionType = id.split('+');
        const postId = actionType[1];
        const eventType = actionType[0]

        if (eventType === "DELETE") {
            deletePost(`${baseURL}/posts`, postId)
        }

        if (eventType === "EDIT") {
            localStorage.setItem('update-id', postId)
            getPostById(`${baseURL}/posts`, postId)
            modalWindow.style.display = "grid";

        }
    }


})

closeBtn.addEventListener('click', () => {
    modalWindow.style.display = "none";
})

updateBtn.addEventListener('submit', () => {
    const id = localStorage.getItem('update-id')
    updatePost(`${baseURL}/posts`, id)
})


