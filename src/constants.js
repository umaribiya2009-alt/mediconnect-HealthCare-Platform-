export const STEPS = ["Test Booked", "Appointment Confirmed", "Sample Collected", "Report Processing", "Report Ready"];
export const ADMIN_LABELS = ["Confirm appointment", "Mark sample collected", "Start processing"];

export const isConsult = (b) => b.testId === 0;

export function formatDate(iso) {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}
