import { useEffect, useState} from 'react';
import { io } from 'socket.io-client';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './App.css';

interface SensorPing {
  sensorId: string;
  lat: number;
  lon: number;
  timestamp: number;
}

interface ConfirmedTarget {
  targetId: string;
  estimatedLat: number;
  estimatedLon: number;
  sensorIds: string[];
}

const pingIcon = L.divIcon({ className: 'ping-icon', iconSize: [10, 10], iconAnchor: [5, 5]  });
const targetIcon = L.divIcon({ className: 'target-icon', iconSize: [20, 20], iconAnchor: [10, 10]  });

function App() {
  const [pings, setPings] = useState<SensorPing[]>([]);
  const [targets, setTargets] = useState<ConfirmedTarget[]>([]);

  useEffect(() => {
    // Connect to the Node.js BFF
    const socket = io('http://localhost:3001');

    socket.on('connect', () => console.log('Connected to BFF Websockets'));

    // Listen for raw noise
    socket.on('new-ping', (data: SensorPing) => {
      // Add the array of pings, but keep only last 100 so the browser doesn't crash
      setPings((prev) => [...prev.slice(-99), data]);
    });

    // Listen for confirmed targets
    socket.on('new-target', (data: ConfirmedTarget) => {
      setTargets((prev) => [...prev, data]);
    });

    return () => {
      socket.disconnect();
    };
  }, []); // The empty array means "Only run this once on startup"

  // Center the map on Los Angeles to match test coordinates for now
  const mapCenter: [number, number] = [34.05, -118.24];

  return (
      <MapContainer center={mapCenter} zoom={13} scrollWheelZoom={true}>
        {/* The Map Background (Dark Mode OpenStreetMap) */}
        <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* Render the Raw Pings (The Noise) */}
        {pings.map((ping, index) => (
            <Marker key={`ping-${index}`} position={[ping.lat, ping.lon]} icon={pingIcon}>
              <Popup>Sensor: {ping.sensorId}</Popup>
            </Marker>
        ))}

        {/* Render the Confirmed Targets (The Signal) */}
        {targets.map((target, index) => (
            <Marker key={`target-${index}`} position={[target.estimatedLat, target.estimatedLon]} icon={targetIcon}>
              <Popup>
                <strong>CONFIRMED TARGET</strong><br/>
                ID: {target.targetId}<br/>
                Sensors: {target.sensorIds.join(', ')}
              </Popup>
            </Marker>
        ))}

      </MapContainer>
  )
}

export default App;