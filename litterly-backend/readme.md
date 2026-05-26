# Litterly Backend

## Overview

This is the backend of the **Litterly web application**.  
It provides a REST API built with **Node.js + Express**, handling authentication, users, missions, the shop system, and all application logic.

The backend is structured in a modular way to keep the code clean, maintainable, and scalable for team development.

---

## Tech Stack

| Technology    | Purpose                              |
| ------------- | ------------------------------------ |
| Node.js       | Runtime environment                  |
| Express.js    | Web framework and routing            |
| MySQL         | Primary relational database          |
| mysql2        | MySQL driver with connection pooling |
| jsonwebtoken  | JWT creation and verification        |
| bcrypt        | Password hashing                     |
| cookie-parser | Reading HTTP-only cookies            |
| dotenv        | Environment variable management      |
| nodemon       | Development auto-restart             |

---

## Core Responsibilities

- User authentication (register, login, logout) via JWT
- User management and profile handling
- Mission creation, management, participation, and tracking
- Attendance tracking per mission area
- Points distribution and transaction recording
- Shop system (items, purchases, inventory)
- Role-based access control (user, admin)
- Serving the static frontend

---

## Folder Structure

```
/litterly-backend
│
├── /config
│   └── db.js
│
├── /middleware
│   ├── authMiddleware.js
│   └── roleMiddleware.js
│
├── /routes
│   ├── index.js
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── missionRoutes.js
│   └── shopRoutes.js
│
├── /sql
│   └── litterly.sql
│
└── /utils
```

---

## Structure Explanation

### /config/db.js

Handles the MySQL connection pool using `mysql2`.  
Exports a reusable pool instance used across all route files.

---

### /middleware

**`authMiddleware.js`** — Verifies the JWT from the HTTP-only cookie on every protected request. Attaches the decoded user to `req.user`.

**`roleMiddleware.js`** — Role-based access control. Accepts role names and blocks requests from users without the required role. Used as `requireRole("admin")`.

---

### /routes

All API endpoints grouped by feature:

- `index.js` — Mounts all route modules under `/api`
- `authRoutes.js` — `/api/auth` — register, login, logout, me
- `userRoutes.js` — `/api/users` — user profile and data
- `missionRoutes.js` — `/api/missions` — full mission lifecycle
- `shopRoutes.js` — `/api/shop` — shop items and purchases

---

### /sql

Contains the database schema and seed data.

- `litterly.sql` — Full database dump including structure and initial data

Import with:

```bash
mysql -u your_user -p your_database < litterly-backend/sql/litterly.sql
```

---

### /utils

Reusable helper functions shared across the backend.

---

## API Reference

### Auth — `/api/auth`

| Method | Endpoint    | Auth     | Description                  |
| ------ | ----------- | -------- | ---------------------------- |
| POST   | `/register` | Public   | Register a new user          |
| POST   | `/login`    | Public   | Login and receive JWT cookie |
| POST   | `/logout`   | Public   | Clear JWT cookie             |
| GET    | `/me`       | Required | Get current logged-in user   |

### Missions — `/api/missions`

| Method | Endpoint                    | Auth     | Description                                    |
| ------ | --------------------------- | -------- | ---------------------------------------------- |
| GET    | `/`                         | Required | Get public missions (filterable by status)     |
| GET    | `/admin/all`                | Admin    | Get all missions including drafts              |
| GET    | `/:id`                      | Required | Get mission detail with areas and registration |
| POST   | `/`                         | Admin    | Create a new mission                           |
| PATCH  | `/:id`                      | Admin    | Update mission fields                          |
| DELETE | `/:id`                      | Admin    | Delete mission and all related data            |
| POST   | `/:id/register`             | Required | Register for a mission                         |
| POST   | `/:id/cancel`               | Required | Cancel own registration                        |
| GET    | `/:id/registrations`        | Admin    | Get all registrations for a mission            |
| PATCH  | `/:id/registrations/:regId` | Admin    | Update a registration status                   |
| POST   | `/:id/distribute-points`    | Admin    | Distribute points to attended participants     |

### Shop — `/api/shop`

| Method | Endpoint    | Auth     | Description                         |
| ------ | ----------- | -------- | ----------------------------------- |
| GET    | `/`         | Required | Get shop items (filterable by type) |
| POST   | `/purchase` | Required | Purchase a shop item                |

---

## Authentication Flow

- User submits credentials via `/api/auth/login`
- Server validates credentials and signs a JWT
- JWT is set as an HTTP-only cookie (`ltr_token`)
- Every protected request reads the cookie via `cookie-parser`
- `authMiddleware` verifies and decodes the token
- Decoded user is available as `req.user` in all protected routes
- Logout clears the cookie via `res.clearCookie()`

---

## Database

MySQL is the primary database. Tables include:

| Table                      | Purpose                                       |
| -------------------------- | --------------------------------------------- |
| `users`                    | User accounts and points                      |
| `roles`                    | Role definitions                              |
| `missions`                 | Mission records                               |
| `mission_areas`            | Sub-areas within a mission                    |
| `mission_registrations`    | User registrations per mission                |
| `mission_area_assignments` | Which area each registrant is assigned to     |
| `shop_items`               | Purchasable items                             |
| `item_type`                | Item categories (badge, avatar, title, frame) |
| `shop_orders`              | Purchase transaction records                  |
| `user_inventory`           | Items owned by users                          |
| `point_transactions`       | Full points ledger (earned and spent)         |

---

## Security Notes

- Passwords are hashed with bcrypt (salt rounds: 10)
- JWT is stored in an HTTP-only cookie — not accessible via JavaScript
- `authMiddleware` protects all private routes
- `requireRole` enforces admin-only endpoints
- Whitelist-based field filtering on PATCH routes prevents mass assignment
- All multi-step operations use database transactions with rollback on failure

---

## Future Improvements

- Introduce a service layer between routes and database
- Add structured request validation (Joi or Zod)
- Improve centralized error handling middleware
- Add rate limiting for API protection
- File upload support for mission and item photos
