import express from "express";
import pool from "../config/db.js";
import bcrypt from "bcrypt";

const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
    const { email, password } = req.body;

    try {
        const hashed = await bcrypt.hash(password, 10);

        await pool.query(
            "INSERT INTO users (email, password) VALUES (?, ?)",
            [email, hashed]
        );

        res.json({ message: "User created" });
    } catch (err) {
        res.status(500).json({ message: "Error creating user", err: err });
    }
});

// LOGIN
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const [rows] = await pool.query(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );

        if (rows.length === 0) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const user = rows[0];

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        req.session.user = {
            id: user.id,
            email: user.email,
            role: user.role
        };

        res.json({ message: "Logged in" });

    } catch (err) {
        res.status(500).json({ message: "Login error", real: err });
    }
});

// LOGOUT
router.post("/logout", (req, res) => {
    req.session.destroy(() => {
        res.json({ message: "Logged out" });
    });
});

export default router;