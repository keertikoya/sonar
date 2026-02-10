import React, { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

export default function Tour() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();

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

  const deletePerformance = (id) => {
    if (window.confirm("Delete this performance?")) {
      dispatch({ type: "REMOVE_PERFORMANCE", payload: id });
    }
  };

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
          No performances yet. Add some from a city's venues list.
        </div>
      )}

      <div className="list" style={{ marginTop: 20 }}>
        {performances.map((item) => (
          <div
            key={item.id}
            className="card"
            style={{
              padding: "20px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              transition: "all 0.2s ease",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {/* Left side: clickable info */}
            <Link
              to={`/performance/${item.id}`}
              style={{ flex: 1, textDecoration: "none", color: "var(--primary)" }}
            >
              <div style={{ fontSize: "19px", fontWeight: 700, marginBottom: "6px" }}>
                {item.venue}
              </div>
              <div style={{ fontSize: "14px", color: "#666", marginBottom: "4px" }}>
                {item.city}, {item.state}
              </div>
              <div style={{ fontSize: "14px", color: "#888", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>{item.date ? item.date : "Pick a date"}</span>
                {item.time && (
                  <>
                    <span style={{ color: "#ccc" }}>•</span>
                    <span>{item.time}</span>
                  </>
                )}
              </div>
            </Link>

            {/* Right side: Edit & Delete buttons */}
            <div style={{ display: "flex", gap: 10, marginLeft: 20 }}>
              <button
                className="btn ghost"
                style={{ 
                  padding: "10spx 10px",
                  border: "1px solid #ddd",
                  background: "var(--secondary)",
                  color: "var(--bg)",
                  fontWeight: 600,
                  fontSize: 18
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/performance/${item.id}`);
                }}
              >
                Edit
              </button>
              <button
                className="btn ghost"
                style={{ 
                  padding: "10spx 10px",
                  border: "1px solid #ffdddd",
                  background: "var(--secondary)",
                  color: "var(--bg)",
                  fontWeight: 600,
                  fontSize: 18
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  deletePerformance(item.id);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}