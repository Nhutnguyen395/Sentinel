import { useEffect, useState} from 'react';
import { io } from 'socket.io-client';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
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
  confirmationTime: number;
}

const pingIcon = L.divIcon({
  className: 'ping-wrapper',
  html: '<div class="ping-dot"></div>',
  iconSize: [10, 10],
  iconAnchor: [5, 5]
});

const targetIcon = L.divIcon({
  className: 'target-wrapper',
  html: '<div class="pulse-dot"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

function App() {
  const [pings, setPings] = useState<SensorPing[]>([]);
  const [targets, setTargets] = useState<ConfirmedTarget[]>([]);

  useEffect(() => {
    // Connect to the Node.js BFF
    const socket = io('http://localhost:3001');

    socket.on('connect', () => console.log('Connected to BFF Websockets'));

    // Listen for raw noise
    socket.on('new-ping', (data: SensorPing) => {
      setPings((prev) => [...prev, data]);
    });

    // Listen for confirmed targets
    socket.on('new-target', (data: ConfirmedTarget) => {
      setTargets((prev) => [...prev, data]);
    });

    return () => {
      socket.disconnect();
    };
  }, []); // The empty array means "Only run this once on startup"

  useEffect(() => {
    const cleanupLoop = setInterval(() => {
      const now = Date.now();
      setTargets((currentTargets) =>
        currentTargets.filter(target => (now - target.confirmationTime) < 6000)
      );

      setPings((currentPings) =>
          currentPings.filter(ping => (now - ping.timestamp) < 3000)
      );
    }, 1000);

    return () => clearInterval(cleanupLoop);
  }, []);

  // Center the map on Los Angeles
  const mapCenter: [number, number] = [34.05, -118.24];

  const triggerScenario = async (endpoint: string) => {
    try {
      await fetch(`http://localhost:4000/api/scenarios/${endpoint}`, {method: 'POST'});
      console.log(`Command sent: ${endpoint}`);
    } catch (error) {
      console.error("Failed to contact God Mode API", error);
    }
  };

  return (
      <>
        <div className="control-panel">
          <h2>Threat Injector</h2>
          <button className="tactical-btn weather" onClick={() => triggerScenario('weather')}>
            Spawn Sensor Storm
          </button>
          <button className="tactical-btn" onClick={() => triggerScenario('hypersonic')}>
            Launch Hypersonic Missile
          </button>
          <button className="tactical-btn" onClick={() => triggerScenario('swarm')}>
            Launch Drone Swarm
          </button>
        </div>


        <MapContainer center={mapCenter} zoom={12} scrollWheelZoom={true}>
          {/* The Map Background (Dark Mode OpenStreetMap) */}
          <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          {/* Kill Zone Perimeter (2200 meters) */}
          <Circle
              center={mapCenter}
              radius={2200}
              pathOptions={{ color: '#00f3ff', fillColor: '#00f3ff', fillOpacity: 0.1, dashArray: '5, 10' }}
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
      </>
  );
}

export default App;