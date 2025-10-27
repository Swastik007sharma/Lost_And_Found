import { useState, useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../../context/AuthContext';
import { verifyOtp, resetPassword, forgotPassword } from '../../services/authService';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Loader from '../../components/common/Loader';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { FiLock, FiShield, FiArrowRight, FiRefreshCw } from 'react-icons/fi';
import { toast } from 'react-toastify';

function VerifyOtp() {
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const isForgot = searchParams.get('forgot') === 'true';
  const navigate = useNavigate();
  const { login: setAuth } = useContext(AuthContext);

  useEffect(() => {
    if (!email) {
      toast.error('No email provided for verification');
    }
  }, [email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!otp) {
      toast.error('Please enter the OTP');
      setLoading(false);
      return;
    }

    if (isForgot) {
      if (!newPassword || !confirmPassword) {
        toast.error('Please enter both new password and confirm password');
        setLoading(false);
        return;
      }
      if (newPassword !== confirmPassword) {
        toast.error('Passwords do not match');
        setLoading(false);
        return;
      }
    }

    try {
      const response = await verifyOtp({ email, otp });
      if (response.status === 200) {
        if (isForgot) {
          await resetPassword({ email, newPassword });
          toast.success('Password reset successfully. Redirecting to login...');
          setTimeout(() => navigate('/login'), 2000);
        } else {
          // Registration verification successful
          setAuth(response.data.authorization, response.data.user);
          localStorage.setItem('token', response.data.authorization);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          toast.success('Account verified and activated. Redirecting to dashboard...');
          navigate('/dashboard');
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
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      await forgotPassword({ email });
      toast.success('New OTP sent to your email.');
    } catch (error) {
      console.error('Failed to resend OTP:', error);
      toast.error('Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleNewPasswordVisibility = () => setShowNewPassword(!showNewPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  if (!email) return <Loader />;

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden" style={{ background: 'var(--color-bg)' }}>
      {/* Animated background gradient blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="p-8 rounded-2xl shadow-2xl backdrop-blur-sm border border-opacity-20"
          style={{
            background: 'var(--color-secondary)',
            borderColor: 'var(--color-accent)'
          }}
        >
          {/* Header with icon */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 8px 20px rgba(102, 126, 234, 0.4)'
              }}
            >
              <FiShield className="text-3xl text-white" />
            </motion.div>
            <h2 className="text-3xl font-bold" style={{ color: 'var(--color-text)' }}>
              {isForgot ? 'Reset Password' : 'Verify Account'}
            </h2>
            <p className="mt-2 text-sm opacity-70" style={{ color: 'var(--color-text)' }}>
              {isForgot
                ? 'Enter OTP and create a new password'
                : `We've sent a verification code to ${email}`}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* OTP Input */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label htmlFor="otp" className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                Verification Code
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiShield className="h-5 w-5 opacity-40" style={{ color: 'var(--color-text)' }} />
                </div>
                <Input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit OTP"
                  className="w-full pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 shadow-sm disabled:opacity-50 text-center text-lg tracking-widest"
                  disabled={loading}
                  maxLength="6"
                  aria-label="Enter OTP"
                />
              </div>
            </motion.div>

            {/* Password Fields for Forgot Password */}
            {isForgot && (
              <>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <label htmlFor="new-password" className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiLock className="h-5 w-5 opacity-40" style={{ color: 'var(--color-text)' }} />
                    </div>
                    <Input
                      id="new-password"
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full pl-10 pr-12 p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 shadow-sm disabled:opacity-50"
                      disabled={loading}
                      aria-label="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={toggleNewPasswordVisibility}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center focus:outline-none"
                      style={{ color: 'var(--color-accent)' }}
                      disabled={loading}
                      aria-label="Toggle new password visibility"
                    >
                      {showNewPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                    </button>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.45 }}
                >
                  <label htmlFor="confirm-password" className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiLock className="h-5 w-5 opacity-40" style={{ color: 'var(--color-text)' }} />
                    </div>
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full pl-10 pr-12 p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 shadow-sm disabled:opacity-50"
                      disabled={loading}
                      aria-label="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={toggleConfirmPasswordVisibility}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center focus:outline-none"
                      style={{ color: 'var(--color-accent)' }}
                      disabled={loading}
                      aria-label="Toggle confirm password visibility"
                    >
                      {showConfirmPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                    </button>
                  </div>
                </motion.div>
              </>
            )}

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Button
                type="submit"
                className={`w-full py-3 rounded-lg text-sm font-semibold text-white transition-all duration-200 shadow-lg group ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl'
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
                  <span className="flex items-center justify-center">
                    {isForgot ? 'Reset Password' : 'Verify Account'}
                    <FiArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </Button>
            </motion.div>
          </form>

          {/* Resend OTP */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 text-center"
          >
            <p className="text-sm" style={{ color: 'var(--color-text)', opacity: 0.7 }}>
              Didn't receive the code?{' '}
              <button
                onClick={handleResendOtp}
                className="font-medium transition-colors duration-200 hover:underline inline-flex items-center"
                style={{ color: 'var(--color-accent)' }}
                disabled={loading}
                aria-label="Resend OTP"
              >
                <FiRefreshCw className={`mr-1 h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                Resend OTP
              </button>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

export default VerifyOtp;