import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { searchVenues } from '../services/venuesService';

function IconButton({ title, onClick, children, variant = 'ghost' }) {
  const cls = variant === 'primary' ? 'iconBtn iconBtn--primary' : 'iconBtn';
  return (
    <button className={cls} title={title} onClick={onClick} type="button">
      {children}
    </button>
  );
}

export default function Venues() {
  const { state, dispatch } = useApp();
  const { cityId } = useParams();
  const navigate = useNavigate();

  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  
  const [selectedType, setSelectedType] = useState('All');
  const [minRating, setMinRating] = useState(0);

  const city = useMemo(
    () => state.analysis.cities.find(c => c.id === cityId),
    [state.analysis.cities, cityId]
  );

  const venueTypes = useMemo(() => {
    const types = new Set(venues.map(v => v.type).filter(Boolean));
    return ['All', ...Array.from(types)];
  }, [venues]);

  useEffect(() => {
    const loadData = async () => {
      if (city?.lat && city?.lng) {
        setLoading(true);
        try {
          const results = await searchVenues(city.city, city.state, city.lat, city.lng);
          setVenues(results);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
    };
    loadData();
  }, [city]);

  const filteredVenues = useMemo(() => {
    return venues.filter(v => {
      const matchesQuery = v.name.toLowerCase().includes(query.toLowerCase());
      const matchesType = selectedType === 'All' || v.type === selectedType;
      const matchesRating = (v.rating || 0) >= minRating;
      return matchesQuery && matchesType && matchesRating;
    });
  }, [venues, query, selectedType, minRating]);

  const addToTour = (venue) => {
    const performanceId = `perf-${Date.now()}`;
    dispatch({ 
      type: 'ADD_PERFORMANCE', 
      payload: { 
        id: performanceId, 
        city: city.city, 
        state: city.state, 
        venue: venue.name, 
        address: venue.address,
        date: null, 
        setlist: [],
        tourId: state.tour.activeTourId,
      } 
    });
    navigate(`/performance/${performanceId}`);
  };

  if (!city) return <div className="container">City not found.</div>;

  return (
    <div className="container" style={{ paddingTop: 16, paddingBottom: 40 }}>
      <div style={{ marginBottom: 20 }}>
        <div className="venuesH1">{city.city} Scout</div>
        <div className="body" style={{ opacity: 0.7 }}>Discovery & Booking</div>
      </div>

      {/* Filter Card */}
      <div className="card" style={{ padding: 20, marginBottom: 24, backgroundColor: '#fff', border: '1px solid #eee' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ flex: 2, minWidth: '200px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', opacity: 0.6 }}>Keyword</div>
              <input
                className="input"
                style={{ margin: 0 }}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search venue names..."
              />
            </div>
            <div style={{ flex: 1, minWidth: '140px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', opacity: 0.6 }}>Min Rating</div>
              <select 
                className="input" 
                style={{ margin: 0 }}
                value={minRating} 
                onChange={(e) => setMinRating(Number(e.target.value))}
              >
                <option value={0}>Any Stars</option>
                <option value={4}>4.0+ Stars</option>
                <option value={4.5}>4.5+ Stars</option>
              </select>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', opacity: 0.6 }}>Venue Type</div>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, scrollbarWidth: 'none' }}>
              {venueTypes.map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  style={{
                    padding: '6px 16px',
                    borderRadius: '30px',
                    border: '1px solid',
                    borderColor: selectedType === type ? '#0077ff' : '#ddd',
                    backgroundColor: selectedType === type ? '#0077ff' : 'transparent',
                    color: selectedType === type ? '#fff' : '#666',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    fontSize: '0.85rem'
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loadingState">Searching {city.city}...</div>
      ) : (
        <>
          <div style={{ marginBottom: 12, opacity: 0.6, fontSize: '0.9rem' }}>
            Found {filteredVenues.length} results matching filters
          </div>

          <div className="venuesGrid">
            {filteredVenues.map(v => {
              // Re-implementing the phone formatting logic
              const phoneUrl = v.phone && v.phone !== "No phone listed" 
                ? `tel:${v.phone.replace(/\s/g, '')}` 
                : null;

              return (
                <div key={v.id} className="venueCard" style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ padding: 20, flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: 4 }}>{v.name}</div>
                    <div className="badge" style={{ marginBottom: 12, backgroundColor: '#eef2ff', color: '#4f46e5' }}>{v.type}</div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <div style={{ fontSize: '0.85rem', color: '#666' }}>📍 {v.address}</div>
                      
                      {/* Restore Phone Number Display */}
                      {v.phone && v.phone !== "No phone listed" && (
                        <div style={{ fontSize: '0.85rem', color: '#666' }}>📞 {v.phone}</div>
                      )}
                      
                      {v.rating && (
                        <div style={{ fontSize: '0.85rem', color: '#f59e0b', fontWeight: '600' }}>
                          ⭐ {v.rating} <span style={{ color: '#999', fontWeight: '400' }}>({v.reviews} reviews)</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div style={{ padding: '12px 20px', borderTop: '1px solid #eee', display: 'flex', gap: 8 }}>
                    <button className="btn" style={{ flex: 1, padding: '8px' }} onClick={() => addToTour(v)}>Add to Tour</button>
                    
                    {/* Website Button */}
                    {v.website && (
                      <button className="btn-ghost" title="Website" onClick={() => window.open(v.website, '_blank')}>🌐</button>
                    )}
                    
                    {/* Restore Phone Dial Button */}
                    {phoneUrl && (
                      <button className="btn-ghost" title="Call Venue" onClick={() => window.location.href = phoneUrl}>📞</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}