# Litterly

## Overview

Litterly is a full-stack web application designed to address the problem of littering and insufficient waste management in Suriname through a **gamified reward-based system**.

Users participate in cleanup missions, earn points, and redeem rewards in a shop system.  
The application is built with a **Node.js + Express backend** and a **vanilla HTML, CSS, and JavaScript frontend**, focusing on simplicity, structure, and learning-oriented development.

The repository is structured as a **monorepo**, containing both frontend and backend in one project.

---

## Requirements

Before running this project, make sure you have the following installed:

- **Node.js** (LTS recommended)
- **npm** (comes with Node.js)
- **Git**
- **MySQL Server** (local or remote instance)

Optional but recommended:

- VS Code or any code editor

---

## Project Structure

This repository is split into two main parts:

### 📁 Litterly Backend

Handles all server-side logic, API endpoints, authentication, database interaction, and business rules.

👉 Located in: `litterly-backend/`  
👉 See `litterly-backend/README.md` for full documentation.

---

### 📁 Litterly Frontend

Handles the user interface, pages, styling, and client-side logic.

👉 Located in: `litterly-frontend/`  
👉 See `litterly-frontend/README.md` for full documentation.

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Blizzorde/litterly.git
cd litterly
```

---

### 2. Install dependencies

```bash
npm install
```

---

### 3. Environment setup

Create your environment file from the example:

```bash
cp .env.example .env
```

Then configure the values inside `.env`:

- Database credentials (MySQL host, user, password, database)
- Session secret
- Server port
- Any other required configuration values

---

### 4. Run the application (development mode)

```bash
npm run dev
```

This will:

- Start the Express backend server
- Serve the frontend statically
- Enable API routes under `/api/*`

---

## Important Notes

- The frontend is served directly from the backend server (no separate hosting required)
- All API communication is handled via `/api` routes
- Authentication is handled using session-based authentication
- MySQL must be running before starting the application
- Ensure `.env` is correctly configured before running the project

---

## Documentation

- 📘 Backend documentation → `litterly-backend/README.md`
- 🎨 Frontend documentation → `litterly-frontend/README.md`

---

## Purpose

This project demonstrates:

- Full-stack web application development
- RESTful API design
- Session-based authentication
- Modular backend architecture
- Clean separation of frontend and backend responsibilities
- Real-world problem-solving using gamifi
