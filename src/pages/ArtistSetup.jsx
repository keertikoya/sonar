import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function ArtistSetup(){
  const { state, dispatch, executeAnalysis } = useApp();
  const [name, setName] = useState(state.artist.name);
  const [genre, setGenre] = useState(state.artist.genre);
  const [similar, setSimilar] = useState(state.artist.similar.join(', '));
  
  const [localLoading, setLocalLoading] = useState(false);
  const navigate = useNavigate();

  const onRun = async () => {
    setLocalLoading(true);
    
    // Update the artist info in state
    const artistPayload = { 
      name, 
      genre, 
      similar: similar.split(',').map(s => s.trim()).filter(Boolean) 
    };
    dispatch({ type: 'SET_ARTIST', payload: artistPayload });

    // Trigger the global executeAnalysis function
    await executeAnalysis({ name, genre, similarArtists: similar });

    setLocalLoading(false);
    navigate('/dashboard');
  };

  return (
    <div className="setup-stage">
      {/* Decorative vinyl stack */}
      <div className="vinyl-stack">
        <div className="stacked-vinyl stacked-1"></div>
        <div className="stacked-vinyl stacked-2"></div>
        <div className="stacked-vinyl stacked-3"></div>
      </div>

      {/* Open layout - no container box */}
      <div className="setup-content">
        <div className="title-section">
          <div className="title-accent-bar"></div>
          <h1 className="page-title">
            Set Up Your<br />
            <span className="title-highlight">Profile</span>
          </h1>
        </div>

        <p className="intro-text">
          We'll analyze search demand and venue saturation to find your best cities
        </p>

        <div className="form-layout">
          <div className="field-group">
            <label className="field-label">Artist Name</label>
            <input 
              className="field-input" 
              placeholder="The Longhorns" 
              value={name} 
              onChange={e=>setName(e.target.value)} 
            />
          </div>

          <div className="field-group">
            <label className="field-label">Genre</label>
            <input 
              className="field-input" 
              placeholder="Country" 
              value={genre} 
              onChange={e=>setGenre(e.target.value)} 
            />
          </div>

          <div className="field-group field-wide">
            <label className="field-label">Similar Artists <span className="label-optional">(optional)</span></label>
            <input 
              className="field-input" 
              placeholder="Taylor Swift, Bruno Mars, Beyonce" 
              value={similar} 
              onChange={e=>setSimilar(e.target.value)} 
            />
          </div>
        </div>

        <button className="btn" disabled={localLoading || !name || !genre} onClick={onRun}>
          {localLoading ? 'Analyzing…' : 'Run Analysis'}
        </button>
      </div>

      {/* Decorative elements */}
      <div className="floating-note floating-note-1">♪</div>
      <div className="floating-note floating-note-2">♫</div>
    </div>
  )
}