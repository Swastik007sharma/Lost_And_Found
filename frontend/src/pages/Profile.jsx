import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { updateUserProfile, updateUserPassword, deleteUserAccount } from '../services/userService';
import Loader from '../components/common/Loader';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Ensure react-icons is installed

function Profile() {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // State for read-only display
  const [displayData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'user',
  });

  // State for password update form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  // State for name and email update form
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  // Toggle states for forms (only one can be open at a time)
  const [isFormOpen, setIsFormOpen] = useState(null); // 'profile' or 'password'

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Frontend validation
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New password and confirm password do not match');
      setLoading(false);
      return;
    }

    try {
      await updateUserPassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setSuccess('Password updated successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setIsFormOpen(null);
    } catch (err) {
      setError('Failed to update password: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await updateUserProfile({
        name: profileForm.name,
        email: profileForm.email,
      });
      setSuccess('Profile updated successfully!');
      setUser({ ...user, ...response.data.user });
      setIsFormOpen(null);
    } catch (err) {
      setError('Failed to update profile: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      setLoading(true);
      setError('');
      setSuccess('');
      try {
        await deleteUserAccount();
        setSuccess('Account deactivated successfully!');
        setUser(null); // Clear user context
        navigate('/login'); // Redirect to login page
      } catch (err) {
        setError('Failed to delete account: ' + err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleForm = (formType) => {
    setIsFormOpen((prev) => (prev === formType ? null : formType));
  };

  if (!user) return <Loader />;

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 text-center">User Profile</h1>

        {/* Success and Error Alerts */}
        {(error || success) && (
          <div className="mb-6 p-4 rounded-md shadow-md mx-auto max-w-md">
            {error && <div className="bg-red-50 text-red-600 p-3 rounded-md">{error}</div>}
            {success && <div className="bg-green-50 text-green-600 p-3 rounded-md">{success}</div>}
          </div>
        )}

        {/* Read-Only User Details */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="space-y-4">
            <p className="text-lg sm:text-xl text-gray-700"><strong>Name:</strong> {displayData.name}</p>
            <p className="text-lg sm:text-xl text-gray-700"><strong>Email:</strong> {displayData.email}</p>
            <p className="text-lg sm:text-xl text-gray-700"><strong>Role:</strong> {displayData.role}</p>
          </div>
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <Button
              onClick={() => toggleForm('profile')}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
            >
              Update Name & Email
            </Button>
            <Button
              onClick={() => toggleForm('password')}
              className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md transition-colors"
            >
              Update Password
            </Button>
            <Button
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md transition-colors"
            >
              Go to Dashboard
            </Button>
            <Button
              onClick={handleDeleteAccount}
              disabled={loading}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md transition-colors"
            >
              {loading ? 'Deleting...' : 'Delete Account'}
            </Button>
          </div>
        </div>

        {/* Update Name & Email Form */}
        {isFormOpen === 'profile' && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Update Name & Email</h2>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name for:</label>
                <Input
                  id="name"
                  label=""
                  name="name"
                  value={profileForm.name}
                  onChange={handleProfileChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email for:</label>
                <Input
                  id="email"
                  label=""
                  name="email"
                  type="email"
                  value={profileForm.email}
                  onChange={handleProfileChange}
                  required
                />
              </div>
              <div className="flex gap-4">
                <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors">
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  onClick={() => setIsFormOpen(null)}
                  className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-md transition-colors"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Update Password Form */}
        {isFormOpen === 'password' && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Update Password</h2>
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div className="relative">
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">Current Password for:</label>
                <Input
                  id="currentPassword"
                  label=""
                  name="currentPassword"
                  type={showPassword.currentPassword ? 'text' : 'password'}
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('currentPassword')}
                  className="absolute top-8 right-2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword.currentPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              <div className="relative">
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password for:</label>
                <Input
                  id="newPassword"
                  label=""
                  name="newPassword"
                  type={showPassword.newPassword ? 'text' : 'password'}
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('newPassword')}
                  className="absolute top-8 right-2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword.newPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              <div className="relative">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password for:</label>
                <Input
                  id="confirmPassword"
                  label=""
                  name="confirmPassword"
                  type={showPassword.confirmPassword ? 'text' : 'password'}
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirmPassword')}
                  className="absolute top-8 right-2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword.confirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              <div className="flex gap-4">
                <Button type="submit" disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md transition-colors">
                  {loading ? 'Saving...' : 'Update Password'}
                </Button>
                <Button
                  onClick={() => setIsFormOpen(null)}
                  className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-md transition-colors"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;