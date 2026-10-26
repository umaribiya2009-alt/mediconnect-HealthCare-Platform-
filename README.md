# MediConnect - Healthcare Platform for Diagnostic Tests

A simple full-stack website (React + Express) where patients book diagnostic tests with a doctor of their choice, and track and download their reports.

## Tech used

| Part | Technology | Folder |
|------|------------|--------|
| Frontend (what the user sees) | React, React Router, Vite, plain CSS | `client/` |
| Backend (the server) | Node.js, Express | `server/` |
| Login security | bcrypt (hashed passwords) + JWT (login token) | `server/routes/auth.js` |
| Database | One JSON file, created automatically (`server/data/db.json`) | `server/db.js` |
| PDF reports | PDFKit (made on the server) | `server/routes/bookings.js` |

Fonts: Source Serif 4 (headings) and Inter (text).

## The 3 pages

1. **Login** (`/login`): click Patient, Doctor or Admin and that role's login form appears. New patients can create an account.
2. **Dashboard** (`/`): shows a different view for each role.
3. **Book Appointment** (`/book`): patient chooses a test, a doctor, a date and the collection type.

## What each role can do

- **Patient**: book a test with a chosen doctor, track the status, **download the report as a PDF** when ready.
- **Doctor**: sees only their own patients. Confirms appointments and **writes the report** (findings and advice).
- **Admin**: sees every booking and handles the lab steps (sample collected, start processing).

## How a booking moves (easy to explain)

1. Patient books a test and picks a doctor. Status: Test Booked
2. Doctor confirms the appointment. Status: Appointment Confirmed
3. Admin marks the sample collected. Status: Sample Collected
4. Admin starts processing. Status: Report Processing
5. Doctor writes the report. Status: Report Ready, and the patient downloads the PDF

A "doctor consultation only" booking skips the lab steps: the doctor confirms, then writes notes.

## How to run

You need Node.js 18 or newer.

    npm run install:all
    npm run dev

- Website: http://localhost:5173
- Server: http://localhost:4000

### Run as one app (like a real deployment)

    npm run build
    npm start

Then open http://localhost:4000 (Express serves the built React website).

## Demo accounts (password for all: `demo1234`)

| Role | Email |
|------|-------|
| Patient | ravi@example.com |
| Doctor | ananya@mediconnect.com (Cardiologist) |
| Doctor | rahul@mediconnect.com (General Physician) |
| Doctor | priya@mediconnect.com (Endocrinologist) |
| Admin | admin@mediconnect.com |

On the login page, click a role and then "Fill demo details". New patients can also use "Create an account".

## Server API (for the reviewer)

| Method | Address | Who | What it does |
|--------|---------|-----|--------------|
| POST | `/api/auth/register` | anyone | Create a patient account |
| POST | `/api/auth/login` | anyone | Log in, returns a token |
| GET | `/api/tests`, `/api/doctors` | anyone | Lists for the booking page |
| GET | `/api/bookings` | logged in | Each role gets only its own bookings |
| POST | `/api/bookings` | patient | Create a booking |
| PATCH | `/api/bookings/:id/advance` | doctor, admin | Move to the next step (rules are checked on the server) |
| POST | `/api/bookings/:id/report` | doctor | Write the report |
| GET | `/api/bookings/:id/report.pdf` | patient, doctor, admin | Download the PDF (only if allowed) |

## Good points to mention

- Passwords are stored hashed, never as plain text.
- All permission rules are checked on the server, not only on the screen. A doctor cannot see another doctor's patients, and a patient cannot download another patient's report.
- Reports are real PDF files made by the server.

## Limits of this demo (be honest with the reviewer)

- The database is a JSON file, good for a demo. For real use, move to MongoDB, PostgreSQL or MySQL.
- No payment, email or SMS yet.
- Sample data only. Not for real medical use.
- Before real use, set a private secret: `JWT_SECRET=your-secret npm start`.

## Upload to GitHub

    git init
    git add .
    git commit -m "MediConnect: React + Express"
    git branch -M main
    git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
    git push -u origin main

`node_modules`, the build folder and the database file are already ignored by `.gitignore`.
