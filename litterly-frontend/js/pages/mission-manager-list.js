const list = document.querySelector("#mgmt-list");

const STATUS_ICONS = {
  draft: "fa-file-pen",
  open: "fa-door-open",
  ongoing: "fa-person-running",
  awaiting_rewards: "fa-gift",
  completed: "fa-circle-check",
  cancelled: "fa-ban",
};

function renderLoading() {
  list.innerHTML = `
    <div class="mgmt-list-loading">
      <i class="fa-solid fa-spinner fa-spin"></i>
    </div>
  `;
}

function renderList(missions) {
  if (!missions.length) {
    list.innerHTML = `<p class="mgmt-list-empty">No missions found.</p>`;
    return;
  }

  list.innerHTML = missions
    .map(
      (mission) => `
    <a href="./mission-management.html?id=${mission.id}" class="mgmt-list-item">
      <div class="mgmt-list-item-left">
        <div class="mgmt-list-status-icon ${mission.status}">
          <i class="fa-solid ${STATUS_ICONS[mission.status] ?? "fa-circle"}"></i>
        </div>
        <div class="mgmt-list-item-info">
          <div class="mgmt-list-item-title">${mission.title}</div>
          <div class="mgmt-list-item-meta">
            <span>${mission.location}</span>
            <span class="mgmt-list-dot">·</span>
            <span>${mission.participant_count} registered</span>
            <span class="mgmt-list-dot">·</span>
            <span>by ${mission.created_by_username}</span>
          </div>
        </div>
      </div>
      <div class="mgmt-list-item-right">
        <span class="status-tag ${mission.status}">${mission.status.replaceAll("_", " ")}</span>
        <i class="fa-solid fa-chevron-right mgmt-list-chevron"></i>
      </div>
    </a>
  `,
    )
    .join("");
}

async function loadManagerList() {
  renderLoading();
  try {
    const missions = await getAllMissionsAdmin();
    renderList(missions);
  } catch (err) {
    list.innerHTML = "";
    if (err.status === 403) {
      showNotif("fa-circle-xmark", "Access Denied", "Admins only");
      setTimeout(() => (window.location.href = "./mission-list.html"), 2000);
    } else {
      showNotif("fa-circle-xmark", "Error", "Failed to load missions");
    }
  }
}

loadManagerList();
