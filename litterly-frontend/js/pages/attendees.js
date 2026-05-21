// Mock Attendee Database
let attendees = [
    { id: 1, name: "Jordan Dawson", email: "j.dawson@example.com", date: "Oct 12, 2023 • 09:15 AM", status: "ATTENDED" },
    { id: 2, name: "Sarah Hudson", email: "sarah.h@green.org", date: "Oct 14, 2023 • 11:42 AM", status: "PENDING" },
    { id: 3, name: "Marcus Chen", email: "m.chen@edu.tech", date: "Oct 15, 2023 • 08:30 AM", status: "NO SHOW" },
    { id: 4, name: "Lena Wilson", email: "lena_w88@gmail.com", date: "Oct 15, 2023 • 02:22 PM", status: "ATTENDED" },
    { id: 5, name: "Riley Peterson", email: "r.peterson@freelance.com", date: "Oct 16, 2023 • 10:10 AM", status: "PENDING" },
    { id: 6, name: "Xander De Vries", email: "x.devries@paramaribo.sr", date: "Oct 17, 2023 • 07:45 AM", status: "ATTENDED" },
    { id: 7, name: "Anjali Ramdin", email: "anjali.r@university.sr", date: "Oct 17, 2023 • 01:15 PM", status: "PENDING" },
    { id: 8, name: "Giovanni Pinas", email: "g.pinas@cleanup.sr", date: "Oct 18, 2023 • 04:30 PM", status: "CANCELLED" },
    { id: 9, name: "Shenaya Soerodimedjo", email: "s.soerodimedjo@outlook.com", date: "Oct 19, 2023 • 09:00 AM", status: "ATTENDED" },
    { id: 10, name: "Kevin MacDonald", email: "kevin.mac@nature.org", date: "Oct 20, 2023 • 11:10 AM", status: "PENDING" },
    { id: 11, name: "Aisha Overeem", email: "aisha.o@greenheart.com", date: "Oct 21, 2023 • 08:15 AM", status: "ATTENDED" },
    { id: 12, name: "Dewan Balraadjsingh", email: "dewan.b@gov.sr", date: "Oct 22, 2023 • 03:20 PM", status: "PENDING" },
    { id: 13, name: "Fabian Ligeon", email: "f.ligeon@litterly.org", date: "Oct 23, 2023 • 10:45 AM", status: "NO SHOW" },
    { id: 14, name: "Cheryl Castelen", email: "c.castelen@suriname.sr", date: "Oct 24, 2023 • 11:30 AM", status: "ATTENDED" },
    { id: 15, name: "Ryan Alibux", email: "r.alibux@recycle.sr", date: "Oct 25, 2023 • 02:00 PM", status: "PENDING" }
];

// App State
let currentPage = 1;
const itemsPerPage = 5;
let activeFilter = "ALL";
let searchQuery = "";

// Helper to get initials
function getInitials(name) {
    const parts = name.split(" ");
    if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}

// Dom Elements
const tableBody = document.getElementById("table-body");
const statsTotal = document.getElementById("stats-total");
const statsPresent = document.getElementById("stats-present");
const statsPresentMeta = document.getElementById("stats-present-meta");
const statsCancelled = document.getElementById("stats-cancelled");
const statsCancelledMeta = document.getElementById("stats-cancelled-meta");

const searchInput = document.getElementById("search-input");
const filterTabs = document.querySelectorAll(".filter-tab");
const paginationRange = document.getElementById("pagination-range");
const paginationControls = document.getElementById("pagination-controls");
const emptyState = document.getElementById("empty-state");

// Modal elements (matching admin style)
const btnAdd = document.getElementById("btn-add");
const attendeeModal = document.getElementById("attendee-modal");
const btnCloseModal = document.getElementById("btn-close-modal");
const btnCancelModal = document.getElementById("btn-cancel-modal");
const addAttendeeForm = document.getElementById("add-attendee-form");

// Toast elements
const toast = document.getElementById("toast");
const toastMessage = document.getElementById("toast-message");

// Display Toast Alert
function showToast(message, iconClass = "fa-check-circle") {
    toastMessage.innerHTML = `<i class="fas ${iconClass}"></i> ${message}`;
    toast.classList.add("show");
    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

// Calculate and Render Statistics Cards
function updateStats() {
    const total = attendees.length;
    const present = attendees.filter(a => a.status === "ATTENDED").length;
    const cancelled = attendees.filter(a => a.status === "CANCELLED" || a.status === "NO SHOW").length;
    const attendanceRate = total > 0 ? Math.round((present / total) * 100) : 0;
    const noShowRate = total > 0 ? Math.round((cancelled / total) * 100) : 0;

    statsTotal.textContent = total;
    statsPresent.textContent = present;
    statsPresentMeta.textContent = `${attendanceRate}% attendance`;
    statsCancelled.textContent = cancelled;
    statsCancelledMeta.textContent = `${noShowRate}% rate`;
}

// Filter and Search Attendees List
function getFilteredAttendees() {
    return attendees.filter(attendee => {
        // Search matches
        const matchesSearch = 
            attendee.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            attendee.email.toLowerCase().includes(searchQuery.toLowerCase());
        
        // Filter matches
        if (!matchesSearch) return false;
        
        if (activeFilter === "ALL") return true;
        if (activeFilter === "ATTENDED") return attendee.status === "ATTENDED";
        if (activeFilter === "PENDING") return attendee.status === "PENDING";
        if (activeFilter === "CANCELLED") {
            return attendee.status === "CANCELLED" || attendee.status === "NO SHOW";
        }
        return true;
    });
}

// Render the Attendee Rows
function renderTable() {
    const filteredList = getFilteredAttendees();
    const totalItems = filteredList.length;
    
    // Reset page if it exceeds range
    const maxPage = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    if (currentPage > maxPage) {
        currentPage = maxPage;
    }

    // Toggle Empty State
    if (totalItems === 0) {
        tableBody.innerHTML = "";
        emptyState.style.display = "flex";
        paginationRange.textContent = "Showing 0-0 of 0 participants";
        renderPagination(0);
        return;
    } else {
        emptyState.style.display = "none";
    }

    // Calculate Slice Range
    const startIdx = (currentPage - 1) * itemsPerPage;
    const endIdx = Math.min(startIdx + itemsPerPage, totalItems);
    const paginatedList = filteredList.slice(startIdx, endIdx);

    // Update range description
    paginationRange.textContent = `Showing ${startIdx + 1}-${endIdx} of ${totalItems} participants`;

    // Render Rows HTML
    tableBody.innerHTML = paginatedList.map(attendee => {
        const initials = getInitials(attendee.name);
        const statusBadgeClass = attendee.status.toLowerCase().replace(" ", "");
        const statusOptions = ["ATTENDED", "PENDING", "NO SHOW", "CANCELLED"];

        const statusSelectHTML = `
            <div class="status-action-row">
                <select id="status-select-${attendee.id}" class="status-select">
                    ${statusOptions.map(option => `
                        <option value="${option}" ${attendee.status === option ? "selected" : ""}>
                            ${option}
                        </option>
                    `).join("")}
                </select>
                <button class="btn-save" onclick="saveAttendeeStatus(${attendee.id})">Save</button>
            </div>
        `;

        return `
            <tr id="attendee-row-${attendee.id}">
                <td>
                    <div class="participant-cell">
                        <div class="avatar">${initials}</div>
                        <div class="participant-info">
                            <span class="participant-name">${attendee.name}</span>
                            <span class="participant-email">${attendee.email}</span>
                        </div>
                    </div>
                </td>
                <td style="color: var(--text-muted); font-size: 0.85rem;">
                    ${attendee.date}
                </td>
                <td>
                    <span class="status-badge ${statusBadgeClass}">
                        ${attendee.status}
                    </span>
                </td>
                <td>
                    ${statusSelectHTML}
                </td>
            </tr>
        `;
    }).join("");

    renderPagination(totalItems);
}

// Render the Pagination Buttons
function renderPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalPages <= 1) {
        paginationControls.innerHTML = "";
        return;
    }

    let buttonsHTML = "";
    
    // Back button
    buttonsHTML += `
        <button class="pagination-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="goToPage(${currentPage - 1})">
            <i class="fas fa-chevron-left"></i>
        </button>
    `;

    // Numeric buttons
    for (let i = 1; i <= totalPages; i++) {
        buttonsHTML += `
            <button class="pagination-btn ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">
                ${i}
            </button>
        `;
    }

    // Next button
    buttonsHTML += `
        <button class="pagination-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="goToPage(${currentPage + 1})">
            <i class="fas fa-chevron-right"></i>
        </button>
    `;

    paginationControls.innerHTML = buttonsHTML;
}

// Global functions exposed to inline onclick attributes
window.goToPage = function(pageNum) {
    currentPage = pageNum;
    renderTable();
};

window.changeAttendeeStatus = function(id, newStatus) {
    const attendee = attendees.find(a => a.id === id);
    if (attendee) {
        const oldStatus = attendee.status;
        attendee.status = newStatus;
        
        // Update stats and redraw
        updateStats();
        renderTable();

        // Add visual transition highlights
        const row = document.getElementById(`attendee-row-${id}`);
        if (row) {
            row.classList.add("row-changed");
            setTimeout(() => row.classList.remove("row-changed"), 800);
        }

        // Show elegant feedback toast
        let emoji = "✅";
        if (newStatus === "ATTENDED") emoji = "🟢 Present";
        if (newStatus === "NO SHOW") emoji = "🔴 Absent (No Show)";
        if (newStatus === "CANCELLED") emoji = "⚫ Cancelled";
        if (newStatus === "PENDING") emoji = "🔵 Reverted to Pending";

        showToast(`${attendee.name} marked as ${emoji}!`, "fa-info-circle");
    }
};

window.saveAttendeeStatus = function(id) {
    const select = document.getElementById(`status-select-${id}`);
    if (!select) return;

    const newStatus = select.value;
    const attendee = attendees.find(a => a.id === id);
    if (!attendee) return;

    if (attendee.status === newStatus) {
        showToast(`${attendee.name}'s status is already ${newStatus}.`, "fa-info-circle");
        return;
    }

    changeAttendeeStatus(id, newStatus);
};

window.editAttendeeDetails = function(id) {
    const attendee = attendees.find(a => a.id === id);
    if (attendee) {
        showToast(`Editing details for ${attendee.name} (Simulation)`, "fa-edit");
    }
};

// Event Listeners for Filters and Search
searchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value;
    currentPage = 1; // reset page
    renderTable();
});

filterTabs.forEach(tab => {
    tab.addEventListener("click", () => {
        filterTabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        
        activeFilter = tab.getAttribute("data-filter");
        currentPage = 1; // reset page
        renderTable();
    });
});

// Modal toggle open/close
btnAdd.addEventListener("click", () => {
    attendeeModal.classList.add("open");
});

function closeModal() {
    attendeeModal.classList.remove("open");
    addAttendeeForm.reset();
}

btnCloseModal.addEventListener("click", closeModal);
btnCancelModal.addEventListener("click", closeModal);
attendeeModal.addEventListener("click", (e) => {
    if (e.target === attendeeModal) closeModal();
});

// Add New Attendee via Form
addAttendeeForm.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const nameInput = document.getElementById("new-attendee-name");
    const emailInput = document.getElementById("new-attendee-email");
    const statusSelect = document.getElementById("new-attendee-status");

    const newAttendee = {
        id: Date.now(), // Unique ID
        name: nameInput.value,
        email: emailInput.value,
        date: formatDate(new Date()),
        status: statusSelect.value
    };

    // Push into database
    attendees.unshift(newAttendee); // Add to the top
    
    // Update stats, redraw page, close modal
    updateStats();
    currentPage = 1;
    renderTable();
    closeModal();

    showToast(`${newAttendee.name} added to the register!`, "fa-user-plus");
});

// Helper to format date cleanly
function formatDate(date) {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[date.getMonth()];
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // hour '0' should be '12'
    const strHours = String(hours).padStart(2, '0');

    return `${month} ${day}, ${year} • ${strHours}:${minutes} ${ampm}`;
}

// Initial Loading Setup
updateStats();
renderTable();
