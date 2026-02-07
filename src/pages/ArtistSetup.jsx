
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { runAnalysis } from '../services/analysisService'

export default function ArtistSetup(){
  const { state, dispatch } = useApp();
  const [name, setName] = useState(state.artist.name);
  const [genre, setGenre] = useState(state.artist.genre);
  const [similar, setSimilar] = useState(state.artist.similar.join(', '));
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onRun = async () => {
    setLoading(true);
    dispatch({ type: 'SET_ARTIST', payload: { name, genre, similar: similar.split(',').map(s => s.trim()).filter(Boolean) } });
    const analysis = await runAnalysis({ name, genre, similarArtists: similar });
    dispatch({ type: 'SET_ANALYSIS', payload: analysis });
    setLoading(false);
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

        <button className="btn" disabled={loading || !name || !genre} onClick={onRun}>
          {loading ? 'Analyzing…' : 'Run Analysis'}
        </button>
      </div>
    </div>
  )
}
