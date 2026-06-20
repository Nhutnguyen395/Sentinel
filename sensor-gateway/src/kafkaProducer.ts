import { KafkaJS } from '@confluentinc/kafka-javascript';
import { type SensorPing } from './types.ts';

const kafka = new KafkaJS.Kafka({
    kafkaJS: {
        clientId: 'sensor-gateway',
        brokers: ['localhost:9092']
    }
});

const producer = kafka.producer();

export const connectKafkaProducer = async () => {
    try {
        await producer.connect();
        console.log("Connected to Kafka Broker");
    } catch (error) {
        console.log("Failed to connect to Kafka", error);
    }
};

export const publishSensorPing = async (payload: SensorPing) => {
    await producer.send({
       topic: 'raw-sensor-ping',
       messages: [
           {value: JSON.stringify(payload)}
       ],
    });
}