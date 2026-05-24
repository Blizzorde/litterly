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
  if (!user) return;
  document.querySelectorAll("[data-role]").forEach((el) => {
    const roles = el.dataset.role.split(",");
    console.log(roles);
    console.log(user);
    el.style.display = roles.includes(user.role_id.toString())
      ? "block"
      : "none";
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
