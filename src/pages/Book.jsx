import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api.js";
import Header from "../components/Header.jsx";

const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const pad = (n) => String(n).padStart(2, "0");

// Next 7 days, each with a value like 2026-10-26
function nextDays() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return { value: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`, day: DAYS[d.getDay()], num: d.getDate(), month: MONTHS[d.getMonth()] };
  });
}

export default function Book() {
  const [params] = useSearchParams();
  const days = useMemo(nextDays, []);
  const [tests, setTests] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [testId, setTestId] = useState(params.get("doctor") && !params.get("test") ? 0 : parseInt(params.get("test"), 10) || 1);
  const [doctorId, setDoctorId] = useState(parseInt(params.get("doctor"), 10) || 1);
  const [date, setDate] = useState(days[0].value);
  const [collection, setCollection] = useState("home");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);

  useEffect(() => {
    api.get("/tests").then(setTests).catch((e) => setError(e.message));
    api.get("/doctors").then(setDoctors).catch((e) => setError(e.message));
  }, []);

  const test = tests.find((t) => t.id === testId);
  const doctor = doctors.find((d) => d.id === doctorId);
  const dayInfo = days.find((d) => d.value === date);

  async function confirm() {
    setError("");
    if (testId && collection === "home" && !address.trim()) return setError("Please enter your address for home collection.");
    setBusy(true);
    try {
      setDone(await api.post("/bookings", { testId, doctorId, date, collection, address }));
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  }

  return (
    <>
      <Header />
      <main className="container">
        <div className="eyebrow">Book appointment</div>
        <h1 className="page-title">Book a test or doctor</h1>

        <div className="pay-grid">
          {done ? (
            <section className="panel">
              <div className="success">
                <div className="big">&#10003;</div>
                <h2>Booking confirmed</h2>
                <p className="muted">Your booking ID is <b>{done.id}</b>.<br />Your doctor is <b>{done.doctor}</b>.<br />You can track it on your dashboard.</p>
                <Link className="btn" to="/">Go to dashboard</Link>
              </div>
            </section>
          ) : (
            <section className="panel">
              <h3>1. Choose a test</h3>
              <select style={{ marginTop: 10 }} value={testId} onChange={(e) => setTestId(parseInt(e.target.value, 10))}>
                <option value={0}>Doctor consultation only (no test)</option>
                {tests.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>

              <h3 style={{ marginTop: 26 }}>2. Choose your doctor</h3>
              {doctors.map((d) => (
                <label key={d.id} className={"option" + (d.id === doctorId ? " selected" : "")}>
                  <input type="radio" name="doc" checked={d.id === doctorId} onChange={() => setDoctorId(d.id)} />
                  <span><b>{d.name}</b><span className="muted small">{d.field}</span></span>
                </label>
              ))}

              <h3 style={{ marginTop: 26 }}>3. Choose a date</h3>
              <div className="date-row" style={{ marginTop: 10 }}>
                {days.map((d) => (
                  <button key={d.value} type="button" className={"date-chip" + (d.value === date ? " selected" : "")} onClick={() => setDate(d.value)}>
                    <small>{d.day}</small><b>{d.num}</b><small>{d.month}</small>
                  </button>
                ))}
              </div>

              {testId !== 0 && (
                <>
                  <h3 style={{ marginTop: 26 }}>4. Sample collection</h3>
                  <label className={"option" + (collection === "home" ? " selected" : "")}>
                    <input type="radio" name="col" checked={collection === "home"} onChange={() => setCollection("home")} />
                    <span><b>Home sample collection</b><span className="muted small">A certified phlebotomist visits your address.</span></span>
                  </label>
                  <label className={"option" + (collection === "lab" ? " selected" : "")}>
                    <input type="radio" name="col" checked={collection === "lab"} onChange={() => setCollection("lab")} />
                    <span><b>Visit a MediConnect lab</b><span className="muted small">Walk in to the nearest partner lab at your slot.</span></span>
                  </label>
                  {collection === "home" && (
                    <>
                      <label htmlFor="address">Address (for home collection)</label>
                      <input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="House no, street, city" />
                    </>
                  )}
                </>
              )}

              <div className="error" role="alert">{error}</div>
              <button className="btn btn-block" onClick={confirm} disabled={busy}>{busy ? "Please wait..." : "Confirm booking"}</button>
              <p style={{ marginTop: 14 }}><Link to="/">&larr; Back to dashboard</Link></p>
            </section>
          )}

          <aside>
            <div className="panel">
              <div className="eyebrow" style={{ color: "var(--muted)" }}>Summary</div>
              <div className="summary-row"><span>Test</span><b>{test ? test.name : "Doctor consultation only"}</b></div>
              <div className="summary-row"><span>Doctor</span><b>{doctor ? doctor.name : "-"}</b></div>
              <div className="summary-row"><span>Date</span><b>{dayInfo.num} {dayInfo.month}</b></div>
              <div className="summary-row"><span>Collection</span><b>{testId === 0 ? "-" : collection === "home" ? "Home sample collection" : "Visit a MediConnect lab"}</b></div>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
