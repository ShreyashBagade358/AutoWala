import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export default function NameEntryPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
    }
  }, [user, navigate]);
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const handleNext = () => {
    if (firstName.trim()) {
      localStorage.setItem('autowala_user_name', JSON.stringify({ firstName, lastName }));
      navigate('/', { replace: true });
    }
  };

  const handleSkip = () => {
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 flex items-center justify-center p-4">
      {/* Main Card */}
      <div className="w-full max-w-sm">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate('/login', { replace: true })} 
          className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition mb-6"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Content Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
          
          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">What's your name?</h1>
            <p className="text-white/70 text-sm">We'll use this for your profile</p>
          </div>

          {/* Name Inputs */}
          <div className="space-y-6 mb-8">
            {/* First Name */}
            <div>
              <label className="block text-white/60 text-xs mb-2 uppercase tracking-wide">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First"
                className="w-full bg-transparent border-b-2 border-white/30 text-white text-lg py-2 outline-none focus:border-white transition-colors placeholder-white/40"
                required
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-white/60 text-xs mb-2 uppercase tracking-wide">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last"
                className="w-full bg-transparent border-b-2 border-white/30 text-white text-lg py-2 outline-none focus:border-white transition-colors placeholder-white/40"
              />
            </div>
          </div>

          {/* Next Button */}
          <button
            onClick={handleNext}
            disabled={!firstName.trim()}
            className="w-full bg-white text-purple-700 py-4 rounded-2xl font-bold text-base shadow-lg hover:bg-gray-100 hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            Next
          </button>

        </div>

        {/* Skip */}
        <div className="mt-6 text-center">
          <button 
            onClick={handleSkip}
            className="text-white/60 hover:text-white text-sm"
          >
            Skip for now
          </button>
        </div>

      </div>
    </div>
  );
}
