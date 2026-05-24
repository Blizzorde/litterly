const cardsWrapper = document.querySelector(".cards-wrapper");

function renderLoading() {
  cardsWrapper.innerHTML = `
    <div class="cards-loading">
      <i class="fa-solid fa-spinner fa-spin"></i>
    </div>
  `;
}

function renderMissions(missions) {
  if (!missions.length) {
    cardsWrapper.innerHTML = `<p class="cards-empty">No missions available.</p>`;
    return;
  }

  console.log(missions);

  cardsWrapper.innerHTML = missions
    .map(
      (mission) => `
    <a href="./mission-detail.html?id=${mission.id}" class="card-wrapper">
      <div class="card-thumbnail" ${mission.thumbnail ? `style="background-image: url('${mission.thumbnail}')"` : ""}></div>
      <div class="card-text-content-wrapper">
        <h1 class="mission-title">${mission.title}</h1>
        <p class="mission-description">${mission.description}</p>
      </div>
    </a>
  `,
    )
    .join("");
}

async function loadMissions() {
  renderLoading();
  try {
    const missions = await getMissions();
    renderMissions(missions);
  } catch (err) {
    cardsWrapper.innerHTML = "";
    console.error(err);
    showNotif("fa-circle-xmark", "Error", "Failed to load missions", "danger");
  }
}

loadMissions();
