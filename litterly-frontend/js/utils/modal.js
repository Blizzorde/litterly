const Modal = {
  open(overlayId) {
    const overlay = document.getElementById(overlayId);
    if (!overlay) return;
    overlay.classList.add("is-open");
    document.addEventListener("keydown", Modal._escHandler);
    overlay.addEventListener("click", Modal._backdropHandler);
  },

  // Accepts either the overlay ID or any child element's ID
  close(id) {
    let el = document.getElementById(id);
    if (!el) return;
    // Walk up to the overlay if a child ID was passed
    const overlay = el.classList.contains("modal-overlay")
      ? el
      : el.closest(".modal-overlay");
    if (!overlay) return;
    overlay.classList.remove("is-open");
    document.removeEventListener("keydown", Modal._escHandler);
    overlay.removeEventListener("click", Modal._backdropHandler);
  },

  submit(id) {
    // 1. Collect values
    const title = document.getElementById("mission-title")?.value.trim();
    const desc = document.getElementById("mission-desc")?.value.trim();
    const location = document.getElementById("mission-location")?.value.trim();
    const time = document.getElementById("mission-time")?.value;
    const points = document.getElementById("mission-points")?.value;

    // 2. Basic validation
    if (!title) {
      alert("Please enter a mission title.");
      return;
    }

    const payload = { title, desc, location, time, points };
    console.log("Submitting mission:", payload);

    // 3. Call your API here, e.g.:
    // missionsApi.create(payload).then(() => Modal.close(id));

    // 4. Close after submission
    Modal.close(id);
  },

  _escHandler(e) {
    if (e.key === "Escape") {
      document
        .querySelectorAll(".modal-overlay.is-open")
        .forEach((el) => Modal.close(el.id));
    }
  },

  _backdropHandler(e) {
    if (e.target === e.currentTarget) Modal.close(e.currentTarget.id);
  },

  openDelete(triggerEl) {
    // 1. Read mission data from the clicked element
    const id = triggerEl.dataset.id;
    const title = triggerEl.dataset.title;

    // 2. Populate the modal with mission info
    const nameEl = document.getElementById("delete-mission-name");
    if (nameEl) nameEl.textContent = `"${title}"`;

    // 3. Wire the confirm button to this specific mission's id
    const confirmBtn = document.getElementById("btn-confirm-delete");
    if (confirmBtn) {
      // Replace the button to clear any previous onclick listener
      const freshBtn = confirmBtn.cloneNode(true);
      freshBtn.addEventListener("click", () => Modal.confirmDelete(id));
      confirmBtn.parentNode.replaceChild(freshBtn, confirmBtn);
    }

    // 4. Open the overlay
    Modal.open("delete-modal-overlay");
  },

  confirmDelete(missionId) {
    console.log("Deleting mission id:", missionId);

    // Call your API here, e.g.:
    // missionsApi.delete(missionId)
    //   .then(() => {
    //     Modal.close('delete-modal-overlay');
    //     // refresh card list
    //   })
    //   .catch(err => console.error(err));

    // For now, just close:
    Modal.close("delete-modal-overlay");
  },

  openEdit(triggerEl) {
    const id = triggerEl.dataset.id;
    const title = triggerEl.dataset.title;
    const description = triggerEl.dataset.description;

    // Populate fields with existing values
    document.getElementById("edit-mission-title").value = title ?? "";
    document.getElementById("edit-mission-desc").value = description ?? "";

    // Store the mission id on the modal for submitEdit to read
    document.getElementById("edit-mission-modal").dataset.missionId = id;

    Modal.open("edit-modal-overlay");
  },

  submitEdit(modalId) {
    const modal = document.getElementById(modalId);
    const id = modal?.dataset.missionId;

    const title = document.getElementById("edit-mission-title")?.value.trim();
    const desc = document.getElementById("edit-mission-desc")?.value.trim();

    if (!title) {
      alert("Please enter a mission title.");
      return;
    }

    const payload = { id, title, description: desc };
    console.log("Updating mission:", payload);

    // Call your API here, e.g.:
    // missionsApi.update(id, payload)
    //   .then(() => Modal.close('edit-modal-overlay'));

    Modal.close("edit-modal-overlay");
  },
};
