import { Router } from "express";
import PDFDocument from "pdfkit";
import { readDb, writeDb, STEPS } from "../db.js";
import { auth, requireRole } from "../middleware.js";

const router = Router();
router.use(auth);

const isConsult = (b) => b.testId === 0; // doctor consultation only (no lab test)

function canView(user, b) {
  if (user.role === "admin") return true;
  if (user.role === "patient") return b.patientId === user.id;
  if (user.role === "doctor") return b.doctorId === user.doctorId;
  return false;
}

// Who is allowed to move a booking forward right now?
function canAdvance(user, b) {
  if (user.role === "doctor") return b.doctorId === user.doctorId && b.step === 0; // confirm appointment
  if (user.role === "admin") return b.step <= 2 && !(isConsult(b) && b.step === 1); // lab steps
  return false;
}

// Doctor can write the report after the lab is done (or right after confirming a consultation)
function canWriteReport(user, b) {
  return user.role === "doctor" && b.doctorId === user.doctorId && (b.step === 3 || (isConsult(b) && b.step === 1));
}

// List bookings (each role sees only what it should)
router.get("/", (req, res) => {
  const db = readDb();
  res.json(db.bookings.filter((b) => canView(req.user, b)));
});

// Patient creates a booking
router.post("/", requireRole("patient"), (req, res) => {
  const db = readDb();
  const testId = parseInt(req.body.testId, 10) || 0;
  const doctorId = parseInt(req.body.doctorId, 10);
  const date = String(req.body.date || "");
  const collection = testId ? (req.body.collection === "lab" ? "lab" : "home") : "none";
  const address = String(req.body.address || "").trim();

  const doctor = db.doctors.find((d) => d.id === doctorId);
  const test = testId ? db.tests.find((t) => t.id === testId) : null;
  if (!doctor) return res.status(400).json({ message: "Please choose a doctor." });
  if (testId && !test) return res.status(400).json({ message: "Please choose a valid test." });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return res.status(400).json({ message: "Please choose a date." });
  if (collection === "home" && !address) return res.status(400).json({ message: "Please enter your address for home collection." });

  const patient = db.users.find((u) => u.id === req.user.id);
  const booking = {
    id: "MC-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
    patientId: req.user.id,
    patient: patient ? patient.name : req.user.name,
    testId,
    test: test ? test.name : "Doctor consultation only",
    sampleType: test ? test.type : "-",
    doctorId: doctor.id,
    doctor: doctor.name,
    date,
    collection,
    address: collection === "home" ? address : "",
    step: 0,
    report: null,
    createdAt: new Date().toISOString()
  };
  db.bookings.push(booking);
  writeDb(db);
  res.status(201).json(booking);
});

// Doctor confirms / admin does lab steps: move to the next status
router.patch("/:id/advance", requireRole("doctor", "admin"), (req, res) => {
  const db = readDb();
  const b = db.bookings.find((x) => x.id === req.params.id);
  if (!b) return res.status(404).json({ message: "Booking not found." });
  if (!canAdvance(req.user, b)) return res.status(400).json({ message: "You cannot update this booking right now." });
  b.step += 1;
  writeDb(db);
  res.json(b);
});

// Doctor writes the report -> status becomes "Report Ready"
router.post("/:id/report", requireRole("doctor"), (req, res) => {
  const db = readDb();
  const b = db.bookings.find((x) => x.id === req.params.id);
  if (!b) return res.status(404).json({ message: "Booking not found." });
  if (!canWriteReport(req.user, b)) return res.status(400).json({ message: "This booking is not ready for a report yet." });

  const findings = String(req.body.findings || "").trim();
  const advice = String(req.body.advice || "").trim();
  if (!findings) return res.status(400).json({ message: "Please write the findings." });

  b.report = { findings, advice, doctor: b.doctor, date: new Date().toISOString() };
  b.step = STEPS.length - 1;
  writeDb(db);
  res.json(b);
});

// Download the report as a PDF
router.get("/:id/report.pdf", (req, res) => {
  const db = readDb();
  const b = db.bookings.find((x) => x.id === req.params.id);
  if (!b || !canView(req.user, b)) return res.status(404).json({ message: "Booking not found." });
  if (b.step !== STEPS.length - 1 || !b.report) return res.status(400).json({ message: "The report is not ready yet." });

  const fmt = (iso) => new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="MediConnect-Report-${b.id}.pdf"`);
  doc.pipe(res);

  doc.rect(0, 0, 595, 90).fill("#0b2a4a");
  doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(24).text("MediConnect", 50, 28);
  doc.font("Helvetica").fontSize(11).fillColor("#c7dff5").text((isConsult(b) ? "Consultation Report" : "Test Report") + "  -  Your healthcare, connected", 50, 58);

  doc.fillColor("#0b2a4a").font("Helvetica-Bold").fontSize(14).text("Patient and test details", 50, 120);
  const rows = [
    ["Report ID", b.id], ["Patient", b.patient], ["Test", b.test], ["Sample type", b.sampleType],
    ["Doctor", b.report.doctor], ["Booking date", fmt(b.date)], ["Report date", fmt(b.report.date)]
  ];
  let y = 148;
  rows.forEach(([k, v]) => {
    doc.fillColor("#1c2b3a").font("Helvetica-Bold").fontSize(11).text(k, 50, y);
    doc.font("Helvetica").text(String(v), 170, y, { width: 370 });
    y += 20;
  });

  doc.moveTo(50, y + 6).lineTo(545, y + 6).strokeColor("#dbe6f2").stroke();
  doc.fillColor("#0b2a4a").font("Helvetica-Bold").fontSize(14).text("Findings", 50, y + 20);
  doc.fillColor("#1c2b3a").font("Helvetica").fontSize(11).text(b.report.findings, 50, doc.y + 6, { width: 495 });

  doc.moveDown(1);
  doc.fillColor("#0b2a4a").font("Helvetica-Bold").fontSize(14).text("Doctor's advice");
  doc.fillColor("#1c2b3a").font("Helvetica").fontSize(11).text(b.report.advice || "-", { width: 495 });

  doc.fillColor("#5d7186").fontSize(9).text("Demo report with sample data. Not for real medical use.", 50, 760, { width: 495, align: "center", lineBreak: false });
  doc.end();
});

export default router;
