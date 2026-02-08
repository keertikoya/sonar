import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { searchTracks } from '../services/musicService';

export default function PerformanceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useApp();

  const perf = useMemo(
    () => state.tour.performances.find(p => p.id === id),
    [state.tour.performances, id]
  );

  const [date, setDate] = useState(perf?.date || '');
  const [song, setSong] = useState('');
  const [tourId, setTourId] = useState(perf?.tourId || state.tour.activeTourId);
  const [title, setTitle] = useState(perf?.title || '');
  const [time, setTime] = useState(perf?.time || '');
  const [summary, setSummary] = useState(perf?.summary || '');
  const [details, setDetails] = useState(perf?.details || '');

  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const tours = state.tour.tours || [];

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (song.trim().length > 2) {
        const results = await searchTracks(song);
        setSuggestions(results);
        setShowDropdown(true);
      } else {
        setSuggestions([]);
        setShowDropdown(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [song]);

  if (!perf) return <div className="container">Not found</div>;

  const save = () => {
    dispatch({
      type: 'UPDATE_PERFORMANCE',
      payload: {
        id,
        date,
        tourId,
        title,
        time,
        summary,
        details,
        setlist: perf.setlist || []
      }
    });
    navigate('/tour');
  };

  const addSong = (selected) => {
    const name = typeof selected === 'string' ? selected : song;
    if (!name.trim()) return;

    dispatch({
      type: 'UPDATE_PERFORMANCE',
      payload: {
        id,
        setlist: [...(perf.setlist || []), name.trim()]
      }
    });

    setSong('');
    setShowDropdown(false);
  };

  const removeSong = (index) => {
    const updated = (perf.setlist || []).filter((_, i) => i !== index);
    dispatch({ type: 'UPDATE_PERFORMANCE', payload: { id, setlist: updated } });
  };

  return (
    <div className="container" style={{ paddingTop: 24, paddingBottom: 64 }}>

      {/* HEADER */}
      <div style={{ marginBottom: 24 }}>
        <div className="h1">{perf.city} — {perf.venue}</div>
        <div className="body" style={{ color: 'var(--secondary)' , fontWeight: 800}}>
          Performance details & setlist
        </div>
      </div>

      {/* TOUR + TITLE */}
      <div className="card pad" style={{ marginBottom: 16 }}>
        <div className="h3">Event Info</div>

        <div className="body">Tour</div>
        <select value={tourId} onChange={e => setTourId(e.target.value)} className="input">
          {tours.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>

        <div className="body" style={{ marginTop: 10 }}>Event title</div>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="e.g., Austin Night 1"
          className="input"
        />
      </div>

      {/* DATE / TIME */}
      <div className="card pad" style={{ marginBottom: 16 }}>
        <div className="h3">Schedule</div>

        <div className="row" style={{ gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div className="body">Date</div>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input" />
          </div>
          <div style={{ width: 180 }}>
            <div className="body">Time</div>
            <input type="time" value={time} onChange={e => setTime(e.target.value)} className="input" />
          </div>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="card pad" style={{ marginBottom: 16 }}>
        <div className="h3">Description</div>

        <div className="body">Summary</div>
        <input
          value={summary}
          onChange={e => setSummary(e.target.value)}
          placeholder="Short one-liner"
          className="input"
        />

        <div className="body" style={{ marginTop: 10 }}>Details</div>
        <textarea
          value={details}
          onChange={e => setDetails(e.target.value)}
          rows={4}
          className="input"
        />
      </div>

      {/* SETLIST */}
      <div className="card pad" style={{ marginBottom: 24 }}>
        <div className="h3">Setlist</div>

        <div className="list" style={{ marginTop: 8 }}>
          {(perf.setlist || []).map((s, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 16px',
                borderRadius: 12,
                background: 'rgba(131,166,197,0.08)',
                border: '1px solid rgba(131,166,197,0.25)'
              }}
            >
              <div style={{ width: 32, fontWeight: 800, color: 'var(--secondary)' }}>
                {String(i + 1).padStart(2, '0')}
              </div>
              <div style={{ flex: 1, fontWeight: 600 }}>{s}</div>
              <button
                onClick={() => removeSong(i)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: 18,
                  cursor: 'pointer',
                  color: '#ff6b6b'
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>

        {/* ADD SONG */}
        <div className="row" style={{ marginTop: 12, gap: 8, position: 'relative' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              value={song}
              onChange={e => setSong(e.target.value)}
              placeholder="Search for a song…"
              className="input"
              onKeyDown={e => e.key === 'Enter' && addSong()}
            />

            {showDropdown && suggestions.length > 0 && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: 0,
                  right: 0,
                  background: '#0f1720',
                  borderRadius: 12,
                  border: '1px solid rgba(131,166,197,0.35)',
                  boxShadow: '0 16px 40px rgba(0,0,0,0.35)',
                  zIndex: 20
                }}
              >
                {suggestions.map((s, idx) => (
                  <div
                    key={idx}
                    onClick={() => addSong(`${s.title} - ${s.artist}`)}
                    style={{
                      padding: '10px 14px',
                      cursor: 'pointer',
                      color: '#ffffff',
                      borderBottom: '1px solid rgba(255,255,255,0.06)'
                    }}
                  >
                    <div style={{ fontWeight: 700 }}>{s.title}</div>
                    <div style={{ fontSize: 12, opacity: 0.75 }}>{s.artist}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button className="btn" onClick={() => addSong()}>
            Add
          </button>
        </div>
      </div>

      {/* SAVE */}
      <button
        className="btn"
        onClick={save}
        style={{
          width: '100%',
          background: 'linear-gradient(135deg, #83a6c5, #587fa3)',
          color: 'var(--bg)',
          fontWeight: 800,
          fontSize: 20,
          boxShadow: '0 12px 30px rgba(131,166,197,0.35)'
        }}
      >
        Save Performance
      </button>
    </div>
  );
}
