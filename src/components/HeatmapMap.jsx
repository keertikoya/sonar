import React, { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Circle, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet.heat";

// Fix default icon paths for Leaflet in build environments
import iconUrl from "leaflet/dist/images/marker-icon.png";
import icon2xUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl,
  iconRetinaUrl: icon2xUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

function HeatLayer({ points, options }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !points?.length) return;

    const layer = L.heatLayer(points, options).addTo(map);
    return () => map.removeLayer(layer);
  }, [map, points, options]);

  return null;
}

export default function HeatmapMap({ data = [], onSelectCity }) {
  const center = useMemo(() => [31.9686, -99.9018], []); // Texas-ish center
  const zoom = 5;

  const heatPoints = useMemo(() => {
    if (!data?.length) return [];
    const maxScore = Math.max(...data.map((c) => c.score ?? 0), 1);

    return data
      .filter((c) => Number.isFinite(c.lat) && Number.isFinite(c.lng))
      .map((c) => [
        c.lat,
        c.lng,
        Math.min(1, (c.score ?? 0) / maxScore), // intensity 0..1
      ]);
  }, [data]);

  // memoize options so the effect doesn't recreate the heat layer constantly
  const heatOptions = useMemo(
    () => ({
      radius: 28,
      blur: 22,
      maxZoom: 10,
    }),
    []
  );

  return (
    <div style={{ height: 360, width: "100%" }}>
      <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%", borderRadius: 12 }}>
        <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        <HeatLayer points={heatPoints} options={heatOptions} />

        {data.map((c) => (
          <React.Fragment key={c.id ?? `${c.lat}-${c.lng}-${c.city}`}>
            <Circle
              center={[c.lat, c.lng]}
              radius={Math.max(10000, (c.score ?? 0) * 12000)}
              pathOptions={{ color: "rgba(255, 122, 0, 0.6)" }}
            />
            <Marker position={[c.lat, c.lng]} eventHandlers={{ click: () => onSelectCity?.(c) }}>
              <Popup>
                <div style={{ fontWeight: 700 }}>
                  {c.city}, {c.state}
                </div>
                <div>Score {(c.score ?? 0).toFixed(1)}</div>
              </Popup>
            </Marker>
          </React.Fragment>
        ))}
      </MapContainer>
    </div>
  );
}
