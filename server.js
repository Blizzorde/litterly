import express from "express";
import dotenv from "dotenv";
import path from "path";
import cookieParser from "cookie-parser";
import apiRouter from "./litterly-backend/routes/index.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

if (!process.env.SESSION_SECRET) {
  console.error("FATAL ERROR: SESSION_SECRET is not defined in .env file.");
  process.exit(1);
}

// Parsing
app.use(express.json());
app.use(cookieParser());

// Static frontend
app.use(express.static("litterly-frontend"));

// API
app.use("/api", apiRouter);

// Frontend catch-all
app.use((req, res) => {
  res.sendFile(
    path.join(process.cwd(), "litterly-frontend", "pages", "notFound.html"),
  );
});

app.listen(process.env.PORT, () => {
  console.log(`Litterly running on http://localhost:${process.env.PORT}`);
  console.log(
    `Litterly API running on http://localhost:${process.env.PORT}/api`,
  );
});
