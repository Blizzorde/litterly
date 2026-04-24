import express from "express";
import pool from "../config/db.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// PUBLIC - get missions
router.get("/", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM missions");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: "Error fetching missions" });
    }
});

// PRIVATE - join mission
router.post("/join", authMiddleware, async (req, res) => {
    const { missionId } = req.body;
    const userId = req.session.user.id;

    try {
        await pool.query(
            "INSERT INTO mission_participants (user_id, mission_id) VALUES (?, ?)",
            [userId, missionId]
        );

        res.json({ message: "Joined mission" });
    } catch (err) {
        res.status(500).json({ message: "Error joining mission" });
    }
});

export default router;