import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../auth.jsx";
import Header from "../components/Header.jsx";

const ROLES = [
  { key: "patient", label: "Patient", icon: "\u{1F464}", text: "Book tests, download reports" },
  { key: "doctor", label: "Doctor", icon: "\u{1FA7A}", text: "See patients, write reports" },
  { key: "admin", label: "Admin", icon: "\u{1F6E1}️", text: "Manage all bookings" }
];

// Demo accounts created by the server on first run
const DEMO = { patient: "ravi@example.com", doctor: "ananya@mediconnect.com", admin: "admin@mediconnect.com" };

export default function Login() {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState(null);
  const [mode, setMode] = useState("login"); // login or register (patients only)
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });
  const chosen = ROLES.find((r) => r.key === role);

  function chooseRole(key) {
    setRole(key); setMode("login"); setError(""); setForm({ name: "", email: "", password: "" });
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (mode === "register" && !form.name.trim()) return setError("Please enter your name.");
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setError("Please enter a valid email.");
    if (form.password.length < 6) return setError("Password must be at least 6 characters.");
    setBusy(true);
    try {
      if (mode === "register") await register(form.name.trim(), form.email, form.password);
      else await login(form.email, form.password, role);
      navigate("/");
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <>
      <Header />
      <main className="login-wrap">
        <section className="login-hero">
          <div className="logo-box">
            <svg width="46" height="46" viewBox="0 0 48 48" aria-hidden="true"><path d="M20 8h8v12h12v8H28v12h-8V28H8v-8h12z" fill="#8cc8ff" /></svg>
          </div>
          <h1>Your healthcare,<br /><em>connected.</em></h1>
          <ul className="points">
            <li><span className="tick">&#10003;</span> Book tests and consultations in minutes</li>
            <li><span className="tick">&#10003;</span> Track every step until your report is delivered</li>
            <li><span className="tick">&#10003;</span> Your records are visible only to you and your care team</li>
          </ul>
        </section>

        <section className="login-form">
          <h1>{mode === "register" ? "Create account" : "Welcome back"}</h1>
          <p className="muted">
            {!role ? "Choose how you want to log in." : mode === "register" ? "Create a patient account to book tests." : `${chosen.label} login. Enter your details to continue.`}
          </p>

          {!role && (
            <>
              <div className="divider">Choose your role</div>
              <div className="role-cards">
                {ROLES.map((r) => (
                  <button key={r.key} type="button" className="role-card" onClick={() => chooseRole(r.key)}>
                    <span className="emoji">{r.icon}</span>{r.label}<small>{r.text}</small>
                  </button>
                ))}
              </div>
            </>
          )}

          {role && (
            <form onSubmit={submit}>
              <div className="role-badge">
                <span>{mode === "register" ? "Registering as" : "Logging in as"} <b>{chosen.label}</b></span>
                <button type="button" className="link-btn" onClick={() => setRole(null)}>Change role</button>
              </div>

              {mode === "register" && (
                <>
                  <label htmlFor="name">Full name</label>
                  <input id="name" value={form.name} onChange={set("name")} placeholder="Your name" autoComplete="name" />
                </>
              )}

              <label htmlFor="email">Email</label>
              <input id="email" type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" autoComplete="email" />

              <label htmlFor="password">Password</label>
              <input id="password" type="password" value={form.password} onChange={set("password")} placeholder="At least 6 characters" autoComplete={mode === "register" ? "new-password" : "current-password"} />

              {mode === "login" && (
                <button type="button" className="link-btn" style={{ marginTop: 10 }} onClick={() => setForm({ ...form, email: DEMO[role], password: "demo1234" })}>
                  Fill demo details
                </button>
              )}

              <div className="error" role="alert">{error}</div>
              <button className="btn btn-block" type="submit" disabled={busy}>
                {busy ? "Please wait..." : mode === "register" ? "Create account" : "Log in"}
              </button>

              {role === "patient" && (
                <p className="muted small" style={{ textAlign: "center", marginTop: 16 }}>
                  {mode === "login" ? "New patient? " : "Already have an account? "}
                  <button type="button" className="link-btn" onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}>
                    {mode === "login" ? "Create an account" : "Log in"}
                  </button>
                </p>
              )}
            </form>
          )}
        </section>
      </main>
    </>
  );
}
