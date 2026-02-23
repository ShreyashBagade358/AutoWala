# Database Schema

## Collections (Firestore)

### users
```typescript
{
  id: string;              // UUID
  phone: string;          // +91XXXXXXXXXX
  name?: string;
  language: 'en' | 'mr';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### drivers
```typescript
{
  id: string;              // UUID
  phone: string;
  name: string;
  vehicleNumber: string;
  autoNumber: string;
  zoneId: string;
  status: 'available' | 'busy' | 'offline';
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
  rating: number;
  totalRides: number;
  isVerified: boolean;
  unionId?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### rides
```typescript
{
  id: string;              // UUID
  userId: string;
  driverId?: string;
  pickupLocation: {
    address: string;
    landmark?: string;
    zoneId: string;
    geoPoint?: {
      latitude: number;
      longitude: number;
    };
  };
  dropLocation: {
    address: string;
    landmark?: string;
    zoneId: string;
    geoPoint?: {
      latitude: number;
      longitude: number;
    };
  };
  status: 'pending' | 'driver_assigned' | 'driver_arrived' | 'in_progress' | 'completed' | 'cancelled';
  fare: number;
  estimatedFare: number;
  distance: number;
  duration: number;
  startedAt?: Timestamp;
  completedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### zones
```typescript
{
  id: string;
  name: string;
  nameMarathi: string;
  boundaries: GeoPoint[];
  center: GeoPoint;
  baseFare: number;
  perKmRate: number;
  perMinuteRate: number;
  minimumFare: number;
}
```

### whatsapp_sessions
```typescript
{
  phone: string;
  step: string;
  data: Record<string, any>;
  expiresAt: Timestamp;
}
```

## Indexes Required
- rides: userId + createdAt (desc)
- rides: driverId + status
- drivers: zoneId + status
