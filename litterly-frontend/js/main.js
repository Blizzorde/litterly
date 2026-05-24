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
}

authGuard();
