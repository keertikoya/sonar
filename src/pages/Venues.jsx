import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { searchVenues } from '../services/venuesService';

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
        tourId: state.tour.activeTourId
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

      {/* FILTERS */}
      <div className="card pad" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ flex: 2, minWidth: 200 }}>
              <div className="venuesFilterLabel">Keyword</div>
              <input
                className="input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search venue names…"
              />
            </div>

            <div style={{ flex: 1, minWidth: 140 }}>
              <div className="venuesFilterLabel">Min Rating</div>
              <select
                className="input"
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
            <div className="venuesFilterLabel">Venue Type</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {venueTypes.map(type => {
                const active = selectedType === type;
                return (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    style={{
                      padding: '6px 16px',
                      borderRadius: 999,
                      border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                      background: active ? 'rgba(42,106,247,0.12)' : '#fff',
                      color: active ? 'var(--accent)' : 'var(--text)',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="body">Searching {city.city}…</div>
      ) : (
        <>
          <div className="body" style={{ marginBottom: 12, opacity: 0.7 }}>
            Found {filteredVenues.length} results
          </div>

          <div className="venuesGrid">
            {filteredVenues.map(v => (
              <div
                key={v.id}
                className="venueCard"
                style={{
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {/* CONTENT (flexes to equal height) */}
                <div style={{ padding: 20, flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: 4 }}>
                    {v.name}
                  </div>

                  <div
                    className="badge"
                    style={{
                      marginBottom: 12,
                      background: 'rgba(42,106,247,0.12)',
                      color: 'var(--accent)',
                      borderColor: 'rgba(42,106,247,0.35)'
                    }}
                  >
                    {v.type}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div className="body">📍 {v.address}</div>

                    {v.phone && v.phone !== 'No phone listed' && (
                      <div className="body">📞 {v.phone}</div>
                    )}

                    {v.rating && (
                      <div style={{ fontSize: '0.85rem', color: '#f59e0b', fontWeight: 700 }}>
                        ⭐ {v.rating}{' '}
                        <span style={{ fontWeight: 400, color: 'var(--muted)' }}>
                          ({v.reviews} reviews)
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* FOOTER (always aligned) */}
                <div
                  style={{
                    padding: '12px 20px',
                    borderTop: '1px solid var(--border)',
                    display: 'flex',
                    gap: 8
                  }}
                >
                  <button
                    className="btn"
                    style={{ flex: 1, padding: 10 }}
                    onClick={() => addToTour(v)}
                  >
                    Add to Tour
                  </button>

                  {v.website && (
                    <button
                      className="btn ghost"
                      title="Website"
                      onClick={() => window.open(v.website, '_blank')}
                    >
                      🌐
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
