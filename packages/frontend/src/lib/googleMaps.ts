import { Loader } from '@googlemaps/js-api-loader';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

export const mapsLoader = new Loader({
  apiKey: GOOGLE_MAPS_API_KEY,
  version: 'weekly',
  libraries: ['places', 'geometry'],
});

let googleMapsReady = false;

export const initGoogleMaps = async () => {
  if (googleMapsReady) return;
  
  try {
    await mapsLoader.load();
    googleMapsReady = true;
  } catch (error) {
    console.error('Failed to load Google Maps:', error);
    throw error;
  }
};

export const getCurrentLocation = (): Promise<google.maps.LatLngLiteral> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      }
    );
  });
};

export const calculateDistance = (
  origin: google.maps.LatLngLiteral,
  destination: google.maps.LatLngLiteral
): number => {
  const originLatLng = new google.maps.LatLng(origin.lat, origin.lng);
  const destLatLng = new google.maps.LatLng(destination.lat, destination.lng);
  return google.maps.geometry.spherical.computeDistanceBetween(originLatLng, destLatLng) / 1000;
};
