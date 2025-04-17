import { createContext, useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import io from 'socket.io-client';
import { toast } from 'react-toastify';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]); // Local notification state
  const socketRef = useRef(null);

  useEffect(() => {
    console.log('Initializing auth state');
    setLoading(false); // Set loading to false after initial state setup
  }, []);

  useEffect(() => {
    if (import.meta.env.DEV) console.log('Token updated:', token);
    try {
      if (token) {
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Failed to sync token with localStorage:', error);
      toast.error('Failed to sync token with storage.');
    }
  }, [token]);

  useEffect(() => {
    if (import.meta.env.DEV) console.log('User state changed:', user);
    try {
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        localStorage.removeItem('user');
      }
    } catch (error) {
      console.error('Failed to sync user with localStorage:', error);
      toast.error('Failed to sync user with storage.');
    }

    // Initialize or update Socket.IO connection when user changes
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    if (user && user.id) {
      // Determine backend URL based on environment
      const isProduction = !import.meta.env.DEV;
      const baseUrl = import.meta.env.VITE_REACT_APP_BACKEND_URL || 'http://localhost:5000';
      const backendUrl = isProduction
        ? baseUrl.replace(/^http:/, 'https:') // Ensure HTTPS in production
        : baseUrl;
      console.log('Initializing Socket.IO connection to:', backendUrl);

      socketRef.current = io(backendUrl, {
        path: '/socket.io',
        query: { userId: user.id },
        transports: ['websocket'],
        upgrade: true,
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 15000,
        forceNew: true,
      });

      socketRef.current.on('connect', () => {
        console.log('Socket connected:', socketRef.current.id);
        socketRef.current.emit('joinUserRoom', user.id);
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('Connection error:', error.message, 'Code:', error.code || 'N/A');
        toast.error(`WebSocket connection error: ${error.message || 'Unable to connect to server'}. Retrying...`, {
          autoClose: 5000,
        });
      });

      socketRef.current.on('disconnect', (reason) => {
        console.log('Disconnected due to:', reason);
        if (reason === 'io server disconnect') {
          toast.warn('Server disconnected. Attempting to reconnect...', {
            autoClose: 5000,
          });
        }
      });

      socketRef.current.on('newNotification', (notification) => {
        const notifId = Date.now();
        const notifType = notification.type || 'info';
        const message = notification.message || 'New notification received';
        setNotifications((prev) => [...prev, { id: notifId, message, type: notifType }]);
        toast[notifType === 'error' ? 'error' : 'info'](message, {
          autoClose: 5000,
          onClose: () => removeNotification(notifId),
        });
      });

      socketRef.current.on('receiveMessage', (message) => {
        console.log('Received message:', message);
      });

      socketRef.current.on('errorMessage', (errorMsg) => {
        console.error('Socket error message:', errorMsg);
        const notifId = Date.now();
        setNotifications((prev) => [...prev, { id: notifId, message: errorMsg || 'An error occurred', type: 'error' }]);
        toast.error(errorMsg || 'An error occurred', {
          autoClose: 5000,
          onClose: () => removeNotification(notifId),
        });
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      setNotifications([]); // Clear notifications on disconnect
    };
  }, [user]);

  const login = (newToken, userData) => {
    if (import.meta.env.DEV) console.log('Logging in with token:', newToken, 'and userData:', userData);
    setToken(newToken);
    setUser(userData);
    toast.success('Logged in successfully!');
    try {
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Failed to save login data to localStorage:', error);
      toast.error('Failed to save login data.');
    }
  };

  const logout = () => {
    if (import.meta.env.DEV) console.log('Logging out');
    setToken(null);
    setUser(null);
    toast.info('Logged out successfully!');
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Failed to clear localStorage on logout:', error);
      toast.error('Failed to clear login data.');
    }
  };

  const addNotification = (message, type = 'info') => {
    if (import.meta.env.DEV) console.log('Adding notification:', { message, type });
    const notifId = Date.now();
    setNotifications((prev) => [...prev, { id: notifId, message, type }]);
    toast[type === 'error' ? 'error' : type === 'success' ? 'success' : 'info'](message, {
      autoClose: 5000,
      onClose: () => removeNotification(notifId),
    });
  };

  const removeNotification = (id) => {
    if (import.meta.env.DEV) console.log('Removing notification with id:', id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const value = {
    user,
    token,
    login,
    logout,
    loading,
    socket: socketRef.current,
    notifications,
    addNotification,
    removeNotification,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthContext;