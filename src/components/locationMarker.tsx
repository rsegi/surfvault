import L, { LatLng } from "leaflet";
import { useEffect, useState } from "react";
import { useMap, useMapEvents } from "react-leaflet/hooks";
import { Marker } from "react-leaflet/Marker";
import "leaflet/dist/leaflet.css";

interface LocationMarkerProps {
  latitude: number;
  longitude: number;
  setLatitude: (latitude: number) => void;
  setLongitude: (longitude: number) => void;
}

L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/marker-icon-2x.png",
  iconUrl: "/marker-icon.png",
  shadowUrl: "/marker-shadow.png",
});

export default function LocationMarker({
  latitude,
  longitude,
  setLatitude,
  setLongitude,
}: LocationMarkerProps) {
  const map = useMap();
  const [position, setPosition] = useState<LatLng | null>(null);

  useMapEvents({
    click: (e: { latlng: LatLng }) => {
      setLatitude(e.latlng.lat);
      setLongitude(e.latlng.lng);
      setPosition(e.latlng);
    },
  });

  useEffect(() => {
    if (latitude && longitude) {
      const newCenter = new LatLng(latitude, longitude);
      setPosition(newCenter);
      map.setView(newCenter, map.getZoom());
    }
  }, [latitude, longitude, map]);

  return position === null ? null : <Marker position={position}></Marker>;
}
