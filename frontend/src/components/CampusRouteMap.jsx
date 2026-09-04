import React, { useEffect } from "react";
import {
  Circle,
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import { divIcon } from "leaflet";
import "leaflet/dist/leaflet.css";

const CAMPUS_COORDINATES = [23.7806, 90.4070];

const markerIcon = (color) => divIcon({
  html: `<span style="display:block;width:14px;height:14px;background:${color};border:2px solid #fff;border-radius:50%;box-shadow:0 0 4px rgba(0,0,0,.4)"></span>`,
  className: "",
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

const distanceInKm = ([lat1, lng1], [lat2, lng2]) => {
  const radians = (value) => (value * Math.PI) / 180;
  const latDistance = radians(lat2 - lat1);
  const lngDistance = radians(lng2 - lng1);
  const value =
    Math.sin(latDistance / 2) ** 2 +
    Math.cos(radians(lat1)) * Math.cos(radians(lat2)) * Math.sin(lngDistance / 2) ** 2;

  return 6371 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
};

const FitRoute = ({ points }) => {
  const map = useMap();

  useEffect(() => {
    map.fitBounds(points, { padding: [30, 30] });
  }, [map, points]);

  return null;
};

const CampusRouteMap = ({ room }) => {
  const lat = Number(room?.coordinates?.lat);
  const lng = Number(room?.coordinates?.lng);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return <div className="alert alert-secondary mb-0">Campus route unavailable: coordinates missing</div>;
  }

  const campusCoordinates = [
    Number(room?.campusCoordinates?.lat) || CAMPUS_COORDINATES[0],
    Number(room?.campusCoordinates?.lng) || CAMPUS_COORDINATES[1],
  ];
  const roomCoordinates = [lat, lng];
  const routePoints = [roomCoordinates, campusCoordinates];
  const distanceKm = distanceInKm(roomCoordinates, campusCoordinates);
  const walkingMinutes = (distanceKm / 5) * 60;

  return (
    <section>
      <div className="rounded overflow-hidden border" style={{ height: 280 }}>
        <MapContainer center={roomCoordinates} zoom={15} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitRoute points={routePoints} />
          <Circle center={campusCoordinates} radius={200} pathOptions={{ color: "#0d6efd", fillOpacity: 0.1 }} />
          <Polyline positions={routePoints} pathOptions={{ color: "#0d6efd", dashArray: "6 8" }} />
          <Marker position={roomCoordinates} icon={markerIcon("#198754")}><Popup>Room {room.roomNumber}</Popup></Marker>
          <Marker position={campusCoordinates} icon={markerIcon("#0d6efd")}><Popup>Campus</Popup></Marker>
        </MapContainer>
      </div>
      <div className="small text-muted mt-2">
        <div>Distance: {distanceKm.toFixed(1)} km</div>
        <div>Estimated Walking Time: {walkingMinutes.toFixed(1)} minutes</div>
      </div>
    </section>
  );
};

export default CampusRouteMap;
