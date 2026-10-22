import "./index.css";
import {
  resetValidation,
  disabledButton,
  enableValidation,
  settings,
} from "../scripts/validation";
import Api from "../utils/Api.js";

const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "f1a287b8-2e0f-47a3-bfdc-d9d334915103",
    "Content-Type": "application/json",
  },
});

api
  .getAppInfo()
  .then(([cards, userInfo]) => {
    cards.forEach((item) => {
      const cardElement = getCardElement(item);
      cardsList.append(cardElement);
    });
    profileNameEl.textContent= userInfo.name
    profileDescriptionEl.textContent= userInfo.about
    profileAvatar.src = userInfo.avatar 
  })
  .catch(console.error);

//4bf45365-5b6b-46b5-9093-3c0f23b8b06e
const editProfileButton = document.querySelector(".profile__edit-button");
const editProfileModal = document.querySelector("#edit-profile-modal");
const editProfileCloseButton = editProfileModal.querySelector(
  ".modal__close-button",
);
const editProfileForm = editProfileModal.querySelector(".modal__form");
const editProfileNameInput = editProfileModal.querySelector(
  "#profile-name-input",
);

const editProfileDescriptionInput = editProfileModal.querySelector(
  "#profile-description-input",
);

// TOOD:
// Create the new post modal
// add the function to open and close modals
// Fix the  rendered cards
// Check console for errors
const profileAvatar = document.querySelector(".profile__avatar")
const newPostButton = document.querySelector(".profile__add-button");
const newPostModal = document.querySelector("#new-post-modal");
const newPostCloseButton = newPostModal.querySelector(".modal__close-button");
const newPostForm = newPostModal.querySelector(".modal__form");
const cardDescriptionInput = document.querySelector("#card-description-input");
const cardImageInput = document.querySelector("#new-post-image");
const profileNameEl = document.querySelector(".profile__name");
const profileDescriptionEl = document.querySelector(".profile__description");
const confirmDeleteModal = document.querySelector("#card-delete-modal");
const previewModal = document.querySelector("#preview-modal");
const previewModalCloseButton = previewModal.querySelector(
  ".modal__close-button",
);
const previewImageEl = previewModal.querySelector(".modal__image");

const cardTemplate = document
  .querySelector("#card-template")
  .content.querySelector(".card");
const cardsList = document.querySelector(".cards__list");

function getCardElement(data) {
  const cardElement = cardTemplate.cloneNode(true);
  const cardTitleEl = cardElement.querySelector(".card__title");
  const cardImageEl = cardElement.querySelector(".card__image");

  cardImageEl.src = data.link;
  cardImageEl.alt = data.name;
  cardTitleEl.textContent = data.name;

  const cardLikeButtonEl = cardElement.querySelector(".card__like-button");
  cardLikeButtonEl.addEventListener("click", () => {
    cardLikeButtonEl.classList.toggle("card__like-button_active");
  });

  const cardDeleteButtonEl = cardElement.querySelector(".card__delete-button");
  cardDeleteButtonEl.addEventListener("click", () => {
    openModal(confirmDeleteModal);
  });

  cardImageEl.addEventListener("click", () => {
    previewImageEl.src = data.link;
    previewImageEl.alt = data.name;
    previewModal.querySelector(".modal__caption").textContent = data.name;
    openModal(previewModal);
  });
  if (data.isLiked) {
    cardLikeButtonEl.classList.add("card__like-button_active");
  }

  return cardElement;
}
function handleEscapeKey(event) {
  if (event.key === "Escape") {
    const openedModal = document.querySelector(".modal_is-opened");
    closeModal(openedModal);
  }
  // What function should you call?
}

function openModal(modal) {
  modal.classList.add("modal_is-opened");
  document.addEventListener("keyup", handleEscapeKey);
}

function closeModal(modal) {
  modal.classList.remove("modal_is-opened");
  document.removeEventListener("keyup", handleEscapeKey);
}

editProfileButton.addEventListener("click", function () {
  editProfileNameInput.value = profileNameEl.textContent;
  editProfileDescriptionInput.value = profileDescriptionEl.textContent;

  resetValidation(
    editProfileForm,
    [editProfileNameInput, editProfileDescriptionInput],
    settings,
  );

  openModal(editProfileModal);
});

newPostButton.addEventListener("click", () => {
  openModal(newPostModal);
});

editProfileCloseButton.addEventListener("click", () => {
  closeModal(editProfileModal);
});

newPostCloseButton.addEventListener("click", () => {
  closeModal(newPostModal);
});

previewModalCloseButton.addEventListener("click", () => {
  closeModal(previewModal);
});

function handleEditProfileSubmit(event) {
  event.preventDefault();
  const submitButton = event.submitter;
  submitButton.textContent = "Saving...";
  api
    .editUserInfo({
      name: editProfileNameInput.value,
      about: editProfileDescriptionInput.value,
    })
    .then((data) => {
      profileNameEl.textContent = data.name;
      profileDescriptionEl.textContent = data.about;
      closeModal(editProfileModal);
    })
    .catch(console.error)
    .finally(() => {
      submitButton.textContent = "Save";
    });
}

editProfileForm.addEventListener("submit", handleEditProfileSubmit);
newPostForm.addEventListener("submit", function (event) {
  event.preventDefault();
  const submitButton = event.submitter;
  submitButton.textContent = "Saving...";
  api
    .addNewCard({
      name: cardDescriptionInput.value,
      link: cardImageInput.value,
    })
    .then((data) => {
      const cardElement = getCardElement({
        name: cardDescriptionInput.value,
        link: cardImageInput.value,
      });

      cardsList.prepend(cardElement);

      closeModal(newPostModal);
      newPostForm.reset();
      disabledButton(event.submitter, settings);
    })
    .catch(console.error)
    .finally(() => {
      submitButton.textContent = "Save";
    });
});

const modals = document.querySelectorAll(".modal");
modals.forEach((modal) => {
  modal.addEventListener("mousedown", (evt) => {
    if (evt.target.classList.contains("modal")) {
      closeModal(modal);
    }
  });
});

enableValidation(settings);
