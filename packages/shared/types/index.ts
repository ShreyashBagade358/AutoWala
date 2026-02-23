export interface User {
  id: string;
  phone: string;
  name?: string;
  language: 'en' | 'mr';
  isAdmin?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Driver {
  id: string;
  phone: string;
  name: string;
  vehicleNumber: string;
  autoNumber: string;
  zoneId: string;
  status: DriverStatus;
  currentLocation?: GeoPoint;
  rating: number;
  totalRides: number;
  isVerified: boolean;
  unionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type DriverStatus = 'available' | 'busy' | 'offline';

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface Ride {
  id: string;
  userId: string;
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  autoNumber?: string;
  pickupLocation: Location & { lat?: number; lng?: number };
  dropLocation: Location & { lat?: number; lng?: number };
  status: RideStatus;
  fare: number;
  estimatedFare: number;
  distance: number;
  duration: number;
  otp?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  rating?: number;
  feedback?: string;
  startedAt?: Date | null;
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type RideStatus = 
  | 'pending' 
  | 'driver_assigned' 
  | 'driver_arrived' 
  | 'in_progress' 
  | 'completed' 
  | 'cancelled';

export interface Location {
  address: string;
  landmark?: string;
  zoneId: string;
  geoPoint?: GeoPoint;
}

export interface Zone {
  id: string;
  name: string;
  nameMarathi: string;
  boundaries: GeoPoint[];
  center: GeoPoint;
  baseFare: number;
  perKmRate: number;
  perMinuteRate: number;
  minimumFare: number;
  demand?: 'high' | 'medium-high' | 'medium' | 'low';
}

export interface FareCalculation {
  baseFare: number;
  distanceFare: number;
  timeFare: number;
  totalFare: number;
  minimumFare: number;
}

export interface PoolRide {
  id: string;
  routeId: string;
  driverId: string;
  pickupPoints: PoolPoint[];
  dropPoints: PoolPoint[];
  scheduledTime: Date;
  status: PoolStatus;
  availableSeats: number;
  currentPassengers: number;
  fare: number;
}

export type PoolStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export interface PoolPoint {
  location: Location;
  estimatedArrival: Date;
}

export interface PoolRoute {
  id: string;
  name: string;
  startPoint: Location;
  endPoint: Location;
  waypoints: Location[];
  regularPassengers: string[];
  fare: number;
}

export interface WhatsAppSession {
  phone: string;
  step: WhatsAppStep;
  data: Record<string, unknown>;
  expiresAt: Date;
}

export type WhatsAppStep = 
  | 'init'
  | 'pickup_location'
  | 'drop_location'
  | 'confirm_ride'
  | 'waiting_driver'
  | 'ride_started'
  | 'ride_completed';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
