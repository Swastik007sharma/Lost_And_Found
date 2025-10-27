import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getMyConversations } from '../services/conversationService';
import Loader from '../components/common/Loader';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import {
  FiMessageSquare,
  FiUser,
  FiClock,
  FiPackage,
  FiChevronRight,
  FiInbox
} from 'react-icons/fi';

function Conversations() {
  const { user } = useContext(AuthContext);
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch conversations function
  const fetchConversations = async () => {
    setLoading(true);
    try {
      const response = await getMyConversations();
      const convs = response.data.conversations.docs || [];

      setConversations(convs);
      setError('');
    } catch (err) {
      setError('Failed to load conversations: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchConversations();
  }, [user, navigate]);

  // Refresh conversations when window/tab comes back into focus
  useEffect(() => {
    const handleFocus = () => {
      fetchConversations();
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Also refresh when component becomes visible again (navigation back)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchConversations();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Format date for better readability
  const formatDate = (date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInHours = Math.floor((now - messageDate) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - messageDate) / (1000 * 60));
      return diffInMinutes < 1 ? 'Just now' : `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'lost':
        return theme === 'dark' ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700';
      case 'found':
        return theme === 'dark' ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700';
      default:
        return theme === 'dark' ? 'bg-gray-500/20 text-gray-400' : 'bg-gray-100 text-gray-700';
    }
  };

  if (!user) return <Loader />;

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 sm:mb-8"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${theme === 'dark' ? 'bg-blue-600/20' : 'bg-blue-100'
                }`}>
                <FiMessageSquare className={`text-2xl ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                  }`} />
              </div>
              <h1 className={`text-3xl sm:text-4xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                Conversations
              </h1>
            </div>
            {/* Refresh Button */}
            <button
              onClick={() => {
                fetchConversations();
              }}
              disabled={loading}
              className={`p-2 rounded-lg transition-all duration-200 ${loading
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-blue-100 dark:hover:bg-blue-900/20'
                } ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}
              title="Refresh conversations"
            >
              <FiMessageSquare className={`text-xl ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <p className={`text-sm sm:text-base ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
            Manage your conversations about lost and found items
          </p>
        </motion.div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mb-6 p-4 rounded-xl shadow-lg ${theme === 'dark'
                ? 'bg-red-500/20 border border-red-500/30 text-red-400'
                : 'bg-red-50 border border-red-200 text-red-700'
                }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">⚠️</span>
                <span className="font-medium">{error}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading State */}
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <Loader size="lg" variant="dots" text="Loading conversations..." />
          </motion.div>
        ) : conversations.length > 0 ? (
          /* Conversations List */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-3 sm:space-y-4"
          >
            {conversations.map((conv, index) => (
              <motion.div
                key={conv._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  to={`/messages/${conv._id}`}
                  className={`block p-4 sm:p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border ${theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 hover:border-blue-500/50'
                    : 'bg-white border-gray-200 hover:border-blue-400'
                    }`}
                >
                  {/* Main Content */}
                  <div className="flex items-start gap-4">
                    {/* Avatar with Unread Indicator */}
                    <div className="relative flex-shrink-0">
                      <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center ${theme === 'dark' ? 'bg-blue-600/20' : 'bg-blue-100'
                        }`}>
                        <FiUser className={`text-xl sm:text-2xl ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                          }`} />
                      </div>
                      {/* Unread Indicator - Show if lastMessage exists, is not read, and sender is not current user */}
                      {conv.lastMessage &&
                        !conv.lastMessage.isRead &&
                        conv.lastMessage.sender &&
                        user?.id &&
                        String(conv.lastMessage.sender) !== String(user.id) && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-gray-800 animate-pulse"></span>
                        )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* User Name */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <h3 className={`font-semibold text-base sm:text-lg truncate ${conv.lastMessage &&
                            !conv.lastMessage.isRead &&
                            conv.lastMessage.sender &&
                            user?.id &&
                            String(conv.lastMessage.sender) !== String(user.id)
                            ? theme === 'dark' ? 'text-white' : 'text-gray-900'
                            : theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                            {conv.participants[1]?.name || 'Unknown User'}
                          </h3>
                          {/* Unread Badge */}
                          {conv.lastMessage &&
                            !conv.lastMessage.isRead &&
                            conv.lastMessage.sender &&
                            user?.id &&
                            String(conv.lastMessage.sender) !== String(user.id) && (
                              <span className="flex-shrink-0 px-2 py-0.5 text-xs font-bold text-white bg-red-500 rounded-full">
                                NEW
                              </span>
                            )}
                        </div>
                        <FiChevronRight className={`flex-shrink-0 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
                          }`} />
                      </div>

                      {/* Item Info */}
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <FiPackage className={`flex-shrink-0 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                          }`} />
                        <span className={`text-sm font-medium truncate ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                          {conv.item?.title || 'Untitled Item'}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(conv.item?.status)
                          }`}>
                          {conv.item?.status || 'Unknown'}
                        </span>
                      </div>

                      {/* Last Update Time */}
                      <div className="flex items-center gap-2">
                        <FiClock className={`text-xs ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
                          }`} />
                        <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                          }`}>
                          {formatDate(conv.updatedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className={`text-center py-16 sm:py-20 rounded-2xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              }`}
          >
            <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
              <FiInbox className={`text-4xl sm:text-5xl ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
                }`} />
            </div>
            <h3 className={`text-xl sm:text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
              No Conversations Yet
            </h3>
            <p className={`text-sm sm:text-base max-w-md mx-auto ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
              When you start a conversation about a lost or found item, it will appear here.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default Conversations;