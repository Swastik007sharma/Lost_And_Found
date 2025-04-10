import { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { getMessagesInConversation, sendMessageInConversation } from '../services/messageService';
import Loader from '../components/common/Loader';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

function Messages() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState({ content: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

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
      const response = await getMessagesInConversation(conversationId, { page: 1, limit: 10 });
      setMessages(response.data.messages || []);
      setError('');
    } catch (err) {
      setError('Failed to load messages: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

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
  }, [user, conversationId, navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewMessage((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.content.trim() || !conversationId || !user?.id) return;

    setLoading(true);
    setError('');

    const tempMessage = {
      _id: Date.now().toString(),
      conversation: conversationId,
      sender: { _id: user.id, name: user.name || 'You' },
      content: newMessage.content,
      createdAt: new Date().toISOString(),
      isRead: false,
      isActive: true,
    };

    // Optimistic UI update
    setMessages((prev) => [tempMessage, ...prev]);
    setNewMessage({ content: '' });

    try {
      await sendMessageInConversation(conversationId, {
        sender: user.id,
        content: tempMessage.content,
      });
      // Fetch updated messages after sending
      await fetchMessages();
    } catch (err) {
      setError('Failed to send message: ' + err.message);
      setMessages((prev) => prev.filter((msg) => msg._id !== tempMessage._id));
    } finally {
      setLoading(false);
    }
  };

  const getSenderInitial = (sender) => 
    sender?.name?.charAt(0).toUpperCase() || '?';

  if (!user) return <Loader />;

  return (
    <div className="container mx-auto p-4 sm:p-6 bg-gray-50 min-h-screen flex flex-col">
      <div className="max-w-3xl mx-auto flex-1 w-full">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Messages</h1>
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md shadow-md">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="mb-6 bg-white p-6 rounded-lg shadow-lg">
          <Input
            label="Message"
            name="content"
            value={newMessage.content}
            onChange={handleChange}
            as="textarea"
            rows="4"
            required
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <Button
            type="submit"
            disabled={loading || !newMessage.content.trim()}
            className={`w-full mt-4 bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 
              disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200`}
          >
            {loading ? 'Sending...' : 'Send Message'}
          </Button>
        </form>
        <div className="flex-1 overflow-y-auto max-h-[calc(100vh-300px)] bg-white p-4 rounded-lg shadow-lg">
          {loading && messages.length === 0 ? (
            <Loader className="text-blue-600" />
          ) : messages.length > 0 ? (
            <div className="space-y-4">
              {messages.map((msg) => {
                const isCurrentUser = msg.sender?._id === user.id;
                return (
                  <div
                    key={msg._id}
                    className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-lg shadow-md ${
                        isCurrentUser ? 'bg-blue-100 text-blue-900' : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <div className="flex items-center mb-1">
                        <span className="w-8 h-8 bg-gray-300 text-white rounded-full flex items-center justify-center mr-2">
                          {getSenderInitial(msg.sender)}
                        </span>
                        <p className="text-sm font-medium">
                          {msg.sender?.name || 'Unknown Sender'}
                        </p>
                      </div>
                      <p className="text-sm mt-1">{msg.content || 'No content'}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(msg.createdAt).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true,
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <p className="text-gray-600 text-lg text-center py-10">No messages found.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Messages;