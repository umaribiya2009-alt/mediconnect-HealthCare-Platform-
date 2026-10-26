import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, downloadReport } from "../api.js";
import { useAuth } from "../auth.jsx";
import Header from "../components/Header.jsx";
import BookingTable from "../components/BookingTable.jsx";
import ReportForm from "../components/ReportForm.jsx";
import { isConsult } from "../constants.js";

const Stat = ({ num, label }) => (
  <div className="stat"><div className="num">{num}</div><div className="label">{label}</div></div>
);

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [bookings, setBookings] = useState(null);
  const [tests, setTests] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    try {
      setBookings(await api.get("/bookings"));
    } catch (e) {
      if (e.status === 401) logout();
      else setError(e.message);
    }
  }, [logout]);

  useEffect(() => {
    refresh();
    api.get("/tests").then(setTests).catch(() => {});
    api.get("/doctors").then(setDoctors).catch(() => {});
  }, [refresh]);

  async function advance(id) {
    setError("");
    try { await api.patch(`/bookings/${id}/advance`); await refresh(); } catch (e) { setError(e.message); }
  }
  async function saveReport(id, findings, advice) {
    await api.post(`/bookings/${id}/report`, { findings, advice });
    setEditingId(null);
    await refresh();
  }
  async function download(id) {
    setError("");
    try { await downloadReport(id); } catch (e) { setError(e.message); }
  }

  const list = bookings || [];
  const editing = list.find((b) => b.id === editingId);
  const done = list.filter((b) => b.step === 4).length;
  const table = (
    <BookingTable list={list} role={user.role} onAdvance={advance} onWrite={(id) => { setEditingId(id); window.scrollTo({ top: 0, behavior: "smooth" }); }} onDownload={download} />
  );

  return (
    <>
      <Header />
      <main className="container">
        <div className="eyebrow">Dashboard</div>
        <h1 className="page-title">Hello, {user.name}<span className="badge">{user.role}</span></h1>
        {error && <div className="error" role="alert" style={{ marginBottom: 12 }}>{error}</div>}
        {!bookings && !error && <p className="muted">Loading...</p>}

        {bookings && user.role === "patient" && (
          <>
            <div className="stats">
              <Stat num={list.length} label="My bookings" />
              <Stat num={done} label="Reports ready" />
              <Stat num={list.length - done} label="In progress" />
            </div>
            <div className="section"><h2>My appointments and reports</h2>{table}</div>

            <div className="section">
              <h2>Book a diagnostic test</h2>
              <div className="cards">
                {tests.map((t) => (
                  <div className="card" key={t.id}>
                    <h3>{t.name}</h3><span className="muted small">{t.type} sample</span>
                    <Link className="btn btn-small" style={{ marginTop: 10 }} to={`/book?test=${t.id}`}>Book now</Link>
                  </div>
                ))}
              </div>
            </div>

            <div className="section">
              <h2>Find doctors</h2>
              <div className="cards">
                {doctors.map((d) => (
                  <div className="card" key={d.id}>
                    <h3>{d.name}</h3><span className="muted small">{d.field}</span>
                    <Link className="btn btn-light btn-small" style={{ marginTop: 10 }} to={`/book?doctor=${d.id}`}>Book with this doctor</Link>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {bookings && user.role === "doctor" && (
          <>
            <div className="stats">
              <Stat num={list.length} label="My patients" />
              <Stat num={list.filter((b) => b.step === 0 || b.step === 3 || (isConsult(b) && b.step === 1)).length} label="Need my action" />
              <Stat num={done} label="Reports given" />
            </div>
            {editing && <ReportForm key={editing.id} booking={editing} onSave={saveReport} onCancel={() => setEditingId(null)} />}
            <div className="section"><h2>Patients who booked with me</h2>{table}</div>
            <p className="muted small">How it works: confirm the appointment, the lab collects and processes the sample, then you write the report and the patient can download it.</p>
          </>
        )}

        {bookings && user.role === "admin" && (
          <>
            <div className="stats">
              <Stat num={list.length} label="Total bookings" />
              <Stat num={list.length - done} label="In progress" />
              <Stat num={done} label="Reports delivered" />
            </div>
            <div className="section"><h2>All bookings</h2>{table}</div>
            <div className="section">
              <h2>Doctors</h2>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Doctor</th><th>Field</th><th>Patients</th></tr></thead>
                  <tbody>
                    {doctors.map((d) => (
                      <tr key={d.id}><td>{d.name}</td><td>{d.field}</td><td>{list.filter((b) => b.doctorId === d.id).length}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </>
  );
}
