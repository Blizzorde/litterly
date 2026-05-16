const container = document.getElementById("admin-missions");
let allMissions = []; // Store all missions to allow filtering

async function fetchAdminMissions() {
  try {
    const response = await fetch("data/missions.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    allMissions = await response.json();
    renderMissions(allMissions);
    setupFilters(); // Setup filter buttons after fetching data
  } catch (error) {
    console.error("Could not fetch missions data:", error);
    container.innerHTML = `
      <div style="grid-column: 1 / -1; padding: 20px; background: #fee2e2; color: #991b1b; border-radius: 8px;">
        Error loading missions data. Ensure you are running this via a local server (e.g. Live Server).
      </div>
    `;
  }
}

function renderMissions(missions) {
  const htmlString = missions.map(m => {
    // Generate HTML for areas
    const areasHTML = m.areas.map(area => `
      <div class="area-item">
        <span>${area.name}</span>
        <span class="points">${area.points} pts</span>
      </div>
    `).join("");

    return `
      <div class="card">
        <div class="card-header">
          <div class="mission-info-group">
            <img src="${m.image || 'assets/placeholder.jpg'}" alt="Mission thumbnail" class="mission-image" />
            <div>
              <h3>${m.title}</h3>
              <span class="mission-id">ID: ${m.id} &bull; ${m.date}</span>
            </div>
          </div>
          <span class="status-badge ${m.status.toLowerCase()}">${m.status}</span>
        </div>
        
        <div class="card-details">
          <p>${m.details}</p>
        </div>

        <div class="areas-section">
          <h4>Areas & Assigned Points</h4>
          ${areasHTML}
        </div>

        <div class="card-actions">
          <button class="btn-outline">Edit Mission</button>
          <button class="btn-outline">View Reports</button>
        </div>
      </div>
    `;
  }).join("");

  container.innerHTML = htmlString;
}

function setupFilters() {
  const filterButtons = document.querySelectorAll('.filters button');

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      // 1. Update active button styling
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      // 2. Filter logic
      const filterValue = button.textContent.trim();

      if (filterValue === 'All') {
        renderMissions(allMissions);
      } else {
        const filteredMissions = allMissions.filter(m => m.status === filterValue);
        renderMissions(filteredMissions);
      }
    });
  });
}

// Modal Setup
function setupModal() {
  const modal = document.getElementById("mission-modal");
  const createBtn = document.getElementById("create-mission-btn");
  const closeBtn = document.getElementById("modal-close-btn");
  const cancelBtn = document.getElementById("modal-cancel-btn");

  // Open modal
  createBtn.addEventListener("click", () => {
    modal.classList.remove("hidden");
  });

  // Close modal
  const closeModal = () => {
    modal.classList.add("hidden");
  };

  closeBtn.addEventListener("click", closeModal);
  cancelBtn.addEventListener("click", closeModal);

  // Close when clicking on the overlay background
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });
}

// Form Setup
function setupForm() {
  const form = document.getElementById("mission-form");
  const addAreaBtn = document.getElementById("add-area-btn");
  const areasList = document.getElementById("areas-list");
  const modal = document.getElementById("mission-modal");

  // Dynamic Add Area Logic
  addAreaBtn.addEventListener("click", () => {
    const row = document.createElement("div");
    row.className = "form-row area-input-row";
    row.style.marginBottom = "8px";
    row.innerHTML = `
      <div class="form-group" style="flex: 2;">
        <input type="text" class="area-name" placeholder="Area name (e.g. Playground)" required />
      </div>
      <div class="form-group" style="flex: 1;">
        <input type="number" class="area-points" placeholder="Points" required />
      </div>
      <button type="button" class="btn-danger remove-area-btn" style="padding: 10px; flex-shrink: 0;">&times;</button>
    `;
    
    // Remove area button logic
    row.querySelector(".remove-area-btn").addEventListener("click", () => {
      row.remove();
    });

    areasList.appendChild(row);
  });

  // Form Submission Logic
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // 1. Gather Basic Info
    const title = document.getElementById("input-title").value;
    const status = document.getElementById("input-status").value;
    const date = document.getElementById("input-date").value;
    const image = document.getElementById("input-image").value;
    const details = document.getElementById("input-details").value;

    // 2. Gather Areas
    const areas = [];
    const areaRows = areasList.querySelectorAll(".area-input-row");
    areaRows.forEach(row => {
      const name = row.querySelector(".area-name").value;
      const points = row.querySelector(".area-points").value;
      if (name && points) {
        areas.push({ name, points: parseInt(points, 10) });
      }
    });

    // 3. Create New Mission Object
    const newMission = {
      id: "M-" + Math.floor(Math.random() * 1000) + 100, // Generate random ID
      title,
      status,
      date,
      image,
      details,
      areas
    };

    // 4. Update state and re-render
    allMissions.unshift(newMission); // Add to beginning of array
    renderMissions(allMissions);

    // 5. Reset and Close
    form.reset();
    areasList.innerHTML = ""; // Clear dynamic areas
    modal.classList.add("hidden");

    // Re-apply active filter if needed (optional, keeping it simple by showing all)
    document.querySelector('.filters button').click(); 
  });
}

// Initialization
fetchAdminMissions();
setupModal();
setupForm();