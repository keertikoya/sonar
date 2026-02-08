import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import cityData from '../data/cities.json';

// Helper to convert ABBR to Full Name
const stateMap = {
  'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
  'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia',
  'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
  'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
  'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri',
  'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey',
  'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio',
  'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
  'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont',
  'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming'
};

// 1. BUILD THE LOOKUP TABLE
const cityLookup = {};
cityData.forEach(c => {
  // Key format: "houston, texas"
  const key = `${c.city}, ${c.state}`.toLowerCase();
  cityLookup[key] = { lat: parseFloat(c.latitude), lng: parseFloat(c.longitude) };
});

export default function HeatmapMap({ data = [], onSelectCity }){
  const center = [39.8283, -98.5795]; 

  return (
    <div style={{ height: 400, width: '100%' }}>
      <MapContainer center={center} zoom={4} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        
        {data.map(item => {
          // Normalize the incoming API data (e.g., "Houston, TX")
          const statePart = item.state?.toUpperCase();
          const fullState = stateMap[statePart] || item.state;
          const lookupKey = `${item.city}, ${fullState}`.toLowerCase();
          
          const coords = cityLookup[lookupKey];

          if (!coords) return null;

          return (
            <React.Fragment key={item.id}>
              <Circle 
                center={[coords.lat, coords.lng]} 
                radius={Math.max(20000, (item.score || 0) * 1500)} 
                pathOptions={{
                  color: '#58765d',
                  fillColor: '#58765d',
                  fillOpacity: 0.35
                }}                
              />
              <Marker position={[coords.lat, coords.lng]} eventHandlers={{ click: () => onSelectCity?.(item) }}>
                <Popup>
                  <strong>{item.city}, {item.state}</strong><br/>
                  Demand Score: {item.score}
                </Popup>
              </Marker>
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
}