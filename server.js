import express from "express";
import session from "express-session";
import dotenv from "dotenv";
import pool from "./litterly-backend/config/db.js";
import path from "path";

import apiRouter from "./litterly-backend/routes/index.js";

dotenv.config();

const app = express();

// Parsing
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

// API
app.use("/api", apiRouter);

// Frontend catch-all
app.use((req, res) => {
    res.sendFile(path.join(process.cwd(), "litterly-frontend", "pages","notFound.html"));
});

app.listen(process.env.PORT, () => {
    console.log(`Litterly running on http://localhost:${process.env.PORT}`);
    console.log(`Litterly API running on http://localhost:${process.env.PORT}/api`);
});