
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

  if(!perf) return <div className="container">Not found</div>

  const save = () => {
    dispatch({ type: 'UPDATE_PERFORMANCE', payload: { id, date } });
    navigate(-1);
  }
  const addSong = () => {
    if(!song) return;
    dispatch({ type: 'UPDATE_PERFORMANCE', payload: { id, setlist: [...(perf.setlist||[]), song] } });
    setSong('');
  }

  return (
    <div className="container" style={{ paddingTop: 16 }}>
      <div className="h1" style={{ marginBottom: 8 }}>{perf.city} — {perf.venue}</div>

      <div className="body">Date (YYYY-MM-DD)</div>
      <input
        type="date"
        value={date}
        onChange={e=>setDate(e.target.value)}
        className="input"
      />

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
