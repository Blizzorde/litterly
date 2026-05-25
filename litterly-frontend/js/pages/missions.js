const cardsWrapper = document.querySelector(".cards-wrapper");

function renderLoading() {
  cardsWrapper.style.display = "flex";
  cardsWrapper.innerHTML = `
    <div class="cards-loading">
      <i class="fa-solid fa-circle-notch fa-spin"></i>
    </div>
  `;
}

function renderMissions(missions) {
  if (!missions.length) {
    cardsWrapper.innerHTML = `<p class="cards-empty">No missions available.</p>`;
    return;
  }

  console.log(missions);
  cardsWrapper.style.display = "grid";

  cardsWrapper.innerHTML = missions
    .map(
      (mission) => `
    <a href="./mission-detail.html?id=${mission.id}" class="card-wrapper">
      <div class="card-thumbnail" ${mission.thumbnail ? `style="background-image: url('${mission.thumbnail}')"` : ""}>
        <div class="card-top-bar">
          <div class="status-tag ${mission.status}">${mission.status.split("_").join(" ")}</div>
        </div>
      </div>
      <div class="card-text-content-wrapper">
        <div class="card-text">
          <h1 class="mission-title">${mission.title}</h1>
          <p class="mission-description">${mission.description}</p>
        </div>
        <div class="card-action">View Mission</div>
      </div>
    </a>
  `,
    )
    .join("");
}

function getTypeFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const type = params.get("type");
  const allowed = [
    "open",
    "ongoing",
    "awaiting_rewards",
    "completed",
    "cancelled",
  ];
  return allowed.includes(type) ? type : null;
}

function setActiveFilter(type) {
  document.querySelectorAll(".filter-text").forEach((el) => {
    el.classList.remove("active");
    const elType = el.dataset.type;
    if ((!type && !elType) || elType === type) el.classList.add("active");
  });
}

async function loadMissions() {
  const type = getTypeFromUrl();
  setActiveFilter(type);
  renderLoading();

  try {
    const missions = await getMissions(type);
    renderMissions(missions);
  } catch (err) {
    cardsWrapper.innerHTML = "";
    showNotif("fa-circle-xmark", "Error", "Failed to load missions", "danger");
  }
}

loadMissions();
