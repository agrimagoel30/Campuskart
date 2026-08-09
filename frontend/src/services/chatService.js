import api from '../api/axiosConfig';

// Access or create chat
const accessChat = async (chatData) => {
  const response = await api.post('/chats', chatData);
  return response.data;
};

// Fetch all chats
const fetchChats = async () => {
  const response = await api.get('/chats');
  return response.data;
};

// Send message
const sendMessage = async (messageData) => {
  const response = await api.post('/chats/message', messageData);
  return response.data;
};

// Fetch all messages for a chat
const fetchMessages = async (chatId) => {
  const response = await api.get(`/chats/${chatId}/messages`);
  return response.data;
};

// Mark messages as read
const markAsRead = async (chatId) => {
  const response = await api.put(`/chats/${chatId}/read`);
  return response.data;
};

const chatService = {
  accessChat,
  fetchChats,
  sendMessage,
  fetchMessages,
  markAsRead,
};

export default chatService;
