import { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../services/notificationService';
import Loader from '../components/common/Loader';
import Pagination from '../components/common/Pagination';
import { toast } from 'react-toastify';
import {
  FaBell,
  FaCheck,
  FaCheckDouble,
  FaClock,
  FaInbox,
  FaFilter,
  FaExclamationCircle
} from 'react-icons/fa';

// Helper for relative time
function timeAgo(date) {
  const now = new Date();
  const then = new Date(date);
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return then.toLocaleDateString();
}

function Notifications() {
  const { user, loading: authLoading, socket } = useContext(AuthContext);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [pageLoading, setPageLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'
  const limit = 10;

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })));
      toast.success('All notifications marked as read!');
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to mark all as read';
      toast.error(errorMessage);
    }
  };

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
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load notifications';
      toast.error(errorMessage);
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
      const errorMessage = err.response?.data?.message || err.message || 'Failed to mark as read';
      toast.error(errorMessage);
    }
  };

  // Pagination handler
  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (authLoading || !user) return <Loader />;

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.isRead;
    if (filter === 'read') return notif.isRead;
    return true;
  });

  return (
    <main className="min-h-screen px-3 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <header className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div
                className="p-3 rounded-xl shadow-lg"
                style={{ background: 'var(--color-primary)' }}
              >
                <FaBell className="text-white text-xl sm:text-2xl" />
              </div>
              <div>
                <h1
                  className="text-2xl sm:text-3xl lg:text-4xl font-bold"
                  style={{ color: 'var(--color-text)' }}
                >
                  Notifications
                </h1>
                {unreadCount > 0 && (
                  <p className="text-sm sm:text-base" style={{ color: 'var(--color-muted, #6b7280)' }}>
                    You have <span className="font-bold" style={{ color: 'var(--color-primary)' }}>{unreadCount}</span> unread {unreadCount === 1 ? 'notification' : 'notifications'}
                  </p>
                )}
              </div>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 text-sm sm:text-base"
                style={{
                  background: 'var(--color-primary)',
                  color: 'white'
                }}
                aria-label="Mark all notifications as read"
              >
                <FaCheckDouble />
                <span className="hidden sm:inline">Mark All as Read</span>
                <span className="sm:hidden">Mark All</span>
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 p-1 rounded-xl shadow-md" style={{ background: 'var(--color-secondary)' }}>
            <button
              onClick={() => setFilter('all')}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-200 ${filter === 'all' ? 'shadow-md' : ''
                }`}
              style={{
                background: filter === 'all' ? 'var(--color-primary)' : 'transparent',
                color: filter === 'all' ? 'white' : 'var(--color-text)'
              }}
            >
              <FaFilter className="text-xs" />
              <span>All</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{
                background: filter === 'all' ? 'rgba(255,255,255,0.2)' : 'var(--color-bg)',
                color: filter === 'all' ? 'white' : 'var(--color-text)'
              }}>
                {notifications.length}
              </span>
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-200 ${filter === 'unread' ? 'shadow-md' : ''
                }`}
              style={{
                background: filter === 'unread' ? 'var(--color-primary)' : 'transparent',
                color: filter === 'unread' ? 'white' : 'var(--color-text)'
              }}
            >
              <FaExclamationCircle className="text-xs" />
              <span>Unread</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{
                  background: filter === 'unread' ? 'rgba(255,255,255,0.2)' : 'var(--color-bg)',
                  color: filter === 'unread' ? 'white' : 'var(--color-text)'
                }}>
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-200 ${filter === 'read' ? 'shadow-md' : ''
                }`}
              style={{
                background: filter === 'read' ? 'var(--color-primary)' : 'transparent',
                color: filter === 'read' ? 'white' : 'var(--color-text)'
              }}
            >
              <FaCheck className="text-xs" />
              <span>Read</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{
                background: filter === 'read' ? 'rgba(255,255,255,0.2)' : 'var(--color-bg)',
                color: filter === 'read' ? 'white' : 'var(--color-text)'
              }}>
                {notifications.filter(n => n.isRead).length}
              </span>
            </button>
          </div>
        </header>

        {/* Loading State */}
        {pageLoading && notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader size="md" variant="pulse" text="Loading notifications..." />
          </div>
        ) : filteredNotifications.length > 0 ? (
          <section className="space-y-3">
            {filteredNotifications.map((notif, index) => (
              <div
                key={notif._id}
                className={`group rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:scale-[1.01] ${notif.isRead ? '' : 'ring-2'
                  }`}
                style={{
                  background: 'var(--color-secondary)',
                  borderLeft: notif.isRead ? 'none' : '4px solid var(--color-primary)',
                  ringColor: notif.isRead ? 'transparent' : 'var(--color-primary)',
                  animationDelay: `${index * 50}ms`
                }}
                role="region"
                aria-label={`Notification: ${notif.message}`}
              >
                <div className="p-4 sm:p-5 flex items-start gap-3 sm:gap-4">
                  {/* Icon/Indicator */}
                  <div className="flex-shrink-0 mt-1">
                    {!notif.isRead ? (
                      <div
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-lg animate-pulse"
                        style={{ background: 'var(--color-primary)' }}
                      >
                        <FaBell className="text-white text-sm sm:text-base" />
                      </div>
                    ) : (
                      <div
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow"
                        style={{ background: 'var(--color-bg)' }}
                      >
                        <FaCheck className="text-sm sm:text-base" style={{ color: 'var(--color-muted, #9ca3af)' }} />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm sm:text-base break-words leading-relaxed ${notif.isRead ? 'opacity-70' : 'font-semibold'
                        }`}
                      style={{ color: 'var(--color-text)' }}
                    >
                      {notif.message}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <FaClock className="text-xs" style={{ color: 'var(--color-muted, #9ca3af)' }} />
                      <time
                        className="text-xs sm:text-sm"
                        style={{ color: 'var(--color-muted, #9ca3af)' }}
                        dateTime={notif.createdAt}
                      >
                        {timeAgo(notif.createdAt)}
                      </time>
                      {!notif.isRead && (
                        <span
                          className="ml-auto px-2 py-1 rounded-full text-xs font-bold"
                          style={{
                            background: 'var(--color-primary)',
                            color: 'white'
                          }}
                        >
                          NEW
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Mark as Read Button */}
                  {!notif.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(notif._id)}
                      className="flex-shrink-0 px-3 py-2 sm:px-4 sm:py-2 rounded-xl font-semibold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 flex items-center gap-2"
                      style={{
                        background: 'var(--color-primary)',
                        color: 'white'
                      }}
                      aria-label={`Mark notification as read`}
                    >
                      <FaCheck className="text-xs" />
                      <span className="hidden sm:inline">Mark Read</span>
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Pagination */}
            <div className="pt-4">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          </section>
        ) : (
          <div
            className="flex flex-col items-center justify-center py-16 px-4 rounded-2xl shadow-lg"
            style={{ background: 'var(--color-secondary)' }}
          >
            <div
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mb-4 shadow-lg"
              style={{ background: 'var(--color-bg)' }}
            >
              <FaInbox className="text-4xl sm:text-5xl" style={{ color: 'var(--color-muted, #9ca3af)' }} />
            </div>
            <h3
              className="text-lg sm:text-xl font-bold mb-2"
              style={{ color: 'var(--color-text)' }}
            >
              No notifications {filter !== 'all' ? `(${filter})` : ''}
            </h3>
            <p
              className="text-sm sm:text-base text-center max-w-md"
              style={{ color: 'var(--color-muted, #6b7280)' }}
            >
              {filter === 'unread'
                ? "You're all caught up! No unread notifications."
                : filter === 'read'
                  ? "No read notifications found."
                  : "When you receive notifications, they'll appear here."}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

export default Notifications;