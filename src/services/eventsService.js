import { serpapi } from './serpapi';

// Try Google Events (SerpAPI), then Eventbrite API (if token), then fallback sample
export async function getVenuesAndEventsByCity({ city, state, artist }){
  const rows = [];
  // 1) Google Events surface
  try{
    const q = `Events in ${city}, ${state}`;
    const ev = await serpapi({ engine: 'google_events', q, hl: 'en', gl: 'us' });
    const events = ev.events_results || [];
    for(const e of events){
      rows.push({
        id: e.event_id || e.title + (e.date?.start_date||'') + (e.venue?.name||''),
        name: e.title,
        venueName: e.venue?.name || e.address,
        date: e.date?.when || e.date?.start_date,
        url: e.link,
        source: 'Google Events'
      })
    }
  }catch(e){ /* ignore */ }

  // 2) Eventbrite API (requires token; optional)
  const token = import.meta.env.VITE_EVENTBRITE_TOKEN;
  if(token){
    try{
      const params = new URLSearchParams({
        'q': artist ? `${artist} ${city}` : city,
        'location.address': `${city}, ${state}`,
        'location.within': '50mi',
        'expand': 'venue,ticket_availability',
        'sort_by': 'date'
      });
      const res = await fetch(`https://www.eventbriteapi.com/v3/events/search/?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if(res.ok){
        const data = await res.json();
        for(const e of (data.events||[])){
          rows.push({
            id: e.id,
            name: e.name?.text,
            venueName: e.venue?.name || (e.venue_id || 'Eventbrite Venue'),
            date: e.start?.local,
            url: e.url,
            source: 'Eventbrite'
          })
        }
      }
    }catch(e){ /* ignore */ }
  }

  // 3) Fallback curated venues
  if(rows.length === 0){
    for(const v of venuesFallback.filter(v=>v.city===city)){
      rows.push({ id: v.id, name: v.name, venueName: v.name, capacity: v.capacity, url: '', source: 'Sample' })
    }
  }

  return rows;
}