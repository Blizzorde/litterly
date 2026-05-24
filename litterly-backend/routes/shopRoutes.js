import express from "express";
import pool from "../config/db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { type } = req.query;

    // fetch valid types from db
    const [types] = await pool.query("SELECT item_type_name FROM item_type");
    const validTypes = types.map((t) => t.item_type_name);

    if (type && !validTypes.includes(type)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid filter type" });
    }

    const query = type
      ? `SELECT s.*, t.item_type_name FROM shop_items s
         JOIN item_type t ON s.item_type_id = t.id
         WHERE s.active = 1 AND t.item_type_name = ?`
      : `SELECT s.*, t.item_type_name FROM shop_items s
         JOIN item_type t ON s.item_type_id = t.id
         WHERE s.active = 1`;

    const [rows] = await pool.query(query, type ? [type] : []);

    res.status(200).json({ success: true, data: rows });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Error fetching shop items" });
  }
});

export default router;
