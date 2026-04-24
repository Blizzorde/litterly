# Litterly Frontend

## Overview

This is the frontend of the Litterly web application.  
It provides the user interface for interacting with the platform, including authentication, missions, and the reward system.

The frontend is built using **vanilla HTML, CSS, and JavaScript**, without frameworks, focusing on simplicity and clear structure.

---

## Getting Started

```bash
git clone https://github.com/Blizzorde/litterly-frontend.git
cd litterly-frontend
```

---

## Planned Features

- User login & registration
- View available missions
- Join missions
- Dashboard with user data (points, history)
- Shop interface (redeem rewards)

---

## Tech Stack

- HTML
- CSS
- JavaScript (Vanilla ES Modules)

---

## Folder Structure

```
/litterly-frontend
│
├── /assets
│
├── /css
│   ├── main.css
│   └── (optional additional page-specific CSS files)
│
├── /js
│   │
│   ├── /api
│   │   └── loginApi.js (Example)
│   │
│   ├── /pages
│   │   └── login.js
│   │
│   ├── /utils
│   │
│   ├── config.js
│   └── main.js
│
├── /pages
│   ├── login.html
│   └── register.html
│
└── index.html
```

---

## Structure Explanation

📁 /assets

_Contains all static files used in the UI:_

- Images (logos, mission pictures)
- Icons (SVGs)
- Fonts (if used)

> No logic here, only resources.

---

📁 /css

> main.css

- Global styling
- Reset + design system (:root)
- Layout helpers (container, flex, etc.)
  Optional extra CSS files
- Only if needed per page
- Example: missions.css

---

📁 /js

> All JavaScript lives here (fully separated by responsibility)

---

📁 /js/api

_Handles all communication with the backend API._

Contains:

- Fetch logic
- Request handling
- Response handling

Example responsibilities:

- Sending requests
- Attaching token
- Returning JSON data

> This is your frontend “API layer”

---

📁 /js/pages

_Contains page-specific logic._

Each file:

- Controls one HTML page
- Handles UI updates
- Calls /api functions

> This is your business logic layer

---

📁 /js/utils

_Reusable helper functions._

Examples:

- Format date
- Token helpers
- Small utilities

> Avoid duplicating code

---

📄 config.js

_Stores global configuration values._

Examples:

- API base URL
- App name
- Static constants

> Central place for config

---

📄 main.js

_Global JavaScript logic._

Used for:

- Authentication checks
- Redirect logic
- Global event listeners (e.g. logout)

> Runs across multiple pages

---

📁 /pages

_Contains all HTML pages._

Each page:

- Has its own JS file in /js/pages
- Focuses only on structure (no logic)

---

📄 index.html

> Landing / entry point of the application.

Used for:

- Homepage
- Optional redirect (if logged in)
