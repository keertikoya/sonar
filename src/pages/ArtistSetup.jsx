import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function ArtistSetup(){
  // Note: We now pull 'executeAnalysis' directly from context
  const { state, dispatch, executeAnalysis } = useApp();
  const [name, setName] = useState(state.artist.name);
  const [genre, setGenre] = useState(state.artist.genre);
  const [similar, setSimilar] = useState(state.artist.similar.join(', '));
  
  // We can use the global loading state or keep a local one for the button
  const [localLoading, setLocalLoading] = useState(false);
  const navigate = useNavigate();

  const onRun = async () => {
    setLocalLoading(true);
    
    // 1. Update the artist info in state
    const artistPayload = { 
      name, 
      genre, 
      similar: similar.split(',').map(s => s.trim()).filter(Boolean) 
    };
    dispatch({ type: 'SET_ARTIST', payload: artistPayload });

    // 2. Trigger the global executeAnalysis function
    // This handles the runAnalysis call and the dispatching for you
    await executeAnalysis({ name, genre, similarArtists: similar });

    setLocalLoading(false);
    navigate('/dashboard');
  };

  return (
    <div className="container" style={{ paddingTop: 16 }}>
      <div className="h1" style={{ marginBottom: 8 }}>Artist Setup</div>
      <div className="body" style={{ marginBottom: 24 }}>We’ll analyze search demand and venue saturation to find your best cities.</div>

      <div className="stack">
        <label className="body">Band / Artist Name</label>
        <input className="input" placeholder="e.g., The Longhorns" value={name} onChange={e=>setName(e.target.value)} />

        <label className="body">Primary Genre</label>
        <input className="input" placeholder="e.g., indie rock" value={genre} onChange={e=>setGenre(e.target.value)} />

        <label className="body">Similar Artists (comma-separated, optional)</label>
        <input className="input" placeholder="e.g., Spoon, Snail Mail" value={similar} onChange={e=>setSimilar(e.target.value)} />

        <button className="btn" disabled={localLoading || !name || !genre} onClick={onRun}>
          {localLoading ? 'Analyzing…' : 'Run Analysis'}
        </button>
      </div>
    </div>
  )
}