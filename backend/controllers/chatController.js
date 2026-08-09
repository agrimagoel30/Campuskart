const Chat = require('../models/chatModel');
const Message = require('../models/messageModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

// @desc    Access or Create Chat (between logged in user and target user for a product)
// @route   POST /api/v1/chats
// @access  Private
exports.accessChat = catchAsync(async (req, res, next) => {
  const { userId, productId } = req.body;

  if (!userId || !productId) {
    return next(new AppError('User ID and Product ID are required', 400));
  }

  // Check if a chat exists with these two users for this product
  let isChat = await Chat.find({
    product: productId,
    $and: [
      { users: { $elemMatch: { $eq: req.user.id } } },
      { users: { $elemMatch: { $eq: userId } } }
    ]
  }).populate('users', '-password')
    .populate('product')
    .populate({
      path: 'latestMessage',
      populate: { path: 'sender', select: 'name email' }
    });

  if (isChat.length > 0) {
    res.status(200).json(isChat[0]);
  } else {
    // Create new chat
    var chatData = {
      product: productId,
      users: [req.user.id, userId]
    };

    const createdChat = await Chat.create(chatData);
    const fullChat = await Chat.findOne({ _id: createdChat._id })
      .populate('users', '-password')
      .populate('product');

    res.status(200).json(fullChat);
  }
});

// @desc    Fetch all chats for a user
// @route   GET /api/v1/chats
// @access  Private
exports.fetchChats = catchAsync(async (req, res, next) => {
  let results = await Chat.find({ users: { $elemMatch: { $eq: req.user.id } } })
    .populate('users', '-password')
    .populate('product')
    .populate({
      path: 'latestMessage',
      populate: { path: 'sender', select: 'name email' }
    })
    .sort({ updatedAt: -1 });

  results = await Promise.all(results.map(async (chat) => {
    const unreadCount = await Message.countDocuments({
      chat: chat._id,
      sender: { $ne: req.user.id },
      readAt: null
    });
    return { ...chat.toObject(), unreadCount };
  }));

  res.status(200).json(results);
});

// @desc    Send new message
// @route   POST /api/v1/chats/message
// @access  Private
exports.sendMessage = catchAsync(async (req, res, next) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    return next(new AppError('Invalid data passed into request', 400));
  }

  var newMessage = {
    sender: req.user.id,
    content: content,
    chat: chatId
  };

  let message = await Message.create(newMessage);

  // Populate references
  message = await message.populate('sender', 'name email');
  message = await message.populate('chat');
  message = await message.populate({
    path: 'chat.users',
    select: 'name email'
  });

  await Chat.findByIdAndUpdate(req.body.chatId, {
    latestMessage: message
  });

  res.status(200).json(message);
});

// @desc    Fetch all messages for a chat
// @route   GET /api/v1/chats/:chatId/messages
// @access  Private
exports.fetchMessages = catchAsync(async (req, res, next) => {
  const messages = await Message.find({ chat: req.params.chatId })
    .populate('sender', 'name email')
    .populate('chat');

  res.status(200).json(messages);
});

// @desc    Mark all messages in a chat as read
// @route   PUT /api/v1/chats/:chatId/read
// @access  Private
exports.markAsRead = catchAsync(async (req, res, next) => {
  const { chatId } = req.params;

  await Message.updateMany(
    { 
      chat: chatId,
      sender: { $ne: req.user.id },
      readAt: null
    },
    {
      $set: { readAt: new Date() }
    }
  );

  res.status(200).json({ success: true });
});
