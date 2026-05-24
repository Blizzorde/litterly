import express from "express";
import pool from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
  const { email, username, password } = req.body;
  //TODO: add guardclause for when user already exists
  try {
    const hashed = await bcrypt.hash(password, 10);
    await pool.query(
      "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
      [username, email, hashed],
    );
    res.json({ success: true, message: "User created" });
  } catch (err) {
    res.status(500).json({ message: "Error creating user", err: err.message });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, username, password } = req.body;

  if ((!email && !username) || !password) {
    return res.status(400).json({
      success: false,
      message: "Provide email or username, and password",
    });
  }

  try {
    const field = email ? "email" : "username";
    const value = email ?? username;

    const [rows] = await pool.query(`SELECT * FROM users WHERE ${field} = ?`, [
      value,
    ]);

    if (rows.length === 0) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    // Sign token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role_id,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN },
    );
    console.log({
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role_id,
    });

    // Send as httpOnly cookie
    res.cookie("ltr_token", token, {
      httpOnly: true,
      secure: false, // set true in production with HTTPS
      sameSite: "lax",
      maxAge: 1000 * 60 * 60,
    });

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
    res
      .status(500)
      .json({ success: false, message: "Login error", error: err.message });
  }
});

// LOGOUT
router.post("/logout", (req, res) => {
  res.clearCookie("ltr_token");
  res.json({ success: true, message: "Logged out" });
});

export default router;
