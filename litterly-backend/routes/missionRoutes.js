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

// PRIVATE - join mission http://localhost:3000/api/missions/join
router.post("/join", authMiddleware, async (req, res) => {
    const { missionId } = req.body;
    const userId = req.session.user.id;
    const status = req.body.status || "registered";

    if (!missionId) {
        return res.status(400).json({ success: false, message: "missionId is required" });
    }

    try {
        // 1. Check if mission exists
        const [missions] = await pool.query("SELECT * FROM missions WHERE id = ?", [missionId]);
        if (missions.length === 0) {
            return res.status(404).json({ success: false, message: "Mission not found" });
        }
        
        const mission = missions[0];

        // 2. Validate mission status (must be open to join)
        if (mission.status !== "open") {
            return res.status(400).json({ 
                success: false, 
                message: `Cannot join mission in status: ${mission.status}` 
            });
        }

        // 3. Validate capacity limit
        if (mission.max_participants !== null) {
            const [countRows] = await pool.query(
                "SELECT COUNT(*) as count FROM mission_registrations WHERE mission_id = ? AND status != 'cancelled'",
                [missionId]
            );
            if (countRows[0].count >= mission.max_participants) {
                return res.status(400).json({ success: false, message: "Mission is full" });
            }
        }

        // 4. Check existing registrations (handling unique constraint)
        const [existing] = await pool.query(
            "SELECT * FROM mission_registrations WHERE mission_id = ? AND user_id = ?",
            [missionId, userId]
        );

        if (existing.length > 0) {
            const registration = existing[0];
            if (registration.status !== "cancelled") {
                return res.status(400).json({ 
                    success: false, 
                    message: `Already registered for this mission (current status: ${registration.status})` 
                });
            }

            // Reactivate cancelled registration
            await pool.query(
                "UPDATE mission_registrations SET status = ? WHERE id = ?",
                [status, registration.id]
            );
            return res.json({ success: true, message: "Rejoined mission successfully" });
        }

        // 5. Insert new registration
        await pool.query(
            "INSERT INTO mission_registrations (user_id, mission_id, status) VALUES (?, ?, ?)",
            [userId, missionId, status]
        );

        res.json({ success: true, message: "Joined mission successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error joining mission", error: err.message });
    }
});

export default router;

