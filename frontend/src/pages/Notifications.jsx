import { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../services/notificationService';
import Loader from '../components/common/Loader';
import Pagination from '../components/common/Pagination';
import { toast } from 'react-toastify';

// Helper for relative time
function timeAgo(date) {
  const now = new Date();
  const then = new Date(date);
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return then.toLocaleDateString();
}

function Notifications() {
  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })));
      toast.success('All notifications marked as read!');
    } catch (err) {
      toast.error(`Failed to mark all as read: ${err.response?.data?.error || err.message}`);
    }
  };
  const { user, loading: authLoading, socket } = useContext(AuthContext);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [pageLoading, setPageLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  // Fetch notifications with error handling
  const fetchNotifications = useCallback(async () => {
    if (!user?.id) {
      navigate('/login');
      return;
    }

    setPageLoading(true);
    try {
      const response = await getNotifications({ page, limit });
      setNotifications(response.data.data.notifications || []);
      setTotalPages(response.data.data.pagination?.totalPages || 1);
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Unknown error';
      toast.error(`Failed to load notifications: ${errorMessage}`);
    } finally {
      setPageLoading(false);
    }
  }, [user, page, limit, navigate]);

  // Socket event handling
  useEffect(() => {
    if (!socket || !user) return;

    const handleNewNotification = (notification) => {
      setNotifications((prev) => {
        if (prev.some((n) => n._id === notification._id)) return prev;
        return [notification, ...prev.slice(0, limit - 1)];
      });
    };

    const handleErrorMessage = (errorMsg) => {
      toast.error(errorMsg);
    };

    socket.on('newNotification', handleNewNotification);
    socket.on('errorMessage', handleErrorMessage);
    fetchNotifications();

    return () => {
      socket.off('newNotification', handleNewNotification);
      socket.off('errorMessage', handleErrorMessage);
    };
  }, [socket, user, page, fetchNotifications]);

  // Mark notification as read
  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationAsRead(id, { id: user.id, read: true });
      setNotifications((prev) =>
        prev.map((notif) => (notif._id === id ? { ...notif, isRead: true } : notif))
      );
      // Optionally add toast.success if desired
      // toast.success('Notification marked as read!');
    } catch (err) {
      toast.error(`Failed to mark as read: ${err.response?.data?.error || err.message}`);
    }
  };

  // Pagination handler
  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (authLoading || !user) return <Loader />;

  return (
    <main className="max-w-4xl mx-auto px-4 py-6 min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <header className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold md:text-3xl lg:text-4xl animate-fade-in-down" style={{ color: 'var(--color-text)' }}>
          Notifications
        </h1>
        {notifications.some((n) => !n.isRead) && (
          <button
            onClick={handleMarkAllAsRead}
            className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold shadow transition-colors duration-200"
            aria-label="Mark all notifications as read"
          >
            Mark All as Read
          </button>
        )}
      </header>

      {/* Loading State */}
      {pageLoading && notifications.length === 0 ? (
        <Loader size="md" variant="pulse" text="Loading notifications..." />
      ) : notifications.length > 0 ? (
        <section className="rounded-xl shadow-md overflow-hidden animate-fade-in-down" style={{ background: 'var(--color-secondary)' }}>
          <ul className="divide-y" style={{ borderColor: 'var(--color-secondary)' }}>
            {notifications.map((notif) => (
              <li
                key={notif._id}
                className={`group p-4 flex items-start gap-3 transition-all duration-200 rounded-lg mb-2 shadow-sm relative ${notif.isRead ? 'opacity-80' : 'bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500'} hover:shadow-lg`}
                style={{
                  background: notif.isRead ? 'var(--color-secondary)' : undefined,
                  color: 'var(--color-text)',
                  borderLeft: notif.isRead ? undefined : '4px solid var(--color-accent)',
                  boxShadow: notif.isRead ? undefined : '0 2px 8px 0 rgba(0,0,0,0.04)'
                }}
                role="region"
                aria-label={`Notification: ${notif.message}`}
              >
                {/* Unread dot */}
                {!notif.isRead && (
                  <span className="mt-2 w-3 h-3 rounded-full bg-blue-500 animate-pulse shadow" title="Unread" />
                )}
                <div className="flex-1 flex flex-col space-y-1">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm md:text-base break-words font-medium ${notif.isRead ? 'text-gray-600' : 'font-semibold text-blue-900'}`}>{notif.message}</p>
                  </div>
                  <time
                    className="text-xs md:text-sm text-gray-500"
                    dateTime={notif.createdAt}
                  >
                    {timeAgo(notif.createdAt)}
                  </time>
                </div>
                {!notif.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(notif._id)}
                    className="ml-2 px-3 py-1 text-xs rounded-full bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-colors duration-200"
                    aria-label={`Mark notification ${notif.message} as read`}
                  >
                    Mark as Read
                  </button>
                )}
              </li>
            ))}
          </ul>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </section>
      ) : (
        <p className="text-center py-12 animate-fade-in-down" style={{ color: 'var(--color-text)' }}>
          No notifications available
        </p>
      )}
    </main>
  );
}

export default Notifications;