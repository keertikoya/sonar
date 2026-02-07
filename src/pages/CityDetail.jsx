
import React, { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function CityDetail(){
  const { state } = useApp();
  const { cityId } = useParams();
  const navigate = useNavigate();
  const city = useMemo(()=> state.analysis.cities.find(c=>c.id===cityId), [state.analysis.cities, cityId]);
  if(!city) return <div className="container">Not found</div>

  return (
    <div className="container" style={{ paddingTop: 16 }}>
      <div className="h1">{city.city}, {city.state}</div>
      <div className="body" style={{ marginBottom: 12 }}>Search Score {city.score.toFixed(1)} · Trend {city.trend.toFixed(1)} · Saturation {city.saturation.toFixed(1)}</div>

      <div className="card" style={{ padding: 16, marginBottom: 12 }}>
        <div className="h3">Why this city</div>
        <div className="body" style={{ marginTop: 8 }}>
          High interest with {city.tier === 'High/Low' ? 'low' : 'comparable'} venue saturation. Genre alignment: {(city.genreAlignment ?? 0.6).toFixed(1)}.
        </div>
      </div>

      <button className="btn" onClick={()=>navigate(`/venues/${cityId}`)}>Explore Venues</button>
    </div>
  )
}
