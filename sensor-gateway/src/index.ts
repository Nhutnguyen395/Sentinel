import express, {type Request, type Response } from 'express';
import { connectKafkaProducer, publishSensorPing }  from "./kafkaProducer";
import { type SensorPing } from './types';

const app = express();
app.use(express.json()); // Middleware to parse incoming JSON

// The endpoint the simulation engine will hit
app.post('/api/sensors/ping', async (req: Request<{}, {}, SensorPing>, res: Response) => {
    try {
        const sensorData = req.body;

        if (!sensorData.sensorId || !sensorData.lat || !sensorData.lon) {
            return res.status(400).json({error: 'Missing required sensor fields'});
        }
        sensorData.timestamp = Date.now();
        // Drop it into Kafka
        await publishSensorPing(sensorData);
        res.status(202).json({status: 'Accepted'});
    } catch (error) {
        console.error('Error publishing to Kafka:', error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});

const PORT = 3000;

const startServer = async () => {
    await connectKafkaProducer();
    app.listen(PORT, () => {
        console.log(`Sensor Gateway listening on http://localhost:${PORT}`);
    });
};

startServer();