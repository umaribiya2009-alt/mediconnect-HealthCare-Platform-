import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { readDb, writeDb } from "../db.js";
import { SECRET } from "../middleware.js";

const router = Router();
const emailOk = (e) => /^\S+@\S+\.\S+$/.test(e);

function publicUser(u) {
  return { id: u.id, name: u.name, email: u.email, role: u.role, doctorId: u.doctorId || null };
}
function sendLogin(res, u) {
  const token = jwt.sign({ id: u.id, role: u.role, doctorId: u.doctorId || null, name: u.name }, SECRET, { expiresIn: "8h" });
  res.json({ token, user: publicUser(u) });
}

// New patients can create an account. Doctors and admin are created by the system.
router.post("/register", (req, res) => {
  const name = String(req.body.name || "").trim();
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");
  if (!name) return res.status(400).json({ message: "Please enter your name." });
  if (!emailOk(email)) return res.status(400).json({ message: "Please enter a valid email." });
  if (password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters." });

  const db = readDb();
  if (db.users.some((u) => u.email === email)) return res.status(409).json({ message: "This email is already registered. Please log in." });

  const user = { id: Date.now(), name, email, passwordHash: bcrypt.hashSync(password, 10), role: "patient" };
  db.users.push(user);
  writeDb(db);
  sendLogin(res, user);
});

router.post("/login", (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");
  const role = String(req.body.role || "");

  const db = readDb();
  const user = db.users.find((u) => u.email === email);
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ message: "Wrong email or password." });
  }
  if (role && user.role !== role) {
    return res.status(403).json({ message: `This email is not a ${role} account. Choose the correct role.` });
  }
  sendLogin(res, user);
});

export default router;
