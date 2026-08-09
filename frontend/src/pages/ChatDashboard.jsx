import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchChats, fetchMessages, sendMessage, setSelectedChat, markMessagesAsRead } from '../features/chat/chatSlice';
import Navbar from '../components/layout/Navbar';
import socket from '../services/socket';
import { Send, Loader2, User as UserIcon, CheckCheck, ArrowLeft, Search, MessageSquare, IndianRupee } from 'lucide-react';
import { motion } from 'framer-motion';

const ChatDashboard = () => {
  const dispatch = useDispatch();
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  
  const { user } = useSelector((state) => state.auth);
  const { chats, selectedChat, messages, isLoading } = useSelector((state) => state.chat);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket.on('typing', () => setIsTyping(true));
    socket.on('stop typing', () => setIsTyping(false));

    return () => {
      socket.off('typing');
      socket.off('stop typing');
    };
  }, []);

  useEffect(() => {
    if (!selectedChat) return;
    
    dispatch(fetchMessages(selectedChat._id));
    dispatch(markMessagesAsRead(selectedChat._id));
    socket.emit('join chat', selectedChat._id);
    socket.emit('messages_read', { chat: selectedChat, readerId: user?.id || user?._id });
  }, [selectedChat, dispatch, user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!socket.connected) return;

    if (!typing) {
      setTyping(true);
      socket.emit('typing', selectedChat._id);
    }
    
    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit('stop typing', selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      socket.emit('stop typing', selectedChat._id);
      
      try {
        const action = await dispatch(sendMessage({
          content: newMessage,
          chatId: selectedChat._id
        })).unwrap();
        
        socket.emit('new message', action);
        setNewMessage('');
      } catch (error) {
        console.error('Failed to send message');
      }
    }
  };

  const getOtherUser = (users) => {
    if (!users || !users.length) return { name: 'Unknown' };
    if (users.length === 1) return users[0];
    return users[0]._id === (user?.id || user?._id) ? users[1] : users[0];
  };

  return (
    <div className="h-screen bg-slate-50 flex flex-col font-sans overflow-hidden">
      <Navbar />
      
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 h-[calc(100vh-80px)]">
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex h-full overflow-hidden">
          
          {/* Left Sidebar (Conversations) */}
          <div className={`flex-col w-full md:w-[380px] border-r border-slate-100 bg-white ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-6 border-b border-slate-100 bg-white">
              <h2 className="text-2xl font-black text-slate-900 mb-6">Messages</h2>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search chats..."
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3">
              {chats.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 px-4 text-center">
                  <MessageSquare className="h-12 w-12 mb-4 opacity-30" />
                  <p className="text-sm font-medium">No messages yet.</p>
                </div>
              ) : (
                chats.map((chat) => {
                  const otherUser = getOtherUser(chat.users);
                  const unreadCount = chat.unreadCount || 0;
                  const isSelected = selectedChat?._id === chat._id;
                  
                  return (
                    <div 
                      key={chat._id} 
                      onClick={() => dispatch(setSelectedChat(chat))}
                      className={`p-4 mb-2 rounded-2xl cursor-pointer transition-all ${isSelected ? 'bg-brand-50 shadow-sm' : 'hover:bg-slate-50'}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-sm ${isSelected ? 'bg-brand-600' : 'bg-slate-800'}`}>
                          {otherUser?.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline mb-0.5">
                            <h4 className={`text-base font-bold truncate ${unreadCount > 0 ? 'text-slate-900' : 'text-slate-700'}`}>
                              {otherUser?.name}
                            </h4>
                          </div>
                          <p className="text-xs font-semibold text-brand-600 truncate mb-1">
                            {chat.product?.title || 'Unknown Product'}
                          </p>
                          {chat.latestMessage && (
                            <p className={`text-sm truncate ${unreadCount > 0 ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>
                              {chat.latestMessage.content}
                            </p>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <div className="bg-brand-600 text-white text-xs font-bold h-6 w-6 flex items-center justify-center rounded-full ml-2 flex-shrink-0 shadow-sm">
                            {unreadCount}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Pane (Chat Window) */}
          <div className={`flex-col flex-1 bg-slate-50/50 ${!selectedChat ? 'hidden md:flex' : 'flex'}`}>
            {selectedChat ? (
              <>
                {/* Header */}
                <div className="h-20 px-6 border-b border-slate-100 bg-white flex items-center justify-between sticky top-0 z-10 shadow-sm">
                  <div className="flex items-center gap-4">
                    <button 
                      className="md:hidden p-2 -ml-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-colors"
                      onClick={() => dispatch(setSelectedChat(null))}
                    >
                      <ArrowLeft className="h-6 w-6" />
                    </button>
                    
                    <div className="h-12 w-12 bg-slate-800 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm">
                      {getOtherUser(selectedChat.users)?.name?.charAt(0)?.toUpperCase()}
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{getOtherUser(selectedChat.users)?.name}</h3>
                      <div className="flex items-center text-xs font-medium text-slate-500">
                        <span className="truncate max-w-[200px]">{selectedChat.product?.title}</span>
                        {selectedChat.product?.price && (
                          <>
                            <span className="mx-2">•</span>
                            <span className="flex items-center text-brand-600 font-bold">
                              <IndianRupee className="h-3 w-3" />
                              {selectedChat.product.price}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {isLoading ? (
                    <div className="flex justify-center items-center h-full">
                      <Loader2 className="animate-spin h-8 w-8 text-brand-600" />
                    </div>
                  ) : (
                    messages.map((m) => {
                      const isMyMessage = m?.sender?._id === (user?.id || user?._id);
                      return (
                        <div key={m._id} className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[75%] px-5 py-3 rounded-2xl shadow-sm text-base ${
                            isMyMessage 
                              ? 'bg-brand-600 text-white rounded-tr-sm' 
                              : 'bg-white border border-slate-100 text-slate-900 rounded-tl-sm'
                          }`}>
                            <p className="leading-relaxed">{m.content}</p>
                            {isMyMessage && (
                              <div className="flex justify-end mt-1">
                                <CheckCheck className={`h-4 w-4 ${m.readAt ? 'text-brand-300' : 'text-white/60'}`} />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                  {isTyping && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start"
                    >
                      <div className="bg-white border border-slate-100 px-5 py-3 rounded-2xl rounded-tl-sm text-sm text-slate-500 font-medium shadow-sm flex items-center gap-2">
                        <div className="flex gap-1">
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                        </div>
                        Typing
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} className="h-4" />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-slate-100">
                  <form onSubmit={handleSendMessage} className="flex gap-3 max-w-4xl mx-auto">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={typingHandler}
                      placeholder="Type your message..."
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-base focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:bg-white transition-all shadow-inner"
                    />
                    <button 
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="bg-brand-600 text-white h-14 w-14 rounded-2xl flex items-center justify-center hover:bg-brand-700 disabled:opacity-50 transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-md"
                    >
                      <Send className="h-6 w-6 ml-1" />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-500">
                <div className="bg-white p-6 rounded-full shadow-sm mb-6 border border-slate-100">
                  <MessageSquare className="h-12 w-12 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Your Messages</h3>
                <p className="text-slate-500 font-medium">Select a conversation to start chatting</p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default ChatDashboard;
