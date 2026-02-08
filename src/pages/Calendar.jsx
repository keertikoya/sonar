import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";

// Helper functions 
function ymd(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function cityCode(city = "") {
  const clean = city.replace(/[^a-zA-Z]/g, "").toUpperCase();
  if (clean.length >= 3) return clean.slice(0, 3);
  return (clean + "XXX").slice(0, 3);
}

function stateHue(state = "") {
  const s = String(state || "").toUpperCase();
  let hash = 0;
  for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
  return (hash % 280) + 40;
}

// CalendarView Component
export default function Calendar() {
  const { state } = useApp();
  const performances = state.tour.performances || [];
  const today = new Date();

  const [month, setMonth] = useState(() => startOfMonth(today));
  const [selectedDay, setSelectedDay] = useState(() => ymd(today));
  const [selectedEventId, setSelectedEventId] = useState(null);

  // Group performances by day
  const eventsByDay = useMemo(() => {
    const map = new Map();
    for (const p of performances) {
      if (!p.date) continue;
      if (!map.has(p.date)) map.set(p.date, []);
      map.get(p.date).push(p);
    }
    return map;
  }, [performances]);

  const monthStart = startOfMonth(month);
  const startDow = monthStart.getDay();
  const gridStart = addDays(monthStart, -startDow);

  // Build 7x6 grid
  const days = [];
  for (let i = 0; i < 42; i++) {
    const d = addDays(gridStart, i);
    const key = ymd(d);
    const inMonth = d.getMonth() === monthStart.getMonth();
    const dayEvents = eventsByDay.get(key) || [];
    days.push({ d, key, inMonth, dayEvents });
  }

  const selectedEvents = eventsByDay.get(selectedDay) || [];
  const primary =
    selectedEvents.find(e => e.id === selectedEventId) || selectedEvents[0] || null;

  const prevMonth = () => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1));
  const nextMonth = () => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1));

  return (
    <div className="container" style={{ paddingTop: 16 }}>
      <div className="h1" style={{ marginBottom: 12 }}>Calendar</div>

      <div className="tourCalWrap" style={{ display: "flex", gap: 20, minHeight: 400 }}>
        {/* LEFT: calendar grid */}
        <div className="tourCalLeft" style={{ flex: 1 }}>
          <div className="tourCalHeader">
            <button className="btn ghost" onClick={prevMonth}>←</button>
            <div className="tourCalTitle">
              {month.toLocaleString(undefined, { month: "long", year: "numeric" })}
            </div>
            <button className="btn ghost" onClick={nextMonth}>→</button>
          </div>

          <div className="tourCalDow" style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", textAlign: "center", marginBottom: 4 }}>
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(x => (
              <div key={x}>{x}</div>
            ))}
          </div>

          <div className="tourCalGrid" style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
            {days.map(({ d, key, inMonth, dayEvents }) => (
              <div
                key={key}
                className={`tourCalCell ${inMonth ? "" : "muted"} ${key === selectedDay ? "selected" : ""}`}
                style={{
                  border: "1px solid #ccc",
                  minHeight: 60,
                  padding: 4,
                  background: inMonth ? "#fff" : "#f5f5f5",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                }}
                onClick={() => setSelectedDay(key)}
              >
                <div className="tourCalCellHeader" style={{ fontWeight: 600 }}>{d.getDate()}</div>
                <div className="tourCalEvents" style={{ flex: 1, overflow: "hidden" }}>
                  {dayEvents.slice(0, 2).map(ev => (
                    <button
                      key={ev.id}
                      type="button"
                      className="tourCalEvent"
                      style={{
                        "--h": stateHue(ev.state),
                        display: "block",
                        fontSize: "0.7em",
                        marginTop: 2,
                        textAlign: "left",
                        padding: "1px 3px",
                      }}
                      onClick={e => {
                        e.stopPropagation();
                        setSelectedEventId(ev.id);
                      }}
                      title={`${ev.city}, ${ev.state} • ${ev.venue}`}
                    >
                      {cityCode(ev.city)} {ev.city}
                    </button>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="tourCalMoreLine" style={{ fontSize: "0.7em" }}>+{dayEvents.length - 2} more</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: selected day panel */}
        <div className="tourCalRight" style={{ width: 250 }}>
          <div className="tourCalDayPanel">
            <div className="h3" style={{ marginBottom: 8 }}>
              {selectedDay} • {selectedEvents.length} show{selectedEvents.length === 1 ? "" : "s"}
            </div>
            {selectedEvents.length === 0 ? (
              <div className="body">No shows on this date.</div>
            ) : (
              <div className="list">
                {selectedEvents.map(ev => (
                  <Link key={ev.id} to={`/performance/${ev.id}`} className="card" style={{ padding: 8, display: "block" }}>
                    <div style={{ fontWeight: 800, display: "flex", gap: 6, alignItems: "center" }}>
                      <span className="tourCityPill" style={{ "--h": stateHue(ev.state) }}>{cityCode(ev.city)}</span>
                      {ev.city}, {ev.state}
                    </div>
                    <div className="body">{ev.venue}</div>
                    <div className="body">{ev.date}</div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
