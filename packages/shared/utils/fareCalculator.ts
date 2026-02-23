import { FareCalculation, GeoPoint } from '../types';
import { config } from '../constants/config';

export const calculateFare = (
  distanceKm: number,
  durationMinutes: number,
  baseFare: number = config.fares.defaultBaseFare,
  perKmRate: number = config.fares.defaultPerKmRate,
  perMinuteRate: number = config.fares.defaultPerMinuteRate,
  minimumFare: number = config.fares.defaultMinimumFare
): FareCalculation => {
  const distanceFare = distanceKm * perKmRate;
  const timeFare = durationMinutes * perMinuteRate;
  const totalFare = Math.max(baseFare + distanceFare + timeFare, minimumFare);

  return {
    baseFare,
    distanceFare: Math.round(distanceFare),
    timeFare: Math.round(timeFare),
    totalFare: Math.round(totalFare),
    minimumFare,
  };
};

export const calculateDistance = (
  point1: GeoPoint,
  point2: GeoPoint
): number => {
  const R = 6371;
  const dLat = toRad(point2.latitude - point1.latitude);
  const dLon = toRad(point2.longitude - point1.longitude);
  const lat1 = toRad(point1.latitude);
  const lat2 = toRad(point2.latitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (deg: number): number => {
  return deg * (Math.PI / 180);
};

export const isWithinRadius = (
  center: GeoPoint,
  point: GeoPoint,
  radiusKm: number
): boolean => {
  return calculateDistance(center, point) <= radiusKm;
};

export const formatFare = (fare: number): string => {
  return `₹${fare}`;
};

export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};
