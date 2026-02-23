import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { drivers, driverPhones, driverLocations, getDriverById, rides } from '../data/store';

const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) return `+91${cleaned}`;
  if (cleaned.length === 12 && cleaned.startsWith('91')) return `+${cleaned}`;
  if (cleaned.length === 11 && cleaned.startsWith('0')) return `+91${cleaned.slice(1)}`;
  return phone;
};

const router = Router();

const generateToken = (driverId: string): string => {
  return jwt.sign({ driverId }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' });
};

router.post('/login', body('phone').notEmpty(), async (req, res) => {
  const { phone } = req.body;
  const formattedPhone = formatPhoneNumber(phone);
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  console.log(`Driver OTP for ${formattedPhone}: ${otp}`);
  res.json({ success: true, message: 'OTP sent successfully' });
});

router.post('/verify', body('phone').notEmpty(), body('otp').notEmpty(), async (req, res) => {
  const { phone, otp } = req.body;
  const formattedPhone = formatPhoneNumber(phone);
  
  if (otp !== '123456' && otp.length === 6) return res.status(400).json({ success: false, error: 'Invalid OTP' });
  
  let driverId = driverPhones.get(formattedPhone);
  let driver = driverId ? drivers.get(driverId) : null;
  
  if (!driver) {
    driverId = uuidv4();
    driver = {
      id: driverId,
      phone: formattedPhone,
      name: 'Auto Driver',
      vehicleNumber: 'MH 09 AB 1234',
      autoNumber: 'MH 09 AB 1234',
      zoneId: 'railway-station',
      status: 'available',
      rating: 4.8,
      totalRides: 150,
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    drivers.set(driverId, driver);
    driverPhones.set(formattedPhone, driverId);
    driverLocations.set(driverId, { driverId, zoneId: 'railway-station', status: 'available', lat: 16.7, lng: 74.2 });
  }
  
  const token = generateToken(driver.id);
  res.json({ success: true, token, driver });
});

router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ success: false, error: 'Unauthorized' });
  
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret') as { driverId: string };
    const driver = drivers.get(decoded.driverId);
    if (!driver) return res.status(404).json({ success: false, error: 'Driver not found' });
    res.json(driver);
  } catch { res.status(401).json({ success: false, error: 'Invalid token' }); }
});

router.post('/status', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ success: false, error: 'Unauthorized' });
  
  const { status, zoneId } = req.body;
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret') as { driverId: string };
    const driver = drivers.get(decoded.driverId);
    if (!driver) return res.status(404).json({ success: false, error: 'Driver not found' });
    
    driver.status = status;
    if (zoneId) driver.zoneId = zoneId;
    driver.updatedAt = new Date();
    drivers.set(driver.id, driver);
    
    driverLocations.set(driver.id, { 
      driverId: driver.id, 
      zoneId: driver.zoneId, 
      status, 
      lat: 16.7 + Math.random() * 0.05, 
      lng: 74.2 + Math.random() * 0.05 
    });
    
    res.json({ success: true, driver });
  } catch { res.status(401).json({ success: false, error: 'Invalid token' }); }
});

router.get('/location/:zoneId', (req, res) => {
  const { zoneId } = req.params;
  
  // If zoneId is "all", return all available drivers
  let availableDrivers;
  if (zoneId === 'all') {
    availableDrivers = Array.from(driverLocations.values())
      .filter(d => d.status === 'available');
  } else {
    availableDrivers = Array.from(driverLocations.values())
      .filter(d => d.status === 'available' && d.zoneId === zoneId);
  }
  
  res.json(availableDrivers.slice(0, 5));
});

router.get('/location/driver/:driverId', (req, res) => {
  const { driverId } = req.params;
  const location = driverLocations.get(driverId);
  if (location) {
    res.json(location);
  } else {
    res.json({ lat: 16.7, lng: 74.24 });
  }
});

// Update driver location
router.post('/location', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ success: false, error: 'Unauthorized' });
  
  const { lat, lng, rideId } = req.body;
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret') as { driverId: string };
    driverLocations.set(decoded.driverId, { 
      driverId: decoded.driverId, 
      lat, 
      lng, 
      rideId,
      status: 'available'
    });
    res.json({ success: true });
  } catch { res.status(401).json({ success: false, error: 'Invalid token' }); }
});

router.get('/rides/available', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ success: false, error: 'Unauthorized' });
  
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret') as { driverId: string };
    const driver = drivers.get(decoded.driverId);
    if (!driver) return res.status(404).json({ success: false, error: 'Driver not found' });
    
    // Get pending rides in driver's zone
    const ridesModule = require('./rides');
    // Return empty for now - rides are in memory
    res.json([]);
  } catch { res.status(401).json({ success: false, error: 'Invalid token' }); }
});

router.get('/rides/nearby', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ success: false, error: 'Unauthorized' });
  
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret') as { driverId: string };
    const driver = getDriverById(decoded.driverId);
    if (!driver) return res.status(404).json({ success: false, error: 'Driver not found' });
    
    // If driver has "all" zone access, return all pending rides
    let pendingRides;
    if (driver.zoneId === 'all') {
      pendingRides = Array.from(rides.values()).filter(
        (r: any) => r.status === 'pending'
      );
    } else {
      // Get pending rides from driver's zone only
      pendingRides = Array.from(rides.values()).filter(
        (r: any) => r.status === 'pending' && r.pickupLocation?.zoneId === driver.zoneId
      );
    }
    
    res.json(pendingRides);
  } catch { 
    res.json([]); 
  }
});

// Get driver stats (earnings, total rides, rating)
router.get('/stats', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ success: false, error: 'Unauthorized' });
  
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret') as { driverId: string };
    const driver = drivers.get(decoded.driverId);
    if (!driver) return res.status(404).json({ success: false, error: 'Driver not found' });
    
    // Calculate earnings from completed rides
    const completedRides = Array.from(rides.values()).filter(
      (r: any) => r.driverId === driver.id && r.status === 'completed'
    );
    
    const totalEarnings = completedRides.reduce((sum: number, r: any) => sum + (r.fare || 0), 0);
    const todayEarnings = completedRides
      .filter((r: any) => {
        const rideDate = new Date(r.completedAt);
        const today = new Date();
        return rideDate.toDateString() === today.toDateString();
      })
      .reduce((sum: number, r: any) => sum + (r.fare || 0), 0);
    
    res.json({
      totalEarnings,
      todayEarnings,
      totalRides: driver.totalRides || completedRides.length,
      rating: driver.rating || 4.8,
      completedRides: completedRides.length
    });
  } catch { res.status(401).json({ success: false, error: 'Invalid token' }); }
});

router.get('/rides/:rideId', (req, res) => {
  const ridesModule = require('./rides');
  res.json({ message: 'Use rides endpoint from driver app' });
});

router.post('/rides/:rideId/accept', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ success: false, error: 'Unauthorized' });
  
  const { rideId } = req.params;
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret') as { driverId: string };
    const driver = drivers.get(decoded.driverId);
    if (!driver) return res.status(404).json({ success: false, error: 'Driver not found' });
    
    res.json({ success: true, driverId: driver.id, driverName: driver.name, driverPhone: driver.phone, autoNumber: driver.autoNumber });
  } catch { res.status(401).json({ success: false, error: 'Invalid token' }); }
});

router.post('/rides/:rideId/arrived', (req, res) => res.json({ success: true, status: 'driver_arrived' }));
router.post('/rides/:rideId/start', (req, res) => res.json({ success: true, status: 'in_progress' }));
router.post('/rides/:rideId/complete', (req, res) => res.json({ success: true, status: 'completed' }));

export default router;
