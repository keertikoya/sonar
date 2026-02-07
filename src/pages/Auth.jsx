
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function Auth(){
  const { dispatch } = useApp();
  const navigate = useNavigate();
  const start = () => {
    dispatch({ type: 'LOGIN', payload: { id: 'demo', name: 'Demo User' } });
    navigate('/setup');
  }
  return (
    <div className="container" style={{minHeight:'80vh',display:'grid',placeItems:'center'}}>
      <div className="stack" style={{alignItems:'center'}}>
        <div className="h1" style={{ color: 'var(--primary)', fontSize: 34 }}>Artist Venue</div>
        <div className="body">Tour where you're already wanted.</div>
        <button className="btn" onClick={start} style={{ marginTop: 16 }}>Get Started</button>
      </div>
    </div>
  )
}
