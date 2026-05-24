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

const missionDetail = document.querySelector("#mission-detail");
const toastContainer = document.querySelector("#toast-container");
const missionId = new URLSearchParams(window.location.search).get("id");
const joinModal = document.querySelector("#join-modal");
const joinMissionName = document.querySelector("#join-mission-name");
const joinCloseBtn = document.querySelector("#join-close-btn");
const joinCancelBtn = document.querySelector("#join-cancel-btn");
const joinConfirmBtn = document.querySelector("#join-confirm-btn");

let currentMission = null;

document.addEventListener("DOMContentLoaded", initMissionDetailPage);

async function initMissionDetailPage() {
  if (!missionId) {
    renderNotFound();
    return;
  }

  const mission = await loadMission(missionId);

  if (!mission) {
    renderNotFound();
    return;
  }

  currentMission = mission;
  renderMissionDetail(mission);
  bindJoinEvents();
}

async function loadMission(id) {
  const localMission = getLocalMissions().find((mission) => String(mission.id) === String(id));
  if (localMission) return localMission;

  const sampleMission = sampleMissions.find((mission) => String(mission.id) === String(id));

  try {
    const response = await fetch(`${API_BASE_URL}/missions/${encodeURIComponent(id)}`);
    if (!response.ok) throw new Error("Mission not found");

    const apiMission = await response.json();
    return normalizeMission(apiMission);
  } catch (error) {
    return sampleMission ?? null;
  }
}

function renderMissionDetail(mission) {
  const statusClass = mission.status.toLowerCase();
  const statusLabel = getStatusLabel(mission.status);
  const isCompleted = mission.status === "Completed";
  const isJoined = getJoinedMissionIds().includes(String(mission.id));
  const joinDisabled = isCompleted || isJoined;
  const joinLabel = isJoined ? "Joined" : "Join Mission";

  missionDetail.innerHTML = `
    <article class="detail-card">
      <div class="detail-hero-image" aria-hidden="true"></div>
      <div class="detail-content">
        <div class="detail-title-row">
          <div>
            <p class="eyebrow">Mission details</p>
            <h1>${escapeHtml(mission.title)}</h1>
          </div>
          <span class="status-badge ${statusClass}">${escapeHtml(statusLabel)}</span>
        </div>

        <p class="detail-description">${escapeHtml(mission.details)}</p>

        <div class="detail-stats">
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

        <div class="detail-info-grid">
          <section class="info-panel">
            <h2>What to expect</h2>
            <ul>
              <li>Meet at the listed location before the cleanup starts.</li>
              <li>Bring water, comfortable shoes, and sun protection.</li>
              <li>Check in with the mission organizer to receive points.</li>
            </ul>
          </section>

          <section class="info-panel">
            <h2>How points work</h2>
            <p>After participation is confirmed, the mission reward is added to your Litterly account.</p>
          </section>
        </div>

        <div class="detail-actions">
          <button class="btn-primary" type="button" data-join-mission="${escapeHtml(String(mission.id))}" ${joinDisabled ? "disabled" : ""}>${joinLabel}</button>
          <a class="btn-outline button-link" href="../index.html">Back to List</a>
        </div>
      </div>
    </article>
  `;
}

function renderNotFound() {
  missionDetail.innerHTML = `
    <div class="detail-card detail-empty">
      <p class="eyebrow">Mission unavailable</p>
      <h1>Mission not found</h1>
      <p class="hero-copy">This mission may have been removed or the link may be incorrect.</p>
      <a class="btn-primary button-link" href="../index.html">Back to Missions</a>
    </div>
  `;
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

function bindJoinEvents() {
  document.querySelector("[data-join-mission]")?.addEventListener("click", openJoinModal);
  joinCloseBtn?.addEventListener("click", closeJoinModal);
  joinCancelBtn?.addEventListener("click", closeJoinModal);
  joinConfirmBtn?.addEventListener("click", confirmJoinMission);
  joinModal?.addEventListener("click", (event) => {
    if (event.target === joinModal) closeJoinModal();
  });
}

function openJoinModal() {
  if (!currentMission || currentMission.status === "Completed") return;

  joinMissionName.textContent = currentMission.title;
  joinModal.classList.remove("hidden");
  joinConfirmBtn.focus();
}

function closeJoinModal() {
  joinModal.classList.add("hidden");
}

async function confirmJoinMission() {
  if (!currentMission) return;

  const id = currentMission.id;
  addJoinedMissionId(id);
  closeJoinModal();
  renderMissionDetail(currentMission);
  bindJoinEvents();

  try {
    const response = await fetch(`${API_BASE_URL}/missions/join`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ missionId: id })
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

function addJoinedMissionId(id) {
  const joinedMissionIds = getJoinedMissionIds();
  const normalizedId = String(id);
  if (joinedMissionIds.includes(normalizedId)) return;

  localStorage.setItem(JOINED_MISSIONS_KEY, JSON.stringify([normalizedId, ...joinedMissionIds]));
}

function getStatusLabel(status) {
  if (status === "Active") return "Open";
  if (status === "Pending") return "Planned";
  return status;
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
