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

loadMissionManagement();
