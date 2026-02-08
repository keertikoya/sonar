import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { searchVenues } from '../services/venuesService';

// UI Components
function IconButton({ title, onClick, children, variant = 'ghost', disabled = false }) {
  const cls = variant === 'primary' ? 'iconBtn iconBtn--primary' : 'iconBtn';
  return (
    <button className={cls} title={title} onClick={onClick} type="button" disabled={disabled}>
      {children}
    </button>
  );
}

// Main Page Component
export default function Venues() {
  const { state, dispatch } = useApp();
  const { cityId } = useParams();
  const navigate = useNavigate();

  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  // Get current city context from global state
  const city = useMemo(
    () => state.analysis.cities.find(c => c.id === cityId),
    [state.analysis.cities, cityId]
  );

  // 1. Fetch live data from SerpApi
  useEffect(() => {
    if (city?.city) {
      setLoading(true);
      searchVenues(city.city).then(results => {
        setVenues(results);
        setLoading(false);
      });
    }
  }, [city?.city]);

  // 2. Navigation Handler
  const addToTour = (venue) => {
    if (!city) return;
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
        setlist: [] 
      } 
    });
    navigate('/tour');
  };

  // 3. Search Filtering
  const filteredVenues = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return venues;
    return venues.filter(v => 
      v.name.toLowerCase().includes(q) || 
      v.address.toLowerCase().includes(q)
    );
  }, [venues, query]);

  if (!city) return <div className="container">City context not found.</div>;

  return (
    <div className="container" style={{ paddingTop: 16 }}>
      <div className="venuesHeader">
        <div className="venuesTitleBlock">
          <div className="venuesKicker">Live Scout</div>
          <div className="venuesH1">{city.city} Venues</div>
          <div className="venuesSub">Direct results for {city.city} music venues.</div>
        </div>

        <div className="venuesControls">
          <input
            className="venuesSearch"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search venue name or address..."
          />
        </div>
      </div>

      {loading ? (
        <div className="loadingState">Gathering venue data...</div>
      ) : (
        <>
          <div className="venuesMetaRow">
            <div className="venuesMetaText">Found <b>{filteredVenues.length}</b> live music spots</div>
          </div>

          <div className="venuesGrid">
            {filteredVenues.map(v => {
              const phoneUrl = v.phone && v.phone !== "No phone listed" 
                ? `tel:${v.phone.replace(/\s/g, '')}` 
                : null;

              return (
                <div key={v.id} className="venueCard" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div className="venueCardTop" style={{ padding: '20px' }}>
                    <div className="venueCardTitle" style={{ fontSize: '1.25rem', marginBottom: '4px' }}>{v.name}</div>
                    <div className="badge badge--soft" style={{ marginBottom: '12px' }}>{v.type}</div>
                    
                    <div className="venueSummary">
                      <div className="venueSummaryItem" style={{ marginBottom: '6px', fontSize: '0.9rem', color: '#666' }}>📍 {v.address}</div>
                      {v.phone && <div className="venueSummaryItem" style={{ marginBottom: '6px', fontSize: '0.9rem' }}>📞 {v.phone}</div>}
                      {v.rating && (
                        <div className="venueSummaryItem" style={{ fontSize: '0.9rem', fontWeight: '500', color: '#f59e0b' }}>
                          ⭐ {v.rating} <span style={{ color: '#999', fontWeight: '400' }}>({v.reviews} reviews)</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="venueActions" style={{ padding: '12px 16px', borderTop: '1px solid #eee' }}>
                    {v.website && (
                      <IconButton 
                        title="Website" 
                        onClick={() => window.open(v.website, '_blank')}
                      >
                        🌐 Website
                      </IconButton>
                    )}
                    
                    {phoneUrl && (
                      <IconButton 
                        title="Call" 
                        onClick={() => window.location.href = phoneUrl}
                      >
                        📞 Call
                      </IconButton>
                    )}

                    <IconButton
                      variant="primary"
                      title="Add to tour"
                      onClick={(e) => {
                        e.stopPropagation();
                        addToTour(v);
                      }}
                    >
                      ➕ Add to Tour
                    </IconButton>
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