# Litterly Frontend

## Overview

This is the frontend of the **Litterly web application**.  
It provides the user interface for interacting with the platform, including authentication, missions, attendance, the shop, and the admin mission manager.

The frontend is built using **vanilla HTML, CSS, and JavaScript** — no frameworks — served statically by the Express backend.

---

## Tech Stack

| Technology           | Purpose                                 |
| -------------------- | --------------------------------------- |
| HTML5                | Page structure and markup               |
| CSS3                 | Styling, layout, animations             |
| JavaScript (Vanilla) | Page logic, API calls, DOM manipulation |
| Axios (CDN)          | HTTP requests to the backend API        |
| Toastify JS (CDN)    | Toast notification system               |
| Font Awesome (CDN)   | Icons throughout the UI                 |
| Google Fonts — Inter | Primary font                            |

---

## Pages

| Page                 | File                              | Access |
| -------------------- | --------------------------------- | ------ |
| Login                | `pages/login.html`                | Public |
| Register             | `pages/register.html`             | Public |
| Mission List         | `pages/mission-list.html`         | Auth   |
| Mission Detail       | `pages/mission-detail.html`       | Auth   |
| Shop                 | `pages/shop.html`                 | Auth   |
| Mission Manager List | `pages/mission-manager-list.html` | Admin  |
| Mission Management   | `pages/mission-management.html`   | Admin  |
| Not Found            | `pages/notFound.html`             | Public |

---

## Folder Structure

```
/litterly-frontend
│
├── /assets
│   └── (images, logos, placeholders)
│
├── /css
│   ├── main.css
│   ├── mission-list.css
│   ├── mission-detail.css
│   ├── mission-management.css
│   ├── mission-manager-list.css
│   └── shop.css
│
├── /js
│   │
│   ├── /api
│   │   ├── authApi.js
│   │   ├── missionsApi.js
│   │   └── shopApi.js
│   │
│   ├── /pages
│   │   ├── login.js
│   │   ├── missions.js
│   │   ├── mission-detail.js
│   │   ├── mission-management.js
│   │   ├── mission-manager-list.js
│   │   └── shop.js
│   │
│   ├── /utils
│   │   ├── notify.js
│   │   ├── modal.js
│   │   └── demoData.js
│   │
│   ├── config.js
│   └── main.js
│
├── /pages
│   └── (all HTML pages)
│
└── index.html
```

---

## Structure Explanation

### /assets

Static resources — logos, images, placeholder images. No logic, only files.

---

### /css

**`main.css`** — Global styles, CSS reset, design tokens (`:root` variables), shared components (sidebar, modals, drawer, status tags, toastify overrides).

Page-specific CSS files handle only the styles unique to that page.

---

### /js/api

All communication with the backend API lives here. Each file handles one domain:

**`authApi.js`** — `loginUser`, `getMe`, `logoutUser`

**`missionsApi.js`** — `getMissions`, `getMissionById`, `registerForMission`, `cancelMissionRegistration`, `getAllMissionsAdmin`, `getMissionRegistrations`, `updateRegistrationStatus`, `createMission`, `editMission`, `deleteMission`, `updateMissionStatus`, `distributePoints`

**`shopApi.js`** — `getShopItems`, `purchaseItem`

All functions use Axios with `withCredentials: true` to send the JWT cookie automatically.

---

### /js/pages

Page-specific logic. Each file controls one HTML page — handles UI updates, calls API functions, and manages local state.

---

### /js/utils

**`notify.js`** — `showNotif(icon, title, subtext, options)` — wrapper around Toastify for consistent toast notifications.

**`modal.js`** — `Modal` object handling open/close/submit for all modals and the create/edit mission drawers.

**`demoData.js`** — `DEMO_MISSIONS` array and `getRandomDemoMission()` — demo autofill data for the create mission form, based on real Suriname locations.

---

### config.js

```js
const CONFIG = {
  API_BASE: "", // empty = same origin
  APP_NAME: "Litterly",
};
```

Single place to update the API base URL if hosting changes.

---

### main.js

Runs on every page. Responsibilities:

- Calls `getMe()` to verify the JWT cookie
- Redirects unauthenticated users to login
- Redirects logged-in users away from public pages
- Stores the current user in `window.currentUser`
- Populates the sidebar username and points
- Applies role-based visibility (`data-role` attribute system)
- Handles logout button

---

## Authentication Flow (Frontend)

```
Page loads
  → main.js runs authGuard()
    → GET /api/auth/me (cookie sent automatically)
      → 200: store user, populate navbar, continue
      → 401: redirect to /pages/login.html
```

---

## Role-Based UI

Elements with `data-role="1"` are hidden for non-admin users automatically by `applyRoleVisibility()` in `main.js`. No extra JS needed per element — just add the attribute.

---

## Script Load Order

Every page must load scripts in this order:

```html
<!-- CDN libs -->
<script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.css"
/>
<script src="https://cdn.jsdelivr.net/npm/toastify-js"></script>

<!-- Globals -->
<script src="../js/config.js"></script>
<script src="../js/utils/notify.js"></script>
<script src="../js/api/authApi.js"></script>
<script src="../js/main.js"></script>

<!-- Page specific -->
<script src="../js/api/missionsApi.js"></script>
<script src="../js/pages/missions.js"></script>
```

---

## Design System

CSS custom properties defined in `main.css` `:root`:

| Variable               | Purpose                      |
| ---------------------- | ---------------------------- |
| `--primary-color`      | Main brand green             |
| `--accent-color`       | Accent / highlight color     |
| `--accent-light-color` | Light accent for backgrounds |
| `--card-bg`            | Card background              |
| `--card-text`          | Card text color              |
| `--neutral-color`      | Muted/secondary text         |
| `--color-border`       | Border color                 |
| `--sidebar-active`     | Sidebar active state color   |

---

## Future Improvements

- Photo upload for missions and shop items
- User profile page with equipped items display
- Equipped title/badge/frame system
- Leaderboard page
- Mobile responsive layout
