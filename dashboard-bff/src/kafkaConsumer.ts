import { KafkaJS } from '@confluentinc/kafka-javascript';
import { Server } from 'socket.io';

const kafka = new KafkaJS.Kafka({
    kafkaJS: {
        clientId: 'dashboard-bff',
        brokers: [process.env.KAFKA_BROKERS || 'localhost:9092']
    }
});

// Use a unique group ID so it gets its own copy of all message
const consumer = kafka.consumer({ kafkaJS: { groupId: 'dashboard-ui-group'}});

export const startKafkaConsumer = async (io: Server) => {
    await consumer.connect();
    console.log("BFF Connected to Kafka");

    // Subscribe to BOTH topics
    await consumer.subscribe({ topic: 'raw-sensor-pings' });
    await consumer.subscribe({ topic: 'confirmed-targets' });

    await consumer.run({
        eachMessage: async ({ topic, message }) => {
            if (!message.value) return;

            try {
                const rawString = message.value.toString();
                const data = JSON.parse(rawString);

                // Route the message to the correct WebSocket channel based on the Kafka topic
                if (topic === 'raw-sensor-pings') {
                    io.emit('new-ping', data);
                } else if (topic === 'confirmed-targets') {
                    io.emit('new-target', data);
                    console.log(`Pushed confirmed target to UI: ${data.targetId}`);
                }
            } catch (error) {
                console.error(`Failed to process message from topic [${topic}]. Dropping message.`, error);
            }
        }
    })
}