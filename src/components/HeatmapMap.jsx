
import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default icon paths for Leaflet in build environments
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import icon2xUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({ iconUrl, iconRetinaUrl: icon2xUrl, shadowUrl, iconSize:[25,41], iconAnchor:[12,41] });
L.Marker.prototype.options.icon = DefaultIcon;

export default function HeatmapMap({ data = [], onSelectCity }){
  const center = useMemo(()=> ({ lat: 31.9686, lng: -99.9018 }), []); // Texas-ish center
  const zoom = 5;

  return (
    <div style={{ height: 360, width: '100%' }}>
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%', borderRadius: 12 }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {data.map(c => (
          <React.Fragment key={c.id}>
            <Circle center={[c.lat, c.lng]} radius={Math.max(10000, c.score * 12000)} pathOptions={{ color: 'rgba(255, 122, 0, 0.6)' }} />
            <Marker position={[c.lat, c.lng]} eventHandlers={{ click: () => onSelectCity?.(c) }}>
              <Popup>
                <div style={{fontWeight:700}}>{c.city}, {c.state}</div>
                <div>Score {c.score.toFixed(1)}</div>
              </Popup>
            </Marker>
          </React.Fragment>
        ))}
      </MapContainer>
    </div>
  )
}
