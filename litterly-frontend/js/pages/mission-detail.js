function getMissionIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
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

function getTotalRewardPoints(areas) {
  if (!areas.length) return "TBD";
  const min = Math.min(...areas.map((a) => a.reward_points));
  const max = Math.max(...areas.map((a) => a.reward_points));
  return min === max ? `${min} pts` : `${min}–${max} pts`;
}

let currentMission = null;

function openAreaModal(areas) {
  const modalAreas = document.querySelector("#modal-areas");

  modalAreas.innerHTML = areas
    .map((area) => {
      const isFull =
        area.max_users !== null && area.current_count >= area.max_users;
      return `
      <button class="area-option ${isFull ? "area-full" : ""}"
              data-area-id="${area.id}"
              ${isFull ? "disabled" : ""}>
        <div class="area-option-name">${area.area_name}</div>
        <div class="area-option-desc">${area.area_description ?? ""}</div>
        <div class="area-option-meta">
          <span><i class="fa-solid fa-star"></i> ${area.reward_points} pts</span>
          <span>${isFull ? "Full" : area.max_users === null ? "Unlimited spots" : `${area.max_users - area.current_count} spots left`}</span>
        </div>
      </button>
    `;
    })
    .join("");

  document.querySelector("#area-modal").classList.add("active");
}

function closeAreaModal() {
  document.querySelector("#area-modal").classList.remove("active");
}

async function handleRegister(areaId) {
  const btn = document.querySelector(".register-button");
  btn.classList.add("loading");
  btn.textContent = "Registering...";

  try {
    const res = await registerForMission(currentMission.id, areaId);
    closeAreaModal();

    currentMission.areas = res.areas; // update global

    showNotif(
      "fa-circle-check",
      "Registered!",
      "You have joined this mission",
      "success",
      { duration: 2000 },
    );
    setJoinButton({ status: "registered" });
  } catch (err) {
    closeAreaModal();
    btn.classList.remove("loading");
    btn.textContent = "Join this Mission";

    if (err.areas) {
      currentMission.areas = err.areas;
    }

    let msg = "Registration failed, try again";
    if (err.status === 400) msg = err.message;
    else if (err.status === 0) msg = "Cannot reach server";

    showNotif("fa-circle-xmark", "Failed", msg, "danger");
  }
}

async function onJoinClick(e) {
  e.preventDefault();
  if (!currentMission) return;

  const areas = currentMission.areas;

  if (areas.length === 1) {
    const area = areas[0];
    const isFull =
      area.max_users !== null && area.current_count >= area.max_users;

    if (isFull) {
      showNotif(
        "fa-circle-xmark",
        "Area Full",
        "This area has reached its maximum participants",
      );
      return;
    }
    await handleRegister(area.id);
  } else {
    openAreaModal(areas);
  }
}

async function onCancelClick(e) {
  e.preventDefault();
  const btn = e.target;

  btn.textContent = "Cancelling...";
  btn.style.pointerEvents = "none";

  try {
    const res = await cancelMissionRegistration(currentMission.id);

    currentMission.areas = res.areas; // update global

    showNotif(
      "fa-circle-check",
      "Cancelled",
      "Your registration has been cancelled",
      { duration: 2000 },
    );
    setJoinButton(null);
  } catch (err) {
    btn.textContent = "Cancel Registration";
    btn.style.pointerEvents = "auto";

    let msg = "Cancellation failed, try again";
    if (err.status === 400) msg = err.message;
    else if (err.status === 0) msg = "Cannot reach server";

    showNotif("fa-circle-xmark", "Failed", msg);
  }
}

function setJoinButton(registration) {
  const wrapper = document.querySelector(".register-button-wrapper");

  if (!registration || registration.status === "cancelled") {
    wrapper.innerHTML = `<a href="#" class="register-button">Join this Mission</a>`;
    document
      .querySelector(".register-button")
      .addEventListener("click", onJoinClick);
    return;
  }

  wrapper.innerHTML = `<a href="#" class="register-button cancel-button">Cancel Registration</a>`;
  document
    .querySelector(".cancel-button")
    .addEventListener("click", onCancelClick);
}

function populatePage(mission) {
  document.querySelector(".overlay-title").textContent = mission.title;
  document.querySelector(".overlay-status").innerHTML =
    `<span class="status-tag ${mission.status}">${mission.status}</span>`;
  document.querySelector(".overlay-header-wrapper").innerHTML =
    `<i class="fa-solid fa-star"></i> ${getTotalRewardPoints(mission.areas)}`;

  document.querySelector(".card-thumbnail-wrapper").style.backgroundImage =
    `linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.6)), url('${mission.photo_url ?? "../assets/placeholder.webp"}')`;
  document.querySelector(".card-thumbnail-wrapper").style.backgroundSize =
    "cover";
  document.querySelector(".card-thumbnail-wrapper").style.backgroundPosition =
    "center";

  document.querySelector(".card-description-wrapper").innerHTML = `
    <h2 class="description-title">About This Mission</h2>
    <p>${mission.description}</p>
  `;

  document.querySelector(".extra-detail-item:nth-child(1) .value").textContent =
    mission.location;
  document.querySelector(".extra-detail-item:nth-child(2) .value").textContent =
    formatDate(mission.start_datetime);
  document.querySelector(".extra-detail-item:nth-child(3) .value").textContent =
    `${formatTime(mission.start_datetime)} – ${formatTime(mission.end_datetime)}`;
  document.querySelector(".extra-detail-item.reward .value").textContent =
    getTotalRewardPoints(mission.areas);

  document.title = `${mission.title} - Litterly`;

  setJoinButton(mission.user_registration);
}

async function loadMissionDetail() {
  const id = getMissionIdFromUrl();

  if (!id) {
    window.location.href = "./mission-list.html";
    return;
  }

  try {
    const mission = await getMissionById(id);
    currentMission = mission;
    populatePage(mission);
  } catch (err) {
    if (err.status === 404) {
      showNotif("fa-circle-xmark", "Not Found", "This mission does not exist");
      setTimeout(() => (window.location.href = "./mission-list.html"), 2000);
    } else {
      showNotif("fa-circle-xmark", "Error", "Failed to load mission details");
    }
  }
}

document
  .querySelector("#modal-close")
  .addEventListener("click", closeAreaModal);
document.querySelector("#area-modal").addEventListener("click", (e) => {
  if (e.target === document.querySelector("#area-modal")) closeAreaModal();
});

document.querySelector("#modal-areas").addEventListener("click", async (e) => {
  const btn = e.target.closest(".area-option");
  if (!btn || btn.disabled) return;
  await handleRegister(btn.dataset.areaId);
});

loadMissionDetail();
