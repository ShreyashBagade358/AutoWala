import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface LoginPageProps {
  isDriver?: boolean;
}

export default function LoginPage({ isDriver = false }: LoginPageProps) {
  const navigate = useNavigate();
  const { user, driver, login, loginWithOTP, driverLogin, driverLoginWithOTP, error } = useAuthStore();
  
  useEffect(() => {
    if (!isDriver && user) {
      navigate('/', { replace: true });
    } else if (isDriver && driver) {
      navigate('/driver', { replace: true });
    }
  }, [user, driver, isDriver, navigate]);

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) return;
    setLoading(true);
    try {
      if (isDriver) {
        await driverLogin(phone);
      } else {
        await login(phone);
      }
      setShowOtp(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) return;
    setLoading(true);
    try {
      if (isDriver) {
        await driverLoginWithOTP(phone, otp);
        navigate('/driver', { replace: true });
      } else {
        await loginWithOTP(phone, otp);
        const userName = localStorage.getItem('autowala_user_name');
        if (!userName) {
          navigate('/name', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        
        <button 
          onClick={() => navigate('/onboarding')} 
          className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition mb-6"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
          
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30">
              <span className="text-white text-3xl font-bold">A</span>
            </div>
          </div>

          {!showOtp ? (
            <>
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-white mb-1">Enter your mobile number</h1>
                <p className="text-white/70 text-sm">We'll send you a verification code</p>
              </div>

              <form onSubmit={handleSendOtp}>
                <div className="bg-gray-900/40 rounded-2xl p-1 mb-4 border border-white/10">
                  <div className="flex items-center rounded-xl px-4 py-3">
                    <button type="button" className="flex items-center gap-1 text-white">
                      <span className="text-xl">🇮🇳</span>
                      <span className="text-base font-medium">+91</span>
                      <svg className="w-4 h-4 text-white/60 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <div className="w-px h-6 bg-white/20 mx-3"></div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="81234 56789"
                      className="flex-1 bg-transparent text-white text-base outline-none placeholder-white/40"
                      required
                    />
                  </div>
                </div>

                {error && <p className="text-red-300 text-sm mb-4 text-center">{error}</p>}

                <div className="text-center mb-4">
                  <button type="button" className="text-white/60 hover:text-white text-sm font-medium transition">
                    Or connect with social →
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading || phone.length < 10}
                  className="w-full bg-white text-purple-700 py-3.5 rounded-2xl font-bold text-base shadow-lg hover:bg-gray-100 hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? 'Sending...' : 'Next'}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-white mb-1">Verify your number</h1>
                <p className="text-white/70 text-sm">Enter the 6-digit code sent to</p>
                <p className="text-white font-medium text-sm mt-1">+91 {phone}</p>
              </div>

              <form onSubmit={handleVerifyOtp}>
                <div className="bg-gray-900/40 rounded-2xl p-1 mb-4 border border-white/10">
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="● ● ● ● ● ●"
                    className="w-full bg-transparent text-white text-xl text-center py-4 rounded-2xl outline-none placeholder-white/30 tracking-[0.5em] font-bold"
                    maxLength={6}
                    required
                  />
                </div>

                <p className="text-center mb-4 text-white/70 text-sm">
                  Didn't receive code? <button type="button" className="text-white font-bold hover:underline">Resend</button>
                </p>

                {error && <p className="text-red-300 text-sm mb-4 text-center">{error}</p>}

                <button
                  type="submit"
                  disabled={loading || otp.length < 4}
                  className="w-full bg-white text-purple-700 py-3.5 rounded-2xl font-bold text-base shadow-lg hover:bg-gray-100 hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? 'Verifying...' : 'Verify'}
                </button>
              </form>
            </>
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-white/50 text-xs leading-relaxed px-4">
            By continuing you may receive an SMS for verification. Message and data rates may apply.
          </p>
        </div>

        <div className="mt-4 text-center">
          {isDriver ? (
            <button onClick={() => navigate('/login')} className="text-white/70 hover:text-white text-sm font-medium transition">
              Login as User →
            </button>
          ) : (
            <button onClick={() => navigate('/driver/login')} className="text-white/70 hover:text-white text-sm font-medium transition">
              Login as Driver →
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
