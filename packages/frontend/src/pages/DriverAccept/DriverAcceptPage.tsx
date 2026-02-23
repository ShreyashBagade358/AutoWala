import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import MapTracking from '../../components/MapTracking/MapTracking';

interface RideData {
  id: string;
  status: string;
  pickupLocation: { address: string; zoneId: string; lat: number; lng: number };
  dropLocation: { address: string; zoneId: string; lat: number; lng: number };
  fare: number;
  estimatedFare: number;
  distance: number;
  duration: number;
  otp: string;
}

export default function DriverAcceptPage() {
  const { rideId } = useParams();
  const navigate = useNavigate();
  const { driver } = useAuthStore();
  const [ride, setRide] = useState<RideData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [otpInput, setOtpInput] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const locationInterval = useRef<NodeJS.Timeout | null>(null);

  const fetchRide = async () => {
    try {
      const token = localStorage.getItem('autowala_driver_token');
      const res = await fetch(`/api/rides/${rideId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setRide(data);
      }
    } catch (err) {
      console.error('Failed to fetch ride:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!navigator.geolocation) return;
    const updateLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = { lat: position.coords.latitude, lng: position.coords.longitude };
          setCurrentLocation(loc);
          const token = localStorage.getItem('autowala_driver_token');
          if (token && ride?.id) {
            fetch('/api/drivers/location', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ ...loc, rideId: ride.id })
            }).catch(() => {});
          }
        },
        () => {},
        { enableHighAccuracy: true }
      );
    };
    updateLocation();
    locationInterval.current = setInterval(updateLocation, 5000);
    return () => { if (locationInterval.current) clearInterval(locationInterval.current); };
  }, [ride?.id]);

  useEffect(() => {
    fetchRide();
    const interval = setInterval(fetchRide, 5000);
    return () => clearInterval(interval);
  }, [rideId]);

  const handleAccept = async () => {
    if (!ride || !driver) return;
    try {
      const token = localStorage.getItem('autowala_driver_token');
      const res = await fetch(`/api/rides/${rideId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ driverId: driver.id, driverName: driver.name, driverPhone: driver.phone, autoNumber: driver.autoNumber })
      });
      const data = await res.json();
      if (data.success) setRide(data.ride);
    } catch (err) { console.error('Failed to accept ride:', err); }
  };

  const handleArrived = async () => {
    try {
      const token = localStorage.getItem('autowala_driver_token');
      const res = await fetch(`/api/rides/${rideId}/driver-arrived`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
      });
      const data = await res.json();
      if (data.success) setRide(data.ride);
    } catch (err) { console.error('Failed to update status:', err); }
  };

  const handleStartRide = () => {
    setShowOtpModal(true);
  };

  const submitOtp = async () => {
    if (!otpInput.trim()) return;
    try {
      const token = localStorage.getItem('autowala_driver_token');
      const res = await fetch(`/api/rides/${rideId}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ otp: otpInput })
      });
      const data = await res.json();
      if (data.success) {
        setRide(data.ride);
        setShowOtpModal(false);
        setOtpInput('');
      } else {
        alert(data.error || 'Invalid OTP');
      }
    } catch (err) { console.error('Failed to start ride:', err); }
  };

  const handleCompleteRide = async () => {
    if (!confirm('Complete this ride?')) return;
    try {
      const token = localStorage.getItem('autowala_driver_token');
      const res = await fetch(`/api/rides/${rideId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
      });
      const data = await res.json();
      if (data.success) setRide(data.ride);
    } catch (err) { console.error('Failed to complete ride:', err); }
  };

  const openNavigation = () => {
    if (!ride?.pickupLocation) return;
    const { lat, lng } = ride.pickupLocation;
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  };

  if (loading) {
    return (
      <div className="h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!ride) {
    return (
      <div className="h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white mb-4">Ride not found</p>
          <button onClick={() => navigate('/driver', { replace: true })} className="text-white/80">Back to Home</button>
        </div>
      </div>
    );
  }

  const getStatusText = () => {
    switch (ride.status) {
      case 'pending': return 'New Ride Request';
      case 'driver_assigned': return 'Go to Pickup';
      case 'driver_arrived': return 'Waiting for Rider';
      case 'in_progress': return 'Ride in Progress';
      case 'completed': return 'Ride Completed';
      default: return ride.status;
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 flex flex-col overflow-hidden">
      {/* Full Screen Map */}
      <div className="flex-1 min-h-0 relative">
        {(ride.status === 'driver_assigned' || ride.status === 'driver_arrived') && (
          <MapTracking pickupLocation={ride.pickupLocation} driverLocation={currentLocation || undefined} />
        )}
        {ride.status === 'in_progress' && (
          <MapTracking pickupLocation={ride.pickupLocation} dropLocation={ride.dropLocation} driverLocation={currentLocation || undefined} />
        )}
        {ride.status === 'pending' && (
          <div className="h-full bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 flex items-center justify-center">
            <div className="text-center p-8">
              <p className="text-6xl mb-4">🚕</p>
              <p className="text-xl font-bold text-white">New Ride Request</p>
              <p className="text-white/60 mt-2">Accept to see pickup location</p>
            </div>
          </div>
        )}

        {/* Status Banner */}
        <div className="absolute top-0 left-0 right-0 bg-white/20 backdrop-blur-md p-4 z-10">
          <div className="flex items-center justify-between">
            <button onClick={() => navigate('/driver', { replace: true })} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <p className="text-white font-bold">{getStatusText()}</p>
            <div className="w-10"></div>
          </div>
        </div>

        {/* ETA Badge */}
        {(ride.status === 'driver_assigned' || ride.status === 'driver_arrived') && (
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-white/20 backdrop-blur-md rounded-full px-4 py-2 z-10">
            <p className="text-white font-medium text-sm">4 MIN ETA</p>
          </div>
        )}
      </div>

      {/* Bottom Sheet - Glass Design */}
      <div className="bg-white/10 backdrop-blur-xl rounded-t-3xl border-t border-white/20 p-5 flex-shrink-0 overflow-y-auto max-h-[50vh]">
        <div className="w-12 h-1 bg-white/30 rounded-full mx-auto mb-4"></div>

        {/* Trip Details */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
            <div>
              <p className="text-white/60 text-xs">Pickup</p>
              <p className="text-white font-medium">{ride.pickupLocation?.address}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div>
              <p className="text-white/60 text-xs">Drop</p>
              <p className="text-white font-medium">{ride.dropLocation?.address}</p>
            </div>
          </div>
        </div>

        {/* Fare */}
        <div className="flex justify-between items-center py-3 border-t border-white/20">
          <div>
            <p className="text-white/60 text-xs">Fare</p>
            <p className="text-white font-bold text-2xl">₹{ride.estimatedFare}</p>
          </div>
          <div className="text-right">
            <p className="text-white/60 text-xs">{ride.distance} km</p>
            <p className="text-white/60 text-xs">~{ride.duration} min</p>
          </div>
        </div>

        {/* Action Buttons */}
        {ride.status === 'pending' && (
          <div className="space-y-2 mt-4">
            <button onClick={handleAccept} className="w-full bg-green-500 text-white py-4 rounded-2xl font-bold text-lg">
              Accept Ride
            </button>
            <button onClick={() => navigate('/driver', { replace: true })} className="w-full py-3 bg-white/10 text-white/70 rounded-2xl font-medium">
              Decline
            </button>
          </div>
        )}

        {ride.status === 'driver_assigned' && (
          <div className="space-y-2 mt-4">
            <button onClick={openNavigation} className="w-full py-3 bg-blue-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2">
              🧭 Navigate
            </button>
            <button onClick={handleArrived} className="w-full bg-green-500 text-white py-4 rounded-2xl font-bold text-lg">
              I've Arrived
            </button>
          </div>
        )}

        {ride.status === 'driver_arrived' && (
          <button onClick={handleStartRide} className="w-full mt-4 bg-yellow-400 text-gray-900 py-4 rounded-2xl font-bold text-lg">
            🔐 Start Ride (Enter OTP)
          </button>
        )}

        {ride.status === 'in_progress' && (
          <div className="space-y-2 mt-4">
            <button onClick={openNavigation} className="w-full py-3 bg-blue-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2">
              🧭 Navigate to Drop
            </button>
            <div className="bg-green-500/80 rounded-2xl p-4 text-center">
              <p className="text-white font-medium mb-2">Collect Fare: ₹{ride.fare}</p>
              <button onClick={handleCompleteRide} className="w-full bg-white text-green-600 py-3 rounded-xl font-bold">
                ✅ Complete Ride
              </button>
            </div>
          </div>
        )}

        {ride.status === 'completed' && (
          <div className="text-center py-4">
            <p className="text-4xl mb-2">✅</p>
            <p className="text-white font-bold text-xl">Ride Completed!</p>
            <p className="text-white/60">Fare collected: ₹{ride.fare}</p>
            <button onClick={() => navigate('/driver', { replace: true })} className="w-full mt-4 bg-yellow-400 text-gray-900 py-3 rounded-2xl font-bold">
              Back to Home
            </button>
          </div>
        )}
      </div>

      {/* OTP Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center" style={{ zIndex: 9999 }}>
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-sm border-2 border-yellow-400 mx-4" style={{ zIndex: 10000 }}>
            <h3 className="text-xl font-bold text-white text-center mb-4">Enter Ride OTP</h3>
            <p className="text-white/60 text-center mb-4">Ask the rider for the OTP</p>
            <input
              type="text"
              value={otpInput}
              onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="Enter 4-digit OTP"
              className="w-full p-4 border-2 border-white/30 rounded-xl text-center text-2xl font-bold tracking-widest bg-white text-gray-900 outline-none focus:border-yellow-400 mb-4"
              maxLength={4}
              autoFocus
            />
            <div className="flex gap-2">
              <button onClick={() => { setShowOtpModal(false); setOtpInput(''); }} className="flex-1 py-3 bg-gray-700 text-white rounded-xl font-medium">
                Cancel
              </button>
              <button onClick={submitOtp} className="flex-1 py-3 bg-yellow-400 text-gray-900 rounded-xl font-bold">
                Start Ride
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
