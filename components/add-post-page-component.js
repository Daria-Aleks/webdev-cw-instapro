import { uploadImage } from "../api.js";
import { renderUploadImageComponent } from "./upload-image-component.js";
let imageUrl = "";
export function renderAddPostPageComponent({ appEl, onAddPostClick }) {
  const render = () => {
    // TODO: Реализовать страницу добавления поста
    const appHtml = `
    <div class="page-container">
      <div class="header-container"></div>
        <label>
          <p>Опишите фотографию</p>
          <textarea class='desctiption_img' id='descr'></textarea>
        </label>
      <button class="button" id="add-button">Добавить</button>
    </div>
  `;

    appEl.innerHTML = appHtml;

    renderUploadImageComponent({
      element: appEl.querySelector(".header-container"),
      onImageUrlChange(newImageUrl) {
        imageUrl = newImageUrl;
      },
    });

    document.getElementById("add-button").addEventListener("click", () => {
      const descr = document.getElementById('descr').value
      onAddPostClick({
        description: descr,
        imageUrl: imageUrl,
      });
    });
  };

  render();
}
