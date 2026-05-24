import express from "express";
import pool from "../config/db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const userId = req.user.id;

  try {
    const { type } = req.query;

    const [types] = await pool.query("SELECT item_type_name FROM item_type");
    const validTypes = types.map((t) => t.item_type_name);

    if (type === "purchased") {
      // non-stackable items the user owns
      const [rows] = await pool.query(
        `SELECT s.*, t.item_type_name, ui.quantity
         FROM user_inventory ui
         JOIN shop_items s ON ui.item_id = s.id
         JOIN item_type t ON s.item_type_id = t.id
         WHERE ui.user_id = ? AND s.stackable = 0`,
        [userId],
      );
      return res
        .status(200)
        .json({
          success: true,
          data: rows.map((r) => ({ ...r, owned: true })),
        });
    }

    if (type && !validTypes.includes(type)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid filter type" });
    }

    const query = type
      ? `SELECT s.*, t.item_type_name,
           CASE WHEN ui.item_id IS NOT NULL THEN 1 ELSE 0 END AS owned
         FROM shop_items s
         JOIN item_type t ON s.item_type_id = t.id
         LEFT JOIN user_inventory ui ON ui.item_id = s.id AND ui.user_id = ?
         WHERE s.active = 1 AND t.item_type_name = ?`
      : `SELECT s.*, t.item_type_name,
           CASE WHEN ui.item_id IS NOT NULL THEN 1 ELSE 0 END AS owned
         FROM shop_items s
         JOIN item_type t ON s.item_type_id = t.id
         LEFT JOIN user_inventory ui ON ui.item_id = s.id AND ui.user_id = ?
         WHERE s.active = 1`;

    const params = type ? [userId, type] : [userId];
    const [rows] = await pool.query(query, params);

    res.status(200).json({ success: true, data: rows });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Error fetching shop items" });
  }
});

router.post("/purchase", async (req, res) => {
  const { item_id } = req.body;
  const userId = req.user.id;

  if (!item_id) {
    return res
      .status(400)
      .json({ success: false, message: "item_id is required" });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Get item
    const [items] = await connection.query(
      "SELECT * FROM shop_items WHERE id = ? AND active = 1",
      [item_id],
    );

    if (!items.length) {
      await connection.rollback();
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    }

    const item = items[0];

    // 2. Check if user has enough points
    const [users] = await connection.query(
      "SELECT points FROM users WHERE id = ?",
      [userId],
    );

    const currentPoints = users[0].points;
    const remainder = currentPoints - item.price_points;

    if (remainder < 0) {
      await connection.rollback();
      return res
        .status(400)
        .json({ success: false, message: "Not enough points" });
    }

    // 3. Check user inventory
    const [inventory] = await connection.query(
      "SELECT * FROM user_inventory WHERE user_id = ? AND item_id = ?",
      [userId, item_id],
    );

    const alreadyOwns = inventory.length > 0;

    if (alreadyOwns && !item.stackable) {
      await connection.rollback();
      return res
        .status(400)
        .json({ success: false, message: "Cannot repurchase same item" });
    }

    // 4. Update inventory
    if (alreadyOwns && item.stackable) {
      await connection.query(
        "UPDATE user_inventory SET quantity = quantity + 1 WHERE user_id = ? AND item_id = ?",
        [userId, item_id],
      );
    } else {
      await connection.query(
        "INSERT INTO user_inventory (user_id, item_id, quantity) VALUES (?, ?, 1)",
        [userId, item_id],
      );
    }

    // 5. Record shop order
    await connection.query(
      "INSERT INTO shop_orders (user_id, item_id, quantity, total_points) VALUES (?, ?, 1, ?)",
      [userId, item_id, item.price_points],
    );

    // 6. Record point transaction
    await connection.query(
      "INSERT INTO point_transactions (user_id, shop_order_id, type, points, reason) VALUES (?, LAST_INSERT_ID(), 'spent', ?, ?)",
      [userId, item.price_points, `Purchased ${item.name}`],
    );

    // 7. Deduct points
    await connection.query("UPDATE users SET points = ? WHERE id = ?", [
      remainder,
      userId,
    ]);

    await connection.commit();

    res.status(200).json({
      success: true,
      message: "Purchase successful",
      remaining_points: remainder,
    });
  } catch (err) {
    await connection.rollback();
    res
      .status(500)
      .json({ success: false, message: "Purchase failed", error: err.message });
  } finally {
    connection.release();
  }
});

export default router;
