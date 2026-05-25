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
  console.log("ITS ME");
  if (!areas.length) return "TBD";
  console.log("ME MEE");
  const min = Math.min(...areas.map((a) => a.reward_points));
  const max = Math.max(...areas.map((a) => a.reward_points));
  return min === max ? `${min} pts` : `${min}–${max} pts`;
}

function populatePage(mission) {
  // header overlay
  document.querySelector(".overlay-title").textContent = mission.title;
  document.querySelector(".overlay-status").innerHTML =
    `<span class="status-tag ${mission.status}">${mission.status}</span>`;
  document.querySelector(".overlay-header-wrapper").innerHTML =
    `<i class="fa-solid fa-star"></i> ${getTotalRewardPoints(mission.areas)}`;

  // thumbnail bg
  document.querySelector(".card-thumbnail-wrapper").style.backgroundImage =
    `linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.6)), url('${mission.photo_url ?? "../assets/placeholder.webp"}')`;
  document.querySelector(".card-thumbnail-wrapper").style.backgroundSize =
    "cover";
  document.querySelector(".card-thumbnail-wrapper").style.backgroundPosition =
    "center";

  // description
  document.querySelector(".card-description-wrapper").innerHTML = `
    <h2 class="description-title">About This Mission</h2>
    <p>${mission.description}</p>
  `;

  // summary details
  document.querySelector(".extra-detail-item:nth-child(1) .value").textContent =
    mission.location;
  document.querySelector(".extra-detail-item:nth-child(2) .value").textContent =
    formatDate(mission.start_datetime);
  document.querySelector(".extra-detail-item:nth-child(3) .value").textContent =
    `${formatTime(mission.start_datetime)} – ${formatTime(mission.end_datetime)}`;
  document.querySelector(".extra-detail-item.reward .value").textContent =
    getTotalRewardPoints(mission.areas);

  // page title
  document.title = `${mission.title} - Litterly`;
}

async function loadMissionDetail() {
  const id = getMissionIdFromUrl();

  if (!id) {
    window.location.href = "./mission-list.html";
    return;
  }

  try {
    const mission = await getMissionById(id);
    populatePage(mission);
  } catch (err) {
    if (err.status === 404) {
      showNotif(
        "fa-circle-xmark",
        "Not Found",
        "danger",
        "This mission does not exist",
      );
      setTimeout(() => (window.location.href = "./mission-list.html"), 2000);
    } else {
      showNotif(
        "fa-circle-xmark",
        "Error",
        "danger",
        "Failed to load mission details",
      );
    }
  }
}

loadMissionDetail();
