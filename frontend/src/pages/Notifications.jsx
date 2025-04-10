import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getNotifications, markNotificationAsRead } from '../services/notificationService';
import Loader from '../components/common/Loader';

function Notifications() {
  const { user, loading: authLoading } = useContext(AuthContext); // Destructure authLoading
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [pageLoading, setPageLoading] = useState(false); // Separate loading state for page data
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10; // Match backend default limit

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user || !user.id) {
        navigate('/login');
        return;
      }

      setPageLoading(true);
      setError('');
      try {
        const response = await getNotifications({ page, limit });
        setNotifications(response.data.notifications || []);
        setTotalPages(response.data.totalPages || 1);
        console.log('Notifications:', response.data);
      } catch (err) {
        setError(`Failed to load notifications: ${err.response?.data?.error || err.message}`);
      } finally {
        setPageLoading(false);
      }
    };

    fetchNotifications();
  }, [user, navigate, page, limit]);

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationAsRead(id, { id: user.id, read: true });
      setNotifications((prev) =>
        prev.map((notif) => (notif._id === id ? { ...notif, read: true } : notif))
      );
    } catch (err) {
      setError(`Failed to mark as read: ${err.response?.data?.error || err.message}`);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  // Show Loader if auth is loading or page data is loading
  if (authLoading || !user) return <Loader />;

  return (
    <div className="container mx-auto p-4 sm:p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Notifications</h1>
      {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md">{error}</div>}
      {pageLoading ? (
        <Loader />
      ) : notifications.length > 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
          {notifications.map((notif) => (
            <div
              key={notif._id}
              className={`p-4 border border-gray-200 rounded-md ${
                !notif.read ? 'bg-yellow-50' : 'bg-white'
              }`}
            >
              <p className="text-sm text-gray-900">{notif.message}</p>
              <p className="text-xs text-gray-500">{new Date(notif.createdAt).toLocaleString()}</p>
              {!notif.read && (
                <button
                  onClick={() => handleMarkAsRead(notif._id)}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                >
                  Mark as Read
                </button>
              )}
            </div>
          ))}
          {/* Pagination Controls */}
          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors duration-200 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">Page {page} of {totalPages}</span>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors duration-200 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      ) : (
        <p className="text-gray-600 text-lg">No notifications found.</p>
      )}
    </div>
  );
}

export default Notifications;