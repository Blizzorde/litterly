const API_BASE_URL = "/api";
const LOCAL_MISSIONS_KEY = "litterly_user_created_missions";
const JOINED_MISSIONS_KEY = "litterly_joined_missions";
const ATTENDANCE_KEY = "litterly_attendance_records";

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
let selectedMissionId = null;

const attendanceList = document.querySelector("#attendance-list");
const attendanceCount = document.querySelector("#attendance-count");
const joinedCount = document.querySelector("#joined-count");
const checkedInCount = document.querySelector("#checked-in-count");
const pendingCount = document.querySelector("#pending-count");
const attendanceModal = document.querySelector("#attendance-modal");
const attendanceMissionName = document.querySelector("#attendance-mission-name");
const attendanceCloseBtn = document.querySelector("#attendance-close-btn");
const attendanceCancelBtn = document.querySelector("#attendance-cancel-btn");
const attendanceConfirmBtn = document.querySelector("#attendance-confirm-btn");
const toastContainer = document.querySelector("#toast-container");

document.addEventListener("DOMContentLoaded", initAttendancePage);

async function initAttendancePage() {
  bindEvents();
  missions = await loadMissions();
  renderAttendance();
}

function bindEvents() {
  attendanceCloseBtn?.addEventListener("click", closeAttendanceModal);
  attendanceCancelBtn?.addEventListener("click", closeAttendanceModal);
  attendanceConfirmBtn?.addEventListener("click", confirmAttendance);
  attendanceModal?.addEventListener("click", (event) => {
    if (event.target === attendanceModal) closeAttendanceModal();
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

    return [...localMissions, ...normalizedApiMissions, ...sampleMissions];
  } catch (error) {
    return [...localMissions, ...sampleMissions];
  }
}

function renderAttendance() {
  const joinedMissionIds = getJoinedMissionIds();
  const attendanceRecords = getAttendanceRecords();
  const joinedMissions = joinedMissionIds
    .map((id) => missions.find((mission) => String(mission.id) === String(id)))
    .filter(Boolean);

  const checkedInTotal = joinedMissions.filter((mission) => attendanceRecords[String(mission.id)]).length;
  const pendingTotal = Math.max(joinedMissions.length - checkedInTotal, 0);

  joinedCount.textContent = joinedMissions.length;
  checkedInCount.textContent = checkedInTotal;
  pendingCount.textContent = pendingTotal;
  attendanceCount.textContent = `${joinedMissions.length} joined mission${joinedMissions.length === 1 ? "" : "s"}`;

  if (joinedMissions.length === 0) {
    attendanceList.innerHTML = `
      <div class="empty-state">
        <h3>No joined missions yet</h3>
        <p>Join a mission first, then come back here to mark your attendance.</p>
        <a class="btn-primary button-link" href="../index.html">Find Missions</a>
      </div>
    `;
    return;
  }

  attendanceList.innerHTML = joinedMissions
    .map((mission) => createAttendanceItem(mission, attendanceRecords[String(mission.id)]))
    .join("");

  document.querySelectorAll("[data-mark-present]").forEach((button) => {
    button.addEventListener("click", () => openAttendanceModal(button.dataset.markPresent));
  });
}

function createAttendanceItem(mission, attendanceRecord) {
  const hasCheckedIn = Boolean(attendanceRecord);
  const checkInText = hasCheckedIn
    ? `Checked in ${formatDateTime(attendanceRecord.checkedInAt)}`
    : "Not checked in yet";

  return `
    <article class="attendance-item">
      <div class="attendance-main">
        <span class="attendance-status ${hasCheckedIn ? "checked-in" : "pending"}">${hasCheckedIn ? "Present" : "Pending"}</span>
        <div>
          <h3>${escapeHtml(mission.title)}</h3>
          <p>${escapeHtml(mission.location)} &bull; ${formatDate(mission.date)} &bull; ${Number(mission.points) || 0} points</p>
          <span class="attendance-time">${escapeHtml(checkInText)}</span>
        </div>
      </div>
      <div class="attendance-actions">
        <a class="btn-outline button-link" href="mission-detail.html?id=${encodeURIComponent(String(mission.id))}">Details</a>
        <button class="btn-primary" type="button" data-mark-present="${escapeHtml(String(mission.id))}" ${hasCheckedIn ? "disabled" : ""}>${hasCheckedIn ? "Checked In" : "Mark Present"}</button>
      </div>
    </article>
  `;
}

function openAttendanceModal(missionId) {
  const mission = missions.find((item) => String(item.id) === String(missionId));
  if (!mission) return;

  selectedMissionId = String(missionId);
  attendanceMissionName.textContent = mission.title;
  attendanceModal.classList.remove("hidden");
  attendanceConfirmBtn.focus();
}

function closeAttendanceModal() {
  selectedMissionId = null;
  attendanceModal.classList.add("hidden");
}

function confirmAttendance() {
  if (!selectedMissionId) return;

  const attendanceRecords = getAttendanceRecords();
  attendanceRecords[selectedMissionId] = {
    status: "present",
    checkedInAt: new Date().toISOString()
  };

  localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(attendanceRecords));
  closeAttendanceModal();
  renderAttendance();
  showToast("Attendance marked. Nice, you are checked in.", "success");
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

function getAttendanceRecords() {
  const savedRecords = localStorage.getItem(ATTENDANCE_KEY);
  if (!savedRecords) return {};

  try {
    return JSON.parse(savedRecords);
  } catch (error) {
    localStorage.removeItem(ATTENDANCE_KEY);
    return {};
  }
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

function formatDateTime(dateValue) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "recently";

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
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
