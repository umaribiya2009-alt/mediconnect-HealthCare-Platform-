import { useState } from "react";

// Doctor fills in findings and advice, then sends the report to the patient
export default function ReportForm({ booking, onSave, onCancel }) {
  const consult = booking.testId === 0;
  const [findings, setFindings] = useState(consult ? "Consultation completed. Patient examined." : "All values are within the normal range.");
  const [advice, setAdvice] = useState("Drink plenty of water and eat a balanced diet. Visit again if symptoms continue.");
  const [error, setError] = useState("");

  async function save() {
    if (!findings.trim()) return setError("Please write the findings.");
    try { await onSave(booking.id, findings, advice); } catch (e) { setError(e.message); }
  }

  return (
    <div className="panel" id="reportPanel" style={{ marginBottom: 28 }}>
      <h2>Write report for {booking.id}</h2>
      <p className="muted small">Patient: {booking.patient} &middot; {booking.test}</p>
      <label htmlFor="findings">Findings</label>
      <textarea id="findings" rows="4" value={findings} onChange={(e) => setFindings(e.target.value)} />
      <label htmlFor="advice">Doctor's advice</label>
      <textarea id="advice" rows="3" value={advice} onChange={(e) => setAdvice(e.target.value)} />
      <div className="error" role="alert">{error}</div>
      <div className="btn-row">
        <button className="btn" onClick={save}>Save and send to patient</button>
        <button className="btn btn-light" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}
