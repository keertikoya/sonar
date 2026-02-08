import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function Auth(){
  const { dispatch } = useApp();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const start = () => {
    dispatch({ type: 'LOGIN', payload: { id: 'demo', name: 'Demo User' } });
    navigate('/setup');
  }

  return (
    <div className="vinyl-hero">
      {/* Large vinyl record - main visual */}
      <div className={`vinyl-disc ${mounted ? 'vinyl-disc--spin' : ''}`}>
        <div className="vinyl-grooves">
          {[...Array(40)].map((_, i) => (
            <div key={i} className="groove" style={{ '--i': i }}></div>
          ))}
        </div>
        <div className="vinyl-center-label">
          <div className="label-text">Artist Venue</div>
          <div className="label-subtext">Data-Driven Touring</div>
        </div>
      </div>

      {/* Main content - no boxes */}
      <div className={`hero-content ${mounted ? 'hero-content--visible' : ''}`}>
        <h1 className="hero-title">
          Artist<br />
          <span className="hero-title-emphasis">Venue</span>
        </h1>
        
        <p className="hero-subtitle">
          Tour where you're already wanted
        </p>
        
        <p className="hero-description">
          Stop guessing. Start selling out. Find cities actively searching for your sound.
        </p>

        <button className="cta-button" onClick={start}>
          <span>Analyze Your Market</span>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M4 10H16M16 10L11 5M16 10L11 15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Decorative elements */}
      <div className="vinyl-texture"></div>
      <div className="tone-arm"></div>
    </div>
  )
}