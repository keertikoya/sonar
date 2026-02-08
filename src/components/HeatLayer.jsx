import { useEffect } from "react";
import { useMap } from "react-leaflet";
import "leaflet.heat";
import L from "leaflet";

export default function HeatLayer({ points = [], options = {} }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !points.length) return;

    // Make sure points are [lat, lng, intensity]
    const heatPoints = points.map(p => [p.lat, p.lng, p.score || 0.5]);

    const heat = L.heatLayer(heatPoints, {
      radius: 28,
      blur: 18,
      max: 1,
      gradient: { 0.15: "#ffd7cc", 0.4: "#fda085", 0.75: "#e4572e" },
      ...options
    }).addTo(map);

    return () => { map.removeLayer(heat); };
  }, [map, points, options]);

  return null;
}
