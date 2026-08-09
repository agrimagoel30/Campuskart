const dotenv = require('dotenv');

// Handle uncaught exceptions (bugs in synchronous code)
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

// Load env vars first before importing app
dotenv.config({ path: './.env' });

console.log('CLERK_SECRET_KEY starts with:', process.env.CLERK_SECRET_KEY ? process.env.CLERK_SECRET_KEY.substring(0, 7) : 'UNDEFINED');

const app = require('./app');
const connectDB = require('./config/db');

// Connect to Database
connectDB();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

const io = require('socket.io')(server, {
  pingTimeout: 60000, // Wait 60s before closing connection to save bandwidth
  cors: {
    origin: process.env.FRONTEND_URL,
  },
});

io.on('connection', (socket) => {
  console.log('Connected to socket.io');

  // User logs in and connects to their personal room (their ID)
  socket.on('setup', (userData) => {
    socket.join(userData._id);
    socket.emit('connected');
  });

  // User clicks on a specific chat and joins that chat room
  socket.on('join chat', (room) => {
    socket.join(room);
    console.log('User Joined Room: ' + room);
  });

  // Typing Indicators
  socket.on('typing', (room) => socket.in(room).emit('typing'));
  socket.on('stop typing', (room) => socket.in(room).emit('stop typing'));

  // Sending a message
  socket.on('new message', (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;

    if (!chat.users) return console.log('chat.users not defined');

    chat.users.forEach((user) => {
      // If I sent the message, don't send it back to me
      if (user._id == newMessageRecieved.sender._id) return;

      // Emit to the other user's personal room
      socket.in(user._id).emit('message recieved', newMessageRecieved);
    });
  });

  // Handle real-time read receipts
  socket.on('messages_read', ({ chat, readerId }) => {
    if (!chat || !chat.users) return;

    chat.users.forEach((user) => {
      // Notify the OTHER user that their messages were read
      if (user._id == readerId) return;
      socket.in(user._id).emit('messages_read', { chatId: chat._id, readerId });
    });
  });

  socket.on('disconnect', () => {
    console.log('USER DISCONNECTED');
  });
});

// Handle unhandled promise rejections (e.g. failing to connect to DB after starting)
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  // Give server time to finish pending requests before exiting
  server.close(() => {
    process.exit(1);
  });
});
