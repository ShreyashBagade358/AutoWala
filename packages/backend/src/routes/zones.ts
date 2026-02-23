import { Router } from 'express';

const router = Router();

const KOLHAPUR_ZONES = [
  { id: 'railway-station', name: 'Railway Station', nameMarathi: 'रेल्वे स्थानक', center: { latitude: 16.7050, longitude: 74.2439 }, baseFare: 25, perKmRate: 12, perMinuteRate: 1, minimumFare: 30, demand: 'high' },
  { id: 'bus-stand', name: 'Bus Stand (CBS)', nameMarathi: 'मध्यवर्ती बस स्थानक', center: { latitude: 16.6967, longitude: 74.2400 }, baseFare: 25, perKmRate: 12, perMinuteRate: 1, minimumFare: 30, demand: 'high' },
  { id: 'shahupuri', name: 'Shahupuri Market', nameMarathi: 'शाहपूरी मार्केट', center: { latitude: 16.6980, longitude: 74.2350 }, baseFare: 25, perKmRate: 12, perMinuteRate: 1, minimumFare: 30, demand: 'medium-high' },
  { id: 'mahalaxmi', name: 'Mahalaxmi Temple', nameMarathi: 'महालक्ष्मी मंदिर', center: { latitude: 16.6750, longitude: 74.2400 }, baseFare: 30, perKmRate: 12, perMinuteRate: 1, minimumFare: 40, demand: 'high' },
  { id: 'jyotiba', name: 'Jyotiba Temple', nameMarathi: 'ज्योतिबा मंदिर', center: { latitude: 16.7200, longitude: 74.1800 }, baseFare: 40, perKmRate: 14, perMinuteRate: 1.5, minimumFare: 50, demand: 'high' },
  { id: 'rankala', name: 'Rankala Lake', nameMarathi: 'रांकला तलाव', center: { latitude: 16.6820, longitude: 74.2250 }, baseFare: 30, perKmRate: 12, perMinuteRate: 1, minimumFare: 40, demand: 'medium' },
  { id: 'panhala', name: 'Panhala Fort', nameMarathi: 'पन्हाळा किल्ला', center: { latitude: 16.6500, longitude: 74.1000 }, baseFare: 50, perKmRate: 15, perMinuteRate: 1.5, minimumFare: 60, demand: 'medium' },
  { id: 'khasbag', name: 'Khasbag Stadium', nameMarathi: 'खासबाग स्टेडियम', center: { latitude: 16.6950, longitude: 74.2300 }, baseFare: 25, perKmRate: 12, perMinuteRate: 1, minimumFare: 30, demand: 'high' },
  { id: 'shivaji-udyan', name: 'Shivaji Udyamnagar', nameMarathi: 'शिवाजी उद्यान नगर', center: { latitude: 16.7100, longitude: 74.2350 }, baseFare: 25, perKmRate: 12, perMinuteRate: 1, minimumFare: 30, demand: 'medium' },
  { id: 'sykes', name: 'Sykes Extension', nameMarathi: 'सायक्स एक्स्टेंशन', center: { latitude: 16.7020, longitude: 74.2480 }, baseFare: 25, perKmRate: 12, perMinuteRate: 1, minimumFare: 30, demand: 'medium' },
  { id: 'ruchira', name: 'Ruchira Park', nameMarathi: 'रुचिरा पार्क', center: { latitude: 16.7150, longitude: 74.2300 }, baseFare: 25, perKmRate: 12, perMinuteRate: 1, minimumFare: 30, demand: 'low' },
  { id: 'sangavi', name: 'Sangavi', nameMarathi: 'सांगवी', center: { latitude: 16.7300, longitude: 74.2100 }, baseFare: 25, perKmRate: 12, perMinuteRate: 1, minimumFare: 30, demand: 'low' },
  { id: 'tarabai-park', name: 'Tarabai Park', nameMarathi: 'ताराबाई पार्क', center: { latitude: 16.6900, longitude: 74.2380 }, baseFare: 25, perKmRate: 12, perMinuteRate: 1, minimumFare: 30, demand: 'medium' },
  { id: 'laxmipuri', name: 'Laxmipuri', nameMarathi: 'लक्ष्मीपूरी', center: { latitude: 16.7080, longitude: 74.2250 }, baseFare: 25, perKmRate: 12, perMinuteRate: 1, minimumFare: 30, demand: 'medium' },
];

router.get('/', (req, res) => {
  res.json(KOLHAPUR_ZONES);
});

router.get('/:zoneId', (req, res) => {
  const { zoneId } = req.params;
  const zone = KOLHAPUR_ZONES.find(z => z.id === zoneId);
  
  if (!zone) {
    return res.status(404).json({ success: false, error: 'Zone not found' });
  }
  
  res.json(zone);
});

export default router;
