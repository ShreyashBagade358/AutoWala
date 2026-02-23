import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useEffect } from 'react';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user, driver } = useAuthStore();

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    } else if (driver) {
      navigate('/driver', { replace: true });
    }
  }, [user, driver, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 flex items-center justify-center p-4">
      {/* Main Container */}
      <div className="w-full max-w-sm">
        
        {/* Logo Container */}
        <div className="flex justify-center mb-8">
          <div className="w-28 h-28 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center border border-white/30">
            <div className="flex items-center gap-1">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
              <span className="text-white text-4xl font-bold">A</span>
            </div>
          </div>
        </div>

        <h1 className="text-4xl font-bold text-white text-center mb-3 tracking-tight">AutoWala</h1>

        <div className="flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm px-5 py-2.5 rounded-full border border-white/20 mb-6">
          <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span className="text-white/90 font-medium text-sm">Move with safety</span>
        </div>

        <p className="text-white/70 text-center text-base mb-10">Book your auto in Kolhapur instantly</p>

        <button
          onClick={() => navigate('/login', { replace: true })}
          className="w-full bg-white text-purple-700 py-4 px-8 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2"
        >
          Get Started
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>

        <button
          onClick={() => navigate('/login', { replace: true })}
          className="w-full mt-4 text-white/60 hover:text-white text-sm font-medium py-2"
        >
          Skip for now
        </button>

        <div className="flex justify-center gap-2 mt-10">
          <div className="w-8 h-2 bg-white rounded-full"></div>
          <div className="w-2 h-2 bg-white/40 rounded-full"></div>
          <div className="w-2 h-2 bg-white/40 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}
