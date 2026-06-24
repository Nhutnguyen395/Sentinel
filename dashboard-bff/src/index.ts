import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { startKafkaConsumer } from './kafkaConsumer.ts';

const app = express();
app.use(cors()); // allow React app on different port to connect

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log(`New UI Client Connected: ${socket.id}`);

    socket.on('disconnect', () => {
        console.log(`UI Client Disconnected: ${socket.id}`);
    });
});

const PORT = 3001;

server.listen(PORT, async () => {
    console.log(`Dashboard BFF listening on port ${PORT}`);
    await startKafkaConsumer(io);
});