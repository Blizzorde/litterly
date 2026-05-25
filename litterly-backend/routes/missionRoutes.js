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
router.get("/:id", authMiddleware, async (req, res) => {
  const missionId = req.params.id;

  try {
    const [rows] = await pool.query(
      `SELECT m.*, 
        u.username AS created_by_username,
        (SELECT COUNT(*) FROM mission_registrations mr WHERE mr.mission_id = m.id AND mr.status NOT IN ('cancelled')) AS participant_count
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

    const [areas] = await pool.query(
      `SELECT ma.*,
        (
          SELECT COUNT(*) 
          FROM mission_area_assignments maa
          JOIN mission_registrations mr ON maa.registration_id = mr.id
          WHERE maa.area_id = ma.id 
            AND mr.status NOT IN ('cancelled')
        ) AS current_count
       FROM mission_areas ma
       WHERE ma.mission_id = ?`,
      [missionId],
    );

    const [registration] = await pool.query(
      "SELECT id, status FROM mission_registrations WHERE mission_id = ? AND user_id = ?",
      [missionId, req.user.id],
    );

    res.status(200).json({
      success: true,
      data: { ...rows[0], areas, user_registration: registration[0] ?? null },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching mission",
      error: err.message,
    });
  }
});

// PRIVATE - join mission
router.post("/:id/register", authMiddleware, async (req, res) => {
  const missionId = req.params.id;
  const userId = req.user.id;
  const { area_id } = req.body;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [missions] = await connection.query(
      "SELECT * FROM missions WHERE id = ?",
      [missionId],
    );

    if (!missions.length) {
      await connection.rollback();
      return res
        .status(404)
        .json({ success: false, message: "Mission not found" });
    }

    if (missions[0].status !== "open") {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "Mission is not open for registration",
      });
    }

    const [existing] = await connection.query(
      "SELECT * FROM mission_registrations WHERE mission_id = ? AND user_id = ?",
      [missionId, userId],
    );

    if (existing.length && existing[0].status !== "cancelled") {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "You are already registered for this mission",
      });
    }

    const isRejoin = existing.length && existing[0].status === "cancelled";

    const [areas] = await connection.query(
      "SELECT * FROM mission_areas WHERE id = ? AND mission_id = ?",
      [area_id, missionId],
    );

    if (!areas.length) {
      await connection.rollback();
      return res
        .status(400)
        .json({ success: false, message: "Invalid area for this mission" });
    }

    const area = areas[0];

    if (area.max_users !== null) {
      const [taken] = await connection.query(
        `SELECT COUNT(*) AS count 
     FROM mission_area_assignments maa
     JOIN mission_registrations mr ON maa.registration_id = mr.id
     WHERE maa.area_id = ? 
       AND mr.status NOT IN ('cancelled')`,
        [area_id],
      );

      if (taken[0].count >= area.max_users) {
        const [updatedAreas] = await connection.query(
          `SELECT ma.*,
        (
          SELECT COUNT(*) 
          FROM mission_area_assignments maa
          JOIN mission_registrations mr ON maa.registration_id = mr.id
          WHERE maa.area_id = ma.id 
            AND mr.status NOT IN ('cancelled')
        ) AS current_count
       FROM mission_areas ma
       WHERE ma.mission_id = ?`,
          [missionId],
        );

        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: "This area is full",
          areas: updatedAreas,
        });
      }
    }

    let registrationId;

    if (isRejoin) {
      await connection.query(
        "UPDATE mission_registrations SET status = 'registered' WHERE id = ?",
        [existing[0].id],
      );
      registrationId = existing[0].id;

      await connection.query(
        "UPDATE mission_area_assignments SET area_id = ? WHERE registration_id = ?",
        [area_id, registrationId],
      );
    } else {
      const [reg] = await connection.query(
        "INSERT INTO mission_registrations (mission_id, user_id) VALUES (?, ?)",
        [missionId, userId],
      );
      registrationId = reg.insertId;

      await connection.query(
        "INSERT INTO mission_area_assignments (registration_id, area_id) VALUES (?, ?)",
        [registrationId, area_id],
      );
    }

    const [updatedAreas] = await connection.query(
      `SELECT ma.*,
    (
      SELECT COUNT(*) 
      FROM mission_area_assignments maa
      JOIN mission_registrations mr ON maa.registration_id = mr.id
      WHERE maa.area_id = ma.id 
        AND mr.status NOT IN ('cancelled')
    ) AS current_count
   FROM mission_areas ma
   WHERE ma.mission_id = ?`,
      [missionId],
    );

    await connection.commit();

    res.status(200).json({
      success: true,
      message: "Successfully registered for mission",
      areas: updatedAreas,
    });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({
      success: false,
      message: "Registration failed",
      error: err.message,
    });
  } finally {
    connection.release();
  }
});

router.post("/:id/cancel", authMiddleware, async (req, res) => {
  const missionId = req.params.id;
  const userId = req.user.id;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [registration] = await connection.query(
      "SELECT * FROM mission_registrations WHERE mission_id = ? AND user_id = ?",
      [missionId, userId],
    );

    if (!registration.length) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "You are not registered for this mission",
      });
    }

    if (registration[0].status === "cancelled") {
      await connection.rollback();
      return res
        .status(400)
        .json({ success: false, message: "Already cancelled" });
    }

    await connection.query(
      "UPDATE mission_registrations SET status = 'cancelled' WHERE id = ?",
      [registration[0].id],
    );

    const [updatedAreas] = await connection.query(
      `SELECT ma.*,
    (
      SELECT COUNT(*) 
      FROM mission_area_assignments maa
      JOIN mission_registrations mr ON maa.registration_id = mr.id
      WHERE maa.area_id = ma.id 
        AND mr.status NOT IN ('cancelled')
    ) AS current_count
   FROM mission_areas ma
   WHERE ma.mission_id = ?`,
      [missionId],
    );

    await connection.commit();

    res.status(200).json({
      success: true,
      message: "Registration cancelled",
      areas: updatedAreas,
    });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({
      success: false,
      message: "Cancellation failed",
      error: err.message,
    });
  } finally {
    connection.release();
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
