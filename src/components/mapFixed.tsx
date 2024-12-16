import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
// import L from "leaflet";

// Fix for default marker icon
// delete (L.Icon.Default.prototype as any)._getIconUrl
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: '/images/marker-icon-2x.png',
//   iconUrl: '/images/marker-icon.png',
//   shadowUrl: '/images/marker-shadow.png',
// })

interface MapProps {
  center: [number, number];
  zoom: number;
  className?: string;
}

export default function MapFixed({ center, zoom, className }: MapProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className={className}
      zoomControl={false}
      dragging={false}
      touchZoom={false}
      doubleClickZoom={false}
      scrollWheelZoom={false}
      boxZoom={false}
      keyboard={false}
      attributionControl={false}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={center} />
    </MapContainer>
  );
}
