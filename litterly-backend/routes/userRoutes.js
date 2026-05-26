import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import pool from "../config/db.js";

const router = express.Router();

// GET PROFILE
router.get("/profile", (req, res) => {
  res.json(req.user.id);
});

router.get("/me", authMiddleware, async (req, res) => {
  const [rows] = await pool.query("SELECT points FROM users WHERE id = ?", [
    req.user.id,
  ]);
  res.status(200).json({
    success: true,
    user: {
      username: req.user.username,
      id: req.user.id,
      role_id: req.user.role,
      points: rows[0]?.points,
    },
  });
});

export default router;
