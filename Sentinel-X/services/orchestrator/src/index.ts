import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { createClient } from 'redis';
import dotenv from 'dotenv';
import { AppDataSource } from './data-source';
import { Simulator } from './simulator';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Redis Client
const redisClient = createClient({ url: process.env.REDIS_URL });
redisClient.on('error', err => console.log('Redis Client Error', err));

async function startServer() {
  try {
    await AppDataSource.initialize();
    console.log('Data Source initialized');
    
    await redisClient.connect();
    console.log('Connected to Redis');

    // Start Simulator
    const simulator = new Simulator(io);
    simulator.start();

    app.get('/health', (req, res) => {
      res.json({ status: 'ok', service: 'orchestrator' });
    });

    app.get('/processes', async (req, res) => {
      const processes = await AppDataSource.getRepository('Process').find({
        order: { createdAt: 'DESC' },
        take: 10
      });
      res.json(processes);
    });

    // Socket.io connection
    io.on('connection', (socket) => {
      console.log('Client connected to dashboard');
      
      socket.on('disconnect', () => {
        console.log('Client disconnected');
      });
    });

    httpServer.listen(PORT, () => {
      console.log(`Orchestrator running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Error during startup:', err);
  }
}

startServer();
