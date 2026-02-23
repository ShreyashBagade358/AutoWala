import dotenv from 'dotenv';
dotenv.config();

import { app } from './app.js';
import { createServer } from 'http';
import { Server } from 'socket.io';

const PORT = parseInt(process.env.PORT || '3000', 10);
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST']
  }
});

// Real-time location tracking
const driverLocations: Map<string, { lat: number; lng: number; rideId?: string }> = new Map();
const rideRooms: Map<string, string> = new Map();

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Driver updates location
  socket.on('driver-location', (data: { driverId: string; lat: number; lng: number; rideId?: string }) => {
    driverLocations.set(data.driverId, { lat: data.lat, lng: data.lng, rideId: data.rideId });
    
    // Broadcast to user in the same ride
    if (data.rideId) {
      io.to(`ride-${data.rideId}`).emit('location-update', {
        type: 'location-update',
        driverId: data.driverId,
        lat: data.lat,
        lng: data.lng,
        rideId: data.rideId
      });
    }
  });

  // User joins ride room for tracking
  socket.on('join-ride', (rideId: string) => {
    socket.join(`ride-${rideId}`);
    rideRooms.set(socket.id, rideId);
    console.log(`Client joined ride room: ${rideId}`);
  });

  // Leave ride room
  socket.on('leave-ride', (rideId: string) => {
    socket.leave(`ride-${rideId}`);
    rideRooms.delete(socket.id);
  });

  // Chat messages between driver and rider
  socket.on('chat', (data: { rideId: string; text: string; from: string }) => {
    // Broadcast to everyone in the ride room
    io.to(`ride-${data.rideId}`).emit('chat', {
      type: 'chat',
      from: data.from,
      text: data.text,
      time: new Date().toISOString()
    });
  });

  // Get driver location for a ride
  socket.on('get-driver-location', (rideId: string, callback) => {
    for (const [driverId, loc] of driverLocations) {
      if (loc.rideId === rideId) {
        callback({ driverId, ...loc });
        return;
      }
    }
    callback(null);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

httpServer.listen(PORT, () => {
  console.log(`🚀 Autowala API running on port ${PORT}`);
  console.log(`   WebSocket enabled for real-time tracking`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
});

export { io, driverLocations };
