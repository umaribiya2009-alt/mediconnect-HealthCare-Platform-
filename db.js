// Very simple database: one JSON file (server/data/db.json).
// It is created automatically the first time the server starts.
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "data");
const file = path.join(dir, "db.json");

export const STEPS = ["Test Booked", "Appointment Confirmed", "Sample Collected", "Report Processing", "Report Ready"];

function seed() {
  const hash = bcrypt.hashSync("demo1234", 10);
  const doctors = [
    { id: 1, name: "Dr. Ananya Rao", field: "Cardiologist" },
    { id: 2, name: "Dr. Rahul Mehta", field: "General Physician" },
    { id: 3, name: "Dr. Priya Nair", field: "Endocrinologist" }
  ];
  const users = [
    { id: 1, name: "Admin", email: "admin@mediconnect.com", passwordHash: hash, role: "admin" },
    { id: 2, name: "Dr. Ananya Rao", email: "ananya@mediconnect.com", passwordHash: hash, role: "doctor", doctorId: 1 },
    { id: 3, name: "Dr. Rahul Mehta", email: "rahul@mediconnect.com", passwordHash: hash, role: "doctor", doctorId: 2 },
    { id: 4, name: "Dr. Priya Nair", email: "priya@mediconnect.com", passwordHash: hash, role: "doctor", doctorId: 3 },
    { id: 5, name: "Ravi Kumar", email: "ravi@example.com", passwordHash: hash, role: "patient" }
  ];
  const tests = [
    { id: 1, name: "Complete Blood Count (CBC)", type: "Blood" },
    { id: 2, name: "Lipid Profile", type: "Blood" },
    { id: 3, name: "Thyroid Profile (T3, T4, TSH)", type: "Blood" },
    { id: 4, name: "Blood Sugar (Fasting)", type: "Blood" },
    { id: 5, name: "Vitamin D Test", type: "Blood" },
    { id: 6, name: "Urine Routine Test", type: "Urine" }
  ];
  return { users, doctors, tests, bookings: [] };
}

export function readDb() {
  if (!fs.existsSync(file)) writeDb(seed());
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

export function writeDb(db) {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(file, JSON.stringify(db, null, 2));
}
