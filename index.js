import { getPosts } from "./api.js";
import { addPost } from "./api.js";
import { getPostsUser } from "./api.js";
import { renderAddPostPageComponent } from "./components/add-post-page-component.js";
import { renderAuthPageComponent } from "./components/auth-page-component.js";
import { formatDistanceToNow } from "date-fns";
import {
  ADD_POSTS_PAGE,
  AUTH_PAGE,
  LOADING_PAGE,
  POSTS_PAGE,
  USER_POSTS_PAGE,
} from "./routes.js";
import { renderPostsPageComponent } from "./components/posts-page-component.js";
import { renderLoadingPageComponent } from "./components/loading-page-component.js";
import {
  getUserFromLocalStorage,
  removeUserFromLocalStorage,
  saveUserToLocalStorage,
} from "./helpers.js";
import { likePost, dislikePost } from "./api.js";

export let user = getUserFromLocalStorage();
export let page = null;
export let posts = [];

const getToken = () => {
  const token = user ? `Bearer ${user.token}` : undefined;
  return token;
};

export const logout = () => {
  user = null;
  removeUserFromLocalStorage();
  goToPage(POSTS_PAGE);
};

/**
 * Включает страницу приложения
 */
export const goToPage = (newPage, data) => {
  if (
    [
      POSTS_PAGE,
      AUTH_PAGE,
      ADD_POSTS_PAGE,
      USER_POSTS_PAGE,
      LOADING_PAGE,
    ].includes(newPage)
  ) {
    if (newPage === ADD_POSTS_PAGE) {
      // Если пользователь не авторизован, то отправляем его на авторизацию перед добавлением поста
      page = user ? ADD_POSTS_PAGE : AUTH_PAGE;
      return renderApp();
    }

    if (newPage === POSTS_PAGE) {
      page = LOADING_PAGE;
      renderApp();

      return getPosts({ token: getToken() })
        .then((newPosts) => {
          page = POSTS_PAGE;
          posts = newPosts;
          renderApp();
        })
        .catch((error) => {
          console.error(error);
          goToPage(POSTS_PAGE);
        });
    }

    if (newPage === USER_POSTS_PAGE) {
      getPostsUser({ token: getToken() }, data.userId).then((response) => {
        posts = response
        renderApp()
      })
      // TODO: реализовать получение постов юзера из API
      console.log("Открываю страницу пользователя: ", data.userId);
      page = USER_POSTS_PAGE;
    }

    page = newPage;
    renderApp();

    return;
  }

  throw new Error("страницы не существует");
};

export const addlike = (id) => {
  likePost({token: getToken()}, id).then(response => {
    getPosts({ token: getToken() }).then(data => {
      posts = data;
      renderApp()
      })
      }
    )
}

export const removelike = (id) => {
  dislikePost({token: getToken()}, id ).then(response => {
    getPosts({ token: getToken()}).then(data => {
      posts = data;
      renderApp()
    })
  })
}

//

const addlikeUser = (id, userId) => {
  // posts.forEach(post => {
  //   if (post.id == id) {
  //     post.isLiked =  true
  //     post.likes.push([])
  //     renderApp()
  //   }
  // })
  likePost({token: getToken()}, id).then(response => {
    getPostsUser({ token: getToken() }, userId).then(data => {
      posts = data
      renderApp()
      })
      }
    )
}

const removelikeUser = (id, userId) => {
  // posts.forEach(post => {
  //   if (post.id == id) {
  //     post.isLiked =  false
  //     post.likes.pop()

  //     renderApp()
  //   }
  // })
  dislikePost({token: getToken()}, id ).then(response => {
    getPostsUser({ token: getToken() }, userId).then(data => {
      posts = data
      renderApp()
    })
  })
}


export const renderApp = () => {
  const appEl = document.getElementById("app");
  if (page === LOADING_PAGE) {
    return renderLoadingPageComponent({
      appEl,
      user,
      goToPage,
    });
  }

  if (page === AUTH_PAGE) {
    return renderAuthPageComponent({
      appEl,
      setUser: (newUser) => {
        user = newUser;
        saveUserToLocalStorage(user);
        goToPage(POSTS_PAGE);
      },
      user,
      goToPage,
    });
  }

  if (page === ADD_POSTS_PAGE) {
    return renderAddPostPageComponent({
      appEl,
      onAddPostClick({ description, imageUrl }) {
        addPost({ token: getToken() }, description, imageUrl)
        // TODO: реализовать добавление поста в API
        // console.log("Добавляю пост...", { description, imageUrl });
        goToPage(POSTS_PAGE);
      },
    });
  }

  if (page === POSTS_PAGE) {
    return renderPostsPageComponent({
      appEl,
    });
  }
  if (page === USER_POSTS_PAGE) {
    let appElems = ''
    posts.forEach((post) => {
      let safeUserName = post.user.name
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
    let safeDescription = typeof post.description == 'string' ? post.description
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;") : ''
      appElems += 
      `<li class="post">
        <div class="post-header" data-user-id="${post.user.id}">
            <img src="${post.user.imageUrl}" class="post-header__user-image">
            <p class="post-header__user-name">${safeUserName}</p>
        </div>
        <div class="post-image-container">
          <img class="post-image" src="${post.imageUrl}">
        </div>
        <div class="post-likes">
          <button data-post-id="${post.id}" data-user-id="${post.user.id}" class="${post.isLiked ? 'like-button like-button-active' : "like-button like-button-disactive"}">
            <img src="${post.isLiked ? './assets/images/like-active.svg' : './assets/images/like-not-active.svg'}">
          </button>
          <p class="post-likes-text">
            Нравится: <strong>${post.likes.length}</strong>
          </p>
        </div>
        <p class="post-text">
          <span class="user-name">${safeUserName}</span>
          ${safeDescription}
        </p>
        <p class="post-date">
        ${formatDistanceToNow(new Date(post.createdAt))}
        </p>
      </li>`
    })
    // TODO: реализовать страницу фотографию пользвателя
    appEl.innerHTML = `              
    <div class="page-container">
      <div class="header-container"></div>
        <ul class="posts">
        ${appElems}
        </ul>
      </div>
    </div>`;
    
    for (let likeButton of document.querySelectorAll(".like-button-active")) {
      likeButton.addEventListener("click", () => {
        removelikeUser(likeButton.dataset.postId, likeButton.dataset.userId)
      });
    }
  
    for (let likeButton of document.querySelectorAll(".like-button-disactive")) {
      likeButton.addEventListener("click", () => {
        addlikeUser(likeButton.dataset.postId, likeButton.dataset.userId)
      });
    }
  }
};

goToPage(POSTS_PAGE);
