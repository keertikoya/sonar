import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import HeatmapMap from '../components/HeatmapMap'

export default function Dashboard(){
  const { state } = useApp();
  const navigate = useNavigate();

  // Pull from our new state structure
  const { cities, isLoading } = state.analysis;

  const goCity = (c) => navigate(`/venues/${c.id}`);

  // 1. Loading State: Shows while the Vite Proxy/SerpAPI is working
  if (isLoading) {
    return (
      <div className="container" style={{ textAlign: 'center', paddingTop: 60 }}>
        <div className="spinner" style={{ marginBottom: 16 }}></div>
        <div className="h2">Analyzing Market Demand...</div>
        <div className="body" style={{ color: 'var(--accent)' }}>
          Fetching Google Trends for {state.artist.name}
        </div>
      </div>
    );
  }

  // 2. Empty State: If someone visits the dashboard before running a search
  if (!cities || cities.length === 0) {
    return (
      <div className="container" style={{ textAlign: 'center', paddingTop: 60 }}>
        <div className="h2">No Analysis Found</div>
        <button className="btn" onClick={() => navigate('/setup')} style={{ marginTop: 16 }}>
          Run Analysis
        </button>
      </div>
    );
  }

  console.log("Current Cities in State:", cities);

  return (
    <div className="container" style={{ paddingTop: 16 }}>
      <div className="h1" style={{ marginBottom: 12 }}>Demand Heatmap: {state.artist.name}</div>
      <div className="card" style={{ padding: 8 }}>
        <HeatmapMap data={cities} onSelectCity={goCity} />
      </div>

      <div className="h2" style={{ marginTop: 12 }}>Ranked Cities</div>
      <div className="list" style={{ marginTop: 8 }}>
        {cities.map((item, index) => (
          <div key={item.id} className="card" style={{ padding: 12, display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width: 28, textAlign:'center', color:'var(--accent)', fontWeight:800 }}>{index+1}</div>
            <div style={{ flex: 1 }}>
              {/* Added optional chaining and defaults to prevent crashes */}
              <div style={{ fontWeight:700 }}>{item.city}, {item.state || 'TX'}</div>
              <div className="body">
                Score {(item.score || 0).toFixed(1)} · 
                Trend {(item.trend || 0).toFixed(1)} · 
                Saturation {(item.saturation || 0).toFixed(1)}
              </div>
            </div>
            <button className="btn" onClick={()=>goCity(item)}>Open</button>
          </div>
        ))}
      </div>
    </div>
  )
}