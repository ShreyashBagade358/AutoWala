import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';

interface Location {
  lat: number;
  lng: number;
  address?: string;
  heading?: number;
}

interface MapTrackingProps {
  pickupLocation?: Location;
  dropLocation?: Location;
  driverLocation?: Location;
  rideId?: string;
}

const KOLHAPUR_CENTER: [number, number] = [16.70, 74.24];

// Smooth animation helper
const animateMarker = (
  marker: L.Marker,
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
  duration: number = 1500,
  onUpdate?: (lat: number, lng: number) => void
) => {
  const start = performance.now();
  
  const animate = (currentTime: number) => {
    const elapsed = currentTime - start;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing function (ease-out)
    const easeProgress = 1 - Math.pow(1 - progress, 3);
    
    const lat = fromLat + (toLat - fromLat) * easeProgress;
    const lng = fromLng + (toLng - fromLng) * easeProgress;
    
    marker.setLatLng([lat, lng]);
    onUpdate?.(lat, lng);
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };
  
  requestAnimationFrame(animate);
};

// Calculate bearing between two points
const calculateBearing = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const lat1Rad = lat1 * Math.PI / 180;
  const lat2Rad = lat2 * Math.PI / 180;
  
  const x = Math.sin(dLng) * Math.cos(lat2Rad);
  const y = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);
  
  let bearing = Math.atan2(x, y) * 180 / Math.PI;
  return (bearing + 360) % 360;
};

export default function MapTracking({ 
  pickupLocation, 
  dropLocation, 
  driverLocation
}: MapTrackingProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const pickupMarker = useRef<L.Marker | null>(null);
  const dropMarker = useRef<L.Marker | null>(null);
  const driverMarker = useRef<L.Marker | null>(null);
  const routeLine = useRef<L.Polyline | null>(null);
  const [isClient, setIsClient] = useState(false);
  
  // Track previous driver position for smooth animation
  const prevDriverPos = useRef<{ lat: number; lng: number } | null>(null);
  // Track current route type
  const currentRouteType = useRef<'pickup' | 'drop' | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || !isClient || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      center: KOLHAPUR_CENTER,
      zoom: 15,
      zoomControl: false,
      attributionControl: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      minZoom: 10,
      noWrap: true,
      attribution: '© OpenStreetMap'
    }).addTo(map);

    mapInstance.current = map;

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [isClient]);

  // Handle markers - only when locations change (not every GPS update)
  useEffect(() => {
    if (!mapInstance.current || !isClient) return;

    const map = mapInstance.current;

    // Add pickup marker (green pin)
    if (pickupLocation && pickupLocation.lat && pickupLocation.lng) {
      if (!pickupMarker.current) {
        const icon = L.divIcon({
          className: 'custom-marker',
          html: '<div style="background:#22c55e;width:36px;height:36px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 3px 10px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;"><span style="transform:rotate(45deg);font-size:18px;">📍</span></div>',
          iconSize: [36, 36],
          iconAnchor: [18, 36]
        });
        pickupMarker.current = L.marker([pickupLocation.lat, pickupLocation.lng], { icon })
          .addTo(map)
          .bindPopup(pickupLocation.address || 'Pickup');
      }
    }

    // Add drop marker (red flag)
    if (dropLocation && dropLocation.lat && dropLocation.lng) {
      if (!dropMarker.current) {
        const icon = L.divIcon({
          className: 'custom-marker',
          html: '<div style="background:#ef4444;width:36px;height:36px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 3px 10px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;"><span style="transform:rotate(45deg);font-size:18px;">🏁</span></div>',
          iconSize: [36, 36],
          iconAnchor: [18, 36]
        });
        dropMarker.current = L.marker([dropLocation.lat, dropLocation.lng], { icon })
          .addTo(map)
          .bindPopup(dropLocation.address || 'Drop');
      }
    }

  }, [pickupLocation?.lat, pickupLocation?.lng, dropLocation?.lat, dropLocation?.lng, isClient]);

  // Driver marker with smooth animation (CRITICAL)
  useEffect(() => {
    if (!mapInstance.current || !isClient || !driverLocation || !driverLocation.lat || !driverLocation.lng) return;

    const map = mapInstance.current;

    if (!driverMarker.current) {
      // Create car marker with rotation support
      const carIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div id="driver-car-marker" style="width:44px;height:44px;position:relative;">
          <div style="background:#f59e0b;width:44px;height:44px;border-radius:50%;border:3px solid white;box-shadow:0 4px 15px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;transform:rotate(0deg);transition:transform 0.3s ease;">
            <span style="font-size:24px;">🚕</span>
          </div>
        </div>`,
        iconSize: [44, 44],
        iconAnchor: [22, 22]
      });
      
      driverMarker.current = L.marker([driverLocation.lat, driverLocation.lng], { icon: carIcon })
        .addTo(map)
        .bindPopup('Your Driver');
      
      prevDriverPos.current = { lat: driverLocation.lat, lng: driverLocation.lng };
    } else {
      // Smooth animation to new position
      if (prevDriverPos.current) {
        animateMarker(
          driverMarker.current,
          prevDriverPos.current.lat,
          prevDriverPos.current.lng,
          driverLocation.lat,
          driverLocation.lng,
          1500
        );
        
        // Rotate car based on heading or calculated direction
        const bearing = driverLocation.heading || calculateBearing(
          prevDriverPos.current.lat,
          prevDriverPos.current.lng,
          driverLocation.lat,
          driverLocation.lng
        );
        
        // Update rotation
        const markerEl = document.getElementById('driver-car-marker');
        if (markerEl) {
          const innerDiv = markerEl.querySelector('div') as HTMLElement;
          if (innerDiv) {
            innerDiv.style.transform = `rotate(${bearing}deg)`;
          }
        }
      }
      
      prevDriverPos.current = { lat: driverLocation.lat, lng: driverLocation.lng };
    }

    // Route management - only draw route when trip state changes
    const showDropRoute = dropLocation && dropLocation.lat && dropLocation.lng && 
      (!pickupLocation || !pickupLocation.lat || !pickupLocation.lng);
    
    const routeType: 'pickup' | 'drop' = showDropRoute ? 'drop' : 'pickup';
    
    // Only update route if it changed
    if (currentRouteType.current !== routeType) {
      currentRouteType.current = routeType;
      
      // Clear existing route
      if (routeLine.current) {
        routeLine.current.remove();
        routeLine.current = null;
      }
      
      const routeFrom = driverLocation;
      const routeTo = routeType === 'drop' ? dropLocation : pickupLocation;
      
      if (routeTo && routeTo.lat && routeTo.lng) {
        // Draw simple direct route (in production, use Directions API)
        routeLine.current = L.polyline([
          [routeFrom.lat, routeFrom.lng],
          [routeTo.lat, routeTo.lng]
        ], { 
          color: '#3b82f6', 
          weight: 5, 
          opacity: 0.8,
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(map);
      }
    }

    // Smooth camera follow (not every time, to avoid jitter)
    map.setView([driverLocation.lat, driverLocation.lng], 16);

  }, [driverLocation?.lat, driverLocation?.lng, isClient]);

  // Cleanup markers when trip ends
  useEffect(() => {
    if (!mapInstance.current || !isClient) return;
    
    // If no driver location, cleanup
    if (!driverLocation) {
      if (driverMarker.current) {
        driverMarker.current.remove();
        driverMarker.current = null;
      }
      if (routeLine.current) {
        routeLine.current.remove();
        routeLine.current = null;
      }
      prevDriverPos.current = null;
      currentRouteType.current = null;
    }
  }, [driverLocation, isClient]);

  if (!isClient) {
    return (
      <div className="w-full h-full bg-gray-900 flex items-center justify-center">
        <p className="text-white/60">Loading map...</p>
      </div>
    );
  }

  return (
    <div 
      ref={mapRef} 
      className="w-full h-full"
      style={{ minHeight: '100%', background: '#1a1a2e' }}
    />
  );
}
