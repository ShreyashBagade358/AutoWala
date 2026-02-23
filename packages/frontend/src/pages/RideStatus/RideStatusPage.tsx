import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MapTracking from '../../components/MapTracking/MapTracking';

interface Ride {
  id: string;
  status: string;
  pickupLocation: { address: string; zoneId: string; lat: number; lng: number };
  dropLocation: { address: string; zoneId: string; lat: number; lng: number };
  fare: number;
  estimatedFare: number;
  distance: number;
  duration: number;
  otp: string;
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  autoNumber?: string;
  rating?: number;
  feedback?: string;
  paymentStatus?: string;
  paymentMethod?: string;
}

type RideStatus = 'pending' | 'driver_assigned' | 'driver_arrived' | 'in_progress' | 'completed' | 'cancelled';

const STATUS_CONFIG: Record<RideStatus, { icon: string; title: string; description: string; color: string }> = {
  pending: { icon: '🔍', title: 'Finding your auto...', description: 'Connecting you with a nearby driver', color: 'bg-blue-500' },
  driver_assigned: { icon: '🚗', title: 'Driver Assigned!', description: 'Your driver is on the way', color: 'bg-yellow-500' },
  driver_arrived: { icon: '🎯', title: 'Driver Arrived!', description: 'Walk to the pickup point', color: 'bg-green-500' },
  in_progress: { icon: '🚙', title: 'Ride in Progress', description: 'Heading to your destination', color: 'bg-purple-500' },
  completed: { icon: '✅', title: 'Ride Completed!', description: 'Thank you for riding with us', color: 'bg-emerald-500' },
  cancelled: { icon: '❌', title: 'Ride Cancelled', description: 'Your ride has been cancelled', color: 'bg-red-500' }
};

const RATING_STARS = [1, 2, 3, 4, 5];

const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const calculateEta = (distanceKm: number) => {
  const avgSpeedKmh = 30;
  return Math.ceil((distanceKm / avgSpeedKmh) * 60);
};

export default function RideStatusPage() {
  const { rideId } = useParams();
  const navigate = useNavigate();
  const [ride, setRide] = useState<Ride | null>(null);
  const [loading, setLoading] = useState(true);
  const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [driverEta, setDriverEta] = useState<number | null>(null);
  const [driverDistance, setDriverDistance] = useState<number | null>(null);
  const [showSosModal, setShowSosModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [showTipModal, setShowTipModal] = useState(false);
  const [isRatingSubmitting, setIsRatingSubmitting] = useState(false);

  useEffect(() => {
    const fetchRide = async () => {
      try {
        const token = localStorage.getItem('autowala_token');
        const res = await fetch(`/api/rides/${rideId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (res.ok) {
          const data = await res.json();
          setRide(data);
          if (data.status === 'completed' && !data.rating) {
            setShowRatingModal(true);
          }
        }
      } catch (err) {
        console.error('Failed to fetch ride:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRide();
    const interval = setInterval(fetchRide, 3000);
    return () => clearInterval(interval);
  }, [rideId]);

  useEffect(() => {
    if (!navigator.geolocation) return;
    const interval = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        () => {},
        () => {},
        { enableHighAccuracy: true }
      );
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!ride?.driverId || !rideId) return;
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    try {
      const ws = new WebSocket(`${wsProtocol}//${window.location.host}`);
      ws.onopen = () => ws.send(JSON.stringify({ type: 'join-ride', rideId }));
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'location-update') {
            setDriverLocation({ lat: data.lat, lng: data.lng });
            if (ride?.pickupLocation) {
              const distance = calculateDistance(data.lat, data.lng, ride.pickupLocation.lat, ride.pickupLocation.lng);
              setDriverDistance(distance);
              setDriverEta(calculateEta(distance));
            }
          }
        } catch (e) {}
      };
      return () => ws.close();
    } catch (e) {}
  }, [ride?.driverId, rideId, ride?.pickupLocation]);

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this ride?')) return;
    try {
      const res = await fetch(`/api/rides/${rideId}/cancel`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 500);
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      console.error('Failed to cancel ride:', err);
      navigate('/', { replace: true });
    }
  };

  const handleRateDriver = async () => {
    if (rating === 0) return;
    setIsRatingSubmitting(true);
    try {
      await fetch(`/api/rides/${rideId}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, feedback })
      });
      setShowRatingModal(false);
      setRide(prev => prev ? { ...prev, rating } : null);
    } catch (err) {
      console.error('Failed to rate driver:', err);
    } finally {
      setIsRatingSubmitting(false);
    }
  };

  const handleAddTip = (amount: number) => {
    console.log('Tip added:', amount);
    setShowTipModal(false);
  };

  const handleShareTrip = () => {
    const shareData = {
      title: 'AutoWala Ride',
      text: `My ride from ${ride?.pickupLocation.address} to ${ride?.dropLocation.address}`,
      url: window.location.href
    };
    if (navigator.share) {
      navigator.share(shareData);
    } else {
      navigator.clipboard.writeText(`My AutoWala ride: ${ride?.pickupLocation.address} → ${ride?.dropLocation.address}`);
      alert('Ride details copied to clipboard!');
    }
    setShowShareModal(false);
  };

  const handleSos = () => {
    setShowSosModal(true);
  };

  const handleEmergencyCall = () => {
    window.location.href = 'tel:100';
    setShowSosModal(false);
  };

  const downloadReceipt = () => {
    const receiptContent = `
AutoWala Ride Receipt
======================
Ride ID: ${ride?.id}
Date: ${new Date().toLocaleDateString()}

From: ${ride?.pickupLocation.address}
To: ${ride?.dropLocation.address}

Distance: ${ride?.distance} km
Total Fare: ₹${ride?.fare}

Driver: ${ride?.driverName || 'N/A'}
Vehicle: ${ride?.autoNumber || 'N/A'}
    `.trim();
    
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${ride?.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
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
      <div className="h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 flex flex-col items-center justify-center p-4">
        <p className="text-white mb-4">Ride not found</p>
        <button 
          onClick={() => navigate('/', { replace: true })} 
          className="px-6 py-2 bg-white/20 text-white rounded-xl"
        >
          Go Home
        </button>
      </div>
    );
  }

  const currentStatus = STATUS_CONFIG[ride.status as RideStatus] || STATUS_CONFIG.pending;

  return (
    <div className="h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 flex flex-col overflow-hidden">
      <div className="flex-1 min-h-0 relative">
        <MapTracking
          pickupLocation={ride.pickupLocation}
          dropLocation={ride.status === 'in_progress' || ride.status === 'completed' ? ride.dropLocation : undefined}
          driverLocation={driverLocation || undefined}
        />
        
        <div className="absolute top-0 left-0 right-0 bg-white/20 backdrop-blur-md p-4 z-10">
          <div className="flex items-center justify-between">
            <button onClick={() => navigate('/', { replace: true })} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <p className="text-white font-bold">{currentStatus.title}</p>
            <button onClick={handleSos} className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </button>
          </div>
        </div>

        {ride.status !== 'completed' && ride.status !== 'cancelled' && (
          <div className="absolute top-20 right-3 flex flex-col gap-2">
            <button onClick={() => setShowShareModal(true)} className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
          </div>
        )}
      </div>

      <div className="bg-white/10 backdrop-blur-xl rounded-t-3xl border-t border-white/20 p-5 flex-shrink-0 overflow-y-auto max-h-[50vh]">
        <div className="w-12 h-1 bg-white/30 rounded-full mx-auto mb-4"></div>

        <div className={`${currentStatus.color} rounded-xl p-3 mb-4`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{currentStatus.icon}</span>
            <div>
              <p className="text-white font-bold">{currentStatus.title}</p>
              <p className="text-white/80 text-sm">{currentStatus.description}</p>
            </div>
          </div>
        </div>

        {driverEta && driverDistance && (ride.status === 'driver_assigned' || ride.status === 'driver_arrived') && (
          <div className="flex gap-4 mb-4">
            <div className="flex-1 bg-white/10 rounded-xl p-3 text-center">
              <p className="text-white/60 text-xs">Arriving in</p>
              <p className="text-white font-bold text-xl">{driverEta} min</p>
            </div>
            <div className="flex-1 bg-white/10 rounded-xl p-3 text-center">
              <p className="text-white/60 text-xs">Distance</p>
              <p className="text-white font-bold text-xl">{driverDistance.toFixed(1)} km</p>
            </div>
          </div>
        )}

        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
            <div>
              <p className="text-white/60 text-xs">Pickup</p>
              <p className="text-white font-medium">{ride.pickupLocation.address}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div>
              <p className="text-white/60 text-xs">Drop</p>
              <p className="text-white font-medium">{ride.dropLocation.address}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center py-3 border-t border-white/20">
          <div>
            <p className="text-white/60 text-xs">Estimated Fare</p>
            <p className="text-white font-bold text-2xl">₹{ride.estimatedFare}</p>
          </div>
          <div className="text-right">
            <p className="text-white/60 text-xs">Distance</p>
            <p className="text-white font-bold">{ride.distance} km</p>
          </div>
          <div className="text-right">
            <p className="text-white/60 text-xs">Duration</p>
            <p className="text-white font-bold">~{ride.duration} min</p>
          </div>
        </div>

        {ride.status === 'driver_arrived' && (
          <div className="bg-orange-500/80 backdrop-blur-sm rounded-xl p-4 mt-3">
            <p className="text-white/80 text-xs">Ride OTP</p>
            <p className="text-white font-bold text-3xl tracking-wider">{ride.otp}</p>
            <p className="text-white/70 text-xs mt-1">Share this with your driver</p>
          </div>
        )}

        {ride.status === 'in_progress' && (
          <div className="bg-purple-500/30 backdrop-blur-sm rounded-xl p-4 mt-3">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-white/80 text-xs">Trip in progress</p>
                <p className="text-white font-medium">Keep this screen open for tracking</p>
              </div>
              <button onClick={() => setShowShareModal(true)} className="px-4 py-2 bg-white/20 rounded-lg text-white text-sm">
                Share Trip
              </button>
            </div>
          </div>
        )}

        {ride.driverName && (
          <div className="flex items-center gap-4 py-3 border-t border-white/20 mt-3">
            <div className="w-14 h-14 bg-yellow-400 rounded-full flex items-center justify-center text-gray-900 font-bold text-xl">
              {ride.driverName.charAt(0)}
            </div>
            <div className="flex-1">
              <p className="text-white font-bold">{ride.driverName}</p>
              <p className="text-white/60 text-sm">{ride.autoNumber}</p>
            </div>
            {ride.driverPhone && (
              <a href={`tel:${ride.driverPhone}`} className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </a>
            )}
          </div>
        )}

        {ride.status === 'completed' && (
          <div className="mt-3 space-y-3">
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-white font-bold mb-3">Fare Breakdown</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-white/80">
                  <span>Base Fare</span>
                  <span>₹{Math.round(ride.estimatedFare * 0.6)}</span>
                </div>
                <div className="flex justify-between text-white/80">
                  <span>Distance ({ride.distance} km)</span>
                  <span>₹{Math.round(ride.estimatedFare * 0.3)}</span>
                </div>
                <div className="flex justify-between text-white/80">
                  <span>Tax & Fees</span>
                  <span>₹{Math.round(ride.estimatedFare * 0.1)}</span>
                </div>
                <div className="border-t border-white/20 pt-2 flex justify-between font-bold text-white">
                  <span>Total</span>
                  <span>₹{ride.fare}</span>
                </div>
              </div>
            </div>

            {ride.rating ? (
              <div className="bg-green-500/30 rounded-xl p-4 text-center">
                <p className="text-white/80 text-sm">You rated this trip</p>
                <div className="flex justify-center gap-1 mt-1">
                  {[1,2,3,4,5].map((star) => (
                    <span key={star} className={star <= (ride.rating || 0) ? 'text-yellow-400' : 'text-white/30'}>★</span>
                  ))}
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowRatingModal(true)}
                className="w-full py-3 bg-yellow-400 text-gray-900 rounded-xl font-bold"
              >
                Rate Your Driver
              </button>
            )}

            {/* Payment Status */}
            <div className="bg-white/10 rounded-xl p-3 flex justify-between items-center">
              <div>
                <p className="text-white/60 text-xs">Payment</p>
                <p className="text-white font-medium">{ride.paymentMethod === 'cash' ? 'Cash' : 'Online'}</p>
              </div>
              <div className="text-right">
                <p className="text-white/60 text-xs">Status</p>
                <p className={`font-medium ${ride.paymentStatus === 'completed' ? 'text-green-400' : 'text-orange-400'}`}>
                  {ride.paymentStatus === 'completed' ? 'Paid' : 'Pending'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowTipModal(true)}
              className="w-full py-3 border-2 border-green-500 text-green-400 rounded-xl font-medium"
            >
              Add Tip
            </button>

            <div className="flex gap-3">
              <button
                onClick={downloadReceipt}
                className="flex-1 py-3 bg-white/20 text-white rounded-xl font-medium flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Receipt
              </button>
              <button
                onClick={() => setShowShareModal(true)}
                className="flex-1 py-3 bg-white/20 text-white rounded-xl font-medium flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share
              </button>
            </div>

            <button
              onClick={() => navigate('/', { replace: true })}
              className="w-full mt-2 py-3 bg-yellow-400 text-gray-900 rounded-xl font-bold"
            >
              Book Another Ride
            </button>
          </div>
        )}

        {ride.status !== 'completed' && ride.status !== 'cancelled' && (
          <button
            onClick={handleCancel}
            className="w-full mt-4 py-3 border-2 border-red-500 text-white rounded-xl font-medium hover:bg-red-500/20 transition"
          >
            Cancel Ride
          </button>
        )}
      </div>

      {showSosModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center" style={{ zIndex: 9999 }}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4" style={{ zIndex: 10000 }}>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🆘</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Emergency Assistance</h3>
              <p className="text-gray-600 text-sm mb-6">Choose an emergency option below</p>
              
              <button
                onClick={handleEmergencyCall}
                className="w-full py-4 bg-red-500 text-white rounded-xl font-bold mb-3 flex items-center justify-center gap-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Call Police (100)
              </button>
              
              <button
                onClick={() => { window.location.href = 'tel:108'; setShowSosModal(false); }}
                className="w-full py-4 bg-orange-500 text-white rounded-xl font-bold mb-3 flex items-center justify-center gap-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Call Ambulance (108)
              </button>

              <button
                onClick={() => setShowSosModal(false)}
                className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showShareModal && (
        <div className="fixed inset-0 bg-black/80" style={{ zIndex: 9999 }}>
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6" style={{ zIndex: 10000 }}>
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Share Trip</h3>
            
            <div className="space-y-3">
              <button
                onClick={handleShareTrip}
                className="w-full py-4 bg-green-500 text-white rounded-xl font-bold flex items-center justify-center gap-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share with Contacts
              </button>

              <button
                onClick={() => {
                  const text = `My AutoWala ride: ${ride.pickupLocation.address} → ${ride.dropLocation.address}`;
                  navigator.clipboard.writeText(text);
                  alert('Ride details copied to clipboard!');
                  setShowShareModal(false);
                }}
                className="w-full py-4 bg-gray-100 text-gray-700 rounded-xl font-medium flex items-center justify-center gap-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy Details
              </button>
            </div>

            <button
              onClick={() => setShowShareModal(false)}
              className="w-full mt-4 py-3 text-gray-500 font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showRatingModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center" style={{ zIndex: 9999 }}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4" style={{ zIndex: 10000 }}>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Rate Your Trip</h3>
            <p className="text-gray-600 text-sm mb-6">How was your ride with {ride.driverName}?</p>
            
            <div className="flex justify-center gap-2 mb-6">
              {RATING_STARS.map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="text-4xl transition-transform hover:scale-110"
                >
                  {star <= rating ? '★' : '☆'}
                </button>
              ))}
            </div>

            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Add feedback (optional)"
              className="w-full p-3 border border-gray-200 rounded-xl text-sm mb-4 resize-none"
              rows={3}
            />

            <button
              onClick={handleRateDriver}
              disabled={rating === 0 || isRatingSubmitting}
              className="w-full py-3 bg-yellow-400 text-gray-900 rounded-xl font-bold disabled:opacity-50"
            >
              {isRatingSubmitting ? 'Submitting...' : 'Submit Rating'}
            </button>

            <button
              onClick={() => setShowRatingModal(false)}
              className="w-full mt-3 py-2 text-gray-500 font-medium"
            >
              Skip
            </button>
          </div>
        </div>
      )}

      {showTipModal && (
        <div className="fixed inset-0 bg-black/80" style={{ zIndex: 9999 }}>
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6" style={{ zIndex: 10000 }}>
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Add Tip</h3>
            
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[20, 50, 100].map((amount) => (
                <button
                  key={amount}
                  onClick={() => handleAddTip(amount)}
                  className="py-3 border-2 border-green-500 text-green-600 rounded-xl font-bold"
                >
                  ₹{amount}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowTipModal(false)}
              className="w-full py-3 text-gray-500 font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
