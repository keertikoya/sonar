import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";

export default function Tour() {
  const { state } = useApp();
  const activeTourId = state.tour.activeTourId;

  const performances = useMemo(() => {
    return [...state.tour.performances]
      .filter(p => p.tourId === activeTourId)
      .sort((a, b) => (a.date || "").localeCompare(b.date || ""));
  }, [state.tour.performances, activeTourId]);

  return (
    <div className="container" style={{ paddingTop: 16 }}>
      <div className="h1" style={{ marginBottom: 6 }}>Tour Timeline</div>
      <div className="body">View all performances in chronological order.</div>

      {performances.length === 0 && (
        <div className="body" style={{ marginTop: 10 }}>
          No performances yet. Add some from a city’s venues list.
        </div>
      )}

      <div className="list" style={{ marginTop: 12 }}>
        {performances.map(item => (
          <Link
            key={item.id}
            to={`/performance/${item.id}`}
            className="card"
            style={{ padding: 12, display: "block" }}
          >
            <div style={{ fontWeight: 700 }}>{item.city}, {item.state}</div>
            <div className="body">{item.venue}</div>
            <div className="body">{item.date || "Pick a date"}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
