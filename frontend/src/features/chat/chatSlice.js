import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import chatService from '../../services/chatService';

const initialState = {
  chats: [],
  selectedChat: null,
  messages: [],
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

export const accessChat = createAsyncThunk('chat/accessChat', async (chatData, thunkAPI) => {
  try {
    return await chatService.accessChat(chatData);
  } catch (error) {
    const message = (error.response?.data?.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const fetchChats = createAsyncThunk('chat/fetchChats', async (_, thunkAPI) => {
  try {
    return await chatService.fetchChats();
  } catch (error) {
    const message = (error.response?.data?.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const sendMessage = createAsyncThunk('chat/sendMessage', async (messageData, thunkAPI) => {
  try {
    return await chatService.sendMessage(messageData);
  } catch (error) {
    const message = (error.response?.data?.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const fetchMessages = createAsyncThunk('chat/fetchMessages', async (chatId, thunkAPI) => {
  try {
    return await chatService.fetchMessages(chatId);
  } catch (error) {
    const message = (error.response?.data?.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const markMessagesAsRead = createAsyncThunk('chat/markMessagesAsRead', async (chatId, thunkAPI) => {
  try {
    await chatService.markAsRead(chatId);
    return chatId; // Return chatId to update state
  } catch (error) {
    const message = (error.response?.data?.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    resetChatState: (state) => {
      state.isError = false;
      state.isSuccess = false;
      state.isLoading = false;
      state.message = '';
    },
    setSelectedChat: (state, action) => {
      state.selectedChat = action.payload;
    },
    addMessageToState: (state, action) => {
      // Used by Socket.IO to append a message without re-fetching
      const message = action.payload;
      
      // If the message is for the currently open chat, append it to messages
      if (state.selectedChat && state.selectedChat._id === message.chat._id) {
        state.messages.push(message);
      }
      
      // Also update latestMessage in chats array
      const chatIndex = state.chats.findIndex(c => c._id === message.chat._id);
      if (chatIndex !== -1) {
        state.chats[chatIndex].latestMessage = message;
        // If chat is NOT selected, increment its unread count
        if (!state.selectedChat || state.selectedChat._id !== message.chat._id) {
          state.chats[chatIndex].unreadCount = (state.chats[chatIndex].unreadCount || 0) + 1;
        }
        // Move chat to top
        const chat = state.chats.splice(chatIndex, 1)[0];
        state.chats.unshift(chat);
      }
    },
    updateMessageReadStatus: (state, action) => {
      // Triggered when the OTHER user reads our messages
      const { chatId } = action.payload;
      
      // Update read status for messages currently rendered
      if (state.selectedChat && state.selectedChat._id === chatId) {
        state.messages = state.messages.map(m => 
          (!m.readAt) ? { ...m, readAt: new Date() } : m
        );
      }
      
      // Update latestMessage read status
      const chatIndex = state.chats.findIndex(c => c._id === chatId);
      if (chatIndex !== -1 && state.chats[chatIndex].latestMessage && !state.chats[chatIndex].latestMessage.readAt) {
        state.chats[chatIndex].latestMessage.readAt = new Date();
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Access Chat
      .addCase(accessChat.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(accessChat.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.selectedChat = action.payload;
        if (!state.chats.find((c) => c._id === action.payload._id)) {
          state.chats.unshift(action.payload);
        }
      })
      .addCase(accessChat.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Fetch Chats
      .addCase(fetchChats.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchChats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.chats = action.payload;
      })
      .addCase(fetchChats.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Send Message
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.messages.push(action.payload);
        
        // Update latestMessage in chats array
        const chatIndex = state.chats.findIndex(c => c._id === action.payload.chat._id);
        if (chatIndex !== -1) {
          state.chats[chatIndex].latestMessage = action.payload;
          const chat = state.chats.splice(chatIndex, 1)[0];
          state.chats.unshift(chat);
        }
      })
      // Fetch Messages
      .addCase(fetchMessages.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages = action.payload;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(markMessagesAsRead.fulfilled, (state, action) => {
        const chatId = action.payload;
        const chatIndex = state.chats.findIndex(c => c._id === chatId);
        if (chatIndex !== -1) {
          state.chats[chatIndex].unreadCount = 0;
        }
      });
  },
});

export const { resetChatState, setSelectedChat, addMessageToState, updateMessageReadStatus } = chatSlice.actions;
export default chatSlice.reducer;
