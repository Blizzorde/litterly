const STATUS_ORDER = [
  "draft",
  "open",
  "ongoing",
  "awaiting_rewards",
  "completed",
];

function getMissionIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

function updatePipeline(currentStatus) {
  const steps = document.querySelectorAll(".status-step");
  const connectors = document.querySelectorAll(".status-step-connector");
  const currentIndex = STATUS_ORDER.indexOf(currentStatus);
  const cancelledBadge = document.querySelector(".status-cancelled-badge");

  // clear all states and remove any existing active badge
  steps.forEach((step) => {
    step.classList.remove("active", "completed-step", "cancelled-step");
    const badge = step.querySelector(".status-active-badge");
    if (badge) badge.remove();
  });

  connectors.forEach((c) =>
    c.classList.remove("active", "cancelled-connector"),
  );
  cancelledBadge.classList.remove("status-cancelled-active");

  if (currentStatus === "cancelled") {
    // turn everything red
    steps.forEach((s) => s.classList.add("cancelled-step"));
    connectors.forEach((c) => c.classList.add("cancelled-connector"));
    cancelledBadge.classList.add("status-cancelled-active");
    return;
  }

  // apply states
  steps.forEach((step, i) => {
    if (i === currentIndex) {
      step.classList.add("active");
      // inject the badge into the correct step
      const badge = document.createElement("div");
      badge.className = "status-active-badge";
      console.log("NO ITS HERER");

      badge.textContent = "Active";
      step.appendChild(badge);
    } else if (i < currentIndex) {
      step.classList.add("completed-step");
    }
  });

  connectors.forEach((connector, i) => {
    if (i < currentIndex) connector.classList.add("active");
  });
}

function populatePage(mission) {
  document.title = `${mission.title} - Mission Manager`;
  document.querySelector("#mgmt-mission-name").textContent = mission.title;
  document.querySelector("#override-status").value = mission.status;
  updatePipeline(mission.status);
  updateNextStageButton(mission.status);
}

async function loadMissionManagement() {
  const id = getMissionIdFromUrl();

  if (!id) {
    window.location.href = "./mission-list.html";
    return;
  }

  try {
    const mission = await getMissionById(id);
    currentMission = mission;
    populatePage(mission);
    setTab(getTabFromUrl());
  } catch (err) {
    if (err.status === 404) {
      showNotif(
        "fa-circle-xmark",
        "Not Found",
        "Mission does not exist",
        "danger",
      );
      setTimeout(() => (window.location.href = "./mission-list.html"), 2000);
    } else if (err.status === 403) {
      window.location.href = "./mission-list.html";
    } else {
      console.error(err.message);
      showNotif("fa-circle-xmark", "Error", "Failed to load mission", "danger");
    }
  }
}
let currentMission = null;

document.querySelector(".btn-override").addEventListener("click", async () => {
  const select = document.querySelector("#override-status");
  const selectedStatus = select.value;

  if (!selectedStatus) {
    showNotif(
      "fa-circle-exclamation",
      "Select a status",
      "Please choose a status first",
      "warning",
    );
    return;
  }

  if (selectedStatus === currentMission.status) {
    showNotif(
      "fa-circle-info",
      "No change",
      "Mission is already set to this status",
      "warning",
    );
    return;
  }

  const btn = document.querySelector(".btn-override");
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Applying...';

  try {
    await updateMissionStatus(currentMission.id, selectedStatus);
    currentMission.status = selectedStatus;
    updatePipeline(selectedStatus);
    updateNextStageButton(selectedStatus);
    showNotif(
      "fa-circle-check",
      "Status updated",
      `Mission is now ${selectedStatus.replaceAll("_", " ")}`,
      "success",

      { duration: 2000 },
    );
  } catch (err) {
    let msg = "Failed to update status";
    if (err.status === 400) msg = err.message;
    else if (err.status === 403) msg = "You do not have permission";
    showNotif("fa-circle-xmark", "Error", msg, "danger");
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-bolt"></i> Apply status override';
  }
});

const STATUS_NEXT = {
  draft: "open",
  open: "ongoing",
  ongoing: "awaiting_rewards",
  awaiting_rewards: "completed",
};

function updateNextStageButton(status) {
  const wrapper = document.querySelector(".next-stage-wrapper");
  const btn = document.querySelector(".btn-next-stage");
  const nextStatus = STATUS_NEXT[status];

  if (!nextStatus || status === "cancelled") {
    wrapper.style.display = "none";
    return;
  }

  wrapper.style.display = "flex";
  btn.disabled = false;

  if (status === "awaiting_rewards") {
    btn.innerHTML =
      '<i class="fa-solid fa-coins"></i> Distribute points & complete mission';
  } else {
    btn.innerHTML = `<i class="fa-solid fa-forward-step"></i> Progress — move to ${nextStatus.replaceAll("_", " ")}`;
  }
}

document
  .querySelector(".btn-next-stage")
  .addEventListener("click", async () => {
    const nextStatus = STATUS_NEXT[currentMission.status];
    if (!nextStatus) return;

    const btn = document.querySelector(".btn-next-stage");
    btn.disabled = true;
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';

    try {
      if (currentMission.status === "awaiting_rewards") {
        await distributePoints(currentMission.id);

        const updatedUser = await getMe();
        if (updatedUser) {
          window.currentUser = updatedUser;
          const pointsEl = document.querySelector("#points");
          if (pointsEl) pointsEl.textContent = updatedUser.points;
        }
        showNotif(
          "fa-circle-check",
          "Points distributed",
          "All attended participants have been rewarded",
          "success",
          { duration: 3000 },
        );
      } else {
        await updateMissionStatus(currentMission.id, nextStatus);
        showNotif(
          "fa-circle-check",
          "Progressed",
          `Mission moved to ${nextStatus.replaceAll("_", " ")}`,
          "success",
          { duration: 2000 },
        );
      }

      currentMission.status = nextStatus;
      document.querySelector("#override-status").value = nextStatus;
      updatePipeline(nextStatus);
      updateNextStageButton(nextStatus);
    } catch (err) {
      btn.disabled = false;
      btn.innerHTML = originalHTML;

      let msg = "Failed to progress mission";
      if (err.status === 400) msg = err.message;
      else if (err.status === 403) msg = "You do not have permission";
      showNotif("fa-circle-xmark", "Error", msg, "danger");
    }
  });

const REGISTRATION_STATUS_COLORS = {
  registered: "reg-status-registered",
  attended: "reg-status-attended",
  absent: "reg-status-absent",
  cancelled: "reg-status-cancelled",
  rewarded: "reg-status-rewarded",
};

function getTabFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("tab") ?? "status";
}

function setTab(tab) {
  const url = new URL(window.location.href);
  url.searchParams.set("tab", tab);
  window.history.replaceState({}, "", url);

  document.getElementById("panel-status").style.display =
    tab === "status" ? "" : "none";
  document.getElementById("panel-attendance").style.display =
    tab === "attendance" ? "" : "none";
  document.getElementById("panel-details").style.display =
    tab === "details" ? "" : "none";

  document
    .getElementById("tab-status")
    .classList.toggle("active", tab === "status");
  document
    .getElementById("tab-attendance")
    .classList.toggle("active", tab === "attendance");
  document
    .getElementById("tab-details")
    .classList.toggle("active", tab === "details");

  if (tab === "attendance") loadAttendance();
  if (tab === "details") populateDetails(currentMission);
}

function renderAttendanceLoading() {
  document.getElementById("attendance-list").innerHTML = `
    <div class="att-loading"><i class="fa-solid fa-spinner fa-spin"></i></div>
  `;
}

function renderAttendance(registrations, missionStatus) {
  const canEdit = missionStatus === "ongoing";
  const list = document.getElementById("attendance-list");

  if (!registrations.length) {
    list.innerHTML = `<p class="att-empty">No registrations yet.</p>`;
    return;
  }

  list.innerHTML = registrations
    .map((reg) => {
      const actions = canEdit
        ? `
      <div class="att-actions">
        <button class="att-btn att-btn-present ${reg.status === "attended" ? "active" : ""}"
          data-id="${reg.id}" data-status="attended">
          <i class="fa-solid fa-check"></i> Present
        </button>
        <button class="att-btn att-btn-absent ${reg.status === "absent" ? "active" : ""}"
          data-id="${reg.id}" data-status="absent">
          <i class="fa-solid fa-xmark"></i> Absent
        </button>
        <button class="att-btn att-btn-cancel ${reg.status === "cancelled" ? "active" : ""}"
          data-id="${reg.id}" data-status="cancelled">
          <i class="fa-solid fa-ban"></i> Cancelled
        </button>
      </div>
    `
        : `<span class="att-readonly-status ${REGISTRATION_STATUS_COLORS[reg.status]}">${reg.status}</span>`;

      return `
      <div class="att-row" data-reg-id="${reg.id}">
        <div class="att-user-info">
          <div class="att-username">${reg.username}</div>
          <div class="att-meta">
            ${reg.area_name ? `<span>${reg.area_name}</span><span class="mgmt-list-dot">·</span>` : ""}
            <span>${reg.reward_points ?? 0} pts</span>
          </div>
        </div>
        ${actions}
      </div>
    `;
    })
    .join("");
}

async function loadAttendance() {
  renderAttendanceLoading();
  try {
    const registrations = await getMissionRegistrations(currentMission.id);
    renderAttendance(registrations, currentMission.status);
  } catch (err) {
    document.getElementById("attendance-list").innerHTML = "";
    showNotif("fa-circle-xmark", "Error", "Failed to load attendance");
  }
}

function formatDate(datetime) {
  return new Date(datetime).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(datetime) {
  return new Date(datetime).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function populateDetails(mission) {
  document.querySelector("#detail-created-by").textContent =
    `Created by ${mission.created_by_username} · ${formatDate(mission.created_at)}`;

  if (mission.photo_url) {
    document.querySelector("#detail-thumbnail").style.cssText =
      `background-image: linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.5)), url('${mission.photo_url}');
       background-size: cover; background-position: center;`;
  } else {
    document.querySelector("#detail-thumbnail").style.display = "none";
  }

  document.querySelector("#detail-location").textContent = mission.location;
  document.querySelector("#detail-start").textContent =
    `${formatDate(mission.start_datetime)} at ${formatTime(mission.start_datetime)}`;
  document.querySelector("#detail-end").textContent =
    `${formatDate(mission.end_datetime)} at ${formatTime(mission.end_datetime)}`;
  document.querySelector("#detail-participants").textContent =
    `${mission.participant_count} registered`;
  document.querySelector("#detail-max-participants").textContent =
    mission.max_participants ?? "Unlimited";
  document.querySelector("#detail-created-at").textContent =
    `${formatDate(mission.created_at)}`;
  document.querySelector("#detail-description").textContent =
    mission.description;

  const areasEl = document.querySelector("#detail-areas");
  areasEl.innerHTML = mission.areas
    .map((area) => {
      const spotsLeft =
        area.max_users === null
          ? "Unlimited spots"
          : `${area.current_count}/${area.max_users} spots taken`;

      return `
      <div class="area-item">
        <div class="area-item-left">
          <div class="area-item-name">${area.area_name}</div>
          <div class="area-item-desc">${area.area_description ?? ""}</div>
        </div>
        <div class="area-item-right">
          <div class="area-item-points"><i class="fa-solid fa-star"></i> ${area.reward_points} pts</div>
          <div class="area-item-spots ${area.max_users !== null && area.current_count >= area.max_users ? "full" : ""}">
            ${spotsLeft}
          </div>
        </div>
      </div>
    `;
    })
    .join("");
}

// Attendance button clicks
document
  .getElementById("attendance-list")
  .addEventListener("click", async (e) => {
    const btn = e.target.closest(".att-btn");
    if (!btn || btn.disabled) return;

    const regId = btn.dataset.id;
    const newStatus = btn.dataset.status;
    const row = btn.closest(".att-row");

    // disable all buttons in this row
    row.querySelectorAll(".att-btn").forEach((b) => (b.disabled = true));

    try {
      await updateRegistrationStatus(currentMission.id, regId, newStatus);

      // update active state on buttons
      row.querySelectorAll(".att-btn").forEach((b) => {
        b.disabled = false;
        b.classList.toggle("active", b.dataset.status === newStatus);
      });
    } catch (err) {
      row.querySelectorAll(".att-btn").forEach((b) => (b.disabled = false));
      let msg = "Failed to update status";
      if (err.status === 400) msg = err.message;
      showNotif("fa-circle-xmark", "Error", msg);
    }
  });

// Tab listeners
document
  .getElementById("tab-status")
  .addEventListener("click", () => setTab("status"));
document
  .getElementById("tab-attendance")
  .addEventListener("click", () => setTab("attendance"));
document
  .getElementById("tab-details")
  .addEventListener("click", () => setTab("details"));
loadMissionManagement();
