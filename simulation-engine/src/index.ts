import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

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
const randomOffset = (spread = 0.05) => (Math.random() - 0.5) * spread;

let noiseInterval: NodeJS.Timeout;
let noiseSpeed = 300;

// Noise Generator
const startNoise = () => {
    if (noiseInterval) clearInterval(noiseInterval);
    noiseInterval = setInterval(() => {
        sendPing(`NOISE-${Math.floor(Math.random() * 1000)}`, BASE_LAT + randomOffset(), BASE_LON + randomOffset(), 'RF');
    }, noiseSpeed);
};

// Scenario 1: Severe Weather
app.post('/api/scenarios/weather', (req, res) => {
    console.log('SEVERE WEATHER INBOUND! Increasing noise density.');
    noiseSpeed = 20; // Spike in noise
    startNoise();

    // Return to normal after 10 seconds
    setTimeout(() => {
        noiseSpeed = 300;
        startNoise();
        console.log('Weather cleared.');
    }, 10000);

    res.json({status: 'Severe Weather initiated'});
})

// Scenario 2: Hypersonic Missle
app.post('/api/scenarios/hypersonic', (req, res) => {
    console.log('HYPERSONIC TARGET DETECTED!');
    let lat = 33.90;
    let lon = -118.10;
    let ticks = 0;

    const hyperInterval = setInterval(() => {
        lat += 0.008;
        lon -= 0.008;

        // Fire the corroborating sensors
        sendPing('RADAR-FAST', lat, lon, 'RF');
        sendPing('IR-FAST', lat, lon, "INFRARED");

        ticks++;

        if (ticks > 20) clearInterval(hyperInterval) // Stop after it flies off the map
    }, 1000);
    res.json({ status: 'Hypersonic target launched' });
});

// Scenario 3: Drone Swarm
app.post('/api/scenarios/swarm', (req, res) => {
    console.log('🐝 DRONE SWARM DETECTED!');
    let lat = 34.15;
    let lon = -118.30;
    let ticks = 0;

    const swarmInterval = setInterval(() => {
        lat -= 0.002;

        // Spawn 3 targets in a tight triangle formation
        const offsets = [[0, 0], [0.005, 0.005], [-0.005, 0.005]];

        offsets.forEach((offset, index) => {
            // @ts-ignore
            sendPing(`SWARM-RADAR-${index}`, lat + offset[0], lon + offset[1], 'RF');
            // @ts-ignore
            sendPing(`SWARM-ACOUSTIC-${index}`, lat + offset[0], lon + offset[1], 'ACOUSTIC');
        });

        ticks++;

        if (ticks > 30) clearInterval(swarmInterval);
    }, 2000);
    res.json({ status: 'Drone swarm launched' });
});

const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Simulation listening on port ${PORT}`);
    startNoise(); // Start the default background noise
});