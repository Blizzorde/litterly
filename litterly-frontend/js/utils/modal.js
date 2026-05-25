const Modal = {
  open(overlayId) {
    const overlay = document.getElementById(overlayId);
    if (!overlay) return;
    overlay.classList.add("is-open");
    document.addEventListener("keydown", Modal._escHandler);
    overlay.addEventListener("click", Modal._backdropHandler);
  },

  close(id) {
    let el = document.getElementById(id);
    if (!el) return;
    const overlay =
      el.classList.contains("modal-overlay") ||
      el.classList.contains("drawer-overlay")
        ? el
        : el.closest(".modal-overlay, .drawer-overlay");
    if (!overlay) return;
    overlay.classList.remove("is-open");
    document.removeEventListener("keydown", Modal._escHandler);
    overlay.removeEventListener("click", Modal._backdropHandler);
  },

  async submit(id) {
    const title = document.getElementById("mission-title")?.value.trim();
    const desc = document.getElementById("mission-desc")?.value.trim();
    const location = document.getElementById("mission-location")?.value.trim();
    const date = document.getElementById("mission-date")?.value;
    const startTime = document.getElementById("mission-start-time")?.value;
    const endTime = document.getElementById("mission-end-time")?.value;
    const maxParticipants = document.getElementById(
      "mission-max-participants",
    )?.value;

    // Validate required fields
    if (!title) return alert("Please enter a mission title.");
    if (!desc) return alert("Please enter a description.");
    if (!location) return alert("Please enter a location.");
    if (!date) return alert("Please select a mission date.");
    if (!startTime) return alert("Please select a start time.");
    if (!endTime) return alert("Please select an end time.");

    const start = `${date}T${startTime}`;
    const end = `${date}T${endTime}`;

    if (new Date(end) <= new Date(start))
      return alert("End time must be after start time.");

    if (start.split("T")[0] !== end.split("T")[0]) {
      throw new Error("Mission must be on the same day");
    }

    // Validate areas
    const areaRows = document.querySelectorAll(".area-row");
    if (!areaRows.length) return alert("Please add at least one mission area.");

    const areas = [];
    for (const row of areaRows) {
      const areaName = row.querySelector(".area-name")?.value.trim();
      const areaDesc = row.querySelector(".area-desc")?.value.trim();
      const areaPoints = row.querySelector(".area-points")?.value;
      const areaMax = row.querySelector(".area-max")?.value;

      if (!areaName) return alert("Please fill in all area names.");
      if (!areaPoints) return alert("Please fill in points for all areas.");

      areas.push({
        area_name: areaName,
        area_description: areaDesc || null,
        reward_points: parseInt(areaPoints),
        max_users: areaMax ? parseInt(areaMax) : null,
      });
    }

    const payload = {
      title,
      description: desc,
      location,
      start_datetime: start,
      end_datetime: end,
      max_participants: maxParticipants ? parseInt(maxParticipants) : null,
      areas,
    };

    try {
      await createMission(payload);
      Modal.close("create-drawer-overlay");
      showNotif(
        "fa-circle-check",
        "Success",
        "Mission created successfully",
        "success",
      );

      // Clear form
      document.getElementById("mission-title").value = "";
      document.getElementById("mission-desc").value = "";
      document.getElementById("mission-location").value = "";
      document.getElementById("mission-date").value = "";
      document.getElementById("mission-start-time").value = "";
      document.getElementById("mission-end-time").value = "";
      document.getElementById("mission-max-participants").value = "";
      document.getElementById("create-areas-list").innerHTML = "";

      loadMissions();
    } catch (err) {
      showNotif(
        "fa-circle-xmark",
        "Error",
        err.message ?? "Failed to create mission",
        "danger",
      );
    }
    Modal.close("create-drawer-overlay");
  },

  addArea() {
    const list = document.getElementById("create-areas-list");
    const index = list.children.length;

    const row = document.createElement("div");
    row.className = "area-row";
    row.innerHTML = `
      <div class="area-row-header">
        <span class="area-row-label">Area ${index + 1}</span>
        <button class="btn-remove-area" onclick="Modal.removeArea(this)">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
      <div class="field-group">
        <label>Area Name <span class="required">*</span></label>
        <input type="text" class="area-name" placeholder="e.g. Left Side A1" />
      </div>
      <div class="field-group">
        <label>Description</label>
        <input type="text" class="area-desc" placeholder="Optional description" />
      </div>
      <div class="field-row">
        <div class="field-group">
          <label>Points <span class="required">*</span></label>
          <input type="number" class="area-points" placeholder="e.g. 50" min="1" />
        </div>
        <div class="field-group">
          <label>Max Users <span class="field-hint">(empty = unlimited)</span></label>
          <input type="number" class="area-max" placeholder="Unlimited" min="1" />
        </div>
      </div>
    `;

    list.appendChild(row);
  },

  removeArea(btn) {
    btn.closest(".area-row").remove();
    // Re-label remaining areas
    document.querySelectorAll(".area-row").forEach((row, i) => {
      row.querySelector(".area-row-label").textContent = `Area ${i + 1}`;
    });
  },

  _escHandler(e) {
    if (e.key === "Escape") {
      document
        .querySelectorAll(".modal-overlay.is-open, .drawer-overlay.is-open")
        .forEach((el) => Modal.close(el.id));
    }
  },

  _backdropHandler(e) {
    if (e.target === e.currentTarget) Modal.close(e.currentTarget.id);
  },

  openDelete(triggerEl) {
    const id = triggerEl.dataset.id;
    const title = triggerEl.dataset.title;

    const nameEl = document.getElementById("delete-mission-name");
    if (nameEl) nameEl.textContent = `"${title}"`;

    const confirmBtn = document.getElementById("btn-confirm-delete");
    if (confirmBtn) {
      const freshBtn = confirmBtn.cloneNode(true);
      freshBtn.addEventListener("click", () => Modal.confirmDelete(id));
      confirmBtn.parentNode.replaceChild(freshBtn, confirmBtn);
    }

    Modal.open("delete-modal-overlay");
  },

  async confirmDelete(missionId) {
    if (!missionId) {
      return showNotif(
        "fa-circle-xmark",
        "Error",
        "Missing mission ID",
        "danger",
      );
    }

    try {
      const res = await deleteMission(missionId);

      if (!res?.success) {
        return showNotif(
          "fa-circle-xmark",
          "Error",
          res?.message || "Delete failed",
          "danger",
        );
      }

      showNotif(
        "fa-circle-check",
        "Deleted",
        "Mission deleted successfully",
        "success",
      );

      Modal.close("delete-modal-overlay");

      // refresh UI
      loadMissions();
    } catch (err) {
      showNotif(
        "fa-circle-xmark",
        "Error",
        err.message ?? "Failed to delete mission",
        "danger",
      );
    }
  },

  openEdit(triggerEl) {
    const id = triggerEl.dataset.id;
    const title = triggerEl.dataset.title;
    const description = triggerEl.dataset.description;

    document.getElementById("edit-mission-title").value = title ?? "";
    document.getElementById("edit-mission-desc").value = description ?? "";
    document.getElementById("edit-mission-modal").dataset.missionId = id;

    Modal.open("edit-modal-overlay");
  },

  async submitEdit(modalId) {
    const modal = document.getElementById(modalId);
    const id = modal?.dataset.missionId;

    const title = document.getElementById("edit-mission-title")?.value.trim();

    const description = document
      .getElementById("edit-mission-desc")
      ?.value.trim();

    if (!id) return alert("Missing mission ID");
    if (!title) return alert("Please enter a mission title.");

    const payload = {
      title,
      description: description || null,
    };

    try {
      const res = await editMission(id, payload);

      if (!res?.success) {
        return showNotif(
          "fa-circle-xmark",
          "Error",
          res?.message || "Update failed",
          "danger",
        );
      }

      showNotif(
        "fa-circle-check",
        "Success",
        "Mission updated successfully",
        "success",
      );

      Modal.close("edit-modal-overlay");

      // optional refresh
      loadMissions();
    } catch (err) {
      showNotif(
        "fa-circle-xmark",
        "Error",
        err.message ?? "Failed to update mission",
        "danger",
      );
    }
  },
  addEditArea(existing = null, index = null) {
    const list = document.getElementById("edit-areas-list");
    const i = index ?? list.children.length;

    const row = document.createElement("div");
    row.className = "area-row";
    if (existing?.id) row.dataset.areaId = existing.id;

    row.innerHTML = `
    <div class="area-row-header">
      <span class="area-row-label">Area ${i + 1}</span>
      <button class="btn-remove-area" onclick="Modal.removeEditArea(this)">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>
    <div class="field-group">
      <label>Area Name <span class="required">*</span></label>
      <input type="text" class="area-name" placeholder="e.g. Left Side A1" value="${existing?.area_name ?? ""}" />
    </div>
    <div class="field-group">
      <label>Description</label>
      <input type="text" class="area-desc" placeholder="Optional description" value="${existing?.area_description ?? ""}" />
    </div>
    <div class="field-row">
      <div class="field-group">
        <label>Points <span class="required">*</span></label>
        <input type="number" class="area-points" placeholder="e.g. 50" min="1" value="${existing?.reward_points ?? ""}" />
      </div>
      <div class="field-group">
        <label>Max Users <span class="field-hint">(empty = unlimited)</span></label>
        <input type="number" class="area-max" placeholder="Unlimited" min="1" value="${existing?.max_users ?? ""}" />
      </div>
    </div>
  `;

    list.appendChild(row);
  },

  removeEditArea(btn) {
    btn.closest(".area-row").remove();
    document
      .querySelectorAll("#edit-areas-list .area-row")
      .forEach((row, i) => {
        row.querySelector(".area-row-label").textContent = `Area ${i + 1}`;
      });
  },
};
