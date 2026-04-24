import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// all routes here require login
router.use(authMiddleware);

// GET PROFILE
router.get("/profile", (req, res) => {
    res.json(req.session.user);
});

export default router;