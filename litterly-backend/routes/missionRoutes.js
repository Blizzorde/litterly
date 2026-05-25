import express from "express";
import pool from "../config/db.js";
import authMiddleware from "../middleware/authMiddleware.js";
import requireRole from "../middleware/roleMiddleware.js";

const router = express.Router();

const ALLOWED_PUBLIC_STATUSES = ["open", "ongoing", "completed"];

router.get("/", async (req, res) => {
  try {
    const { type } = req.query;

    if (type && !ALLOWED_PUBLIC_STATUSES.includes(type)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid filter type" });
    }

    const query = type
      ? "SELECT * FROM missions WHERE status = ?"
      : `SELECT * FROM missions WHERE status IN ('open', 'ongoing', 'completed')`;

    const params = type ? [type] : [];

    const [rows] = await pool.query(query, params);
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

// PUBLIC - get mission detail
router.get("/:id", async (req, res) => {
  const missionId = req.params.id;

  try {
    const [rows] = await pool.query(
      `SELECT m.*, 
        u.username AS created_by_username,
        (SELECT COUNT(*) FROM mission_registrations mr WHERE mr.mission_id = m.id AND mr.status != 'cancelled') AS participant_count
       FROM missions m
       JOIN users u ON m.created_by = u.id
       WHERE m.id = ?`,
      [missionId],
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Mission not found" });
    }

    // get areas for this mission
    const [areas] = await pool.query(
      "SELECT * FROM mission_areas WHERE mission_id = ?",
      [missionId],
    );

    res.status(200).json({
      success: true,
      data: { ...rows[0], areas },
    });
  } catch (err) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error fetching mission",
        error: err.message,
      });
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
    res
      .status(500)
      .json({ message: "Error joining mission", err: err.message });
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

//creating mission
router.post("/create", async (req, res) => {
  //TODO: validate input for correct formats/ other stuff
  const {
    title,
    description,
    location,
    start_datetime,
    end_datetime,
    status,
    max_participants,
    photo_url,
  } = req.body;
  // const userId = req.session.user.id;
  //TODO: ^^^ uncomment this guy, was testing creation
  try {
    await pool.query(
      "INSERT INTO missions (title, description, location, start_datetime, end_datetime, status, max_participants, created_by, photo_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        title,
        description,
        location,
        start_datetime,
        end_datetime,
        status,
        max_participants,
        1,
        photo_url,
      ],
      //TODO: readd userId along with uncomment guy
    );

    res.json({
      message: "mission created",
    });
  } catch (err) {
    res.status(500).json({
      message: "Error creating mission",
      err: err.message,
    });
  }
});

//Updating mission
router.put("/:id", async (req, res) => {
  const missionId = req.params.id;

  const {
    title,
    description,
    location,
    start_datetime,
    end_datetime,
    status,
    max_participants,
    photo_url,
  } = req.body;

  try {
    await pool.query(
      `UPDATE missions
         SET title=?,
             description=?,
             location=?,
             start_datetime=?,
             end_datetime=?,
             status=?,
             max_participants=?,
             photo_url=?
         WHERE id=?`,
      [
        title,
        description,
        location,
        start_datetime,
        end_datetime,
        status,
        max_participants,
        photo_url,
        missionId,
      ],
    );

    res.json({
      message: "Mission updated",
    });
  } catch (err) {
    res.status(500).json({
      message: "Error updating mission",
    });
  }
});

//Deleting mission, need to change to flag system
router.delete("/:id", async (req, res) => {
  const missionId = req.params.id;

  try {
    await pool.query("DELETE FROM missions WHERE id=?", [missionId]);

    res.json({
      message: "Mission deleted",
    });
  } catch (err) {
    res.status(500).json({
      message: "Error deleting mission",
      err: err.message,
    });
  }
});

export default router;
