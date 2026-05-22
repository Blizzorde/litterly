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

// PUBLIC - get mission detail
router.get("/:id", async (req, res) => {
    const missionId = req.params.id;

    try {
        const [rows] = await pool.query("SELECT * FROM missions WHERE id = ?", [missionId]);

        if (rows.length === 0) {
            return res.status(404).json({ message: "Mission not found" });
        }

        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ message: "Error fetching mission detail" });
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

// PUBLIC - get participants for a mission (Attendance List)
router.get("/:id/participants", async (req, res) => {
    const missionId = req.params.id;

    try {
        const [rows] = await pool.query(
            "SELECT u.email FROM users u JOIN mission_participants mp ON u.id = mp.user_id WHERE mp.mission_id = ?",
            [missionId]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: "Error fetching participants" });
    }
});

export default router;