import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRideStore } from '../../store/rideStore';
import { useSocket } from '../../hooks/useSocket';
import MapTracking from '../../components/MapTracking/MapTracking';

export default function BookingPage() {
  const navigate = useNavigate();
  const { rideId } = useParams();
  const { currentRide, fetchRideStatus, cancelRide } = useRideStore();
  const { driverLocation, joinRide } = useSocket({ rideId });
  const [statusText, setStatusText] = useState('');

  useEffect(() => {
    if (rideId) {
      fetchRideStatus(rideId);
      joinRide(rideId);
    }
    
    const interval = setInterval(() => {
      if (rideId) {
        fetchRideStatus(rideId);
      }
    }, 3000);
    
    return () => clearInterval(interval);
  }, [rideId, fetchRideStatus, joinRide]);

  useEffect(() => {
    if (!currentRide) return;
    
    const statusMap: Record<string, string> = {
      pending: 'Finding your auto...',
      driver_assigned: 'Driver assigned!',
      driver_arrived: 'Driver arrived!',
      in_progress: 'Ride in progress...',
      completed: 'Ride completed!',
      cancelled: 'Ride cancelled'
    };
    
    setStatusText(statusMap[currentRide.status] || currentRide.status);

    if (currentRide.status === 'completed') {
      navigate(`/ride/${currentRide.id}`, { replace: true });
    }
    
    if (currentRide.status === 'cancelled') {
      navigate('/', { replace: true });
    }
    
    if (currentRide.status === 'driver_assigned' || currentRide.status === 'driver_arrived' || currentRide.status === 'in_progress') {
      navigate(`/ride/${currentRide.id}`, { replace: true });
    }
  }, [currentRide, navigate]);

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this ride?')) return;
    if (rideId) {
      await cancelRide(rideId);
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 500);
    }
  };

  const getStatusIcon = () => {
    if (!currentRide) return '⏳';
    const icons: Record<string, string> = {
      pending: '🔍',
      driver_assigned: '✅',
      driver_arrived: '🚗',
      in_progress: '🚙',
      completed: '🎉',
      cancelled: '❌'
    };
    return icons[currentRide.status] || '⏳';
  };

  if (!currentRide) {
    return (
      <div className="h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  const pickupLoc = currentRide.pickupLocation;
  const dropLoc = currentRide.dropLocation;

  return (
    <div className="h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 flex flex-col overflow-hidden">
      {/* Full Screen Map */}
      <div className="flex-1 min-h-0 relative">
        <MapTracking
          pickupLocation={pickupLoc}
          dropLocation={dropLoc}
          driverLocation={driverLocation || undefined}
        />
        
        {/* Status Banner */}
        <div className="absolute top-0 left-0 right-0 bg-white/20 backdrop-blur-md p-4 z-10">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{getStatusIcon()}</span>
            <div>
              <p className="font-bold text-white">{statusText}</p>
              {currentRide.driverName && (
                <p className="text-white/70 text-sm">{currentRide.driverName} • {currentRide.autoNumber}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Sheet - Glass Design */}
      <div className="bg-white/10 backdrop-blur-xl rounded-t-3xl border-t border-white/20 p-5 flex-shrink-0 overflow-y-auto max-h-[50vh]">
        {/* Handle */}
        <div className="w-12 h-1 bg-white/30 rounded-full mx-auto mb-4"></div>

        {/* Pickup & Drop */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
            <div>
              <p className="text-white/60 text-xs">Pickup</p>
              <p className="text-white font-medium">{pickupLoc.address}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div>
              <p className="text-white/60 text-xs">Drop</p>
              <p className="text-white font-medium">{dropLoc.address}</p>
            </div>
          </div>
        </div>

        {/* Fare */}
        <div className="flex justify-between items-center py-3 border-t border-white/20">
          <div>
            <p className="text-white/60 text-xs">Estimated Fare</p>
            <p className="text-white font-bold text-2xl">₹{currentRide.estimatedFare}</p>
          </div>
          <div className="text-right">
            <p className="text-white/60 text-xs">Distance</p>
            <p className="text-white font-bold">{currentRide.distance} km</p>
          </div>
        </div>

        {/* Driver */}
        {currentRide.driverName && (
          <div className="flex items-center gap-4 py-3 border-t border-white/20">
            <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-gray-900 font-bold">
              {currentRide.driverName.charAt(0)}
            </div>
            <div className="flex-1">
              <p className="text-white font-bold">{currentRide.driverName}</p>
              <p className="text-white/60 text-sm">{currentRide.autoNumber}</p>
            </div>
            {currentRide.driverPhone && (
              <a href={`tel:${currentRide.driverPhone}`} className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </a>
            )}
          </div>
        )}

        {/* OTP */}
        {currentRide.otp && currentRide.status !== 'completed' && (
          <div className="bg-orange-500/80 backdrop-blur-sm rounded-xl p-4 mt-3">
            <p className="text-white/80 text-xs">Ride OTP</p>
            <p className="text-white font-bold text-3xl tracking-wider">{currentRide.otp}</p>
            <p className="text-white/70 text-xs mt-1">Share with your driver</p>
          </div>
        )}

        {/* Cancel */}
        {(currentRide.status === 'pending' || currentRide.status === 'driver_assigned') && (
          <button
            onClick={handleCancel}
            className="w-full mt-4 py-3 border-2 border-red-500 text-white rounded-xl font-medium hover:bg-red-500/20 transition"
          >
            Cancel Ride
          </button>
        )}
      </div>
    </div>
  );
}
