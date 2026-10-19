import { useEffect } from 'react';
import { MapContainer, Marker, Polyline, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface IssMapProps {
  lat: number;
  lon: number;
  /** Recent positions, oldest first, as [lat, lon]. */
  trail: [number, number][];
  /** Keep the station centred as it moves. */
  follow: boolean;
}

const issIcon = L.divIcon({
  className: 'iss-marker',
  html: '<span class="iss-marker__pulse"></span><span class="iss-marker__dot"></span>',
  iconSize: [44, 44],
  iconAnchor: [22, 22],
});

const Follower = ({ lat, lon, follow }: Pick<IssMapProps, 'lat' | 'lon' | 'follow'>) => {
  const map = useMap();
  useEffect(() => {
    if (follow) map.panTo([lat, lon], { animate: true, duration: 1.2 });
  }, [lat, lon, follow, map]);
  return null;
};

/** Live ISS position on a dark world map, with the last few minutes of its ground track. */
const IssMap = ({ lat, lon, trail, follow }: IssMapProps) => (
  <MapContainer
    center={[lat, lon]}
    zoom={2}
    minZoom={2}
    maxZoom={6}
    worldCopyJump
    scrollWheelZoom={false}
    className="h-full w-full bg-space-deep"
    attributionControl
  >
    <TileLayer attribution="Tiles &copy; Esri &mdash; Esri, HERE, Garmin, OpenStreetMap contributors" url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}" />
    <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}" />
    {trail.length > 1 && (
      <Polyline positions={trail} pathOptions={{ color: '#ff8fb8', weight: 2, opacity: 0.7, dashArray: '2 6' }} />
    )}
    <Marker position={[lat, lon]} icon={issIcon} />
    <Follower lat={lat} lon={lon} follow={follow} />
  </MapContainer>
);

export default IssMap;
