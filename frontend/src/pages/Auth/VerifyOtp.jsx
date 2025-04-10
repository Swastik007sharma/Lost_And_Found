import { useState, useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { verifyOtp, resetPassword, forgotPassword } from '../../services/authService';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Loader from '../../components/common/Loader';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

function VerifyOtp() {
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const isForgot = searchParams.get('forgot') === 'true';
  const navigate = useNavigate();
  const { login: setAuth } = useContext(AuthContext);

  // Retrieve registration token from localStorage (set during register)
  const registrationToken = localStorage.getItem('tempRegistrationToken');
  const registrationUser = localStorage.getItem('tempRegistrationUser')
    ? JSON.parse(localStorage.getItem('tempRegistrationUser'))
    : null;

  useEffect(() => {
    if (!email) {
      setError('No email provided for verification');
    }
    // Clean up temp storage on unmount if not used
    return () => {
      if (!isForgot && !registrationToken) {
        localStorage.removeItem('tempRegistrationToken');
        localStorage.removeItem('tempRegistrationUser');
      }
    };
  }, [email, isForgot, registrationToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!otp) {
      setError('Please enter the OTP');
      setLoading(false);
      return;
    }

    if (isForgot) {
      if (!newPassword || !confirmPassword) {
        setError('Please enter both new password and confirm password');
        setLoading(false);
        return;
      }
      if (newPassword !== confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }
    }

    try {
      const response = await verifyOtp({ email, otp });
      if (response.status === 200) {
        if (isForgot) {
          await resetPassword({ email, newPassword });
          setError('Password reset successfully. Redirecting to login...');
          setTimeout(() => navigate('/login'), 2000);
        } else if (registrationToken && registrationUser) {
          setAuth(registrationToken, registrationUser);
          localStorage.setItem('token', registrationToken);
          localStorage.setItem('user', JSON.stringify(registrationUser));
          localStorage.removeItem('tempRegistrationToken');
          localStorage.removeItem('tempRegistrationUser');
          navigate('/dashboard');
        } else {
          navigate('/login');
        }
      }
    } catch (err) {
      const errorMsg =
        err.response?.status === 400
          ? err.response?.data?.message || 'Invalid or expired OTP'
          : err.response?.status === 404
          ? 'User not found'
          : err.response?.status === 500
          ? 'Server error, please try again later'
          : 'An unexpected error occurred';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setLoading(true);
    try {
      await forgotPassword({ email });
      setError('New OTP sent to your email.');
    } catch (err) {
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleNewPasswordVisibility = () => setShowNewPassword(!showNewPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  if (!email) return <Loader />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 py-12 px-4 sm:px-6 lg:px-8 animate-fade-in-down">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg transform transition-all duration-500 hover:shadow-xl">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6 animate-fade-in-down">
          {isForgot ? 'Verify OTP & Reset Password' : 'Verify OTP'}
        </h2>

        {error && (
          <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-md animate-fade-in-out flex items-center justify-between">
            <p className="text-sm font-medium">{error}</p>
            <button onClick={() => setError('')} className="text-red-700 hover:text-red-900 focus:outline-none">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="animate-fade-in-left" style={{ animationDelay: '0.1s' }}>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700">OTP</label>
            <Input
              id="otp"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit OTP"
              className="mt-2 w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 shadow-sm disabled:opacity-50"
              disabled={loading}
            />
          </div>
          {isForgot && (
            <>
              <div className="relative animate-fade-in-left" style={{ animationDelay: '0.2s' }}>
                <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">New Password</label>
                <Input
                  id="new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="mt-2 w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 shadow-sm disabled:opacity-50 pr-12"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={toggleNewPasswordVisibility}
                  className="absolute inset-y-0 right-0 flex items-center justify-center w-12 h-full text-gray-500 hover:text-gray-700 focus:outline-none mt-4"
                  disabled={loading}
                >
                  {showNewPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                </button>
              </div>
              <div className="relative animate-fade-in-left" style={{ animationDelay: '0.3s' }}>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="mt-2 w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 shadow-sm disabled:opacity-50 pr-12"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="absolute inset-y-0 right-0 flex items-center justify-center w-12 h-full text-gray-500 hover:text-gray-700 focus:outline-none mt-4"
                  disabled={loading}
                >
                  {showConfirmPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                </button>
              </div>
            </>
          )}
          <div className="animate-fade-in-left" style={{ animationDelay: '0.4s' }}>
            <Button
              type="submit"
              className={`w-full py-3 rounded-lg text-sm font-semibold text-white transition-all duration-200 shadow-md ${
                loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'
              }`}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isForgot ? 'Resetting...' : 'Verifying...'}
                </span>
              ) : (
                isForgot ? 'Reset Password' : 'Verify OTP'
              )}
            </Button>
          </div>
        </form>
        <p className="mt-4 text-sm text-center text-gray-600 animate-fade-in-left" style={{ animationDelay: '0.5s' }}>
          Didn’t receive an OTP?{' '}
          <button
            onClick={handleResendOtp}
            className="text-blue-600 hover:underline hover:text-blue-800 transition-colors duration-200"
            disabled={loading}
          >
            Resend OTP
          </button>
        </p>
      </div>
    </div>
  );
}

export default VerifyOtp;