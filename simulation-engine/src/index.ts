const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:3000/api/sensors/ping';

// Base coordinates (Los Angeles)
const BASE_LAT = 34.05;
const BASE_LON = -118.24;

const sendPing = async (sensorId: string, lat: number, lon: number, type: string) => {
    try {
        await fetch(GATEWAY_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(({sensorId, lat, lon, type}))
        });
    } catch (error) {
        console.error(`Failed to send ping from ${sensorId}.`);
    }
};

// Random offset for the noise
const randomOffset = () => (Math.random() - 0.5) * 0.05;

// Noise Generator
const startNoise = () => {
    setInterval(() => {
        const lat = BASE_LAT + randomOffset();
        const lon = BASE_LON + randomOffset();
        const sensorId = `RADAR-NOISE-${Math.floor(Math.random() * 100)}`;

        sendPing(sensorId, lat, lon, 'RF_SIGNATURE');
        console.log(`Noise generated at ${lat.toFixed(4)}, ${lon.toFixed(4)}`);
    }, 300); // fires every 300 ms
};

// True Target Generator
let targetLat = 34.00
let targetLon = -118.00

const startTrueTarget = () => {
    setInterval(() => {
        // Move the target slightly North-West every tick
        targetLat += 0.001;
        targetLon -= 0.001;

        sendPing('RADAR-ALPHA', targetLat, targetLon, 'RF_SIGNATURE');
        sendPing('ACOUSTIC-BRAVO', targetLat, targetLon, 'ACOUSTIC_SIGNATURE');

        console.log(`TRUE TARGET moved to ${targetLat.toFixed(4)}, ${targetLon.toFixed(4)}`);
    }, 3000); // Fires every 3 seconds
};

console.log('🚀 Starting Sentinel Simulation Engine...');
startNoise();
startTrueTarget();