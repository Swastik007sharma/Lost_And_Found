import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { login, forgotPassword } from '../../services/authService';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Modal from '../../components/common/Modal';
import { toast } from 'react-toastify';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const { login: setAuth } = useContext(AuthContext);
  const navigate = useNavigate();

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
      setTimeout(() => navigate('/'), 300);
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
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-color)] py-12 px-4 sm:px-6 lg:px-8 animate-fade-in-down">
      <div className="w-full max-w-md bg-[var(--bg-color)] p-8 rounded-xl shadow-lg transform transition-all duration-500 hover:shadow-xl">
        <h2 className="text-3xl font-bold text-center text-[var(--text-color)] mb-6 animate-fade-in-down">Login</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="animate-fade-in-left" style={{ animationDelay: '0.1s' }}>
            <label htmlFor="email" className="block text-sm font-medium text-[var(--text-color)]">Email</label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="mt-2 w-full p-3 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] transition-all duration-200 shadow-sm disabled:opacity-50"
              disabled={loading}
            />
          </div>
          <div className="relative animate-fade-in-left" style={{ animationDelay: '0.2s' }}>
            <label htmlFor="password" className="block text-sm font-medium text-[var(--text-color)]">Password</label>
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="mt-2 w-full p-3 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] transition-all duration-200 shadow-sm disabled:opacity-50 pr-12"
              disabled={loading}
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-0 flex items-center justify-center w-12 h-full text-[var(--secondary)] hover:text-[var(--text-color)] focus:outline-none mt-4"
              disabled={loading}
            >
              {showPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
            </button>
          </div>
          <div className="animate-fade-in-left" style={{ animationDelay: '0.3s' }}>
            <Button
              type="submit"
              className={`w-full py-3 rounded-lg text-sm font-semibold text-[var(--text-color)] transition-all duration-200 shadow-md ${
                loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-[var(--primary)] hover:bg-blue-700 hover:shadow-lg'
              }`}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2 text-[var(--text-color)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging in...
                </span>
              ) : (
                'Login'
              )}
            </Button>
          </div>
        </form>
        <div className="mt-4 text-sm text-center text-[var(--secondary)] animate-fade-in-left" style={{ animationDelay: '0.4s' }}>
          <p>
            Don’t have an account?{' '}
            <Link to="/register" className="text-[var(--primary)] hover:text-blue-800 transition-colors duration-200">
              Register here
            </Link>
          </p>
          <button
            onClick={handleForgotPassword}
            className="mt-2 text-[var(--primary)] hover:text-blue-800 transition-colors duration-200"
            disabled={loading}
          >
            Forgot Password?
          </button>
        </div>
      </div>

      <Modal isOpen={isForgotModalOpen} onClose={() => setIsForgotModalOpen(false)}>
        <h3 className="text-xl font-bold mb-4 text-[var(--text-color)]">Forgot Password</h3>
        <form onSubmit={handleForgotSubmit} className="space-y-4">
          <div>
            <label htmlFor="forgot-email" className="block text-sm font-medium text-[var(--text-color)]">Email</label>
            <Input
              id="forgot-email"
              type="email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              placeholder="Enter your email"
              className="mt-1 w-full p-2 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)]"
            />
          </div>
          <Button
            type="submit"
            className="w-full py-2 text-[var(--text-color)] rounded-lg hover:bg-blue-700"
            disabled={loading}
          >
            Send OTP
          </Button>
        </form>
      </Modal>
    </div>
  );
}

export default Login;