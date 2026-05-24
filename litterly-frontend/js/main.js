const API_BASE_URL = "/api";
const LOCAL_MISSIONS_KEY = "litterly_user_created_missions";
const JOINED_MISSIONS_KEY = "litterly_joined_missions";

const sampleMissions = [
  {
    id: "sample-1",
    title: "Waterkant River Cleanup",
    location: "Paramaribo",
    date: "2026-06-02",
    status: "Active",
    points: 80,
    details: "Help remove plastic bottles and small litter near the river walkway."
  },
  {
    id: "sample-2",
    title: "School Yard Refresh",
    location: "Latour",
    date: "2026-06-08",
    status: "Pending",
    points: 60,
    details: "A planned cleanup for students and neighbors around the school area."
  },
  {
    id: "sample-3",
    title: "Market Area Sweep",
    location: "Central Market",
    date: "2026-05-18",
    status: "Completed",
    points: 45,
    details: "Community volunteers cleaned up loose packaging around busy stalls."
  }
];

let missions = [];
let currentFilter = "all";
let searchTerm = "";
let selectedMissionId = null;

const missionsList = document.querySelector("#missions-list");
const missionCount = document.querySelector("#mission-count");
const createMissionBtn = document.querySelector("#create-mission-btn");
const missionModal = document.querySelector("#mission-modal");
const missionForm = document.querySelector("#mission-form");
const closeModalBtn = document.querySelector("#modal-close-btn");
const cancelModalBtn = document.querySelector("#modal-cancel-btn");
const filterButtons = document.querySelectorAll(".filters button");
const missionSearch = document.querySelector("#mission-search");
const toastContainer = document.querySelector("#toast-container");
const joinModal = document.querySelector("#join-modal");
const joinMissionName = document.querySelector("#join-mission-name");
const joinCloseBtn = document.querySelector("#join-close-btn");
const joinCancelBtn = document.querySelector("#join-cancel-btn");
const joinConfirmBtn = document.querySelector("#join-confirm-btn");

document.addEventListener("DOMContentLoaded", initMissionPage);

async function initMissionPage() {
  bindEvents();
  missions = await loadMissions();
  renderMissions();
}

function bindEvents() {
  createMissionBtn?.addEventListener("click", openMissionModal);
  closeModalBtn?.addEventListener("click", closeMissionModal);
  cancelModalBtn?.addEventListener("click", closeMissionModal);
  missionModal?.addEventListener("click", (event) => {
    if (event.target === missionModal) closeMissionModal();
  });

  missionForm?.addEventListener("submit", handleCreateMission);
  joinCloseBtn?.addEventListener("click", closeJoinModal);
  joinCancelBtn?.addEventListener("click", closeJoinModal);
  joinConfirmBtn?.addEventListener("click", confirmJoinMission);
  joinModal?.addEventListener("click", (event) => {
    if (event.target === joinModal) closeJoinModal();
  });

  missionSearch?.addEventListener("input", (event) => {
    searchTerm = event.target.value.trim().toLowerCase();
    renderMissions();
  });

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      currentFilter = button.dataset.filter;
      filterButtons.forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      renderMissions();
    });
  });
}

async function loadMissions() {
  const localMissions = getLocalMissions();

  try {
    const response = await fetch(`${API_BASE_URL}/missions`);
    if (!response.ok) throw new Error("Mission API unavailable");

    const apiMissions = await response.json();
    const normalizedApiMissions = Array.isArray(apiMissions)
      ? apiMissions.map(normalizeMission)
      : [];

    return [...localMissions, ...normalizedApiMissions];
  } catch (error) {
    showToast("Showing example missions until the mission API is available.", "error");
    return [...localMissions, ...sampleMissions];
  }
}

function normalizeMission(mission) {
  return {
    id: mission.id ?? mission.mission_id ?? crypto.randomUUID(),
    title: mission.title ?? mission.name ?? "Untitled mission",
    location: mission.location ?? mission.area ?? "Location to be announced",
    date: mission.date ?? mission.mission_date ?? mission.created_at ?? "",
    status: mission.status ?? "Active",
    points: mission.points ?? mission.reward_points ?? 50,
    details: mission.details ?? mission.description ?? "More details will be shared soon."
  };
}

function getLocalMissions() {
  const savedMissions = localStorage.getItem(LOCAL_MISSIONS_KEY);
  if (!savedMissions) return [];

  try {
    return JSON.parse(savedMissions);
  } catch (error) {
    localStorage.removeItem(LOCAL_MISSIONS_KEY);
    return [];
  }
}

function saveLocalMission(mission) {
  const localMissions = getLocalMissions();
  localStorage.setItem(LOCAL_MISSIONS_KEY, JSON.stringify([mission, ...localMissions]));
}

function renderMissions() {
  const visibleMissions = missions.filter((mission) => {
    const status = mission.status.toLowerCase();
    const matchesFilter = currentFilter === "all" || status === currentFilter;
    const searchableText = `${mission.title} ${mission.location} ${mission.details}`.toLowerCase();
    return matchesFilter && searchableText.includes(searchTerm);
  });

  missionCount.textContent = `${visibleMissions.length} mission${visibleMissions.length === 1 ? "" : "s"} found`;

  if (visibleMissions.length === 0) {
    missionsList.innerHTML = `
      <div class="empty-state">
        <h3>No missions found</h3>
        <p>Try another filter or create a mission for your community.</p>
      </div>
    `;
    return;
  }

  missionsList.innerHTML = visibleMissions.map(createMissionCard).join("");

  document.querySelectorAll("[data-join-mission]").forEach((button) => {
    button.addEventListener("click", () => openJoinModal(button.dataset.joinMission));
  });
}

function createMissionCard(mission) {
  const statusClass = mission.status.toLowerCase();
  const statusLabel = mission.status === "Active"
    ? "Open"
    : mission.status === "Pending"
      ? "Planned"
      : mission.status;
  const joinedMissionIds = getJoinedMissionIds();
  const isJoined = joinedMissionIds.includes(String(mission.id));
  const isCompleted = mission.status === "Completed";
  const joinDisabled = isJoined || isCompleted;
  const joinLabel = isJoined ? "Joined" : "Join Mission";

  return `
    <article class="mission-card">
      <div class="mission-image" aria-hidden="true"></div>
      <div class="mission-card-body">
        <div class="card-header">
          <div>
            <h3>${escapeHtml(mission.title)}</h3>
            <a class="text-link" href="pages/mission-detail.html?id=${encodeURIComponent(String(mission.id))}">Details</a>
          </div>
          <span class="status-badge ${statusClass}">${escapeHtml(statusLabel)}</span>
        </div>

        <div class="mission-meta">
          <div class="meta-item">
            <span class="meta-label">Location</span>
            <span class="meta-value">${escapeHtml(mission.location)}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Date</span>
            <span class="meta-value">${formatDate(mission.date)}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Reward</span>
            <span class="meta-value">${Number(mission.points) || 0} points</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Mission ID</span>
            <span class="meta-value">#${escapeHtml(String(mission.id))}</span>
          </div>
        </div>

        <p class="card-details">${escapeHtml(mission.details)}</p>

        <div class="card-actions">
          <button class="btn-primary" type="button" data-join-mission="${escapeHtml(String(mission.id))}" ${joinDisabled ? "disabled" : ""}>${joinLabel}</button>
          <a class="btn-outline button-link" href="pages/mission-detail.html?id=${encodeURIComponent(String(mission.id))}">View Details</a>
        </div>
      </div>
    </article>
  `;
}

function handleCreateMission(event) {
  event.preventDefault();

  const newMission = {
    id: `local-${Date.now()}`,
    title: document.querySelector("#input-title").value.trim(),
    location: document.querySelector("#input-location").value.trim(),
    date: document.querySelector("#input-date").value,
    status: document.querySelector("#input-status").value,
    points: Number(document.querySelector("#input-points").value),
    details: document.querySelector("#input-details").value.trim() || "No extra details yet."
  };

  saveLocalMission(newMission);
  missions = [newMission, ...missions];
  missionForm.reset();
  document.querySelector("#input-points").value = 50;
  closeMissionModal();
  renderMissions();
  showToast("Mission added to your list.", "success");
}

function openJoinModal(missionId) {
  const mission = missions.find((item) => String(item.id) === String(missionId));
  if (!mission || mission.status === "Completed") return;

  selectedMissionId = String(missionId);
  joinMissionName.textContent = mission.title;
  joinModal.classList.remove("hidden");
  joinConfirmBtn.focus();
}

function closeJoinModal() {
  selectedMissionId = null;
  joinModal.classList.add("hidden");
}

async function confirmJoinMission() {
  if (!selectedMissionId) return;

  const missionId = selectedMissionId;
  addJoinedMissionId(missionId);
  closeJoinModal();
  renderMissions();

  try {
    const response = await fetch(`${API_BASE_URL}/missions/join`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ missionId })
    });

    if (!response.ok) throw new Error("Join request failed");
    showToast("Mission joined. It is now in your joined missions.", "success");
  } catch (error) {
    showToast("Mission saved locally. Log in later to sync it with your account.", "success");
  }
}

function getJoinedMissionIds() {
  const savedMissionIds = localStorage.getItem(JOINED_MISSIONS_KEY);
  if (!savedMissionIds) return [];

  try {
    return JSON.parse(savedMissionIds).map(String);
  } catch (error) {
    localStorage.removeItem(JOINED_MISSIONS_KEY);
    return [];
  }
}

function addJoinedMissionId(missionId) {
  const joinedMissionIds = getJoinedMissionIds();
  const normalizedId = String(missionId);
  if (joinedMissionIds.includes(normalizedId)) return;

  localStorage.setItem(JOINED_MISSIONS_KEY, JSON.stringify([normalizedId, ...joinedMissionIds]));
}

function openMissionModal() {
  missionModal.classList.remove("hidden");
  document.querySelector("#input-title").focus();
}

function closeMissionModal() {
  missionModal.classList.add("hidden");
}

function formatDate(dateValue) {
  if (!dateValue) return "TBA";

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return escapeHtml(String(dateValue));

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3600);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
