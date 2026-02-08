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

function cityCode(city = "") {
  const clean = city.replace(/[^a-zA-Z]/g, "").toUpperCase();
  if (clean.length >= 3) return clean.slice(0, 3);
  return (clean + "XXX").slice(0, 3);
}

function stateHue(state = "") {
  const s = String(state || "").toUpperCase();
  let hash = 0;
  for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
<<<<<<< HEAD
  return (hash % 280) + 40; 
=======
  return (hash % 280) + 40; // 40..319
>>>>>>> 6454a2f40b7053b2eec6c12c1c59eedba47d9a43
}


function CalendarView({ performances }) {
  const today = new Date();
  const [month, setMonth] = useState(() => startOfMonth(today));
  const [selectedDay, setSelectedDay] = useState(() => ymd(today));
  const [selectedEventId, setSelectedEventId] = useState(null); // <-- ADD HERE

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

  const startDow = monthStart.getDay(); 
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
const primary =
  selectedEvents.find(e => e.id === selectedEventId) || selectedEvents[0] || null;


  const prevMonth = () => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1));
  const nextMonth = () => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1));

  return (
  <div className="tourCalWrap">
    <div className="tourCalLeft">
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
  {days.map(({ d, key, inMonth }) => {
    const dayEvents = eventsByDay.get(key) || [];

    return (
      <div key={key} className={`tourCalCell ${inMonth ? "" : "muted"} ${key == selectedDay ? "selected" : ""}`}
      onClick={() => setSelectedDay(key)}>
        <div className="tourCalCellHeader">
          <span className="tourCalDayNum">{d.getDate()}</span>
        </div>

        <div className="tourCalEvents">
          {dayEvents.slice(0, 2).map((ev) => (
  <button
    key={ev.id}
    type="button"
    className="tourCalEvent"
    style={{ "--h": stateHue(ev.state) }}
    onClick={(e) => {
      e.stopPropagation();
      setSelectedDay(key);
<<<<<<< HEAD
      setSelectedEventId(ev.id);
=======
      setSelectedEventId(ev.id); 
>>>>>>> 6454a2f40b7053b2eec6c12c1c59eedba47d9a43
    }}
    title={`${ev.city}, ${ev.state} • ${ev.venue}`}
  >
    <span className="tourCalEventCity">{cityCode(ev.city)}</span>
    <span className="tourCalEventName">{ev.city}</span>
  </button>
))}


          {dayEvents.length > 2 && (
            <div className="tourCalMoreLine">
              +{dayEvents.length - 2} more
            </div>
          )}
        </div>
      </div>
    );
  })}
</div>

    </div>

    <div className="tourCalRight">
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
                <div style={{ fontWeight: 800, display: "flex", gap: 10, alignItems: "center" }}>
                  <span className="tourCityPill" style={{ "--h": stateHue(item.state) }}>
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

export default function Tour() {
  const { state, dispatch } = useApp();
  const [view, setView] = useState("timeline");

  const tours = state.tour.tours || [];
  const activeTourId = state.tour.activeTourId;

  const performances = useMemo(() => {
    return [...state.tour.performances]
      .filter(p => p.tourId === activeTourId)
      .sort((a, b) => (a.date || "").localeCompare(b.date || ""));
  }, [state.tour.performances, activeTourId]);

  function createTour() {
    const name = prompt("Tour name?");
    if (!name) return;
    const id = crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
    dispatch({ type: "ADD_TOUR", payload: { id, name } });
    dispatch({ type: "SET_ACTIVE_TOUR", payload: id });
  }

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
