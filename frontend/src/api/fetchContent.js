import { fallbackContent } from "../content/fallbackContent";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export async function fetchHospitalContent() {
  try {
    const response = await fetch(`${API_BASE}/api/content?v=${Date.now()}`, {
      cache: "no-store",
      headers: { "Cache-Control": "no-cache" }
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch content: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.warn("Falling back to local content:", error.message);
    return fallbackContent;
  }
}

export async function submitAppointment(payload) {
  const response = await fetch(`${API_BASE}/api/appointments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const maybeError = await response.json().catch(() => ({}));
    throw new Error(maybeError.message || "Unable to submit request");
  }

  return response.json();
}

