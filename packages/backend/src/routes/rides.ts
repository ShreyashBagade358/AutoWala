import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { rides, driverLocations, drivers } from '../data/store.js';

const router = Router();

const KOLHAPUR_ZONES = [
  { id: 'railway-station', name: 'Railway Station', center: { lat: 16.7050, lng: 74.2439 }, baseFare: 25, perKmRate: 12, minimumFare: 30 },
  { id: 'bus-stand', name: 'Bus Stand (CBS)', center: { lat: 16.6967, lng: 74.2400 }, baseFare: 25, perKmRate: 12, minimumFare: 30 },
  { id: 'shahupuri', name: 'Shahupuri Market', center: { lat: 16.6980, lng: 74.2350 }, baseFare: 25, perKmRate: 12, minimumFare: 30 },
  { id: 'mahalaxmi', name: 'Mahalaxmi Temple', center: { lat: 16.6750, lng: 74.2400 }, baseFare: 30, perKmRate: 12, minimumFare: 40 },
  { id: 'jyotiba', name: 'Jyotiba Temple', center: { lat: 16.7200, lng: 74.1800 }, baseFare: 40, perKmRate: 14, minimumFare: 50 },
  { id: 'rankala', name: 'Rankala Lake', center: { lat: 16.6820, lng: 74.2250 }, baseFare: 30, perKmRate: 12, minimumFare: 40 },
  { id: 'panhala', name: 'Panhala Fort', center: { lat: 16.6500, lng: 74.1000 }, baseFare: 50, perKmRate: 15, minimumFare: 60 },
  { id: 'khasbag', name: 'Khasbag Stadium', center: { lat: 16.6950, lng: 74.2300 }, baseFare: 25, perKmRate: 12, minimumFare: 30 },
  { id: 'shivaji-udyan', name: 'Shivaji Udyamnagar', center: { lat: 16.7100, lng: 74.2350 }, baseFare: 25, perKmRate: 12, minimumFare: 30 },
  { id: 'sykes', name: 'Sykes Extension', center: { lat: 16.7020, lng: 74.2480 }, baseFare: 25, perKmRate: 12, minimumFare: 30 },
  { id: 'ruchira', name: 'Ruchira Park', center: { lat: 16.7150, lng: 74.2300 }, baseFare: 25, perKmRate: 12, minimumFare: 30 },
  { id: 'sangavi', name: 'Sangavi', center: { lat: 16.7300, lng: 74.2100 }, baseFare: 25, perKmRate: 12, minimumFare: 30 },
  { id: 'tarabai-park', name: 'Tarabai Park', center: { lat: 16.6900, lng: 74.2380 }, baseFare: 25, perKmRate: 12, minimumFare: 30 },
  { id: 'laxmipuri', name: 'Laxmipuri', center: { lat: 16.7080, lng: 74.2250 }, baseFare: 25, perKmRate: 12, minimumFare: 30 },
];

const POPULAR_ROUTES = [
  { from: 'railway-station', to: 'bus-stand', fare: 35, distance: 2 },
  { from: 'railway-station', to: 'mahalaxmi', fare: 60, distance: 4 },
  { from: 'railway-station', to: 'rankala', fare: 55, distance: 3.5 },
  { from: 'railway-station', to: 'shahupuri', fare: 40, distance: 2.5 },
  { from: 'railway-station', to: 'shivaji-udyan', fare: 45, distance: 3 },
  { from: 'railway-station', to: 'khasbag', fare: 40, distance: 2.5 },
  { from: 'railway-station', to: 'jyotiba', fare: 80, distance: 6 },
  { from: 'railway-station', to: 'panhala', fare: 100, distance: 8 },
  { from: 'bus-stand', to: 'mahalaxmi', fare: 50, distance: 3 },
  { from: 'bus-stand', to: 'rankala', fare: 50, distance: 3 },
  { from: 'bus-stand', to: 'shahupuri', fare: 30, distance: 1.5 },
  { from: 'bus-stand', to: 'khasbag', fare: 25, distance: 1 },
  { from: 'bus-stand', to: 'shivaji-udyan', fare: 40, distance: 2.5 },
  { from: 'mahalaxmi', to: 'rankala', fare: 40, distance: 2.5 },
  { from: 'mahalaxmi', to: 'shahupuri', fare: 45, distance: 3 },
  { from: 'rankala', to: 'tarabai-park', fare: 35, distance: 2 },
  { from: 'khasbag', to: 'shahupuri', fare: 25, distance: 1.5 },
  { from: 'khasbag', to: 'laxmipuri', fare: 30, distance: 2 },
  { from: 'shivaji-udyan', to: 'sangavi', fare: 40, distance: 2.5 },
  { from: 'shivaji-udyan', to: 'ruchira', fare: 35, distance: 2 },
];

const getZoneById = (id: string) => KOLHAPUR_ZONES.find(z => z.id === id);

const getFareForRoute = (fromId: string, toId: string) => 
  POPULAR_ROUTES.find(r => (r.from === fromId && r.to === toId) || (r.from === toId && r.to === fromId));

const calculateFare = (distanceKm: number, baseFare: number, perKmRate: number, minimumFare: number) => {
  const totalFare = Math.max(baseFare + (distanceKm * perKmRate), minimumFare);
  return Math.round(totalFare);
};

router.get('/', (req, res) => res.json(Array.from(rides.values())));

router.get('/recent', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ success: false, error: 'Unauthorized' });
  const recentRides = Array.from(rides.values())
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);
  res.json(recentRides);
});

router.get('/pending', (req, res) => {
  const { zoneId } = req.query;
  const allRides = Array.from(rides.values());
  let pendingRides = allRides.filter(r => r.status === 'pending');
  
  if (zoneId) {
    pendingRides = pendingRides.filter(r => r.pickupLocation.zoneId === zoneId);
  }
  
  res.json(pendingRides);
});

router.get('/nearby-drivers', (req, res) => {
  const { zoneId } = req.query;
  if (!zoneId) return res.status(400).json({ success: false, error: 'Zone required' });
  
  const zone = getZoneById(zoneId as string);
  if (!zone) return res.status(400).json({ success: false, error: 'Invalid zone' });
  
  const drivers = Array.from(driverLocations.values())
    .filter(d => d.status === 'available' && d.zoneId === zoneId)
    .slice(0, 5);
  
  res.json(drivers);
});

router.post('/',
  body('pickupZoneId').notEmpty(),
  body('dropZoneId').notEmpty(),
  body('userId').optional(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { pickupZoneId, dropZoneId, userId } = req.body;
    const pickupZone = getZoneById(pickupZoneId);
    const dropZone = getZoneById(dropZoneId);
    
    if (!pickupZone || !dropZone) return res.status(400).json({ success: false, error: 'Invalid zone' });
    
    const route = getFareForRoute(pickupZoneId, dropZoneId);
    const distance = route?.distance || 3;
    const estimatedFare = route?.fare || calculateFare(distance, pickupZone.baseFare, pickupZone.perKmRate, pickupZone.minimumFare);
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    
    const ride = {
      id: uuidv4(),
      userId: userId || 'user-123',
      driverId: null,
      driverName: null,
      driverPhone: null,
      autoNumber: null,
      pickupLocation: { address: pickupZone.name, zoneId: pickupZone.id, ...pickupZone.center },
      dropLocation: { address: dropZone.name, zoneId: dropZone.id, ...dropZone.center },
      status: 'pending',
      fare: estimatedFare,
      estimatedFare,
      distance,
      duration: Math.round(distance * 3),
      otp,
      paymentMethod: 'cash',
      paymentStatus: 'pending',
      rating: null,
      feedback: null,
      startedAt: null,
      completedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    rides.set(ride.id, ride);
    res.status(201).json(ride);
  }
);

router.get('/:rideId', (req, res) => {
  const { rideId } = req.params;
  const ride = rides.get(rideId);
  if (!ride) return res.status(404).json({ success: false, error: 'Ride not found' });
  res.json(ride);
});

router.post('/:rideId/accept', (req, res) => {
  const { rideId } = req.params;
  const { driverId, driverName, driverPhone, autoNumber } = req.body;
  const ride = rides.get(rideId);
  
  if (!ride) return res.status(404).json({ success: false, error: 'Ride not found' });
  if (ride.status !== 'pending') return res.status(400).json({ success: false, error: 'Ride not available' });
  
  ride.driverId = driverId;
  ride.driverName = driverName;
  ride.driverPhone = driverPhone;
  ride.autoNumber = autoNumber;
  ride.status = 'driver_assigned';
  ride.updatedAt = new Date();
  rides.set(rideId, ride);
  
  res.json({ success: true, ride });
});

router.post('/:rideId/decline', (req, res) => {
  const { rideId } = req.params;
  const { driverId } = req.body;
  const ride = rides.get(rideId);
  
  if (!ride) return res.status(404).json({ success: false, error: 'Ride not found' });
  if (ride.status !== 'pending') return res.status(400).json({ success: false, error: 'Ride not available' });
  
  // Driver declined - ride stays pending for other drivers
  res.json({ success: true, message: 'Ride declined', ride });
});

router.post('/:rideId/driver-arrived', (req, res) => {
  const { rideId } = req.params;
  const ride = rides.get(rideId);
  
  if (!ride) return res.status(404).json({ success: false, error: 'Ride not found' });
  if (!ride.driverId) return res.status(400).json({ success: false, error: 'No driver assigned' });
  
  ride.status = 'driver_arrived';
  ride.updatedAt = new Date();
  rides.set(rideId, ride);
  
  res.json({ success: true, ride });
});

router.post('/:rideId/start', (req, res) => {
  const { rideId } = req.params;
  const { otp } = req.body;
  const ride = rides.get(rideId);
  
  if (!ride) return res.status(404).json({ success: false, error: 'Ride not found' });
  if (ride.otp && ride.otp !== otp) return res.status(400).json({ success: false, error: 'Invalid OTP' });
  
  ride.status = 'in_progress';
  ride.startedAt = new Date();
  ride.updatedAt = new Date();
  rides.set(rideId, ride);
  
  res.json({ success: true, ride });
});

router.post('/:rideId/complete', (req, res) => {
  const { rideId } = req.params;
  const ride = rides.get(rideId);
  
  if (!ride) return res.status(404).json({ success: false, error: 'Ride not found' });
  if (ride.status !== 'in_progress') return res.status(400).json({ success: false, error: 'Ride not in progress' });
  
  ride.status = 'completed';
  ride.completedAt = new Date();
  ride.paymentStatus = 'completed';
  ride.updatedAt = new Date();
  rides.set(rideId, ride);
  
  // Update driver stats
  if (ride.driverId) {
    const driver = drivers.get(ride.driverId);
    if (driver) {
      driver.totalRides = (driver.totalRides || 0) + 1;
      driver.updatedAt = new Date();
      drivers.set(driver.id, driver);
    }
  }
  
  res.json({ success: true, ride });
});

router.post('/:rideId/cancel', (req, res) => {
  const { rideId } = req.params;
  const ride = rides.get(rideId);
  
  if (!ride) return res.status(404).json({ success: false, error: 'Ride not found' });
  if (ride.status !== 'pending' && ride.status !== 'driver_assigned') {
    return res.status(400).json({ success: false, error: 'Cannot cancel ride' });
  }
  
  ride.status = 'cancelled';
  ride.updatedAt = new Date();
  rides.set(rideId, ride);
  
  res.json({ success: true, ride });
});

router.post('/:rideId/rate', (req, res) => {
  const { rideId } = req.params;
  const { rating, feedback } = req.body;
  const ride = rides.get(rideId);
  
  if (!ride) return res.status(404).json({ success: false, error: 'Ride not found' });
  if (ride.status !== 'completed') return res.status(400).json({ success: false, error: 'Ride not completed' });
  
  ride.rating = rating;
  ride.feedback = feedback;
  ride.updatedAt = new Date();
  rides.set(rideId, ride);
  
  res.json({ success: true, ride });
});

export default router;
