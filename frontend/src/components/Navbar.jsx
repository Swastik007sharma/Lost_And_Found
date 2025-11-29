import { useState, useContext, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FaBars,
  FaTimes,
  FaUser,
  FaUsers,
  FaSignOutAlt,
  FaHome,
  FaBell,
  FaPlus,
  FaComments,
  FaTachometerAlt,
  FaShieldAlt,
  FaSearch,
} from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import ThemeToggle from './common/ThemeToggle';
import { getNotifications } from '../services/notificationService';


function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, token, logout, loading, socket } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const profileRef = useRef(null);

  const isAdmin = user?.role === 'admin';
  const userInitial = user?.name?.charAt(0).toUpperCase() || 'U';

  const navLinks = [
    { to: '/home', label: 'Home', icon: <FaHome /> },
    { to: '/notifications', label: 'Notifications', icon: <FaBell /> },
    { to: '/items/create', label: 'Post Item', icon: <FaPlus /> },
    { to: '/conversations', label: 'Conversations', icon: <FaComments /> },
    { to: '/keepers', label: 'Keepers', icon: <FaUsers /> },
    { to: '/dashboard', label: 'Dashboard', icon: <FaTachometerAlt /> },
  ];

  if (isAdmin) {
    navLinks.push({ to: '/admin', label: 'Admin', icon: <FaShieldAlt /> });
  }

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    setProfileOpen(false);
    navigate('/login');
  };

  const handleProfileClick = () => {
    setProfileOpen(!profileOpen);
  };

  // Fetch unread notifications count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!token) return;
      try {
        const response = await getNotifications({ limit: 50 });

        // Handle different possible response structures
        let notifications = [];
        if (Array.isArray(response.data.notifications)) {
          notifications = response.data.notifications;
        } else if (response.data.data?.notifications) {
          notifications = response.data.data.notifications;
        } else if (response.data.notifications?.docs) {
          notifications = response.data.notifications.docs;
        }

        const unread = notifications.filter(n => n && !n.isRead);
        setUnreadCount(unread.length);
      } catch (error) {
        console.error('Failed to fetch unread notifications:', error);
      }
    };

    fetchUnreadCount();

    // Refresh count when navigating to/from notifications page
    if (location.pathname === '/notifications') {
      const timeoutId = setTimeout(fetchUnreadCount, 500);
      return () => clearTimeout(timeoutId);
    }

    // Listen for new notifications via socket
    if (socket) {
      const handleNewNotification = () => {
        fetchUnreadCount();
      };
      socket.on('newNotification', handleNewNotification);
      return () => {
        socket.off('newNotification', handleNewNotification);
      };
    }
  }, [token, socket, location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div className="sticky top-0 left-0 w-full z-50 bg-(--color-bg) backdrop-blur-xl border-b border-(--color-border) shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="animate-pulse flex justify-between items-center">
            <div className="h-8 w-32 bg-(--color-muted) rounded-lg"></div>
            <div className="flex gap-4">
              <div className="h-8 w-20 bg-(--color-muted) rounded-lg"></div>
              <div className="h-8 w-20 bg-(--color-muted) rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const mobileMenu = menuOpen
    ? createPortal(
      <>
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-1200 md:hidden"
          onClick={() => setMenuOpen(false)}
        ></div>
        <aside
          className="fixed top-0 left-0 h-full w-full max-w-xs bg-(--color-sidebar) border-r border-(--color-border) shadow-2xl z-1201 md:hidden flex flex-col"
          style={{ backgroundColor: 'var(--color-sidebar)', backgroundImage: 'none' }}
        >
          <div className="p-4 flex justify-between items-center border-b border-(--color-border) bg-linear-to-r from-(--color-primary) to-(--color-accent)">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-md">
                <FaSearch className="text-white text-sm" />
              </div>
              <h2 className="text-lg font-bold text-white">Lost & Found</h2>
            </div>
            <button
              onClick={() => setMenuOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-200"
            >
              <FaTimes className="text-white" />
            </button>
          </div>

          <div className="flex flex-col flex-1" style={{ backgroundColor: 'var(--color-sidebar)' }}>
            <div className="p-4">
              <div className="space-y-1">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.to;
                  const isNotificationLink = link.to === '/notifications';
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setMenuOpen(false)}
                      className={`
                          flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 font-medium relative
                          ${isActive
                          ? 'bg-linear-to-r from-(--color-primary) to-(--color-accent) text-white shadow-md border-l-4 border-white'
                          : 'text-(--color-text) hover:bg-(--color-muted)'
                        }
                        `}
                    >
                      <span className="text-lg relative">
                        {link.icon}
                        {isNotificationLink && unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </span>
                        )}
                      </span>
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {token ? (
              <div className="mt-auto w-full border-t border-(--color-border) p-4 space-y-2">
                <Link
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-(--color-muted) rounded-lg transition-all duration-200 text-sm text-(--color-text)"
                >
                  <FaUser className="text-base" />
                  <span>Profile</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="cursor-pointer w-full flex items-center gap-3 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-all duration-200 text-sm font-medium text-red-600"
                >
                  <FaSignOutAlt className="text-base" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="mt-auto w-full border-t border-(--color-border) p-4 space-y-2">
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="block w-full px-3 py-3 rounded-lg text-center font-medium text-(--color-text) hover:bg-(--color-muted) transition-all duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                  className="block w-full px-3 py-3 rounded-lg text-center font-medium bg-linear-to-r from-(--color-primary) to-(--color-accent) text-white shadow-md hover:shadow-lg transition-all duration-200"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </aside>
      </>,
      document.body
    )
    : null;

  return (
    <>
      <nav className="sticky bg-(--color-bg) backdrop-blur-xl border-b border-(--color-border) shadow-lg top-0 left-0 w-full z-50">
        <div className="max-w-7xl mx-auto py-4 px-4 flex justify-between items-center">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-(--color-primary) to-(--color-accent) flex items-center justify-center shadow-md transform group-hover:scale-110 transition-transform duration-200">
              <FaSearch className="text-white text-sm" />
            </div>
            <span className="text-xl font-bold bg-linear-to-r from-(--color-primary) to-(--color-accent) bg-clip-text text-transparent">
              Lost & Found
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex md:gap-3 lg:gap-4 items-center">
            {token && navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              const isNotificationLink = link.to === '/notifications';
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`
                    group flex items-center gap-2 transition-all duration-200 relative px-3 py-2 rounded-lg font-medium
                    ${isActive
                      ? 'bg-linear-to-r from-(--color-primary) to-(--color-accent) text-white shadow-md'
                      : 'text-(--color-text) hover:bg-(--color-muted) hover:scale-105'
                    }
                  `}
                >
                  <span className="text-base hidden lg:inline">{link.icon}</span>
                  <span className="hidden md:inline text-sm relative">
                    {link.label}
                    {isNotificationLink && unreadCount > 0 && (
                      <span className="absolute -top-2 -right-3 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">

            {token ? (
              <>
                {/* Profile button */}
                <div className="relative hidden md:block" ref={profileRef}>
                  <button
                    onClick={handleProfileClick}
                    className={`
                      w-10 h-10 rounded-lg text-white font-bold flex items-center justify-center transition-all duration-200 shadow-md
                      ${profileOpen
                        ? 'bg-linear-to-br from-(--color-primary) to-(--color-accent) ring-4 ring-(--color-primary)/20 scale-105'
                        : 'bg-linear-to-br from-(--color-primary) to-(--color-accent) hover:scale-110 hover:shadow-lg'
                      }
                    `}
                  >
                    {user?.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={user.name}
                        className="w-full h-full rounded-lg object-cover"
                      />
                    ) : (
                      userInitial
                    )}
                  </button>

                  {profileOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setProfileOpen(false)}
                      ></div>
                      <div className="absolute right-0 mt-2 w-48 bg-(--color-bg) border border-(--color-border) rounded-xl shadow-2xl z-50 overflow-hidden">
                        <div className="p-2 bg-linear-to-r from-(--color-primary) to-(--color-accent)">
                          <p className="text-white font-semibold text-sm truncate">{user?.name || 'User'}</p>
                          <p className="text-white/80 text-xs truncate">{user?.email || ''}</p>
                        </div>
                        <div className="p-1">
                          <button
                            onClick={() => {
                              navigate('/profile');
                              setProfileOpen(false);
                            }}
                            className="w-full px-3 py-2 hover:bg-(--color-muted) rounded-lg text-sm flex items-center gap-2 text-(--color-text) transition-all duration-200"
                          >
                            <FaUser /> Profile
                          </button>
                          <button
                            onClick={handleLogout}
                            className="w-full px-3 py-2 hover:bg-red-500/10 rounded-lg text-sm flex items-center gap-2 text-red-600 transition-all duration-200 font-medium"
                          >
                            <FaSignOutAlt /> Logout
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className='hidden md:flex gap-2 items-center'>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm rounded-lg font-medium text-(--color-text) hover:bg-(--color-muted) transition-all duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm rounded-lg font-medium bg-linear-to-r from-(--color-primary) to-(--color-accent) text-white hover:shadow-lg hover:scale-105 transition-all duration-200"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Theme toggle + Notification icon (mobile) + Hamburger */}
            <ThemeToggle className="ml-2 w-8 h-8 p-1" />

            {/* Mobile Notification Icon */}
            {token && (
              <button
                onClick={() => navigate('/notifications')}
                className="md:hidden relative w-10 h-10 flex items-center justify-center rounded-lg hover:bg-(--color-muted) transition-all duration-200"
                aria-label="Notifications"
              >
                <FaBell className="w-5 h-5 text-(--color-text)" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            )}

            <button
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg hover:bg-(--color-muted) transition-all duration-200"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle Menu"
            >
              {menuOpen ? <FaTimes className="w-6 h-6 text-(--color-text)" /> : <FaBars className="w-6 h-6 text-(--color-text)" />}
            </button>
          </div>
        </div>
      </nav>

      {mobileMenu}
    </>
  );
}

export default Navbar;
