// Small helper to talk to the Express server. Sends the login token with every request.
export function getToken() {
  try { return localStorage.getItem("mc_token"); } catch (e) { return null; }
}

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch("/api" + path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: "Bearer " + token } : {})
    }
  });
  if (!res.ok) {
    let message = "Something went wrong. Please try again.";
    try { message = (await res.json()).message || message; } catch (e) {}
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: "POST", body: JSON.stringify(body || {}) }),
  patch: (path) => request(path, { method: "PATCH" })
};

// Download the PDF report (needs the token, so we fetch it and save it as a file)
export async function downloadReport(id) {
  const res = await fetch(`/api/bookings/${id}/report.pdf`, { headers: { Authorization: "Bearer " + getToken() } });
  if (!res.ok) throw new Error("Could not download the report.");
  const url = URL.createObjectURL(await res.blob());
  const a = document.createElement("a");
  a.href = url;
  a.download = `MediConnect-Report-${id}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
