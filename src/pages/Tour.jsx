import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";

export default function Tour() {
  const { state, dispatch } = useApp();

  const tours = state.tour.tours || [];
  const activeTourId =
    state.tour.activeTourId || (tours[0] ? tours[0].id : "default-tour");

  const activeTour = tours.find((t) => t.id === activeTourId) || tours[0];

  function createTour() {
    const name = window.prompt("Tour name?");
    if (!name) return;

    const id =
      (typeof crypto !== "undefined" && crypto.randomUUID)
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    dispatch({ type: "ADD_TOUR", payload: { id, name } });
    dispatch({ type: "SET_ACTIVE_TOUR", payload: id });
  }

  const performances = useMemo(() => {
    return [...(state.tour.performances || [])]
      .filter((p) => (p.tourId || activeTourId) === activeTourId)
      .sort((a, b) => (a.date || "").localeCompare(b.date || ""));
  }, [state.tour.performances, activeTourId]);

  return (
    <div className="container" style={{ paddingTop: 16 }}>
      <div
        className="row"
        style={{ justifyContent: "space-between", alignItems: "flex-end", gap: 12 }}
      >
        <div>
          <div className="h1" style={{ marginBottom: 6 }}>
            {activeTour ? activeTour.name : "Tour Timeline"}
          </div>
          <div className="body">View all performances in chronological order.</div>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <select
            className="input"
            value={activeTourId}
            onChange={(e) =>
              dispatch({ type: "SET_ACTIVE_TOUR", payload: e.target.value })
            }
            style={{ width: 240 }}
          >
            {tours.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          <button type="button" className="btn" onClick={createTour}>
            + New Tour
          </button>
        </div>
      </div>

      {performances.length === 0 && (
        <div className="body" style={{ marginTop: 10 }}>
          No performances yet. Add some from a city’s venues list.
        </div>
      )}

      <div className="list" style={{ marginTop: 12 }}>
        {performances.map((item) => (
          <Link
            key={item.id}
            to={`/performance/${item.id}`}
            className="card"
            style={{ padding: 12, display: "block" }}
          >
            <div style={{ fontWeight: 700 }}>
              {item.city}, {item.state}
            </div>
            <div className="body">{item.venue}</div>
            <div className="body">
              {item.date ? item.date : "Pick a date"}
              {item.time ? ` • ${item.time}` : ""}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
