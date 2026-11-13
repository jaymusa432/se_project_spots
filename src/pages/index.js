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
    profileNameEl.textContent = userInfo.name;
    profileDescriptionEl.textContent = userInfo.about;
    profileAvatar.src = userInfo.avatar;
  })
  .catch(console.error);

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

const editProfileAvatarBtn = document.querySelector(".profile__avatar-btn");
const editProfileAvatarModal = document.querySelector("#edit-profile-avatar");
const editProfileAvatarForm =
  editProfileAvatarModal.querySelector(".modal__form");
const editProfileAvatarInput = editProfileAvatarModal.querySelector(
  "#profile-avatar-input",
);
const editProfileAvatarCloseButton = editProfileAvatarModal.querySelector(
  ".modal__close-button",
);

const profileAvatar = document.querySelector(".profile__avatar");
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
const deleteForm = confirmDeleteModal.querySelector(".modal__delete-form");
const confirmDeleteCloseButton = confirmDeleteModal.querySelector(
  ".modal__close-button",
);
const previewImageEl = previewModal.querySelector(".modal__image");
const modalCancelButton = confirmDeleteModal.querySelector(
  ".modal__cancel-button",
);
const cardTemplate = document
  .querySelector("#card-template")
  .content.querySelector(".card");
const cardsList = document.querySelector(".cards__list");
let selectedCardId, selectedCard;
function getCardElement(data) {
  const cardElement = cardTemplate.cloneNode(true);
  const cardTitleEl = cardElement.querySelector(".card__title");
  const cardImageEl = cardElement.querySelector(".card__image");

  cardImageEl.src = data.link;
  cardImageEl.alt = data.name;
  cardTitleEl.textContent = data.name;

  const cardLikeButtonEl = cardElement.querySelector(".card__like-button");
  cardLikeButtonEl.addEventListener("click", () => {
    api
      .changeLikeStatus(data._id, data.isLiked)
      .then((updatedCard) => {
        cardLikeButtonEl.classList.toggle(
          "card__like-button_active",
          updatedCard.isLiked,
        );
        data.isLiked = updatedCard.isLiked;
      })
      .catch(console.error);
  });

  const cardDeleteButtonEl = cardElement.querySelector(".card__delete-button");
  cardDeleteButtonEl.addEventListener("click", () => {
    selectedCard = cardElement;
    selectedCardId = data._id;
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

editProfileAvatarBtn.addEventListener("click", () => {
  openModal(editProfileAvatarModal);
});

editProfileAvatarCloseButton.addEventListener("click", () => {
  closeModal(editProfileAvatarModal);
});

editProfileCloseButton.addEventListener("click", () => {
  closeModal(editProfileModal);
});

confirmDeleteCloseButton.addEventListener("click", () => {
  closeModal(confirmDeleteModal);
});

modalCancelButton.addEventListener("click", () => {
  closeModal(confirmDeleteModal);
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

function handleEditAvatarSubmit(event) {
  event.preventDefault();
  const submitButton = event.submitter;
  submitButton.textContent = "Saving...";

  api
    .changeAvatar({ avatar: editProfileAvatarInput.value })
    .then((data) => {
      profileAvatar.src = data.avatar;
      closeModal(editProfileAvatarModal);
      editProfileAvatarForm.reset();
      disabledButton(submitButton, settings);
    })
    .catch(console.error)
    .finally(() => {
      submitButton.textContent = "Save";
    });
}

function deleteButtonSubmit(event) {
  event.preventDefault();
  const deleteButton = event.submitter;
  deleteButton.textContent = "Deleting...";
  api
    .deleteCard(selectedCardId)
    .then(() => {
      selectedCard.remove();
      selectedCardId = null;
      selectedCard = null;
      closeModal(confirmDeleteModal);
    })
    .catch(console.error)
    .finally(() => {
      deleteButton.textContent = "Delete";
    });
}

deleteForm.addEventListener("submit", deleteButtonSubmit);
editProfileForm.addEventListener("submit", handleEditProfileSubmit);
editProfileAvatarForm.addEventListener("submit", handleEditAvatarSubmit);
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
      cardsList.prepend(getCardElement(data));

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
