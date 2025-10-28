import { useState, useEffect, useContext, useRef, useCallback, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getMyItems } from '../services/userService';
import { updateItem, deleteUserItem, generateOTPForItem, verifyOTPForItem } from '../services/itemService';
import { getCategories } from '../services/categoryService';
import { Link, useOutletContext } from 'react-router-dom';
import ItemCard from '../components/ItemCard';
import Pagination from '../components/common/Pagination';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import {
  FiGrid,
  FiList,
  FiPlus,
  FiUser,
  FiBell,
  FiPackage,
  FiTrendingUp,
  FiClock,
  FiAlertCircle,
  FiEye,
  FiEdit,
  FiTrash,
  FiKey,
  FiCheck,
  FiX
} from 'react-icons/fi';

function UserDashboard() {
  const { user, addNotification } = useContext(AuthContext);
  const { theme } = useTheme();
  const { socket } = useOutletContext();
  const [viewType, setViewType] = useState(() => localStorage.getItem('userDashboardViewType') || 'card');
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    category: '',
    status: '',
    location: '',
    image: null,
  });
  const [currentImage, setCurrentImage] = useState('');
  const [otpItemId, setOtpItemId] = useState(null);
  const [otp, setOtp] = useState('');
  const [showOtpVerification, setShowOtpVerification] = useState(false);

  const [itemsPage, setItemsPage] = useState(1);
  const [itemsTotalPages, setItemsTotalPages] = useState(1);
  const limit = 10;

  // Ref to track shown toasts
  // const shownToasts = useRef(new Set());
  const fetchTimeoutRef = useRef(null);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategories();
        setCategories(response.data.categories || []);
      } catch (err) {
        addNotification(`Failed to load categories: ${err.response?.data?.message || err.message}`, 'error');
      }
    };
    fetchCategories();
  }, [addNotification]);

  // Fetch items with debounce
  useEffect(() => {
    if (!user) return;

    // Clear previous timeout
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    fetchTimeoutRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const itemsResponse = await getMyItems({ page: itemsPage, limit });
        setItems(itemsResponse.data.items || []);
        setItemsTotalPages(itemsResponse.data.pagination?.totalPages || 1);
      } catch (err) {
        addNotification(`Failed to load data: ${err.response?.data?.message || err.message}`, 'error');
      } finally {
        setLoading(false);
      }
    }, 300); // Debounce by 300ms

    // Socket listener
    if (socket) {
      const handleNewNotification = (notification) => {
        if (notification.type === 'item' && user.id === notification.userId) {
          addNotification(notification.message, 'info');
          // Trigger fetch after notification
          clearTimeout(fetchTimeoutRef.current);
          fetchTimeoutRef.current = setTimeout(async () => {
            setLoading(true);
            try {
              const itemsResponse = await getMyItems({ page: itemsPage, limit });
              setItems(itemsResponse.data.items || []);
              setItemsTotalPages(itemsResponse.data.pagination?.totalPages || 1);
            } catch (err) {
              addNotification(`Failed to load data: ${err.response?.data?.message || err.message}`, 'error');
            } finally {
              setLoading(false);
            }
          }, 300);
        }
      };

      socket.on('newNotification', handleNewNotification);

      return () => {
        socket.off('newNotification', handleNewNotification);
      };
    }

    return () => {
      if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
    };
  }, [itemsPage, user, socket, addNotification]);

  useEffect(() => {
    localStorage.setItem('userDashboardViewType', viewType);
  }, [viewType]);

  // Memoized handlers
  const handleEdit = useCallback((item) => {
    setEditingItemId(item._id);
    setEditFormData({
      title: item.title,
      description: item.description,
      category: item.category?.name || '',
      status: item.status,
      location: item.location || '',
      image: null,
    });
    setCurrentImage(item.image || '');
  }, []);

  const handleEditChange = useCallback((e) => {
    const { name, value, files } = e.target;
    if (name === 'image' && files && files[0]) {
      const file = files[0];
      setEditFormData((prev) => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => setCurrentImage(reader.result);
      reader.readAsDataURL(file);
    } else {
      setEditFormData((prev) => ({ ...prev, [name]: value }));
    }
  }, []);

  const handleEditSubmit = useCallback(async (itemId) => {
    const data = new FormData();
    data.append('title', editFormData.title);
    data.append('description', editFormData.description);
    data.append('category', editFormData.category);
    data.append('status', editFormData.status);
    data.append('location', editFormData.location);
    if (editFormData.image) {
      data.append('image', editFormData.image);
    }

    try {
      await updateItem(itemId, data);
      const itemsResponse = await getMyItems({ page: itemsPage, limit });
      setItems(itemsResponse.data.items || []);
      setItemsTotalPages(itemsResponse.data.pagination?.totalPages || 1);
      addNotification('Item updated successfully!', 'success', { toastId: `update-${itemId}` });
      setEditingItemId(null);
      setEditFormData({ title: '', description: '', category: '', status: '', location: '', image: null });
      setCurrentImage('');
    } catch (err) {
      addNotification(`Failed to update item: ${err.response?.data?.message || err.message}`, 'error', { toastId: `update-error-${itemId}` });
    }
  }, [editFormData, itemsPage, addNotification]);

  const handleDelete = useCallback(async (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteUserItem(itemId);
        setItems((prev) => prev.filter((item) => item._id !== itemId));
        if (items.length === 1 && itemsPage > 1) {
          setItemsPage((prev) => prev - 1);
        } else {
          const itemsResponse = await getMyItems({ page: itemsPage, limit });
          setItems(itemsResponse.data.items || []);
          setItemsTotalPages(itemsResponse.data.pagination?.totalPages || 1);
        }
        addNotification('Item deleted successfully!', 'success', { toastId: `delete-${itemId}` });
      } catch (err) {
        addNotification(`Failed to delete item: ${err.response?.data?.message || err.message}`, 'error', { toastId: `delete-error-${itemId}` });
      }
    }
  }, [items, itemsPage, addNotification]);

  const handleGenerateOTP = useCallback(async (itemId) => {
    const item = items.find((i) => i._id === itemId);
    if (!item) return;

    if (user.id !== item.postedBy._id && user.id !== item.keeperId) {
      addNotification('Only the poster or keeper can generate OTP.', 'error', { toastId: `otp-auth-${itemId}` });
      return;
    }

    try {
      const response = await generateOTPForItem(itemId);
      setOtpItemId(itemId);
      setShowOtpVerification(true);
      setOtp('');
      addNotification(`OTP generated: ${response.data.otp}. Share this with the claimant to verify return.`, 'info', { toastId: `otp-gen-${itemId}` });
    } catch (err) {
      addNotification(`Failed to generate OTP: ${err.response?.data?.message || err.message}`, 'error', { toastId: `otp-error-${itemId}` });
    }
  }, [items, user.id, addNotification]);

  const handleVerifyOTP = useCallback(async (itemId) => {
    if (!otp.trim()) {
      addNotification('Please enter the OTP.', 'error', { toastId: `otp-input-${itemId}` });
      return;
    }
    try {
      await verifyOTPForItem(itemId, { otp });
      setItems((prev) =>
        prev.map((item) => (item._id === itemId ? { ...item, status: 'Returned' } : item))
      );
      addNotification('OTP verified successfully! Item marked as returned.', 'success', { toastId: `otp-verify-${itemId}` });
      setShowOtpVerification(false);
      setOtpItemId(null);
      setOtp('');
    } catch (err) {
      addNotification(`Failed to verify OTP: ${err.response?.data?.message || err.message}`, 'error', { toastId: `otp-verify-error-${itemId}` });
    }
  }, [otp, addNotification]);

  const handleCancelOTP = useCallback(() => {
    setShowOtpVerification(false);
    setOtpItemId(null);
    setOtp('');
  }, []);

  // Memoized derived states
  const isClaimant = useMemo(() => user.id === items.find((item) => item._id === editingItemId)?.claimedById, [user.id, items, editingItemId]);
  const isPosterOrKeeper = useMemo(() => user.id === items.find((item) => item._id === editingItemId)?.postedBy._id || user.id === items.find((item) => item._id === editingItemId)?.keeperId, [user.id, items, editingItemId]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = items.length;
    const lost = items.filter(item => item.status === 'Lost').length;
    const found = items.filter(item => item.status === 'Found').length;
    const claimed = items.filter(item => item.status === 'Claimed').length;
    const returned = items.filter(item => item.status === 'Returned').length;

    return { total, lost, found, claimed, returned };
  }, [items]);

  if (!user) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
        }`}>
        <div className={`text-center p-8 rounded-2xl shadow-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
          <FiAlertCircle className={`text-5xl mx-auto mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`} />
          <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
            Please log in to view your dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
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
        limit={3}
      />

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <h1 className={`text-3xl sm:text-4xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                My Dashboard
              </h1>
              <p className={`text-sm sm:text-base ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                Manage your lost and found items
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <Link
                to="/items/create"
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all shadow-lg hover:shadow-xl ${theme === 'dark'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
              >
                <FiPlus className="text-lg" />
                <span>Add Item</span>
              </Link>
              <Link
                to="/profile"
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${theme === 'dark'
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700'
                    : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-md hover:shadow-lg'
                  }`}
              >
                <FiUser className="text-lg" />
                <span>Profile</span>
              </Link>
              <Link
                to="/notifications"
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${theme === 'dark'
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700'
                    : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-md hover:shadow-lg'
                  }`}
              >
                <FiBell className="text-lg" />
                <span>Notifications</span>
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className={`p-4 sm:p-6 rounded-xl shadow-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                }`}
            >
              <div className="flex items-center justify-between mb-2">
                <FiPackage className={`text-2xl ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                  }`} />
              </div>
              <p className={`text-3xl font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                {stats.total}
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                Total Items
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className={`p-4 sm:p-6 rounded-xl shadow-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                }`}
            >
              <div className="flex items-center justify-between mb-2">
                <FiAlertCircle className="text-2xl text-red-500" />
              </div>
              <p className={`text-3xl font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                {stats.lost}
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                Lost
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className={`p-4 sm:p-6 rounded-xl shadow-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                }`}
            >
              <div className="flex items-center justify-between mb-2">
                <FiPackage className="text-2xl text-green-500" />
              </div>
              <p className={`text-3xl font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                {stats.found}
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                Found
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className={`p-4 sm:p-6 rounded-xl shadow-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                }`}
            >
              <div className="flex items-center justify-between mb-2">
                <FiClock className="text-2xl text-yellow-500" />
              </div>
              <p className={`text-3xl font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                {stats.claimed}
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                Claimed
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.5 }}
              className={`p-4 sm:p-6 rounded-xl shadow-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                }`}
            >
              <div className="flex items-center justify-between mb-2">
                <FiTrendingUp className="text-2xl text-purple-500" />
              </div>
              <p className={`text-3xl font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                {stats.returned}
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                Returned
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* View Toggle */}
        <div className={`flex items-center justify-between mb-6 p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          } shadow-lg`}>
          <div>
            <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
              My Items
            </h2>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
              {items.length} item{items.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setViewType('card')}
              className={`p-2.5 rounded-lg transition-all ${viewType === 'card'
                  ? theme === 'dark'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-500 text-white'
                  : theme === 'dark'
                    ? 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              <FiGrid className="text-lg" />
            </button>
            <button
              onClick={() => setViewType('list')}
              className={`p-2.5 rounded-lg transition-all ${viewType === 'list'
                  ? theme === 'dark'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-500 text-white'
                  : theme === 'dark'
                    ? 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              <FiList className="text-lg" />
            </button>
          </div>
        </div>

        {/* Items Section */}
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="relative">
              <div className={`w-16 h-16 rounded-full border-4 border-t-transparent animate-spin ${theme === 'dark' ? 'border-blue-500' : 'border-blue-600'
                }`}></div>
              <FiPackage className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                }`} />
            </div>
            <p className={`mt-4 text-lg font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
              Loading your items...
            </p>
          </motion.div>
        ) : items.length === 0 ? (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className={`text-center py-16 sm:py-20 rounded-2xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              } shadow-xl`}
          >
            <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
              <FiPackage className={`text-4xl sm:text-5xl ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
                }`} />
            </div>
            <h3 className={`text-xl sm:text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
              No Items Yet
            </h3>
            <p className={`text-sm sm:text-base mb-6 max-w-md mx-auto ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
              Start by adding your first lost or found item to get started.
            </p>
            <Link
              to="/items/create"
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all shadow-lg hover:shadow-xl ${theme === 'dark'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
            >
              <FiPlus className="text-lg" />
              <span>Add Your First Item</span>
            </Link>
          </motion.div>
        ) : (
          <div>
            {viewType === 'card' ? (
              /* Card View */
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
              >
                {items.map((item, index) => {
                  const isClaimant = user.id === item.claimedById;
                  const isPosterOrKeeper = user.id === item.postedBy._id || user.id === item.keeperId;

                  return (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <ItemCard
                        item={item}
                        currentUserId={user?.id}
                        onEdit={() => handleEdit(item)}
                        onDelete={() => handleDelete(item._id)}
                        showActions={editingItemId !== item._id}
                        isEditing={editingItemId === item._id}
                        editFormData={editingItemId === item._id ? editFormData : null}
                        onEditChange={handleEditChange}
                        onEditSubmit={() => handleEditSubmit(item._id)}
                        onCancelEdit={() => {
                          setEditingItemId(null);
                          setCurrentImage('');
                        }}
                        onGenerateOTP={item.status === 'Claimed' && !isClaimant && isPosterOrKeeper ? () => handleGenerateOTP(item._id) : null}
                        onVerifyOTP={item.status === 'Claimed' && showOtpVerification && otpItemId === item._id && !isClaimant ? () => handleVerifyOTP(item._id) : null}
                        otp={showOtpVerification && otpItemId === item._id && !isClaimant ? otp : ''}
                        setOtp={showOtpVerification && otpItemId === item._id && !isClaimant ? setOtp : null}
                        onCancelOTP={showOtpVerification && otpItemId === item._id && !isClaimant ? handleCancelOTP : null}
                      />
                    </motion.div>
                  );
                })}
              </motion.div>
            ) : (
              /* List View */
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className={`rounded-xl shadow-lg overflow-hidden ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                  }`}
              >
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className={`${theme === 'dark' ? 'bg-gray-900/50' : 'bg-gray-50'
                      }`}>
                      <tr>
                        <th className={`px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                          Image
                        </th>
                        <th className={`px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                          Title
                        </th>
                        <th className={`px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                          Status
                        </th>
                        <th className={`px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                          Category
                        </th>
                        <th className={`px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                          Posted On
                        </th>
                        <th className={`px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'
                      }`}>
                      {items.map((item, index) => (
                        <motion.tr
                          key={item._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className={`transition-colors ${theme === 'dark'
                              ? 'hover:bg-gray-700/50'
                              : 'hover:bg-gray-50'
                            }`}
                        >
                          {editingItemId === item._id ? (
                            <>
                              <td className="px-1 sm:px-2 md:px-4 py-1 sm:py-2">
                                <div className="flex flex-col items-center">
                                  {currentImage && (
                                    <img src={currentImage} alt={item.title} className="w-8 sm:w-12 md:w-16 h-8 sm:h-12 md:h-16 object-cover rounded-md mb-1 sm:mb-2" />
                                  )}
                                  {editFormData.status === 'Found' ? (
                                    <button
                                      type="button"
                                      onClick={async () => {
                                        // Use MediaDevices API to capture image
                                        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                                          addNotification('Camera not supported in this browser.', 'error');
                                          return;
                                        }
                                        try {
                                          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                                          const video = document.createElement('video');
                                          video.srcObject = stream;
                                          await video.play();
                                          const canvas = document.createElement('canvas');
                                          canvas.width = video.videoWidth;
                                          canvas.height = video.videoHeight;
                                          canvas.getContext('2d').drawImage(video, 0, 0);
                                          stream.getTracks().forEach((track) => track.stop());
                                          const dataUrl = canvas.toDataURL('image/png');
                                          setCurrentImage(dataUrl);
                                          // Convert dataUrl to File for upload
                                          const res = await fetch(dataUrl);
                                          const blob = await res.blob();
                                          const file = new File([blob], 'captured.png', { type: 'image/png' });
                                          setEditFormData((prev) => ({ ...prev, image: file }));
                                        } catch (err) {
                                          addNotification('Failed to capture image: ' + (err.message || 'Unknown error'), 'error');
                                        }
                                      }}
                                      className="w-full p-1 sm:p-2 border rounded-md text-xs sm:text-sm bg-blue-600 text-white mt-1"
                                      style={{ border: '1px solid var(--color-secondary)' }}
                                    >
                                      Capture Image
                                    </button>
                                  ) : (
                                    <input
                                      type="file"
                                      name="image"
                                      onChange={handleEditChange}
                                      className="w-full p-1 sm:p-2 border rounded-md text-xs sm:text-sm"
                                      style={{
                                        border: '1px solid var(--color-secondary)',
                                        background: 'var(--color-bg)',
                                        color: 'var(--color-text)'
                                      }}
                                    />
                                  )}
                                </div>
                              </td>
                              <td className="px-1 sm:px-2 md:px-4 py-1 sm:py-2">
                                <input
                                  type="text"
                                  name="title"
                                  value={editFormData.title}
                                  onChange={handleEditChange}
                                  className="w-full p-1 sm:p-2 border rounded-md text-xs sm:text-sm"
                                  style={{
                                    border: '1px solid var(--color-secondary)',
                                    background: 'var(--color-bg)',
                                    color: 'var(--color-text)'
                                  }}
                                  required
                                />
                              </td>
                              <td className="px-1 sm:px-2 md:px-4 py-1 sm:py-2">
                                <select
                                  name="status"
                                  value={editFormData.status}
                                  onChange={handleEditChange}
                                  className="w-full p-1 sm:p-2 border rounded-md text-xs sm:text-sm"
                                  style={{
                                    border: '1px solid var(--color-secondary)',
                                    background: 'var(--color-bg)',
                                    color: 'var(--color-text)'
                                  }}
                                  required
                                >
                                  <option value="Lost">Lost</option>
                                  <option value="Found">Found</option>
                                  <option value="Claimed">Claimed</option>
                                  <option value="Returned">Returned</option>
                                </select>
                              </td>
                              <td className="px-1 sm:px-2 md:px-4 py-1 sm:py-2">
                                <select
                                  name="category"
                                  value={editFormData.category}
                                  onChange={handleEditChange}
                                  className="w-full p-1 sm:p-2 border rounded-md text-xs sm:text-sm"
                                  style={{
                                    border: '1px solid var(--color-secondary)',
                                    background: 'var(--color-bg)',
                                    color: 'var(--color-text)'
                                  }}
                                  required
                                >
                                  <option value="">Select a category</option>
                                  {categories.map((category) => (
                                    <option key={category._id} value={category.name}>
                                      {category.name}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="px-1 sm:px-2 md:px-4 py-1 sm:py-2 text-xs sm:text-sm">{new Date(item.createdAt).toLocaleDateString()}</td>
                              <td className="px-1 sm:px-2 md:px-4 py-1 sm:py-2 flex flex-col sm:flex-row gap-1 sm:gap-2">
                                <button
                                  onClick={() => handleEditSubmit(item._id)}
                                  className="px-1 sm:px-2 py-0.5 sm:py-1 rounded-md text-xs sm:text-sm transition-colors w-full sm:w-auto"
                                  style={{ background: 'var(--color-accent)', color: 'var(--color-bg)' }}
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingItemId(null);
                                    setCurrentImage('');
                                  }}
                                  className="px-1 sm:px-2 py-0.5 sm:py-1 rounded-md text-xs sm:text-sm transition-colors w-full sm:w-auto mt-1 sm:mt-0"
                                  style={{ background: 'var(--color-secondary)', color: 'var(--color-text)' }}
                                >
                                  Cancel
                                </button>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="px-4 py-4">
                                {item.image ? (
                                  <img
                                    src={item.image}
                                    alt={item.title}
                                    className="w-16 h-16 object-cover rounded-lg shadow-md"
                                  />
                                ) : (
                                  <div className={`w-16 h-16 rounded-lg flex items-center justify-center ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                                    }`}>
                                    <FiPackage className={`text-2xl ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
                                      }`} />
                                  </div>
                                )}
                              </td>
                              <td className={`px-4 py-4 text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                                }`}>
                                {item.title}
                              </td>
                              <td className="px-4 py-4">
                                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${item.status === 'Lost'
                                    ? 'bg-red-100 text-red-700'
                                    : item.status === 'Found'
                                      ? 'bg-green-100 text-green-700'
                                      : item.status === 'Claimed'
                                        ? 'bg-yellow-100 text-yellow-700'
                                        : 'bg-purple-100 text-purple-700'
                                  }`}>
                                  {item.status}
                                </span>
                              </td>
                              <td className={`px-4 py-4 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                {item.category?.name || 'N/A'}
                              </td>
                              <td className={`px-4 py-4 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                {new Date(item.createdAt).toLocaleDateString()}
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex flex-wrap gap-2">
                                  <Link
                                    to={`/items/${item._id}`}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${theme === 'dark'
                                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                                      }`}
                                  >
                                    <FiEye className="text-sm" />
                                    View
                                  </Link>
                                  <button
                                    onClick={() => handleEdit(item)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${theme === 'dark'
                                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                      }`}
                                  >
                                    <FiEdit className="text-sm" />
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDelete(item._id)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${theme === 'dark'
                                        ? 'bg-red-600 hover:bg-red-700 text-white'
                                        : 'bg-red-500 hover:bg-red-600 text-white'
                                      }`}
                                  >
                                    <FiTrash className="text-sm" />
                                    Delete
                                  </button>
                                  {item.status === 'Claimed' && !isClaimant && (
                                    <>
                                      {isPosterOrKeeper && (
                                        <button
                                          onClick={() => handleGenerateOTP(item._id)}
                                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${theme === 'dark'
                                              ? 'bg-purple-600 hover:bg-purple-700 text-white'
                                              : 'bg-purple-500 hover:bg-purple-600 text-white'
                                            }`}
                                        >
                                          <FiKey className="text-sm" />
                                          Generate OTP
                                        </button>
                                      )}
                                      {showOtpVerification && otpItemId === item._id && (
                                        <div className="flex items-center gap-2 w-full mt-2">
                                          <input
                                            type="text"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            placeholder="Enter OTP"
                                            className={`px-3 py-2 border rounded-lg text-sm w-32 focus:ring-2 focus:ring-purple-500 ${theme === 'dark'
                                                ? 'bg-gray-700 border-gray-600 text-white'
                                                : 'bg-white border-gray-300 text-gray-900'
                                              }`}
                                          />
                                          <button
                                            onClick={() => handleVerifyOTP(item._id)}
                                            className={`px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${theme === 'dark'
                                                ? 'bg-green-600 hover:bg-green-700 text-white'
                                                : 'bg-green-500 hover:bg-green-600 text-white'
                                              }`}
                                          >
                                            <FiCheck className="text-sm" />
                                            Verify
                                          </button>
                                          <button
                                            onClick={handleCancelOTP}
                                            className={`px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${theme === 'dark'
                                                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                                                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                              }`}
                                          >
                                            <FiX className="text-sm" />
                                            Cancel
                                          </button>
                                        </div>
                                      )}
                                    </>
                                  )}
                                </div>
                              </td>
                            </>
                          )}
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {items.length > 0 && (
                  <div className="mt-6 px-4 pb-4">
                    <Pagination
                      currentPage={itemsPage}
                      totalPages={itemsTotalPages}
                      onPageChange={(page) => setItemsPage(page)}
                    />
                  </div>
                )}
              </motion.div>
            )}

            {/* Pagination for Card View */}
            {viewType === 'card' && items.length > 0 && (
              <div className="mt-6">
                <Pagination
                  currentPage={itemsPage}
                  totalPages={itemsTotalPages}
                  onPageChange={(page) => setItemsPage(page)}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default UserDashboard;