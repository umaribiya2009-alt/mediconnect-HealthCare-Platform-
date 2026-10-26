import { STEPS, ADMIN_LABELS, isConsult, formatDate } from "../constants.js";

function Status({ b }) {
  return <span className={"pill " + (b.step === 4 ? "done" : "")}>{STEPS[b.step]}</span>;
}

const Wait = ({ children }) => <span className="muted small">{children}</span>;

// Shows the right button for this person and this booking
function Action({ b, role, onAdvance, onWrite, onDownload }) {
  if (b.step === 4) return <button className="btn btn-small" onClick={() => onDownload(b.id)}>Download report</button>;

  if (role === "patient") return <Wait>Report not ready yet</Wait>;

  if (role === "doctor") {
    if (b.step === 0) return <button className="btn btn-small" onClick={() => onAdvance(b.id)}>Confirm appointment</button>;
    if (b.step === 3 || (isConsult(b) && b.step === 1)) return <button className="btn btn-small" onClick={() => onWrite(b.id)}>Write report</button>;
    return <Wait>Waiting for the lab</Wait>;
  }

  // admin
  if (b.step <= 2 && !(isConsult(b) && b.step === 1)) {
    return <button className="btn btn-small" onClick={() => onAdvance(b.id)}>{ADMIN_LABELS[b.step]}</button>;
  }
  return <Wait>Waiting for the doctor's report</Wait>;
}

export default function BookingTable({ list, role, onAdvance, onWrite, onDownload }) {
  if (!list.length) return <div className="empty">No bookings yet.</div>;
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Booking ID</th>
            {role !== "patient" && <th>Patient</th>}
            <th>Test</th>
            {role !== "doctor" && <th>Doctor</th>}
            <th>Date</th>
            <th>Status</th>
            <th>{role === "patient" ? "Report" : "Action"}</th>
          </tr>
        </thead>
        <tbody>
          {list.map((b) => (
            <tr key={b.id}>
              <td>{b.id}</td>
              {role !== "patient" && <td>{b.patient}</td>}
              <td>{b.test}</td>
              {role !== "doctor" && <td>{b.doctor}</td>}
              <td>{formatDate(b.date)}</td>
              <td><Status b={b} /></td>
              <td><Action b={b} role={role} onAdvance={onAdvance} onWrite={onWrite} onDownload={onDownload} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
