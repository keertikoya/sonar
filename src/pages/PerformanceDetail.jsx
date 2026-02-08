
import React, { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function PerformanceDetail(){
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const perf = useMemo(()=> state.tour.performances.find(p=>p.id===id), [state.tour.performances, id]);
  const [date, setDate] = useState(perf?.date || '');
  const [song, setSong] = useState('');

  const [tourId, setTourId] = useState(perf?.tourId || state.tour.activeTourId);
const [title, setTitle] = useState(perf?.title || '');
const [time, setTime] = useState(perf?.time || '');
const [summary, setSummary] = useState(perf?.summary || '');
const [details, setDetails] = useState(perf?.details || '');

const tours = state.tour.tours || [];


  if(!perf) return <div className="container">Not found</div>

  const save = () => {
    dispatch({
    type: 'UPDATE_PERFORMANCE',
    payload: { id, date, tourId, title, time, summary, details },
    });
    navigate('/tour');
  }
  
  const addSong = () => {
    if(!song) return;
    dispatch({ type: 'UPDATE_PERFORMANCE', payload: { id, setlist: [...(perf.setlist||[]), song] } });
    setSong('');
  }

  return (
    <div className="container" style={{ paddingTop: 16 }}>
      <div className="h1" style={{ marginBottom: 8 }}>{perf.city} — {perf.venue}</div>
      <div className="row" style={{ gap: 10, alignItems: "flex-end" }}>
  <div style={{ flex: 1 }}>
    <div className="body">Tour</div>
    <select
      value={tourId}
      onChange={(e) => setTourId(e.target.value)}
      className="input"
    >
      {(state.tour.tours || []).map(t => (
        <option key={t.id} value={t.id}>{t.name}</option>
      ))}
    </select>
  </div>

  <button
    type="button"
    className="btn"
    onClick={createTourInline}
  >
    + New Tour
  </button>
</div>


<div className="body" style={{ marginTop: 8 }}>Event title (optional)</div>
<input value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g., Austin Night 1" className="input" />

<div className="row" style={{ marginTop: 8, gap: 10 }}>
  <div style={{ flex: 1 }}>
    <div className="body">Date</div>
    <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="input" />
  </div>
  <div style={{ width: 180 }}>
    <div className="body">Time</div>
    <input type="time" value={time} onChange={e=>setTime(e.target.value)} className="input" />
  </div>
</div>

<div className="body" style={{ marginTop: 8 }}>Summary</div>
<input value={summary} onChange={e=>setSummary(e.target.value)} placeholder="Short one-liner about this show" className="input" />

<div className="body" style={{ marginTop: 8 }}>Details</div>
<textarea value={details} onChange={e=>setDetails(e.target.value)} rows={5} className="input"
  placeholder="Load-in, soundcheck, contacts, support acts, notes..." />

      <div className="h3" style={{ marginTop: 8 }}>Setlist</div>
      <div className="list">
        {(perf.setlist||[]).map((s, i)=> <div key={s+i} className="body">{i+1}. {s}</div>)}
      </div>

      <div className="row" style={{ marginTop: 8 }}>
        <input value={song} onChange={e=>setSong(e.target.value)} placeholder="Add song" className="input" style={{ flex: 1 }} />
        <button className="btn" onClick={addSong}>Add</button>
      </div>

      <button className="btn" onClick={save} style={{ marginTop: 12 }}>Save</button>
    </div>
  )
}
