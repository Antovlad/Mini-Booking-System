const API_BASE = "http://localhost:8080";

async function req(path, options = {}) {
  const r = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  // success
  if (r.ok) {
    const contentType = r.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) return null;
    return r.json();
  }

  // error
  const text = await r.text();
  // încearcă să scoți "message"/"error" dacă backend trimite JSON
  try {
    const obj = JSON.parse(text);
    const msg = obj.message || obj.error || text;
    throw new Error(msg);
  } catch {
    throw new Error(text || `HTTP ${r.status}`);
  }
}

export function fetchRooms() {
  return req("/api/rooms", { method: "GET" });
}

export function createRoom(payload) {
  return req("/api/rooms", { method: "POST", body: JSON.stringify(payload) });
}

export function fetchAvailability(roomId, fromIso, toIso) {
  const q = new URLSearchParams({ from: fromIso, to: toIso }).toString();
  return req(`/api/rooms/${roomId}/availability?${q}`, { method: "GET" });
}

export function fetchBookings(roomId) {
  const q = new URLSearchParams({ roomId: String(roomId) }).toString();
  return req(`/api/bookings?${q}`, { method: "GET" });
}

export function createBooking(payload) {
  return req("/api/bookings", { method: "POST", body: JSON.stringify(payload) });
}

export function cancelBooking(id) {
  return req(`/api/bookings/${id}`, { method: "DELETE" });
}
