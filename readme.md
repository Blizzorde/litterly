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

## Technologies

| Technology           | Purpose                                 |
| -------------------- | --------------------------------------- |
| Node.js              | Server runtime                          |
| Express.js           | Web framework and API routing           |
| MySQL                | Primary relational database             |
| mysql2               | MySQL driver with connection pooling    |
| jsonwebtoken         | JWT authentication                      |
| bcrypt               | Password hashing                        |
| cookie-parser        | Reading HTTP-only cookies               |
| nodemon              | Development auto-restart                |
| HTML5                | Frontend page structure                 |
| CSS3                 | Styling and layout                      |
| JavaScript (Vanilla) | Client-side logic and API communication |
| Axios                | HTTP requests from the frontend         |
| Toastify JS          | Toast notification system               |
| Font Awesome         | UI icons                                |

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

### 3. Database setup

The database schema and seed data are located in:

```
litterly-backend/sql/
```

Import the SQL file into your MySQL instance:

```bash
mysql -u your_user -p your_database < litterly-backend/sql/litterly.sql
```

Or import it via phpMyAdmin or any MySQL GUI tool.

---

### 4. Environment setup

Create your environment file from the example:

```bash
cp .env.sample .env
```

Then configure the values inside `.env`:

```env
PORT=3000
SESSION_SECRET=your_secret_here
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=1h
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=litterly
```

---

### 5. Run the application (development mode)

```bash
npm run dev
```

This will:

- Start the Express backend server via nodemon
- Serve the frontend statically from `litterly-frontend/`
- Watch for backend changes and restart automatically
- Enable API routes under `/api/*`

The app will be available at `http://localhost:3000`

---

## Important Notes

- The frontend is served directly from the backend server — no separate hosting required
- All API communication is handled via `/api` routes
- Authentication is handled using **JWT** stored in HTTP-only cookies
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
- JWT-based authentication with HTTP-only cookies
- Modular backend architecture
- Clean separation of frontend and backend responsibilities
- Real-world problem-solving using gamification
