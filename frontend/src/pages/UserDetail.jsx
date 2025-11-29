import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getUserItems, getUserById } from '../services/adminService';
import { toast } from 'react-toastify';
import Pagination from '../components/common/Pagination';
import Loader from '../components/common/Loader';
import {
  FaUser,
  FaEnvelope,
  FaUserShield,
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaBoxOpen,
  FaClipboardList,
  FaArrowLeft,
  FaMapMarkerAlt,
  FaBuilding,
  FaFileAlt
} from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';

function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const limit = 6;

  // Calculate stats
  const stats = {
    totalItems: totalItems,
    postedItems: items.filter(item => item.postedBy?._id === id).length,
    claimedItems: items.filter(item => item.claimedBy?._id === id).length,
    lostItems: items.filter(item => item.status === 'Lost' && item.postedBy?._id === id).length,
    foundItems: items.filter(item => item.status === 'Found' && item.postedBy?._id === id).length,
  };

  useEffect(() => {
    const fetchUserAndItems = async () => {
      setLoading(true);
      try {
        // Fetch user details
        const userResponse = await getUserById(id);
        setUser(userResponse.data.user);

        // Fetch items posted by the user with pagination
        const itemsResponse = await getUserItems(id, { page: currentPage, limit });
        setItems(itemsResponse.data.items || []);
        setTotalPages(itemsResponse.data.pagination?.totalPages || 1);
        setTotalItems(itemsResponse.data.pagination?.total || 0);
      } catch (err) {
        toast.error('Failed to fetch data: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };
    fetchUserAndItems();
  }, [id, currentPage]); // Re-fetch when id or currentPage changes

  // Handler for page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div style={{ background: 'var(--color-bg)', minHeight: '100vh' }} className="flex items-center justify-center">
        <Loader size="lg" variant="bars" text="Loading user details..." />
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ background: 'var(--color-bg)', minHeight: '100vh' }} className="flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-semibold mb-4" style={{ color: 'var(--color-text)' }}>User not found</p>
          <button
            onClick={() => navigate('/admin')}
            className="px-4 py-2 rounded-lg transition-all"
            style={{ background: 'var(--color-primary)', color: 'var(--color-bg)' }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--color-bg)', color: 'var(--color-text)', minHeight: '100vh' }}>
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin')}
              className="p-2 rounded-lg transition-all hover:scale-110"
              style={{ background: 'var(--color-secondary)' }}
            >
              <FaArrowLeft className="text-xl" style={{ color: 'var(--color-text)' }} />
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--color-text)' }}>
              User Profile
            </h1>
          </div>
        </div>

        {/* Profile Card */}
        <div className="rounded-2xl shadow-xl overflow-hidden mb-6" style={{ background: 'var(--color-secondary)' }}>
          {/* Header Banner */}
          <div className={`relative h-32 ${theme === 'dark'
              ? 'bg-linear-to-r from-blue-600 to-purple-600'
              : 'bg-linear-to-r from-blue-500 to-purple-500'
            }`}>
            <div className="absolute -bottom-16 left-8">
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.name}
                  className={`w-32 h-32 rounded-full object-cover shadow-xl ${theme === 'dark' ? 'border-4 border-gray-800' : 'border-4 border-white'
                    }`}
                />
              ) : (
                <div
                  className={`w-32 h-32 rounded-full flex items-center justify-center text-4xl font-bold shadow-xl ${theme === 'dark'
                      ? 'bg-gray-700 text-white border-4 border-gray-800'
                      : 'bg-white text-blue-600 border-4 border-white'
                    }`}
                >
                  {user.name ? user.name[0].toUpperCase() : <FaUser />}
                </div>
              )}
            </div>
          </div>

          {/* User Info */}
          <div className="pt-20 px-8 pb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold" style={{ color: 'var(--color-text)' }}>
                  {user.name}
                </h2>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${user.role === 'keeper'
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                        : user.role === 'admin'
                          ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      }`}
                  >
                    <FaUserShield className="text-xs" />
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                  {user.isActive ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                      <FaCheckCircle className="text-xs" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
                      <FaTimesCircle className="text-xs" />
                      Inactive
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div
                className={`flex items-start gap-3 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
                  }`}
              >
                <div
                  className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-blue-600/20' : 'bg-blue-100'
                    }`}
                >
                  <FaEnvelope
                    className={`text-xl ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                      }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}
                  >
                    Email Address
                  </p>
                  <p
                    className={`text-sm font-semibold truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}
                  >
                    {user.email}
                  </p>
                </div>
              </div>

              <div
                className={`flex items-start gap-3 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
                  }`}
              >
                <div
                  className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-green-600/20' : 'bg-green-100'
                    }`}
                >
                  <FaCalendarAlt
                    className={`text-xl ${theme === 'dark' ? 'text-green-400' : 'text-green-600'
                      }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}
                  >
                    Member Since
                  </p>
                  <p
                    className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}
                  >
                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {user.role === 'keeper' && user.location && (
                <div
                  className={`flex items-start gap-3 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
                    }`}
                >
                  <div
                    className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-purple-600/20' : 'bg-purple-100'
                      }`}
                  >
                    <FaMapMarkerAlt
                      className={`text-xl ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                        }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}
                    >
                      Location
                    </p>
                    <p
                      className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}
                    >
                      {user.location}
                    </p>
                  </div>
                </div>
              )}

              {user.role === 'keeper' && user.department && (
                <div
                  className={`flex items-start gap-3 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
                    }`}
                >
                  <div
                    className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-orange-600/20' : 'bg-orange-100'
                      }`}
                  >
                    <FaBuilding
                      className={`text-xl ${theme === 'dark' ? 'text-orange-400' : 'text-orange-600'
                        }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}
                    >
                      Department
                    </p>
                    <p
                      className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}
                    >
                      {user.department}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {user.role === 'keeper' && user.description && (
              <div
                className={`flex items-start gap-3 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
                  }`}
              >
                <div
                  className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-indigo-600/20' : 'bg-indigo-100'
                    }`}
                >
                  <FaFileAlt
                    className={`text-xl ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'
                      }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-xs font-medium uppercase tracking-wider mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}
                  >
                    Description
                  </p>
                  <p
                    className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}
                  >
                    {user.description}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          <div
            className="p-4 rounded-xl shadow-lg"
            style={{ background: 'var(--color-secondary)' }}
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900">
                <FaBoxOpen className="text-2xl text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
                  {stats.totalItems}
                </p>
                <p className="text-xs opacity-70" style={{ color: 'var(--color-text)' }}>
                  Total Items
                </p>
              </div>
            </div>
          </div>

          <div
            className="p-4 rounded-xl shadow-lg"
            style={{ background: 'var(--color-secondary)' }}
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900">
                <FaClipboardList className="text-2xl text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
                  {stats.postedItems}
                </p>
                <p className="text-xs opacity-70" style={{ color: 'var(--color-text)' }}>
                  Posted
                </p>
              </div>
            </div>
          </div>

          <div
            className="p-4 rounded-xl shadow-lg"
            style={{ background: 'var(--color-secondary)' }}
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900">
                <FaCheckCircle className="text-2xl text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
                  {stats.claimedItems}
                </p>
                <p className="text-xs opacity-70" style={{ color: 'var(--color-text)' }}>
                  Claimed
                </p>
              </div>
            </div>
          </div>

          <div
            className="p-4 rounded-xl shadow-lg"
            style={{ background: 'var(--color-secondary)' }}
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900">
                <FaTimesCircle className="text-2xl text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
                  {stats.lostItems}
                </p>
                <p className="text-xs opacity-70" style={{ color: 'var(--color-text)' }}>
                  Lost
                </p>
              </div>
            </div>
          </div>

          <div
            className="p-4 rounded-xl shadow-lg"
            style={{ background: 'var(--color-secondary)' }}
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-emerald-100 dark:bg-emerald-900">
                <FaCheckCircle className="text-2xl text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
                  {stats.foundItems}
                </p>
                <p className="text-xs opacity-70" style={{ color: 'var(--color-text)' }}>
                  Found
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Items Section */}
        <div className="rounded-2xl shadow-xl p-6" style={{ background: 'var(--color-secondary)' }}>
          <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text)' }}>
            User's Items
          </h2>

          {items.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((item) => (
                  <Link
                    key={item._id}
                    to={`/items/${item._id}`}
                    className={`p-4 rounded-xl border-2 transition-all hover:shadow-lg hover:-translate-y-1 ${theme === 'dark'
                        ? 'bg-gray-700/50 border-gray-600 hover:border-blue-500'
                        : 'bg-white border-gray-200 hover:border-blue-400'
                      }`}
                  >
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-40 object-cover rounded-lg mb-3"
                      />
                    )}
                    <h3
                      className="font-bold text-lg mb-2 truncate"
                      style={{ color: 'var(--color-text)' }}
                    >
                      {item.title}
                    </h3>
                    <p
                      className="text-sm opacity-70 mb-3 line-clamp-2"
                      style={{ color: 'var(--color-text)' }}
                    >
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${item.status === 'Lost'
                            ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                            : item.status === 'Found'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                          }`}
                      >
                        {item.status}
                      </span>
                      <span className="text-xs opacity-60" style={{ color: 'var(--color-text)' }}>
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-6">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <FaBoxOpen
                className="text-6xl mx-auto mb-4 opacity-30"
                style={{ color: 'var(--color-text)' }}
              />
              <p className="text-lg opacity-70" style={{ color: 'var(--color-text)' }}>
                No items found for this user
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserDetail;