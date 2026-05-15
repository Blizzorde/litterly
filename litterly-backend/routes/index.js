import { Router } from "express";
import authRoutes from "./authRoutes.js";
import userRoutes from "./userRoutes.js";
import missionRoutes from "./missionRoutes.js";
import authMiddleware from "../middleware/authMiddleware.js";

const apiRouter = Router();

// API root
apiRouter.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        app: "Litterly",
        message: "API is running"
    });
});

// Routes
apiRouter.use("/auth", authRoutes);
apiRouter.use("/users", authMiddleware, userRoutes);
apiRouter.use("/missions", missionRoutes);
//TODO: authMiddleware removed for testing, re add when done



// API 404
apiRouter.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API route not found"
    });
});

export default apiRouter;