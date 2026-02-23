import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useTranslation } from '../../i18n';

interface PendingRide {
  id: string;
  pickupLocation: { address: string; zoneId: string };
  dropLocation: { address: string; zoneId: string };
  estimatedFare: number;
  distance: number;
  status: string;
}

interface DriverStats {
  totalEarnings: number;
  todayEarnings: number;
  totalRides: number;
  rating: number;
  completedRides: number;
}

export default function DriverHomePage() {
  const navigate = useNavigate();
  const { driver, logout } = useAuthStore();
  const { t } = useTranslation('en');
  const [status, setStatus] = useState<'available' | 'busy' | 'offline'>('available');
  const [rides, setRides] = useState<PendingRide[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<DriverStats>({
    totalEarnings: 0,
    todayEarnings: 0,
    totalRides: 0,
    rating: 4.8,
    completedRides: 0
  });

  const fetchNearbyRides = async () => {
    const token = localStorage.getItem('autowala_driver_token');
    if (!token) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/drivers/rides/nearby', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setRides(data);
    } catch (err) {
      console.error('Failed to fetch rides:', err);
    }
    setLoading(false);
  };

  const fetchDriverStats = async () => {
    const token = localStorage.getItem('autowala_driver_token');
    if (!token) return;
    
    try {
      const res = await fetch('/api/drivers/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.totalEarnings !== undefined) {
        setStats({
          totalEarnings: data.totalEarnings || 0,
          todayEarnings: data.todayEarnings || 0,
          totalRides: data.totalRides || 0,
          rating: data.rating || 4.8,
          completedRides: data.completedRides || 0
        });
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  useEffect(() => {
    fetchNearbyRides();
    fetchDriverStats();
    const interval = setInterval(() => {
      fetchNearbyRides();
      fetchDriverStats();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (newStatus: 'available' | 'busy' | 'offline') => {
    setStatus(newStatus);
    const token = localStorage.getItem('autowala_driver_token');
    if (token) {
      await fetch('/api/drivers/status', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
    }
  };

  const handleAcceptRide = async (ride: PendingRide) => {
    const token = localStorage.getItem('autowala_driver_token');
    if (!token || !driver) return;

    try {
      const res = await fetch(`/api/rides/${ride.id}/accept`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          driverId: driver.id,
          driverName: driver.name,
          driverPhone: driver.phone,
          autoNumber: driver.autoNumber
        })
      });
      const data = await res.json();
      if (data.success) {
        navigate(`/driver/ride/${ride.id}`);
      }
    } catch (err) {
      console.error('Failed to accept ride:', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/driver/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 pb-20">
      <header className="bg-white/10 backdrop-blur-md p-4 sticky top-0 z-10">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <h1 className="text-lg font-bold text-white">{t('driver.title')}</h1>
          <button onClick={handleLogout} className="text-sm text-white/70">
            {t('auth.logout')}
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 overflow-y-auto">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 mb-4 border border-white/20">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-yellow-400 flex items-center justify-center text-gray-900 text-2xl font-bold">
              {driver?.name?.charAt(0) || 'D'}
            </div>
            <div>
              <h2 className="font-bold text-lg text-white">{driver?.name || 'Driver'}</h2>
              <p className="text-white/60">{driver?.autoNumber || 'MH 09 XX XXXX'}</p>
              <p className="text-sm text-yellow-400">📍 {t(`zones.${driver?.zoneId}`) || driver?.zoneId || 'Railway Station'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 mb-4 border border-white/20">
          <h3 className="font-medium mb-3 text-white">Go Online</h3>
          <div className="flex gap-2">
            {(['available', 'busy', 'offline'] as const).map((s) => (
              <button
                key={s}
                onClick={() => handleStatusChange(s)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium ${
                  status === s
                    ? s === 'available'
                      ? 'bg-green-500 text-white'
                      : s === 'busy'
                      ? 'bg-yellow-500 text-white'
                      : 'bg-gray-500 text-white'
                    : 'bg-white/10 text-white/60'
                }`}
              >
                {t(`driver.status.${s}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 mb-4 border border-white/20">
          <h3 className="font-medium mb-3 text-white">
            {t('driver.newRide')} 
            <button onClick={fetchNearbyRides} className="ml-2 text-sm text-yellow-400">
              🔄
            </button>
          </h3>
          
          {loading ? (
            <p className="text-white/60">Loading...</p>
          ) : rides.length === 0 ? (
            <p className="text-white/60">No rides available in your zone</p>
          ) : (
            <div className="space-y-3">
              {rides.map((ride) => (
                <div key={ride.id} className="p-3 bg-white/10 rounded-xl border-l-4 border-yellow-400">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-green-400">📍</span>
                    <span className="font-medium text-white">{ride.pickupLocation?.address || 'Pickup'}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-red-400">📍</span>
                    <span className="text-white/70">{ride.dropLocation?.address || 'Drop'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/60">₹{ride.estimatedFare} • {ride.distance} km</span>
                    <button
                      onClick={() => handleAcceptRide(ride)}
                      className="py-2 px-4 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600"
                    >
                      {t('driver.accept')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 text-center border border-white/20">
            <p className="text-2xl font-bold text-yellow-400">₹{stats.todayEarnings}</p>
            <p className="text-xs text-white/60">{t('driver.todayEarnings') || "Today's Earning"}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 text-center border border-white/20">
            <p className="text-2xl font-bold text-yellow-400">{stats.completedRides}</p>
            <p className="text-xs text-white/60">{t('driver.rides') || 'Rides'}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 text-center border border-white/20">
            <p className="text-2xl font-bold text-yellow-400">{stats.rating.toFixed(1)}</p>
            <p className="text-xs text-white/60">{t('driver.rating') || 'Rating'}</p>
          </div>
        </div>
        
        <div className="mt-4 bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-white/60 text-xs">Total Earnings</p>
              <p className="text-white font-bold text-xl">₹{stats.totalEarnings}</p>
            </div>
            <div className="text-right">
              <p className="text-white/60 text-xs">Total Rides</p>
              <p className="text-white font-bold text-xl">{stats.totalRides}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
