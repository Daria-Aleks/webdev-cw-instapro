import { USER_POSTS_PAGE } from "../routes.js";
import { renderHeaderComponent } from "./header-component.js";
import { posts, goToPage } from "../index.js";
import { addlike, removelike } from "../index.js";
// import { compareAsc, format } from 'date-fns'

export function renderPostsPageComponent({ appEl }) {
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
          <button data-post-id="${post.id}" class="${post.isLiked ? 'like-button like-button-active' : "like-button like-button-disactive"}">
            <img src="${post.isLiked ? './assets/images/like-active.svg' : './assets/images/like-not-active.svg'}">
          </button>
          <p class="post-likes-text">
            Нравится: <strong>${post.likes.length}</strong>
          </p>
        </div>
        <p class="post-text">
          <span class="user-name">${safeUserName}</span>
          ${safeDescription }
        </p>
        <p class="post-date">
        ${dateFns.distanceInWordsToNow(post.createdAt)}
        </p>
      </li>`
  })
  console.log("Актуальный список постов:", posts);

  /**
   * TODO: чтобы отформатировать дату создания поста в виде "19 минут назад"
   * можно использовать https://date-fns.org/v2.29.3/docs/formatDistanceToNow
   */
  const appHtml = `
              <div class="page-container">
                  <div class="header-container"></div>
                    <ul class="posts">
                    ${appElems}
                    </ul>
                </div>
              </div>`;

  appEl.innerHTML = appHtml;

  renderHeaderComponent({
    element: document.querySelector(".header-container"),
  });

  for (let userEl of document.querySelectorAll(".post-header")) {
    userEl.addEventListener("click", () => {
      goToPage(USER_POSTS_PAGE, {
        userId: userEl.dataset.userId,
      });
    });
  }

  for (let likeButton of document.querySelectorAll(".like-button-active")) {
    likeButton.addEventListener("click", () => {
      removelike(likeButton.dataset.postId)
    });
  }

  for (let likeButton of document.querySelectorAll(".like-button-disactive")) {
    likeButton.addEventListener("click", () => {
      addlike(likeButton.dataset.postId)
    });
  }
}
