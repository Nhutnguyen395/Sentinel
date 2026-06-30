import { KafkaJS } from '@confluentinc/kafka-javascript';
import { type SensorPing } from './types';

const kafka = new KafkaJS.Kafka({
    kafkaJS: {
        clientId: 'sensor-gateway',
        brokers: [process.env.KAFKA_BROKERS || 'localhost:9092']
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
    try{
        const result = await producer.send({
            topic: 'raw-sensor-pings',
            messages: [
                {value: JSON.stringify(payload)}
            ],
        });
        // @ts-ignore
        console.log(`Successfully sent to Kafka partitions: `, result[0].partition);
    } catch (error){
        console.error(`Node.js failed to send to Kafka: `, error);
        await new Promise(resolve => setTimeout(resolve, 5000));
    }
}