// src/pages/Notifications.jsx
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getNotifications, markNotificationAsRead } from '../services/api'; // Updated to use api.js
import Loader from '../components/common/Loader';

function Notifications() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const response = await getNotifications(user.id);
        setNotifications(response.data || []);
        console.log('Notifications:', response.data);
        
      } catch (err) {
        setError('Failed to load notifications: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchNotifications();
    } else {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((notif) => (notif._id === id ? { ...notif, read: true } : notif))
      );
    } catch (err) {
      setError('Failed to mark as read: ' + err.message);
    }
  };

  if (!user) return <Loader />;

  return (
    <div className="container mx-auto p-4 sm:p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Notifications</h1>
      {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md">{error}</div>}
      {loading ? (
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
        </div>
      ) : (
        <p className="text-gray-600 text-lg">No notifications found.</p>
      )}
    </div>
  );
}

export default Notifications;