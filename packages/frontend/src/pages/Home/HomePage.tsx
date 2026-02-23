import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useRideStore } from '../../store/rideStore';
import { Zone } from '@shared/types';

export default function HomePage() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const { availableZones, selectedPickup, selectedDrop, estimatedFare, fetchZones, setSelectedPickup, setSelectedDrop } = useRideStore();
  
  const [step, setStep] = useState<'pickup' | 'drop'>('pickup');

  useEffect(() => {
    fetchZones();
  }, [fetchZones]);

  useEffect(() => {
    if (selectedPickup && step === 'pickup') {
      setStep('drop');
    }
  }, [selectedPickup, step]);

  const handleConfirmRide = () => {
    if (selectedPickup && selectedDrop) {
      createRideAndNavigate();
    }
  };

  const createRideAndNavigate = async () => {
    const token = localStorage.getItem('autowala_token');
    try {
      const res = await fetch('/api/rides', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ 
          pickupZoneId: selectedPickup?.id, 
          dropZoneId: selectedDrop?.id 
        }),
      });
      const ride = await res.json();
      navigate(`/booking/${ride.id}`, { replace: true });
    } catch (err) {
      console.error('Failed to create ride:', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 pb-28">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20 p-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Book Your Auto</h1>
            <p className="text-white/70 text-sm">Select pickup and drop location</p>
          </div>
          <button 
            onClick={handleLogout}
            className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4">
        {/* Progress Indicator */}
        <div className="flex items-center gap-2 mb-6">
          <div className={`flex-1 h-1.5 rounded-full ${selectedPickup ? 'bg-green-400' : 'bg-white/30'}`}></div>
          <div className={`flex-1 h-1.5 rounded-full ${selectedDrop ? 'bg-green-400' : 'bg-white/30'}`}></div>
        </div>

        {/* Pickup Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedPickup ? 'bg-green-400' : 'bg-white/20'} text-white font-bold text-sm`}>
              {selectedPickup ? '✓' : '1'}
            </div>
            <span className="text-white font-medium">Pickup Location</span>
          </div>
          
          {step === 'pickup' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {availableZones.map((zone: Zone) => (
                <button
                  key={zone.id}
                  onClick={() => setSelectedPickup(zone)}
                  className={`bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20 transition-all hover:bg-white/20 ${
                    selectedPickup?.id === zone.id ? 'ring-2 ring-green-400 bg-white/20' : ''
                  }`}
                >
                  <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-gray-900 font-bold mb-2 mx-auto">
                    {zone.name.charAt(0)}
                  </div>
                  <p className="text-white font-medium text-xs text-center truncate">{zone.name}</p>
                  <p className="text-white/60 text-[10px] text-center">₹{zone.baseFare}+</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Drop Section */}
        {selectedPickup && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedDrop ? 'bg-green-400' : 'bg-white/20'} text-white font-bold text-sm`}>
                {selectedDrop ? '✓' : '2'}
              </div>
              <span className="text-white font-medium">Drop Location</span>
            </div>
            
            {step === 'drop' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {availableZones
                  .filter((zone: Zone) => zone.id !== selectedPickup?.id)
                  .map((zone: Zone) => (
                    <button
                      key={zone.id}
                      onClick={() => setSelectedDrop(zone)}
                      className={`bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20 transition-all hover:bg-white/20 ${
                        selectedDrop?.id === zone.id ? 'ring-2 ring-green-400 bg-white/20' : ''
                      }`}
                    >
                      <div className="w-10 h-10 bg-red-400 rounded-full flex items-center justify-center text-white font-bold mb-2 mx-auto">
                        {zone.name.charAt(0)}
                      </div>
                      <p className="text-white font-medium text-xs text-center truncate">{zone.name}</p>
                      <p className="text-white/60 text-[10px] text-center">₹{zone.baseFare}+</p>
                    </button>
                  ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Bottom Bar - Fare & Book */}
      {estimatedFare && selectedDrop && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/10 backdrop-blur-md border-t border-white/20 p-4">
          <div className="max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-3">
              <div>
                <p className="text-white/70 text-xs">Estimated Fare</p>
                <p className="text-3xl font-bold text-white">₹{estimatedFare}</p>
              </div>
              <div className="text-right max-w-[50%]">
                <p className="text-white/70 text-xs truncate">{selectedPickup?.name}</p>
                <p className="text-white">↓</p>
                <p className="text-white/70 text-xs truncate">{selectedDrop?.name}</p>
              </div>
            </div>
            <button
              onClick={handleConfirmRide}
              className="w-full bg-yellow-400 text-gray-900 py-4 rounded-2xl font-bold text-base shadow-lg hover:bg-yellow-300 hover:shadow-xl transform hover:scale-[1.02] transition-all"
            >
              Book Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
