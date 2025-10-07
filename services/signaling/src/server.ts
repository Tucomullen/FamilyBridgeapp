import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:8081', // Expo dev server
      'http://localhost:8082',
      'http://localhost:8083',
      'http://localhost:3000', // Web dev server
      'exp://192.168.*.*:8081', // Expo tunnel
    ],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:8081',
    'http://localhost:8082', 
    'http://localhost:8083',
    'http://localhost:3000',
    /^exp:\/\/192\.168\.\d+\.\d+:\d+$/,
  ],
  credentials: true,
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Join a room
  socket.on('join', (roomId: string) => {
    console.log(`Client ${socket.id} joining room: ${roomId}`);
    socket.join(roomId);
    socket.to(roomId).emit('user-joined', socket.id);
  });

  // WebRTC signaling events
  socket.on('offer', (data: { roomId: string; offer: RTCSessionDescriptionInit; targetId: string }) => {
    console.log(`Offer from ${socket.id} to ${data.targetId} in room ${data.roomId}`);
    socket.to(data.roomId).emit('offer', {
      offer: data.offer,
      from: socket.id,
    });
  });

  socket.on('answer', (data: { roomId: string; answer: RTCSessionDescriptionInit; targetId: string }) => {
    console.log(`Answer from ${socket.id} to ${data.targetId} in room ${data.roomId}`);
    socket.to(data.roomId).emit('answer', {
      answer: data.answer,
      from: socket.id,
    });
  });

  socket.on('ice-candidate', (data: { roomId: string; candidate: RTCIceCandidateInit; targetId: string }) => {
    console.log(`ICE candidate from ${socket.id} to ${data.targetId} in room ${data.roomId}`);
    socket.to(data.roomId).emit('ice-candidate', {
      candidate: data.candidate,
      from: socket.id,
    });
  });

  // Leave room
  socket.on('leave', (roomId: string) => {
    console.log(`Client ${socket.id} leaving room: ${roomId}`);
    socket.leave(roomId);
    socket.to(roomId).emit('user-left', socket.id);
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Signaling server running on port ${PORT}`);
  console.log(`📡 WebSocket endpoint: ws://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});
