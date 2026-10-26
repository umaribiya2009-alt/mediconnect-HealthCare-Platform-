import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { readDb } from "./db.js";
import authRoutes from "./routes/auth.js";
import bookingRoutes from "./routes/bookings.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Public lists used by the booking page
app.get("/api/tests", (req, res) => res.json(readDb().tests));
app.get("/api/doctors", (req, res) => res.json(readDb().doctors));

app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);

app.use("/api", (req, res) => res.status(404).json({ message: "Not found." }));

// After "npm run build", Express also serves the React website
const dist = path.join(path.dirname(fileURLToPath(import.meta.url)), "../client/dist");
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get("*", (req, res) => res.sendFile(path.join(dist, "index.html")));
}

readDb(); // creates the database file with sample data on first run
app.listen(PORT, () => console.log(`MediConnect server running on http://localhost:${PORT}`));
