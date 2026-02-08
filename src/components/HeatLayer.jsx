import { useEffect } from "react";
import { useMap } from "react-leaflet";
import "leaflet.heat";

export default function HeatLayer({ points = [], options = {} }) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    const heat = window.L.heatLayer(points, {
      radius: 28, blur: 18, max: 1,
      gradient: { 0.15: "#ffd7cc", 0.4: "#fda085", 0.75: "#e4572e" },
      ...options
    }).addTo(map);
    return () => { map.removeLayer(heat); };
  }, [map, points, options]);
  return null;
}