const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8000";

async function handleResponse(res) {
  if (!res.ok) {
    let detail = `Request failed with status ${res.status}`;
    try {
      const body = await res.json();
      detail = body.detail || detail;
    } catch (_) {
      // response wasn't JSON; keep default message
    }
    throw new Error(detail);
  }
  return res.json();
}

export async function uploadResume(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/api/upload`, {
    method: "POST",
    body: formData,
  });
  return handleResponse(res);
}

export async function fetchReports() {
  const res = await fetch(`${API_BASE}/api/reports`);
  return handleResponse(res);
}

export async function fetchReport(id) {
  const res = await fetch(`${API_BASE}/api/reports/${id}`);
  return handleResponse(res);
}
