const PUBLIC_PAGES = ["/pages/login.html", "/pages/register.html", "/"];

async function authGuard() {
  const currentPath = window.location.pathname;
  const isPublicPage = PUBLIC_PAGES.some(
    (page) => currentPath.endsWith(page) || currentPath === page,
  );

  const user = await getMe();

  if (!user && !isPublicPage) {
    // No token / invalid token — kick to login
    window.location.href = "/pages/login.html";
    return;
  }

  if (user && isPublicPage && currentPath !== "/") {
    // Already logged in, don't let them see login/register
    window.location.href = "/";
    return;
  }

  // Store user in memory for this page to use
  window.currentUser = user;
  populateNavbar(user);
  applyRoleVisibility(user);
}

function populateNavbar(user) {
  if (!user) return;

  const nameEl = document.querySelector("#username");
  const pointsEl = document.querySelector("#points");

  if (nameEl) nameEl.textContent = user.username;
  if (pointsEl) pointsEl.textContent = user.points;
}

function hasRole(...roles) {
  return window.currentUser && roles.includes(window.currentUser.role);
}

function applyRoleVisibility(user) {
  // no user
  if (!user || !user.role_id) {
    console.warn("No valid user found for role visibility");
    return;
  }

  document.querySelectorAll("[data-role]").forEach((el) => {
    const roles = el.dataset.role.split(",");

    // SHOW
    if (roles.includes(String(user.role_id))) {

      // remove inline display override
      el.style.display = "flex";

    } else {

      // HIDE
      el.style.display = "none";
    }
  });
}

document
  .querySelector(".logout-section a")
  .addEventListener("click", async (e) => {
    e.preventDefault();
    await logoutUser();
    window.location.href = "/pages/login.html";
  });

authGuard();
