import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { updateUserProfile, updateUserPassword, deleteUserAccount } from '../services/userService';
import Loader from '../components/common/Loader';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import {
  FiUser,
  FiMail,
  FiShield,
  FiMapPin,
  FiBookmark,
  FiFileText,
  FiEdit,
  FiLock,
  FiHome,
  FiTrash2,
  FiCheck,
  FiX,
  FiCamera
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

function Profile() {
  const { user, setUser, token } = useContext(AuthContext);
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

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

  // State for name, email, and keeper fields
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    location: user?.location || '',
    department: user?.department || '',
    description: user?.description || '',
  });

  // Toggle states for forms
  const [isFormOpen, setIsFormOpen] = useState(null);

  // Profile image states
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(user?.profileImage || null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Derive displayData directly from user
  const displayData = {
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'user',
    location: user?.location || '',
    department: user?.department || '',
    description: user?.description || '',
    profileImage: user?.profileImage || '',
  };

  useEffect(() => {
    console.log('Profile component - Current user:', user, 'Token:', token);
    if (!user && !token) {
      console.log('No user or token, redirecting to login');
      navigate('/login');
    }
    if (user?.profileImage) {
      setImagePreview(user.profileImage);
    }
  }, [user, token, navigate]);

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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB', {
          toastId: 'image-size-error',
          position: 'top-center'
        });
        return;
      }

      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Only JPG, JPEG, and PNG images are allowed', {
          toastId: 'image-type-error',
          position: 'top-center'
        });
        return;
      }

      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async () => {
    if (!profileImage) {
      toast.error('Please select an image first', {
        toastId: 'no-image-error',
        position: 'top-center'
      });
      return;
    }

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('image', profileImage);
    formData.append('name', user.name);

    try {
      const response = await updateUserProfile(formData);
      setUser(response.data.user);
      setProfileImage(null);
      toast.success('Profile image updated successfully!', {
        toastId: 'image-upload-success',
        position: 'top-center'
      });
    } catch (err) {
      console.error('Image upload error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to upload image';
      toast.error(errorMessage, {
        toastId: 'image-upload-error',
        position: 'top-center'
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    setImagePreview(user?.profileImage || null);
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        toast.error('New password and confirm password do not match');
        return;
      }

      await updateUserPassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Password updated successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setIsFormOpen(null);
    } catch (err) {
      console.error('Password Update Error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update password';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Validate token before request
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Sending profile update:', profileForm, 'Token:', token);
      // Build update payload - don't send email as it cannot be changed
      const updatePayload = {
        name: profileForm.name,
      };
      if (user?.role === 'keeper') {
        updatePayload.location = profileForm.location;
        updatePayload.department = profileForm.department;
        updatePayload.description = profileForm.description;
      }
      const response = await updateUserProfile(updatePayload);
      console.log('API Response:', response);

      // Handle backend response structure
      const updatedUser = response.data.user;
      console.log('Extracted updated user:', updatedUser);

      // Validate updatedUser
      if (!updatedUser || !updatedUser.name || !updatedUser.email) {
        throw new Error('Invalid user data returned from API');
      }

      toast.success('Profile updated successfully!');
      setUser({ ...user, ...updatedUser }); // Update AuthContext
      setProfileForm({
        name: updatedUser.name,
        email: updatedUser.email,
        location: updatedUser.location || '',
        department: updatedUser.department || '',
        description: updatedUser.description || '',
      }); // Sync form
    } catch (err) {
      console.error('Profile Update Error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update profile';
      if (err.response?.status === 401) {
        console.log('Unauthorized error, token may be invalid');
        toast.error('Session expired. Please log in again.');
        setUser(null);
        setTimeout(() => navigate('/login'), 2000);
      } else {
        toast.error(errorMessage);
      }
    } finally {
      console.log('Closing profile form, isFormOpen before:', isFormOpen);
      setIsFormOpen(null);
      console.log('isFormOpen after:', isFormOpen);
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      setLoading(true);
      try {
        await deleteUserAccount();
        toast.success('Account deactivated successfully!');
        setUser(null);
        navigate('/login');
      } catch (err) {
        console.error('Delete Account Error:', err);
        const errorMessage = err.response?.data?.message || err.message || 'Failed to delete account';
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleForm = (formType) => {
    setIsFormOpen((prev) => (prev === formType ? null : formType));
  };

  if (!user && !token) return <Loader />;

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
      }`}>
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className={`text-4xl sm:text-5xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                  My Profile
                </h1>
                <p className={`mt-2 text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                  Manage your account settings and preferences
                </p>
              </div>
              <button
                onClick={() => navigate('/dashboard')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${theme === 'dark'
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                  : 'bg-white hover:bg-gray-50 text-gray-700 shadow-md'
                  }`}
              >
                <FiHome className="text-lg" />
                <span className="hidden sm:inline">Dashboard</span>
              </button>
            </div>
          </motion.div>

          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={`rounded-2xl shadow-xl overflow-hidden mb-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              }`}
          >
            {/* Profile Header with Avatar */}
            <div className={`relative h-32 ${theme === 'dark'
              ? 'bg-gradient-to-r from-blue-600 to-purple-600'
              : 'bg-gradient-to-r from-blue-500 to-purple-500'
              }`}>
              <div className="absolute -bottom-16 left-8">
                <div className="relative group">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt={displayData.name}
                      className={`w-32 h-32 rounded-full object-cover shadow-xl ${theme === 'dark'
                        ? 'border-4 border-gray-800'
                        : 'border-4 border-white'
                        }`}
                    />
                  ) : (
                    <div className={`w-32 h-32 rounded-full flex items-center justify-center text-4xl font-bold shadow-xl ${theme === 'dark'
                      ? 'bg-gray-700 text-white border-4 border-gray-800'
                      : 'bg-white text-blue-600 border-4 border-white'
                      }`}>
                      {displayData.name ? displayData.name[0].toUpperCase() : <FiUser />}
                    </div>
                  )}

                  {/* Edit Image Button */}
                  <label
                    htmlFor="profile-image-upload"
                    className={`absolute bottom-0 right-0 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer shadow-lg transition-all duration-200 ${theme === 'dark'
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                      }`}
                  >
                    <FiEdit className="text-lg" />
                  </label>
                  <input
                    id="profile-image-upload"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div className="pt-20 px-8 pb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <div>
                  <h2 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                    {displayData.name}
                  </h2>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${displayData.role === 'keeper'
                      ? 'bg-purple-100 text-purple-700'
                      : displayData.role === 'admin'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-blue-100 text-blue-700'
                      }`}>
                      <FiShield className="text-xs" />
                      {displayData.role.charAt(0).toUpperCase() + displayData.role.slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Profile Image Upload Controls */}
              {profileImage && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`mb-6 p-4 rounded-lg border-2 ${theme === 'dark'
                      ? 'bg-gray-700/50 border-blue-600'
                      : 'bg-blue-50 border-blue-200'
                    }`}
                >
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-blue-600/20' : 'bg-blue-100'
                        }`}>
                        <FiUser className={`text-xl ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                          }`} />
                      </div>
                      <div>
                        <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                          New Profile Image Selected
                        </p>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                          {profileImage.name} ({(profileImage.size / 1024).toFixed(2)} KB)
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleImageUpload}
                        disabled={uploadingImage}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${uploadingImage
                            ? 'opacity-50 cursor-not-allowed'
                            : ''
                          } ${theme === 'dark'
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                          }`}
                      >
                        {uploadingImage ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <FiCheck className="text-lg" />
                            Upload
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleRemoveImage}
                        disabled={uploadingImage}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${theme === 'dark'
                            ? 'bg-gray-600 hover:bg-gray-700 text-white'
                            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                          }`}
                      >
                        <FiX className="text-lg" />
                        Cancel
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className={`flex items-start gap-3 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
                  }`}>
                  <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-blue-600/20' : 'bg-blue-100'
                    }`}>
                    <FiMail className={`text-xl ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                      }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                      Email Address
                    </p>
                    <p className={`text-sm font-semibold truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                      {displayData.email}
                    </p>
                  </div>
                </div>

                {displayData.role === 'keeper' && displayData.location && (
                  <div className={`flex items-start gap-3 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
                    }`}>
                    <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-green-600/20' : 'bg-green-100'
                      }`}>
                      <FiMapPin className={`text-xl ${theme === 'dark' ? 'text-green-400' : 'text-green-600'
                        }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                        Location
                      </p>
                      <p className={`text-sm font-semibold truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                        {displayData.location}
                      </p>
                    </div>
                  </div>
                )}

                {displayData.role === 'keeper' && displayData.department && (
                  <div className={`flex items-start gap-3 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
                    }`}>
                    <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-purple-600/20' : 'bg-purple-100'
                      }`}>
                      <FiBookmark className={`text-xl ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                        }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                        Department
                      </p>
                      <p className={`text-sm font-semibold truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                        {displayData.department}
                      </p>
                    </div>
                  </div>
                )}

                {displayData.role === 'keeper' && displayData.description && (
                  <div className={`flex items-start gap-3 p-4 rounded-lg md:col-span-2 ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
                    }`}>
                    <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-yellow-600/20' : 'bg-yellow-100'
                      }`}>
                      <FiFileText className={`text-xl ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'
                        }`} />
                    </div>
                    <div className="flex-1">
                      <p className={`text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                        Description
                      </p>
                      <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                        {displayData.description}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <button
                  onClick={() => toggleForm('profile')}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${theme === 'dark'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                >
                  <FiEdit className="text-lg" />
                  Edit Profile
                </button>
                <button
                  onClick={() => toggleForm('password')}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${theme === 'dark'
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'bg-purple-500 hover:bg-purple-600 text-white'
                    }`}
                >
                  <FiLock className="text-lg" />
                  Change Password
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={loading}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${theme === 'dark'
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-red-500 hover:bg-red-600 text-white'
                    } sm:col-span-2 lg:col-span-1`}
                >
                  <FiTrash2 className="text-lg" />
                  {loading ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Update Name, Email, and Keeper Fields Form */}
          <AnimatePresence>
            {isFormOpen === 'profile' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className={`rounded-2xl shadow-xl overflow-hidden mb-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                  }`}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                      Edit Profile
                    </h2>
                    <button
                      onClick={() => setIsFormOpen(null)}
                      className={`p-2 rounded-lg transition-colors ${theme === 'dark'
                        ? 'hover:bg-gray-700 text-gray-400'
                        : 'hover:bg-gray-100 text-gray-600'
                        }`}
                    >
                      <FiX className="text-xl" />
                    </button>
                  </div>
                  <form onSubmit={handleProfileUpdate} className="space-y-5">
                    <div>
                      <label htmlFor="name" className={`flex items-center gap-2 text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                        <FiUser />
                        Name
                      </label>
                      <Input
                        id="name"
                        label=""
                        name="name"
                        value={profileForm.name}
                        onChange={handleProfileChange}
                        required
                        className={`w-full px-4 py-3 rounded-lg border ${theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                          }`}
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className={`flex items-center gap-2 text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                        <FiMail />
                        Email (Cannot be changed)
                      </label>
                      <Input
                        id="email"
                        label=""
                        name="email"
                        type="email"
                        value={profileForm.email}
                        onChange={handleProfileChange}
                        disabled
                        required
                        className={`w-full px-4 py-3 rounded-lg border cursor-not-allowed ${theme === 'dark'
                          ? 'bg-gray-700/50 border-gray-600 text-gray-400'
                          : 'bg-gray-100 border-gray-300 text-gray-500'
                          }`}
                      />
                    </div>
                    {/* Keeper-specific fields */}
                    {user?.role === 'keeper' && (
                      <>
                        <div>
                          <label htmlFor="location" className={`flex items-center gap-2 text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                            <FiMapPin />
                            Location
                          </label>
                          <Input
                            id="location"
                            label=""
                            name="location"
                            value={profileForm.location}
                            onChange={handleProfileChange}
                            placeholder="Enter your location"
                            className={`w-full px-4 py-3 rounded-lg border ${theme === 'dark'
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                              }`}
                          />
                        </div>
                        <div>
                          <label htmlFor="department" className={`flex items-center gap-2 text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                            <FiBookmark />
                            Department
                          </label>
                          <Input
                            id="department"
                            label=""
                            name="department"
                            value={profileForm.department}
                            onChange={handleProfileChange}
                            placeholder="Enter your department"
                            className={`w-full px-4 py-3 rounded-lg border ${theme === 'dark'
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                              }`}
                          />
                        </div>
                        <div>
                          <label htmlFor="description" className={`flex items-center gap-2 text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                            <FiFileText />
                            Description
                          </label>
                          <Input
                            id="description"
                            label=""
                            name="description"
                            value={profileForm.description}
                            onChange={handleProfileChange}
                            placeholder="Extra details (optional)"
                            className={`w-full px-4 py-3 rounded-lg border ${theme === 'dark'
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                              }`}
                          />
                        </div>
                      </>
                    )}
                    <div className="flex gap-3 pt-4">
                      <button
                        type="submit"
                        disabled={loading}
                        className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${theme === 'dark'
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-blue-500 hover:bg-blue-600 text-white'
                          }`}
                      >
                        <FiCheck />
                        {loading ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsFormOpen(null)}
                        className={`px-6 py-3 rounded-lg font-medium transition-all ${theme === 'dark'
                          ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                          }`}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Update Password Form */}
          <AnimatePresence>
            {isFormOpen === 'password' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className={`rounded-2xl shadow-xl overflow-hidden mb-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                  }`}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                      Change Password
                    </h2>
                    <button
                      onClick={() => setIsFormOpen(null)}
                      className={`p-2 rounded-lg transition-colors ${theme === 'dark'
                        ? 'hover:bg-gray-700 text-gray-400'
                        : 'hover:bg-gray-100 text-gray-600'
                        }`}
                    >
                      <FiX className="text-xl" />
                    </button>
                  </div>
                  <form onSubmit={handlePasswordUpdate} className="space-y-5">
                    <div className="relative">
                      <label htmlFor="currentPassword" className={`flex items-center gap-2 text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                        <FiLock />
                        Current Password
                      </label>
                      <Input
                        id="currentPassword"
                        label=""
                        name="currentPassword"
                        type={showPassword.currentPassword ? 'text' : 'password'}
                        value={passwordForm.currentPassword}
                        onChange={handlePasswordChange}
                        required
                        className={`w-full px-4 py-3 rounded-lg border ${theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                          }`}
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('currentPassword')}
                        className={`absolute right-3 top-10 ${theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                          }`}
                      >
                        {showPassword.currentPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                      </button>
                    </div>
                    <div className="relative">
                      <label htmlFor="newPassword" className={`flex items-center gap-2 text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                        <FiLock />
                        New Password
                      </label>
                      <Input
                        id="newPassword"
                        label=""
                        name="newPassword"
                        type={showPassword.newPassword ? 'text' : 'password'}
                        value={passwordForm.newPassword}
                        onChange={handlePasswordChange}
                        required
                        className={`w-full px-4 py-3 rounded-lg border ${theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                          }`}
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('newPassword')}
                        className={`absolute right-3 top-10 ${theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                          }`}
                      >
                        {showPassword.newPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                      </button>
                    </div>
                    <div className="relative">
                      <label htmlFor="confirmPassword" className={`flex items-center gap-2 text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                        <FiLock />
                        Confirm Password
                      </label>
                      <Input
                        id="confirmPassword"
                        label=""
                        name="confirmPassword"
                        type={showPassword.confirmPassword ? 'text' : 'password'}
                        value={passwordForm.confirmPassword}
                        onChange={handlePasswordChange}
                        required
                        className={`w-full px-4 py-3 rounded-lg border ${theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                          }`}
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('confirmPassword')}
                        className={`absolute right-3 top-10 ${theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                          }`}
                      >
                        {showPassword.confirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                      </button>
                    </div>
                    <div className="flex gap-3 pt-4">
                      <button
                        type="submit"
                        disabled={loading}
                        className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${theme === 'dark'
                          ? 'bg-purple-600 hover:bg-purple-700 text-white'
                          : 'bg-purple-500 hover:bg-purple-600 text-white'
                          }`}
                      >
                        <FiCheck />
                        {loading ? 'Updating...' : 'Update Password'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsFormOpen(null)}
                        className={`px-6 py-3 rounded-lg font-medium transition-all ${theme === 'dark'
                          ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                          }`}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default Profile;