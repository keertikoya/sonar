
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import HeatmapMap from '../components/HeatmapMap'

export default function Dashboard(){
  const { state } = useApp();
  const cities = state.analysis.cities;
  const navigate = useNavigate();

  const goCity = (c) => navigate(`/city/${c.id}`);

  return (
    <div className="container" style={{ paddingTop: 16 }}>
      <div className="h1" style={{ marginBottom: 12 }}>Demand Heatmap</div>
      <div className="card" style={{ padding: 8 }}>
        <HeatmapMap data={cities} onSelectCity={goCity} />
      </div>

      <div className="h2" style={{ marginTop: 12 }}>Ranked Cities</div>
      <div className="list" style={{ marginTop: 8 }}>
        {cities.map((item, index) => (
          <div key={item.id} className="card" style={{ padding: 12, display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width: 28, textAlign:'center', color:'var(--accent)', fontWeight:800 }}>{index+1}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight:700 }}>{item.city}, {item.state}</div>
              <div className="body">Score {item.score.toFixed(1)} · Trend {item.trend.toFixed(1)} · Saturation {item.saturation.toFixed(1)}</div>
            </div>
            <button className="btn" onClick={()=>goCity(item)}>Open</button>
          </div>
        ))}
      </div>
    </div>
  )
}
