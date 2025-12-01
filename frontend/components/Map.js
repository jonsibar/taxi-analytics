import { MapContainer, TileLayer, useMap, CircleMarker, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef } from 'react';
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});
function MapUpdater({ trips }) {
  const map = useMap();
  useEffect(() => {
    if (trips.length > 0) {
      const bounds = trips.map(t => [t.pickup_latitude, t.pickup_longitude]);
      if (bounds.length > 0) map.fitBounds(bounds, { padding: [50, 50], animate: false });
    }
  }, [trips, map]);
  return null;
}
const AutoOpenCircle = ({ center, color, children }) => {
  const markerRef = useRef(null);
  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.openPopup();
    }
  }, []);
  return (
    <CircleMarker 
      ref={markerRef}
      center={center} 
      radius={8} 
      pathOptions={{ color: color, fillColor: color, fillOpacity: 0.8, weight: 2 }}
    >
      {children}
    </CircleMarker>
  );
};
const PointsLayer = ({ trips, onPointClick }) => {
  return (
    <>
      {trips.map((trip, idx) => (
        <CircleMarker
          key={`p-${idx}`}
          center={[trip.pickup_latitude, trip.pickup_longitude]}
          radius={2} 
          pathOptions={{ 
            fillColor: '#00ffff', 
            fillOpacity: 0.8, 
            color: '#00ffff', 
            weight: 20, 
            opacity: 0 
          }}
          eventHandlers={{
            click: (e) => {
              L.DomEvent.stopPropagation(e);
              onPointClick(trip);
            }
          }}
        />
      ))}
    </>
  );
};
const SingleTripView = ({ trip }) => (
  <>
    {}
    <AutoOpenCircle center={[trip.pickup_latitude, trip.pickup_longitude]} color="#4ade80">
      {}
      <Popup autoClose={false} closeOnClick={false} autoPan={false}>
        <strong>📍 Pickup</strong><br/>{new Date(trip.pickup_datetime).toLocaleString()}
      </Popup>
    </AutoOpenCircle>
    {}
    <AutoOpenCircle center={[trip.dropoff_latitude, trip.dropoff_longitude]} color="#f87171">
      {}
      <Popup autoClose={false} closeOnClick={false} autoPan={false}>
        <strong>🏁 Dropoff</strong><br/>{Math.floor(trip.trip_duration / 60)} min
      </Popup>
    </AutoOpenCircle>
    {}
    <Polyline 
      positions={[[trip.pickup_latitude, trip.pickup_longitude], [trip.dropoff_latitude, trip.dropoff_longitude]]}
      pathOptions={{ color: '#ffffff', weight: 3, opacity: 0.8, dashArray: '5, 10' }}
    />
    <Polyline 
      positions={[[trip.pickup_latitude, trip.pickup_longitude], [trip.dropoff_latitude, trip.dropoff_longitude]]}
      pathOptions={{ color: '#00ffff', weight: 6, opacity: 0.4 }}
    />
  </>
);
const Map = ({ trips, focusedTrip, onPointClick }) => {
  const center = [40.7589, -73.9851];
  return (
    <MapContainer 
      center={center} 
      zoom={12} 
      style={{ height: '100%', width: '100%', background: '#111' }} 
      className="rounded-lg z-0"
      preferCanvas={true}
    >
      <TileLayer
        attribution='&copy; CartoDB'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      {}
      <PointsLayer trips={trips} onPointClick={onPointClick} />
      {}
      {!focusedTrip && <MapUpdater trips={trips} />}
      {}
      {focusedTrip && <SingleTripView trip={focusedTrip} />}
    </MapContainer>
  );
};
export default Map;