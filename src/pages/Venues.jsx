
import React, { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { getVenuesByCity } from '../services/venuesService'

export default function Venues(){
  const { state, dispatch } = useApp();
  const { cityId } = useParams();
  const navigate = useNavigate();
  const city = useMemo(()=> state.analysis.cities.find(c=>c.id===cityId), [state.analysis.cities, cityId]);
  const venues = getVenuesByCity(city?.city);

  const addToTour = (venue) => {
    const id = `${city.id}-${venue.id}-${Date.now()}`;
    dispatch({ type: 'ADD_PERFORMANCE', payload: { id, city: city.city, state: city.state, venue: venue.name, date: null, setlist: [] } });
    navigate('/tour');
  };

  if(!city) return <div className="container">Not found</div>

  return (
    <div className="container" style={{ paddingTop: 16 }}>
      <div className="h1" style={{ marginBottom: 8 }}>{city.city}: Venues</div>
      <div className="list">
        {venues.map(item => (
          <div key={item.id} className="card" style={{ padding: 12 }}>
            <div style={{ fontWeight:700 }}>{item.name}</div>
            <div className="body">Capacity: {item.capacity || '—'} · Genre fit: {item.genreFit || '—'} · Typical: {(item.typicalDays||[]).join(', ') || '—'}</div>
            <div className="row" style={{ justifyContent:'space-between' }}>
              {item.contact && <a href={item.contact.startsWith('http')? item.contact : `https://${item.contact}`} target="_blank" rel="noreferrer" style={{ color:'var(--accent)', fontWeight:600 }}>{item.contact}</a>}
              <button className="btn" onClick={()=>addToTour(item)}>Add to Tour</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
