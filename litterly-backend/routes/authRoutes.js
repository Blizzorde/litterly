import express from "express";
import pool from "../config/db.js";
import bcrypt from "bcrypt";

const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
  const { email, username, password } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
      [username, email, hashed],
    );

    res.json({ message: "User created" });
  } catch (err) {
    res.status(500).json({ message: "Error creating user", err:err.message });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, username, password } = req.body;

  // Need at least one identifier and a password
  if ((!email && !username) || !password) {
    return res.status(400).json({
      success: false,
      message: "Provide email or username, and password",
    });
  }

  try {
    // Use email if provided, otherwise username
    const field = email ? "email" : "username";
    const value = email ?? username;

    const [rows] = await pool.query(`SELECT * FROM users WHERE ${field} = ?`, [
      value,
    ]);

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const user = rows[0];

    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Set session
    req.session.user = {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Login error",
      error: err.message,
    });
  }
});

// LOGOUT
router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out" });
  });
});

export default router;
