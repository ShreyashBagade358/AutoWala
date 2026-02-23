import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface DriverLocation {
  driverId: string;
  lat: number;
  lng: number;
  rideId?: string;
}

interface UseSocketOptions {
  rideId?: string;
  userId?: string;
  driverId?: string;
}

export function useSocket({ rideId, driverId }: UseSocketOptions) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [driverLocation, setDriverLocation] = useState<DriverLocation | null>(null);

  useEffect(() => {
    // Connect to backend socket server (runs on port 3000)
    const socketUrl = 'http://localhost:3000';
    
    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      timeout: 10000
    });

    socket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);

      if (rideId) {
        socket.emit('join-ride', rideId);
      }
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    socket.on('location-update', (data: DriverLocation) => {
      console.log('Location update:', data);
      setDriverLocation(data);
    });

    socketRef.current = socket;

    return () => {
      if (rideId) {
        socket.emit('leave-ride', rideId);
      }
      socket.disconnect();
    };
  }, [rideId]);

  const sendDriverLocation = useCallback((lat: number, lng: number) => {
    if (socketRef.current && driverId) {
      socketRef.current.emit('driver-location', {
        driverId,
        lat,
        lng,
        rideId
      });
    }
  }, [driverId, rideId]);

  const joinRide = useCallback((newRideId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('join-ride', newRideId);
    }
  }, []);

  const leaveRide = useCallback((newRideId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('leave-ride', newRideId);
    }
  }, []);

  return {
    isConnected,
    driverLocation,
    sendDriverLocation,
    joinRide,
    leaveRide
  };
}
