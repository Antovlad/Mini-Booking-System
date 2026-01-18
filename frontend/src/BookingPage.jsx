import { useEffect, useMemo, useState } from "react";
import {
  fetchRooms,
  createRoom,
  fetchAvailability,
  fetchBookings,
  createBooking,
  cancelBooking,
} from "./api";

function isoFromLocalDatetime(localValue) {
  return new Date(localValue).toISOString();
}

function fmt(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function isValidRange(startLocal, endLocal) {
  if (!startLocal || !endLocal) return false;
  const s = new Date(startLocal).getTime();
  const e = new Date(endLocal).getTime();
  return Number.isFinite(s) && Number.isFinite(e) && e > s;
}

export default function BookingPage() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [rooms, setRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState(null);

  const [roomName, setRoomName] = useState("");
  const [roomCapacity, setRoomCapacity] = useState(8);
  const [roomBusy, setRoomBusy] = useState(false);

  const [fromLocal, setFromLocal] = useState("2026-01-01T09:00");
  const [toLocal, setToLocal] = useState("2026-01-01T13:00");
  const [availability, setAvailability] = useState(null);
  const [availBusy, setAvailBusy] = useState(false);

  const [bookings, setBookings] = useState([]);
  const [listBusy, setListBusy] = useState(false);

  const [startLocal, setStartLocal] = useState("2026-01-01T10:00");
  const [endLocal, setEndLocal] = useState("2026-01-01T11:00");
  const [createdBy, setCreatedBy] = useState("Antoniu");
  const [bookingBusy, setBookingBusy] = useState(false);

  const selectedRoom = useMemo(
    () => rooms.find((r) => r.id === selectedRoomId) || null,
    [rooms, selectedRoomId]
  );

  const bookingRangeOk = useMemo(() => isValidRange(startLocal, endLocal), [startLocal, endLocal]);
  const availabilityRangeOk = useMemo(() => isValidRange(fromLocal, toLocal), [fromLocal, toLocal]);

  function flashSuccess(msg) {
    setSuccess(msg);
    setTimeout(() => setSuccess(""), 2500);
  }

  async function loadRooms() {
    setError("");
    const data = await fetchRooms();
    setRooms(data || []);
    if (selectedRoomId == null && data && data.length > 0) {
      setSelectedRoomId(data[0].id);
    }
  }

  async function loadBookings(roomId) {
    if (!roomId) return;
    setListBusy(true);
    setError("");
    try {
      const data = await fetchBookings(roomId);
      setBookings(data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setListBusy(false);
    }
  }

  useEffect(() => {
    loadRooms().catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (selectedRoomId) loadBookings(selectedRoomId);
  }, [selectedRoomId]);

  async function onCreateRoom(e) {
    e.preventDefault();
    setRoomBusy(true);
    setError("");
    try {
      const r = await createRoom({
        name: roomName.trim(),
        capacity: Number(roomCapacity),
      });
      await loadRooms();
      setSelectedRoomId(r.id);
      setRoomName("");
      setRoomCapacity(8);
      flashSuccess(`Room created: ${r.name} (id=${r.id})`);
    } catch (e2) {
      setError(e2.message);
    } finally {
      setRoomBusy(false);
    }
  }

  async function onCheckAvailability() {
    if (!selectedRoomId) return;
    if (!availabilityRangeOk) {
      setError("Availability range invalid: 'to' must be after 'from'.");
      return;
    }

    setAvailBusy(true);
    setError("");
    try {
      const fromIso = isoFromLocalDatetime(fromLocal);
      const toIso = isoFromLocalDatetime(toLocal);
      const slots = await fetchAvailability(selectedRoomId, fromIso, toIso);
      setAvailability(slots || []);
      flashSuccess("Availability refreshed.");
    } catch (e) {
      setError(e.message);
    } finally {
      setAvailBusy(false);
    }
  }

  async function onCreateBooking(e) {
    e.preventDefault();
    if (!selectedRoomId) return;

    if (!bookingRangeOk) {
      setError("Booking range invalid: end must be after start.");
      return;
    }

    setBookingBusy(true);
    setError("");
    try {
      await createBooking({
        roomId: selectedRoomId,
        startTime: isoFromLocalDatetime(startLocal),
        endTime: isoFromLocalDatetime(endLocal),
        createdBy: createdBy?.trim() || "anonymous",
      });

      await loadBookings(selectedRoomId);
      if (availability != null) await onCheckAvailability();
      flashSuccess("Booking created.");
    } catch (e2) {
      setError(e2.message);
    } finally {
      setBookingBusy(false);
    }
  }

  async function onCancel(id) {
    const ok = confirm("Cancel booking?");
    if (!ok) return;

    setError("");
    try {
      await cancelBooking(id);
      await loadBookings(selectedRoomId);
      if (availability != null) await onCheckAvailability();
      flashSuccess("Booking cancelled.");
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 24, fontFamily: "system-ui" }}>
      <h1 style={{ marginBottom: 6 }}>Mini Booking System</h1>
      <div style={{ color: "#666", marginBottom: 18 }}>
        Rooms • Availability • Bookings (no overlaps)
      </div>

      {success && (
        <div style={{ background: "#e8fff1", padding: 12, borderRadius: 10, marginBottom: 12 }}>
          <b>OK:</b> {success}
        </div>
      )}

      {error && (
        <div style={{ background: "#ffe6e6", padding: 12, borderRadius: 10, marginBottom: 16 }}>
          <b>Error:</b> {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "start" }}>
        {/* ROOMS */}
        <div style={{ border: "1px solid #eee", borderRadius: 14, padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ marginTop: 0 }}>Rooms</h2>
            <button onClick={() => loadRooms().catch((e) => setError(e.message))}>Refresh</button>
          </div>

          <label style={{ display: "grid", gap: 6 }}>
            Select room
            <select
              value={selectedRoomId ?? ""}
              onChange={(e) => setSelectedRoomId(Number(e.target.value))}
            >
              {rooms.length === 0 ? (
                <option value="">(no rooms yet)</option>
              ) : (
                rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} (id={r.id})
                  </option>
                ))
              )}
            </select>
          </label>

          {selectedRoom && (
            <div style={{ marginTop: 10, color: "#444" }}>
              <b>{selectedRoom.name}</b> • capacity: {selectedRoom.capacity ?? "-"} • id: {selectedRoom.id}
            </div>
          )}

          <hr style={{ border: "none", borderTop: "1px solid #eee", margin: "16px 0" }} />

          <form onSubmit={onCreateRoom} style={{ display: "grid", gap: 10 }}>
            <h3 style={{ margin: 0 }}>Create room</h3>

            <label style={{ display: "grid", gap: 6 }}>
              Name
              <input value={roomName} onChange={(e) => setRoomName(e.target.value)} required />
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              Capacity
              <input
                type="number"
                min="1"
                value={roomCapacity}
                onChange={(e) => setRoomCapacity(e.target.value)}
              />
            </label>

            <button disabled={roomBusy} type="submit">
              {roomBusy ? "Creating..." : "Create room"}
            </button>
          </form>
        </div>

        <div style={{ border: "1px solid #eee", borderRadius: 14, padding: 16 }}>
          <h2 style={{ marginTop: 0 }}>Availability</h2>

          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <label style={{ display: "grid", gap: 6 }}>
                From
                <input type="datetime-local" value={fromLocal} onChange={(e) => setFromLocal(e.target.value)} />
              </label>

              <label style={{ display: "grid", gap: 6 }}>
                To
                <input type="datetime-local" value={toLocal} onChange={(e) => setToLocal(e.target.value)} />
              </label>
            </div>

            {!availabilityRangeOk && (
              <div style={{ color: "#b45309", fontSize: 13 }}>
                Range invalid: <b>To</b> must be after <b>From</b>.
              </div>
            )}

            <button disabled={!selectedRoomId || availBusy || !availabilityRangeOk} onClick={onCheckAvailability}>
              {availBusy ? "Checking..." : "Check availability"}
            </button>

            {availability && (
              <div style={{ marginTop: 6 }}>
                {availability.length === 0 ? (
                  <div style={{ color: "#666" }}>No free slots in range.</div>
                ) : (
                  <ul style={{ paddingLeft: 18, margin: 0 }}>
                    {availability.map((s, idx) => (
                      <li key={idx} style={{ marginBottom: 6 }}>
                        {fmt(s.startTime)} → {fmt(s.endTime)}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <hr style={{ border: "none", borderTop: "1px solid #eee", margin: "16px 0" }} />

            <h2 style={{ marginTop: 0 }}>Create booking</h2>
            <form onSubmit={onCreateBooking} style={{ display: "grid", gap: 10 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <label style={{ display: "grid", gap: 6 }}>
                  Start
                  <input type="datetime-local" value={startLocal} onChange={(e) => setStartLocal(e.target.value)} required />
                </label>

                <label style={{ display: "grid", gap: 6 }}>
                  End
                  <input type="datetime-local" value={endLocal} onChange={(e) => setEndLocal(e.target.value)} required />
                </label>
              </div>

              {!bookingRangeOk && (
                <div style={{ color: "#b45309", fontSize: 13 }}>
                  Range invalid: <b>End</b> must be after <b>Start</b>.
                </div>
              )}

              <label style={{ display: "grid", gap: 6 }}>
                Created by
                <input value={createdBy} onChange={(e) => setCreatedBy(e.target.value)} />
              </label>

              <button disabled={!selectedRoomId || bookingBusy || !bookingRangeOk} type="submit">
                {bookingBusy ? "Booking..." : "Create booking"}
              </button>

              <div style={{ color: "#666", fontSize: 13 }}>
                Overlap ⇒ backend returns <b>409 Conflict</b>.
              </div>
            </form>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16, border: "1px solid #eee", borderRadius: 14, padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ marginTop: 0 }}>Bookings</h2>
          <button disabled={!selectedRoomId || listBusy} onClick={() => loadBookings(selectedRoomId)}>
            {listBusy ? "Loading..." : "Refresh"}
          </button>
        </div>

        {!selectedRoomId ? (
          <div style={{ color: "#666" }}>Select a room first.</div>
        ) : bookings.length === 0 ? (
          <div style={{ color: "#666" }}>No bookings yet.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>ID</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Start</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>End</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>By</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>{b.id}</td>
                  <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>{fmt(b.startTime)}</td>
                  <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>{fmt(b.endTime)}</td>
                  <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>{b.createdBy}</td>
                  <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                    <button onClick={() => onCancel(b.id)}>Cancel</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
