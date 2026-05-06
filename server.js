import express from "express";
import session from "express-session";
import dotenv from "dotenv";
import pool from "./litterly-backend/config/db.js";

import authRoutes from "./litterly-backend/routes/authRoutes.js";
import userRoutes from "./litterly-backend/routes/userRoutes.js";
import missionRoutes from "./litterly-backend/routes/missionRoutes.js";



dotenv.config();

const app = express();

// JSON parsing
app.use(express.json());


// ==============temp server startup logging
try {

 const [rows] = await pool.query("SELECT 1");

 console.log("Database connected");
 console.log(rows);

}
catch(err){

 console.error(err);

}
// ================


// Sessions
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    name: "ltr_ses",
    cookie: {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 1000 * 60 * 60
    }
}));

// Static frontend
app.use(express.static("litterly-frontend"));

// API routes
app.get("/api", (req, res) => {
    res.status(200).send({
        success: true,
        message: "This is the root of the API!"
    })
});
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/missions", missionRoutes);

app.listen(process.env.PORT, () => {
    console.log(`Litterly running on http://localhost:${process.env.PORT}`);
    console.log(`Litterly Backend API running on http://localhost:${process.env.PORT}/api`);
});