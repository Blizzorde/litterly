# Litterly Backend

## Overview

This is the backend of the **Litterly web application**.  
It provides a REST API built with **Node.js + Express**, handling authentication, users, missions, database communication, and application logic.

The backend is structured in a modular way to keep the code clean, maintainable, and scalable for team development.

---

## Core Responsibilities

- User authentication (login, register, sessions)
- User management and profile handling
- Mission creation, approval, participation, and tracking
- Points and reward logic handling
- Role-based access control (user, worker, manager, admin)
- Database communication with MySQL
- Providing API endpoints for the frontend

---

## Tech Stack

- Node.js
- Express.js
- express-session
- MySQL
- mysql2 (or Sequelize depending on implementation)
- dotenv (for environment configuration)

---

## Folder Structure

```
/litterly-backend
│
├── /config
│ └── db.js
│
├── /middleware
│
├── /routes
│ ├── authRoutes.js
│ ├── userRoutes.js
│ └── missionRoutes.js
│
├── /utils
```

---

## Structure Explanation

### /config

Contains configuration-related files used across the backend.

Used for:

- Database setup and connection configuration
- Centralized configuration logic

---

### /config/db.js

Handles the MySQL database connection pool.

Responsible for:

- Connecting to the database using environment variables
- Creating a reusable connection pool
- Exporting database access methods for use in routes

---

### /middleware

Contains middleware functions that run before requests reach the routes.

Used for:

- Authentication checks (session validation)
- Role-based access control
- Request validation
- Protecting private routes

---

### /routes

Contains all API endpoints grouped by feature/domain.

- authRoutes → login, register, logout
- userRoutes → profile, user data management
- missionRoutes → mission CRUD, joining, approval flow

Each route file handles its own related logic.

---

### /utils

Contains helper and reusable functions used across the backend.

Examples:

- Response formatting helpers
- Validation helpers
- Utility functions for repeated logic

---

## API Structure

The backend exposes structured API endpoints such as:

- /api/auth
- /api/users
- /api/missions

Each module is responsible for a specific part of the system.

---

## Authentication Flow

- User logs in through authentication routes
- Session is created using express-session
- Session ID is stored in HTTP-only cookies
- Middleware checks session for protected routes
- Unauthorized users are blocked from accessing private data

---

## Database Layer

- MySQL is used as the main database
- Connection is handled through `/config/db.js`
- Queries are executed inside routes or helper functions

---

## Security Notes

- Passwords must be hashed before storing (bcrypt recommended)
- Sessions are stored in secure HTTP-only cookies
- Middleware protects private routes
- Input validation should be applied before database queries

---

## Notes

- Backend is designed to work with a static frontend (vanilla HTML/CSS/JS)
- Follows REST API principles
- Modular structure supports teamwork and scalability
- Each folder has a clear responsibility boundary

---

## Future Improvements

- Introduce service layer between routes and database
- Add structured validation system (Joi/Zod)
- Improve centralized error handling
- Add rate limiting for API protection
