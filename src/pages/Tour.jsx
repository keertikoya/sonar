import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";

function ymd(d) {
  // local YYYY-MM-DD
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

function CalendarView({ performances }) {
  const today = new Date();
  const [month, setMonth] = useState(() => startOfMonth(today));
  const [selectedDay, setSelectedDay] = useState(() => ymd(today));

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
  const monthEnd = endOfMonth(month);

  // build grid starting Sunday
  const startDow = monthStart.getDay(); // 0=Sun
  const gridStart = addDays(monthStart, -startDow);

  const days = [];
  for (let i = 0; i < 42; i++) {
    const d = addDays(gridStart, i);
    const key = ymd(d);
    const inMonth = d.getMonth() === monthStart.getMonth();
    const isToday = key === ymd(today);
    const isSelected = key === selectedDay;
    const count = eventsByDay.get(key)?.length || 0;

    days.push({ d, key, inMonth, isToday, isSelected, count });
  }

  const selectedEvents = eventsByDay.get(selectedDay) || [];

  const prevMonth = () => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1));
  const nextMonth = () => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1));

  return (
    <div className="tourCalWrap">
      <div className="tourCalHeader">
        <button className="btn ghost" onClick={prevMonth}>←</button>
        <div className="tourCalTitle">
          {month.toLocaleString(undefined, { month: "long", year: "numeric" })}
        </div>
        <button className="btn ghost" onClick={nextMonth}>→</button>
      </div>

      <div className="tourCalDow">
        {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(x => (
          <div key={x} className="tourCalDowCell">{x}</div>
        ))}
      </div>

      <div className="tourCalGrid">
        {days.map(({ d, key, inMonth, isToday, isSelected, count }) => (
          <button
            key={key}
            className={[
              "tourCalCell",
              inMonth ? "" : "muted",
              isToday ? "today" : "",
              isSelected ? "selected" : ""
            ].join(" ")}
            onClick={() => setSelectedDay(key)}
          >
            <div className="tourCalDayNum">{d.getDate()}</div>
            {count > 0 && (
              <div className="tourCalDots">
                {Array.from({ length: Math.min(3, count) }).map((_, i) => (
                  <span key={i} className="tourCalDot" />
                ))}
                {count > 3 && <span className="tourCalMore">+{count - 3}</span>}
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="tourCalDayPanel">
        <div className="h3" style={{ marginBottom: 8 }}>
          {selectedDay} • {selectedEvents.length} show{selectedEvents.length === 1 ? "" : "s"}
        </div>

        {selectedEvents.length === 0 ? (
          <div className="body">No shows on this date.</div>
        ) : (
          <div className="list">
            {selectedEvents.map((item) => (
              <Link key={item.id} to={`/performance/${item.id}`} className="card" style={{ padding: 12, display: "block" }}>
                <div style={{ fontWeight: 700 }}>{item.city}, {item.state}</div>
                <div className="body">{item.venue}</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Tour() {
  const { state } = useApp();
  const [view, setView] = useState("timeline"); // "timeline" | "calendar"

  const performances = useMemo(() => {
    return [...state.tour.performances].sort((a, b) => (a.date || "").localeCompare(b.date || ""));
  }, [state.tour.performances]);

  return (
    <div className="container" style={{ paddingTop: 16 }}>
      <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-end", gap: 12 }}>
        <div>
          <div className="h1" style={{ marginBottom: 6 }}>Tour Overview</div>
          <div className="body">View your tour as a timeline or a calendar.</div>
        </div>

        <div className="seg">
          <button className={`segBtn ${view === "timeline" ? "active" : ""}`} onClick={() => setView("timeline")}>
            Timeline
          </button>
          <button className={`segBtn ${view === "calendar" ? "active" : ""}`} onClick={() => setView("calendar")}>
            Calendar
          </button>
        </div>
      </div>

      {performances.length === 0 && <div className="body" style={{ marginTop: 10 }}>No performances yet. Add some from a city’s venues list.</div>}

      {view === "timeline" ? (
        <div className="list" style={{ marginTop: 12 }}>
          {performances.map((item) => (
            <Link key={item.id} to={`/performance/${item.id}`} className="card" style={{ padding: 12, display: "block" }}>
              <div style={{ fontWeight: 700 }}>{item.city}, {item.state}</div>
              <div className="body">{item.venue}</div>
              <div className="body">{item.date || "Pick a date"}</div>
            </Link>
          ))}
        </div>
      ) : (
        <div style={{ marginTop: 12 }}>
          <CalendarView performances={performances} />
        </div>
      )}
    </div>
  );
}
