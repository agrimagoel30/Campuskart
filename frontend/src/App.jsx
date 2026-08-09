import { useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useUser, useAuth, useClerk } from '@clerk/clerk-react';
import Login from './pages/Login';
import Register from './pages/Register';
import Marketplace from './pages/Marketplace';
import SellItem from './pages/SellItem';
import ProductDetails from './pages/ProductDetails';
import EditProduct from './pages/EditProduct';
import ChatDashboard from './pages/ChatDashboard';
import Profile from './pages/Profile';
import Wishlist from './pages/Wishlist';
import ProtectedRoute from './components/common/ProtectedRoute';
import socket from './services/socket';
import { fetchChats, addMessageToState, updateMessageReadStatus, markMessagesAsRead } from './features/chat/chatSlice';
import { syncClerkUser, clearUser } from './features/auth/authSlice';
import { setGetToken } from './api/axiosConfig';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

// This component handles syncing the Clerk identity to the MongoDB backend
const AuthSync = () => {
  const { isSignedIn, user: clerkUser, isLoaded } = useUser();
  const { getToken } = useAuth();
  const { signOut } = useClerk();
  const dispatch = useDispatch();
  const { user: reduxUser, isError, message } = useSelector((state) => state.auth);

  useEffect(() => {
    setGetToken(() => getToken());
  }, [getToken]);

  useEffect(() => {
    const syncUserWithBackend = async () => {
      if (isSignedIn && clerkUser && !reduxUser) {
        const primaryEmail = clerkUser.primaryEmailAddress?.emailAddress;
        
        try {
          await dispatch(syncClerkUser({
            email: primaryEmail,
            firstName: clerkUser.firstName,
            lastName: clerkUser.lastName,
            getToken: () => getToken()
          })).unwrap();
        } catch (error) {
          // If sync fails (e.g. non-NITS email returns 403)
          toast.error(error || "Authentication failed. Make sure you use your NITS email.");
          signOut();
          dispatch(clearUser());
        }
      } else if (!isSignedIn && reduxUser) {
        // Logged out of Clerk, clear redux
        dispatch(clearUser());
      }
    };

    syncUserWithBackend();
  }, [isSignedIn, clerkUser, reduxUser, dispatch, getToken, signOut]);

  // Optionally block rendering if loading
  if (!isLoaded) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin h-10 w-10 text-brand-600" />
      </div>
    );
  }

  return null;
};

function App() {
  const { user } = useSelector((state) => state.auth);
  const { selectedChat } = useSelector((state) => state.chat);
  const dispatch = useDispatch();

  const selectedChatRef = useRef(selectedChat);
  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    if (user) {
      socket.connect();
      socket.emit('setup', user);

      dispatch(fetchChats());

      const messageHandler = (newMessageRecieved) => {
        const currentSelectedChat = selectedChatRef.current;
        if (!currentSelectedChat || currentSelectedChat._id !== newMessageRecieved.chat._id) {
          dispatch(addMessageToState(newMessageRecieved));
        } else {
          dispatch(addMessageToState(newMessageRecieved));
          dispatch(markMessagesAsRead(currentSelectedChat._id));
          socket.emit('messages_read', { chat: currentSelectedChat, readerId: user?.id || user?._id });
        }
      };

      const readHandler = (data) => {
        dispatch(updateMessageReadStatus(data));
      };

      socket.on('message recieved', messageHandler);
      socket.on('messages_read', readHandler);

      return () => {
        socket.off('message recieved', messageHandler);
        socket.off('messages_read', readHandler);
        socket.disconnect();
      };
    }
  }, [user, dispatch]);

  return (
    <Router>
      <AuthSync />
      <Routes>
        <Route path="/login/*" element={user ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/register/*" element={user ? <Navigate to="/" replace /> : <Register />} />
        
        <Route path="/" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
        <Route path="/sell" element={<ProtectedRoute><SellItem /></ProtectedRoute>} />
        <Route path="/products/:id" element={<ProtectedRoute><ProductDetails /></ProtectedRoute>} />
        <Route path="/products/:id/edit" element={<ProtectedRoute><EditProduct /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><ChatDashboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
