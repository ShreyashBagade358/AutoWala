import { v4 as uuidv4 } from 'uuid';

// Shared in-memory storage
export const rides: Map<string, any> = new Map();
export const drivers: Map<string, any> = new Map();
export const driverPhones: Map<string, string> = new Map();
export const driverLocations: Map<string, any> = new Map();

// Initialize test drivers
const TEST_DRIVERS = [
  { phone: '+919876543210', name: 'Santosh Patil', autoNumber: 'MH 09 AB 1234', zoneId: 'railway-station' },
  { phone: '+919876543211', name: 'Ramesh Jadhav', autoNumber: 'MH 09 CD 5678', zoneId: 'bus-stand' },
  { phone: '+919876543212', name: 'Ajay More', autoNumber: 'MH 09 EF 9012', zoneId: 'mahalaxmi' },
  { phone: '+919876543213', name: 'Vijay Kamble', autoNumber: 'MH 09 GH 3456', zoneId: 'rankala' },
  { phone: '+919876543214', name: 'Dinesh Shinde', autoNumber: 'MH 09 IJ 7890', zoneId: 'shivaji-udyan' },
  { phone: '+919309484985', name: 'Auto Driver', autoNumber: 'MH 09 KK 0001', zoneId: 'all' },
];

for (const d of TEST_DRIVERS) {
  const driverId = uuidv4();
  drivers.set(driverId, {
    id: driverId,
    phone: d.phone,
    name: d.name,
    vehicleNumber: d.autoNumber,
    autoNumber: d.autoNumber,
    zoneId: d.zoneId,
    status: 'available',
    rating: 4.5 + Math.random() * 0.5,
    totalRides: Math.floor(Math.random() * 500) + 100,
    isVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  driverPhones.set(d.phone, driverId);
  driverLocations.set(driverId, { driverId, zoneId: d.zoneId, status: 'available', lat: 16.7 + Math.random() * 0.05, lng: 74.2 + Math.random() * 0.05 });
}

export const getDriverByPhone = (phone: string) => {
  const driverId = driverPhones.get(phone);
  return driverId ? drivers.get(driverId) : null;
};

export const getDriverById = (id: string) => drivers.get(id);
