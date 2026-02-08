// src/pages/Calendar.jsx
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";

function ymd(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function cityCode(city = "") {
  const clean = city.replace(/[^a-zA-Z]/g, "").toUpperCase();
  return clean.length >= 3 ? clean.slice(0, 3) : (clean + "XXX").slice(0, 3);
}

function stateHue(state = "") {
  const s = String(state || "").toUpperCase();
  let hash = 0;
  for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
  return (hash % 280) + 40; // 40..319
}

export default function Calendar() {
  const { state } = useApp();
  const performances = state.tour.performances || [];

  const today = new Date();
  const [month, setMonth] = useState(startOfMonth(today));
  const [selectedDay, setSelectedDay] = useState(ymd(today));
  const [selectedEventId, setSelectedEventId] = useState(null);

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

  const days = [];
  for (let i = 0; i < 42; i++) {
    const d = addDays(gridStart, i);
    const key = ymd(d);
    const inMonth = d.getMonth() === monthStart.getMonth();
    const isToday = key === ymd(today);
    const isSelected = key === selectedDay;
    days.push({ d, key, inMonth, isToday, isSelected });
  }

  const selectedEvents = eventsByDay.get(selectedDay) || [];
  const primary =
    selectedEvents.find((e) => e.id === selectedEventId) || selectedEvents[0] || null;

  const prevMonth = () => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1));
  const nextMonth = () => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1));

  return (
    <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
      {/* Calendar Grid */}
      <div style={{ flex: "1 1 600px" }}>
      <div className="row" style={{ marginBottom: 12, alignItems: "center" }}>
  <button className="btn ghost calendar-nav" onClick={prevMonth}>←</button>
  <div className="h2" style={{ flex: 1, textAlign: "center" }}>
    {month.toLocaleString(undefined, { month: "long", year: "numeric" })}
  </div>
  <button className="btn ghost calendar-nav" onClick={nextMonth}>→</button>
</div>


        <div className="row" style={{ fontWeight: 700, marginBottom: 6 }}>
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(x => (
            <div key={x} style={{ flex: 1, textAlign: "center" }}>{x}</div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
          {days.map(({ d, key, inMonth, isToday, isSelected }) => {
            const dayEvents = eventsByDay.get(key) || [];
            return (
              <div
                key={key}
                className="card"
                style={{
                  background: isSelected ? "var(--primary)" : "var(--surface)",
                  color: isSelected ? "#fff" : inMonth ? "var(--text)" : "var(--muted)",
                  padding: 8,
                  cursor: "pointer",
                  minHeight: 100, // make each cell taller
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: 6, // less rounded
                  border: isToday ? "2px solid var(--accent)" : "1px solid var(--border)",
                  overflow: "hidden",
                  fontSize: 13
                }}
                onClick={() => setSelectedDay(key)}
              >
                <div style={{ fontWeight: 700, marginBottom: 4 }}>{d.getDate()}</div>
                <div style={{ flex: 1, overflow: "hidden" }}>
                  {dayEvents.map(ev => (
                    <div
                      key={ev.id}
                      style={{
                        marginBottom: 2,
                        background: `hsl(${stateHue(ev.state)}, 60%, 75%)`,
                        borderRadius: 4,
                        padding: "2px 4px",
                        fontSize: 12,
                        lineHeight: "1.2em",
                        whiteSpace: "normal", // allow wrapping
                        overflow: "hidden",
                        textOverflow: "ellipsis"
                      }}
                      title={`${ev.city}, ${ev.venue}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEventId(ev.id);
                        setSelectedDay(key);
                      }}
                    >
                      {ev.venue}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Day Panel */}
      <div style={{ flex: "1 1 320px" }}>
        <div className="card pad">
          <div className="h2" style={{ marginBottom: 8 }}>
            {selectedDay} • {selectedEvents.length} show{selectedEvents.length !== 1 ? "s" : ""}
          </div>
          {selectedEvents.length === 0 ? (
            <div className="body">No shows on this date.</div>
          ) : (
            <div className="list">
              {selectedEvents.map(item => (
                <Link
                  key={item.id}
                  to={`/performance/${item.id}`}
                  className="card pad"
                  style={{ display: "block" }}
                >
                  <div style={{ fontWeight: 800, display: "flex", gap: 8, alignItems: "center" }}>
                    <span className="badge" style={{ "--h": stateHue(item.state) }}>
                      {cityCode(item.city)}
                    </span>
                    {item.city}, {item.state}
                  </div>
                  <div className="body">{item.venue}</div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
