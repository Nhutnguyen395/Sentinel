import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:3000/api/sensors/ping';

// Los Angeles is the defended asset
const BASE_LAT = 34.05;
const BASE_LON = -118.24;
const INTERCEPT_RADIUS = 0.02 // The kill-zone perimeter

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

// Use Pythagorean Theorem to find distance between two coordinates
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    return Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lon2 - lon1, 2));
};

// Spawns a target at a random 360-degree angle, at a specific distance from LA
const getRandomSpawn = (distanceFromBase: number) => {
    const angle = Math.random() * Math.PI * 2; // random angle in radians
    return {
        lat: BASE_LAT + distanceFromBase * Math.cos(angle),
        lon: BASE_LAT + distanceFromBase * Math.sin(angle)
    };
};

const randomOffset = (spread = 0.05) => (Math.random() - 0.5) * spread;
let noiseInterval: NodeJS.Timeout;
let noiseSpeed = 500;

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

// Scenario 2: Hypersonic Missile
app.post('/api/scenarios/hypersonic', (req, res) => {
    console.log('HYPERSONIC TARGET DETECTED!');
    const speed = 0.008;
    const spawn = getRandomSpawn(0.15);
    let currentLat = spawn.lat;
    let currentLon = spawn.lon;

    const hyperInterval = setInterval(() => {
        const dist = getDistance(currentLat, currentLon, BASE_LAT, BASE_LON);

        if (dist <= INTERCEPT_RADIUS){
            console.log("HYPERSONIC TARGET INTERCEPTED AT PERIMETER!");
            clearInterval(hyperInterval);
            return;
        }

        currentLat += ((BASE_LAT - currentLat) / dist) * speed;
        currentLon += ((BASE_LON - currentLon) / dist) * speed;

        sendPing('RADAR-FAST', currentLat, currentLon, 'RF');
        sendPing('IR-FAST', currentLat, currentLon, 'INFRARED');

    }, 1000);

    res.json({ status: 'Hypersonic target launched' });
});

// Scenario 3: Drone Swarm
app.post('/api/scenarios/swarm', (req, res) => {
    console.log('🐝 DRONE SWARM DETECTED!');
    const speed = 0.002;
    const spawn = getRandomSpawn(0.10);
    let currentLat = spawn.lat;
    let currentLon = spawn.lon;

    const swarmInterval = setInterval(() => {
        const dist = getDistance(currentLat, currentLon, BASE_LAT, BASE_LON);

        if (dist <= INTERCEPT_RADIUS) {
            console.log('DRONE SWARM INTERCEPTED AT PERIMETER!');
            clearInterval(swarmInterval);
            return;
        }

        currentLat += ((BASE_LAT - currentLat) / dist) * speed;
        currentLon += ((BASE_LON - currentLon) / dist) * speed;

        // Spawn 5 targets in a tight cluster around the center point
        const offsets = [[0,0], [0.005, 0.005], [-0.005, 0.005], [0.005, -0.005], [-0.005, -0.005]];
        offsets.forEach((offset, index) => {
            // @ts-ignore
            sendPing(`SWARM-RADAR-${index}`, currentLat + offset[0], currentLon + offset[1], 'RF');
            // @ts-ignore
            sendPing(`SWARM-ACOUSTIC-${index}`, currentLat + offset[0], currentLon + offset[1], 'ACOUSTIC');
        });

    }, 2000);
    res.json({ status: 'Drone swarm launched' });
});

const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Simulation listening on port ${PORT}`);
    startNoise(); // Start the default background noise
});