import express from "express";
import pool from "../config/db.js";
import authMiddleware from "../middleware/authMiddleware.js";
import requireRole from "../middleware/roleMiddleware.js";

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
    const [rows] = await pool.query("SELECT * FROM missions WHERE id = ?", [
      missionId,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Mission not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Error fetching mission detail" });
  }
});

// PRIVATE - join mission
router.post("/join", async (req, res) => {
  const { missionId } = req.body;
  const userId = req.user.id;

  try {
    await pool.query(
      "INSERT INTO mission_participants (user_id, mission_id) VALUES (?, ?)",
      [userId, missionId],
    );

    res.json({ message: "Joined mission" });
  } catch (err) {
    res.status(500).json({ message: "Error joining mission" });
  }
});

router.post("/:id/distribute-points", requireRole(1), async (req, res) => {
  const missionId = req.params.id;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Get mission
    const [missions] = await connection.query(
      "SELECT * FROM missions WHERE id = ?",
      [missionId],
    );

    const mission = missions[0];

    if (!mission) {
      return res.status(404).json({ error: "Mission not found" });
    }

    if (mission.status !== "awaiting_rewards") {
      return res.status(400).json({ error: "Mission not ready" });
    }

    // 2. Get attended registrations
    const [attended_registrants] = await connection.query(
      `SELECT mr.*, ma.reward_points FROM mission_registrations AS mr
        INNER JOIN mission_area_assignments AS maa ON mr.id = maa.registration_id
        INNER JOIN mission_areas AS ma ON maa.area_id = ma.id
        WHERE mr.mission_id = ? AND mr.status = 'attended'`,
      [missionId],
    );

    // 3. Distribute points
    for (const registrant of attended_registrants) {
      await connection.query(
        `INSERT INTO point_transactions
                (user_id, mission_id, points, reason)
                VALUES (?, ?, ?, ?)`,
        [
          registrant.user_id,
          missionId,
          registrant.reward_points,
          "Mission completion",
        ],
      );

      await connection.query(
        `UPDATE users 
                 SET points = points + ?
                 WHERE id = ?`,
        [registrant.reward_points, registrant.user_id],
      );
    }

    // 4. Mark mission completed
    await connection.query(
      `UPDATE missions 
             SET status = 'completed'
             WHERE id = ?`,
      [missionId],
    );

    await connection.commit();

    res.json({
      success: true,
      message: "Points distributed successfully",
    });
  } catch (err) {
    await connection.rollback();

    res.status(500).json({
      error: err.message,
    });
  } finally {
    connection.release();
  }
});

export default router;
