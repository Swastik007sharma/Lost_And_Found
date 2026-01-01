import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../../context/AuthContext';
import { login, forgotPassword } from '../../services/authService';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { FiMail, FiLock, FiLogIn, FiArrowRight } from 'react-icons/fi';
import Modal from '../../components/common/Modal';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const { login: setAuth } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    toast.info('⏳ Please wait, the server may take some time to start.', {
      toastId: 'server-wait-message'
    });
  }, []);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!email || !password) {
      toast.error('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      const response = await login({ email, password });
      setAuth(response.data.authorization, response.data.user || null);
      localStorage.setItem('token', response.data.authorization);
      console.log('Login successful, token:', response.data.authorization);
      toast.success('Login successful!');
      setTimeout(() => navigate('/home'), 300);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setIsForgotModalOpen(true);
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast.error('Please enter your email');
      return;
    }
    forgotPassword({ email: forgotEmail })
      .then(() => {
        toast.success('OTP sent to your email. Please verify it.');
        setTimeout(() => navigate(`/verify-otp?email=${encodeURIComponent(forgotEmail)}&forgot=true`), 2000);
      })
      .catch((err) => toast.error(err.response?.data?.message || 'Failed to send OTP. Try again.'));
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden" style={{ background: 'var(--color-bg)' }}>
      {/* Animated background gradient blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        style={{ zIndex: 99999 }}
      />

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
              <FiLogIn className="text-3xl text-white" />
            </motion.div>
            <h2 className="text-3xl font-bold" style={{ color: 'var(--color-text)' }}>
              Welcome Back
            </h2>
            <p className="mt-2 text-sm opacity-70" style={{ color: 'var(--color-text)' }}>
              Sign in to continue to your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 opacity-40" style={{ color: 'var(--color-text)' }} />
                </div>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 shadow-sm disabled:opacity-50"
                  disabled={loading}
                />
              </div>
            </motion.div>

            {/* Password Input */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label htmlFor="password" className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 opacity-40" style={{ color: 'var(--color-text)' }} />
                </div>
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-12 p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 shadow-sm disabled:opacity-50"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center focus:outline-none"
                  style={{ color: 'var(--color-accent)' }}
                  disabled={loading}
                >
                  {showPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                </button>
              </div>
            </motion.div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Button
                type="submit"
                className={`w-full py-3 rounded-lg text-sm font-semibold text-white transition-all duration-200 shadow-lg group ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl'
                  }`}
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Logging in...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    Login
                    <FiArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </Button>
            </motion.div>
          </form>

          {/* Footer Links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6"
          >
            <div className="text-center">
              <button
                onClick={handleForgotPassword}
                className="text-sm font-medium transition-colors duration-200 hover:underline"
                style={{ color: 'var(--color-accent)' }}
                disabled={loading}
              >
                Forgot your password?
              </button>
            </div>

            <div className="mt-4 text-center">
              <p className="text-sm" style={{ color: 'var(--color-text)', opacity: 0.7 }}>
                Don't have an account?{' '}
                <a
                  href="/register"
                  className="font-medium transition-colors duration-200 hover:underline"
                  style={{ color: 'var(--color-accent)' }}
                >
                  Sign up now
                </a>
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {isForgotModalOpen && (
          <Modal isOpen={isForgotModalOpen} onClose={() => setIsForgotModalOpen(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-3"
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
                  }}
                >
                  <FiMail className="text-xl text-white" />
                </div>
                <h3 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
                  Forgot Password?
                </h3>
                <p className="mt-2 text-sm opacity-70" style={{ color: 'var(--color-text)' }}>
                  Enter your email to receive an OTP
                </p>
              </div>

              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div>
                  <label htmlFor="forgot-email" className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiMail className="h-5 w-5 opacity-40" style={{ color: 'var(--color-text)' }} />
                    </div>
                    <Input
                      id="forgot-email"
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full py-3 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                  style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                  disabled={loading}
                >
                  <span className="flex items-center justify-center">
                    Send OTP
                    <FiArrowRight className="ml-2 h-4 w-4" />
                  </span>
                </Button>
              </form>
            </motion.div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Login;