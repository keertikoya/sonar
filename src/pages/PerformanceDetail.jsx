import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { searchTracks } from '../services/musicService'; 

export default function PerformanceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useApp();

  const perf = useMemo(() => 
    state.tour.performances.find(p => p.id === id), 
    [state.tour.performances, id]
  );

  // Form State
  const [date, setDate] = useState(perf?.date || '');
  const [song, setSong] = useState('');
  const [tourId, setTourId] = useState(perf?.tourId || state.tour.activeTourId);
  const [title, setTitle] = useState(perf?.title || '');
  const [time, setTime] = useState(perf?.time || '');
  const [summary, setSummary] = useState(perf?.summary || '');
  const [details, setDetails] = useState(perf?.details || '');

  // Search/Autocomplete State
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const tours = state.tour.tours || [];

  // Live search effect with debounce
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
      },
    });
    navigate('/tour');
  };

  const addSong = (selectedName) => {
    const songName = typeof selectedName === 'string' ? selectedName : song;
    if (!songName.trim()) return;

    dispatch({ 
      type: 'UPDATE_PERFORMANCE', 
      payload: { id, setlist: [...(perf.setlist || []), songName.trim()] } 
    });
    
    setSong('');
    setShowDropdown(false);
  };

  const removeSong = (index) => {
    const updated = (perf.setlist || []).filter((_, i) => i !== index);
    dispatch({ type: 'UPDATE_PERFORMANCE', payload: { id, setlist: updated } });
  };

  return (
    <div className="container" style={{ paddingTop: 16, paddingBottom: 60 }}>
      <div className="h1" style={{ marginBottom: 8 }}>{perf.city} — {perf.venue}</div>
      
      <div className="body">Tour</div>
      <select value={tourId} onChange={e => setTourId(e.target.value)} className="input">
        {tours.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
      </select>

      <div className="body" style={{ marginTop: 8 }}>Event title (optional)</div>
      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Austin Night 1" className="input" />

      <div className="row" style={{ marginTop: 8, gap: 10 }}>
        <div style={{ flex: 1 }}>
          <div className="body">Date</div>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input" />
        </div>
        <div style={{ width: 180 }}>
          <div className="body">Time</div>
          <input type="time" value={time} onChange={e => setTime(e.target.value)} className="input" />
        </div>
      </div>

      <div className="body" style={{ marginTop: 8 }}>Summary</div>
      <input value={summary} onChange={e => setSummary(e.target.value)} placeholder="Short one-liner" className="input" />

      <div className="body" style={{ marginTop: 8 }}>Details</div>
      <textarea value={details} onChange={e => setDetails(e.target.value)} rows={5} className="input" placeholder="Notes..." />

      <hr style={{ margin: '24px 0', opacity: 0.1 }} />

      <div className="h3">Setlist</div>
      <div className="list" style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {(perf.setlist || []).map((s, i) => (
          <div 
            key={i} 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              backgroundColor: i % 2 === 0 ? '#f8f9fa' : '#ffffff', 
              padding: '12px 16px', 
              borderRadius: '8px',
              border: '1px solid #eee',
              boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
            }}
          >
            {/* Position Number */}
            <div style={{ 
              width: 30, 
              fontWeight: 'bold', 
              color: '#0077ff',
              fontSize: '0.9rem' 
            }}>
              {String(i + 1).padStart(2, '0')}
            </div>

            {/* Song Info */}
            <div style={{ flex: 1, fontWeight: 500, fontSize: '1rem' }}>
              {s}
            </div>

            {/* Remove Button */}
            <button 
              onClick={() => removeSong(i)} 
              style={{ 
                background: '#fff0f0', 
                color: '#ff4444', 
                border: '1px solid #ffe0e0', 
                borderRadius: '50%', 
                width: 28, 
                height: 28, 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.8rem'
              }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="row" style={{ position: 'relative', gap: 8 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <input 
            value={song} 
            onChange={e => setSong(e.target.value)} 
            placeholder="Search for a song..." 
            className="input" 
            onKeyDown={(e) => e.key === 'Enter' && addSong()}
          />
          
          {showDropdown && suggestions.length > 0 && (
            <div className="autocomplete-dropdown" style={{
              position: 'absolute', bottom: '100%', left: 0, right: 0, 
              background: 'white', border: '1px solid #ddd', borderRadius: 4,
              boxShadow: '0 -4px 10px rgba(0,0,0,0.1)', zIndex: 10
            }}>
              {suggestions.map((s, idx) => (
                <div 
                  key={idx} 
                  className="suggestion-item"
                  style={{ padding: '10px', borderBottom: '1px solid #eee', cursor: 'pointer' }}
                  onClick={() => addSong(`${s.title} - ${s.artist}`)}
                >
                  <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{s.title}</div>
                  <div style={{ fontSize: '0.75rem', color: '#666' }}>{s.artist}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <button className="btn" onClick={() => addSong()}>Add</button>
      </div>

      <button className="btn" onClick={save} style={{ marginTop: 24, width: '100%', background: '#000', color: '#fff' }}>
        Save Performance
      </button>
    </div>
  );
}