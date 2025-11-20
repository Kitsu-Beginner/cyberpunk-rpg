document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("item-modal");
  const modalCloseBtn = document.getElementById("item-modal-close");
  const modalBackdrop = modal.querySelector(".modal-backdrop");
  const modalTitle = document.getElementById("item-modal-title");
  const modalDescription = document.getElementById("item-modal-description");
  const modalImage = document.getElementById("item-modal-image");

  // Open the modal
  function openItemModal(data) {
    modalTitle.textContent = data.name || "Unnamed Item";
    modalDescription.textContent = data.description || "No description available.";
    modalImage.src = data.image || "/static/img/placeholder.png";
    modal.classList.remove("hidden");
  }

  // expose globally so other scripts (weapons table) can use it
  window.openItemModal = openItemModal;

  // Close the modal
  function closeItemModal() {
    modal.classList.add("hidden");
  }

  // Attach close behavior to the "X" button and backdrop click
  modalCloseBtn.addEventListener("click", closeItemModal);
  modalBackdrop.addEventListener("click", closeItemModal);

  // Optional: test helper
  window.testModal = () => {
    openItemModal({
      name: "Test Weapon",
      description: "This is a sample description to test the modal.",
      image: "/static/img/test_weapon.jpg"
    });
  };
});
