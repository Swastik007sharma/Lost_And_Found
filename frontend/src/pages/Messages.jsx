import { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { getMessagesInConversation, sendMessageInConversation, markMessagesAsRead } from '../services/messageService';
import Loader from '../components/common/Loader';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import {
  FiSend,
  FiUser,
  FiArrowLeft,
  FiMessageCircle,
  FiInbox
} from 'react-icons/fi';

function Messages() {
  const { user, socket } = useContext(AuthContext);
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState({ content: '' });
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Scroll to bottom function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch messages function
  const fetchMessages = async () => {
    if (!conversationId) {
      setError('No conversation ID provided');
      return;
    }
    setLoading(true);
    try {
      const response = await getMessagesInConversation(conversationId, { page: 1, limit: 50 });
      setMessages(response.data.messages || []);
      setError('');
    } catch (err) {
      setError('Failed to load messages: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle incoming messages via the shared socket
  useEffect(() => {
    if (!socket || !conversationId) return;

    const handleReceiveMessage = (message) => {
      if (message.conversation === conversationId) {
        setMessages((prev) => {
          if (prev.some((msg) => msg._id === message._id)) return prev;
          return [...prev, message]; // Add to end, not beginning
        });
        setError(''); // Clear error on successful receive

        // Mark messages as read immediately when they arrive
        markMessagesAsRead(conversationId)
          .then(() => console.log('New message marked as read automatically'))
          .catch(err => console.error('Failed to auto-mark message as read:', err));
      }
    };

    const handleErrorMessage = (errorMsg) => {
      console.error('Message error:', errorMsg);
      // Only set error if the last sent message isn’t received
      const lastSent = messages.find((msg) => msg._id === socket.lastMessageId);
      if (!lastSent) {
        setError(errorMsg || 'Failed to send message');
      }
    };

    socket.on('receiveMessage', handleReceiveMessage);
    socket.on('errorMessage', handleErrorMessage);

    socket.emit('joinConversation', conversationId);

    return () => {
      socket.off('receiveMessage', handleReceiveMessage);
      socket.off('errorMessage', handleErrorMessage);
    };
  }, [socket, conversationId]);

  // Initial fetch and navigation logic
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!conversationId) {
      navigate('/conversations');
      return;
    }
    fetchMessages();

    // Mark messages as read when conversation is opened
    const markAsRead = async () => {
      try {
        await markMessagesAsRead(conversationId);
        console.log('Messages marked as read');
      } catch (err) {
        console.error('Failed to mark messages as read:', err);
      }
    };
    markAsRead();

    // No periodic check needed - we'll rely on other mechanisms
    // (on open, on receive, on focus, on visibility change)
  }, [user, conversationId, navigate]);

  // Mark messages as read when window gains focus or becomes visible
  useEffect(() => {
    if (!conversationId) return;

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        try {
          await markMessagesAsRead(conversationId);
          console.log('Messages marked as read (tab visible)');
        } catch (err) {
          console.error('Failed to mark messages as read on visibility change:', err);
        }
      }
    };

    const handleFocus = async () => {
      try {
        await markMessagesAsRead(conversationId);
        console.log('Messages marked as read (window focused)');
      } catch (err) {
        console.error('Failed to mark messages as read on focus:', err);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [conversationId]);

  // Scroll to bottom when messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewMessage((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.content.trim() || !conversationId || !user?.id || !socket) return;

    setSending(true);
    setError('');

    const tempMessageId = Date.now().toString();
    const tempMessage = {
      _id: tempMessageId,
      conversation: conversationId,
      sender: { _id: user.id, name: user.name || 'You' },
      content: newMessage.content,
      createdAt: new Date().toISOString(),
      isRead: false,
      isActive: true,
    };

    setMessages((prev) => [...prev, tempMessage]); // Add to end
    setNewMessage({ content: '' });
    socket.lastMessageId = tempMessageId; // Track last sent message

    try {
      const response = await sendMessageInConversation(conversationId, {
        sender: user.id,
        content: tempMessage.content,
      });

      socket.emit('sendMessage', {
        conversationId,
        senderId: user.id,
        content: tempMessage.content,
        _id: response.data.message._id,
        createdAt: response.data.message.createdAt,
      });

      await fetchMessages();
    } catch (err) {
      setError('Failed to send message: ' + err.message);
      setMessages((prev) => prev.filter((msg) => msg._id !== tempMessageId));
    } finally {
      setSending(false);
    }
  };

  const getSenderInitial = (sender) =>
    sender?.name?.charAt(0).toUpperCase() || '?';

  const formatMessageTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatMessageDate = (date) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: messageDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
      });
    }
  };

  if (!user) return <Loader />;

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`sticky top-0 z-10 border-b ${theme === 'dark'
          ? 'bg-gray-800 border-gray-700'
          : 'bg-white border-gray-200'
          } shadow-sm`}
      >
        <div className="container mx-auto px-4 py-4 max-w-5xl">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/conversations')}
              className={`p-2 rounded-lg transition-colors ${theme === 'dark'
                ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
            >
              <FiArrowLeft className="text-xl" />
            </button>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-blue-600/20' : 'bg-blue-100'
              }`}>
              <FiMessageCircle className={`text-lg ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                }`} />
            </div>
            <div>
              <h1 className={`text-lg sm:text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                Conversation
              </h1>
              <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                {messages.length} message{messages.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="container mx-auto px-4 pt-4 max-w-5xl"
          >
            <div className={`p-4 rounded-xl shadow-lg ${theme === 'dark'
              ? 'bg-red-500/20 border border-red-500/30 text-red-400'
              : 'bg-red-50 border border-red-200 text-red-700'
              }`}>
              <div className="flex items-center gap-2">
                <span className="text-lg">⚠️</span>
                <span className="font-medium text-sm">{error}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages Container */}
      <div className="flex-1 overflow-hidden">
        <div className="container mx-auto px-4 py-4 max-w-5xl h-full">
          <div
            ref={messagesContainerRef}
            className={`h-[calc(100vh-280px)] overflow-y-auto rounded-xl p-4 ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-white'
              } shadow-inner`}
          >
            {loading && messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <Loader size="lg" variant="dots" text="Loading messages..." />
              </div>
            ) : messages.length > 0 ? (
              <div className="space-y-4">
                {messages.map((msg, index) => {
                  const isCurrentUser = msg.sender?._id === user.id;
                  const showDate = index === 0 ||
                    formatMessageDate(messages[index].createdAt) !==
                    formatMessageDate(messages[index - 1]?.createdAt);

                  return (
                    <div key={msg._id}>
                      {/* Date Separator */}
                      {showDate && (
                        <div className="flex items-center justify-center my-6">
                          <div className={`px-4 py-1 rounded-full text-xs font-medium ${theme === 'dark'
                            ? 'bg-gray-700 text-gray-400'
                            : 'bg-gray-100 text-gray-600'
                            }`}>
                            {formatMessageDate(msg.createdAt)}
                          </div>
                        </div>
                      )}

                      {/* Message */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex gap-2 max-w-[75%] sm:max-w-[65%] ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'
                          }`}>
                          {/* Avatar */}
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isCurrentUser
                            ? theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500'
                            : theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'
                            }`}>
                            <span className="text-white text-sm font-semibold">{getSenderInitial(msg.sender)}</span>
                          </div>

                          {/* Message Bubble */}
                          <div>
                            <div
                              className={`rounded-2xl px-4 py-2 shadow-md ${isCurrentUser
                                ? theme === 'dark'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-blue-500 text-white'
                                : theme === 'dark'
                                  ? 'bg-gray-700 text-gray-100'
                                  : 'bg-gray-100 text-gray-900'
                                } ${isCurrentUser ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}
                            >
                              {!isCurrentUser && (
                                <p className={`text-xs font-semibold mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                  }`}>
                                  {msg.sender?.name || 'Unknown'}
                                </p>
                              )}
                              <p className="text-sm break-words">{msg.content || 'No content'}</p>
                            </div>
                            <p className={`text-xs mt-1 ${isCurrentUser ? 'text-right' : 'text-left'
                              } ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                              {formatMessageTime(msg.createdAt)}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            ) : (
              /* Empty State */
              <div className="flex flex-col items-center justify-center h-full">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                  }`}>
                  <FiInbox className={`text-4xl ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
                    }`} />
                </div>
                <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                  No Messages Yet
                </h3>
                <p className={`text-sm text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                  Start the conversation by sending a message below
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Input Form */}
      <div className={`border-t ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } shadow-lg`}>
        <div className="container mx-auto px-4 py-4 max-w-5xl">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <textarea
              name="content"
              value={newMessage.content}
              onChange={handleChange}
              placeholder="Type your message..."
              rows="1"
              disabled={sending}
              className={`flex-1 px-4 py-3 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${theme === 'dark'
                ? 'bg-gray-700 text-white placeholder-gray-400'
                : 'bg-gray-100 text-gray-900 placeholder-gray-500'
                } ${sending ? 'opacity-50 cursor-not-allowed' : ''}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <button
              type="submit"
              disabled={sending || !newMessage.content.trim()}
              className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${sending || !newMessage.content.trim()
                ? theme === 'dark'
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : theme === 'dark'
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                  : 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg hover:shadow-xl'
                }`}
            >
              {sending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="hidden sm:inline">Sending...</span>
                </>
              ) : (
                <>
                  <FiSend className="text-lg" />
                  <span className="hidden sm:inline">Send</span>
                </>
              )}
            </button>
          </form>
          <p className={`text-xs mt-2 text-center ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
            }`}>
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}

export default Messages;