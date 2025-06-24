import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { toast } from 'react-toastify';
export const useSocket = (conversationId) => {
  const { socket, user } = useAuth();
  const [messages, setMessages] = useState([]);
  
  useEffect(() => {
    if (!socket || !user || !conversationId) return;
    socket.emit('joinConversation', conversationId);
    const handleReceiveMessage = (message) => {
      setMessages((prev) => [...prev, message]);
    };
    const handleError = (error) => {
      toast.error(`Socket error: ${error.message || 'Failed to communicate with server'}`);
    };
    socket.on('receiveMessage', handleReceiveMessage);
    socket.on('errorMessage', handleError);
    return () => {
      socket.off('receiveMessage', handleReceiveMessage);
      socket.off('errorMessage', handleError);
      socket.emit('leaveConversation', conversationId);
    };
  }, [socket, user, conversationId]);
  const sendMessage = (messageData) => {
    if (socket && messageData) {
      socket.emit('sendMessage', messageData, (response) => {
        if (response?.error) {
          toast.error(`Failed to send message: ${response.error}`);
        }
      });
    } else {
      toast.error('Cannot send message: No socket connection or invalid data');
    }
  };

  return { messages, sendMessage };
};