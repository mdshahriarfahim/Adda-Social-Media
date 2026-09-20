const User = require('../models/User');

// Keeps track of which socket belongs to which user (in-memory — fine for a single instance;
// for multi-instance scaling swap this for a Redis adapter)
const onlineUsers = new Map();

const initSocket = (io) => {
  io.on('connection', (socket) => {
    // Client emits this right after connecting, with their user id
    socket.on('identify', async (userId) => {
      if (!userId) return;
      onlineUsers.set(String(userId), socket.id);
      socket.userId = String(userId);

      await User.findByIdAndUpdate(userId, { isOnline: true, lastSeen: new Date() });
      io.emit('userOnline', userId);
    });

    // Typing indicator
    socket.on('typing', ({ to }) => {
      const targetSocketId = onlineUsers.get(String(to));
      if (targetSocketId) {
        io.to(targetSocketId).emit('userTyping', { from: socket.userId });
      }
    });

    socket.on('stopTyping', ({ to }) => {
      const targetSocketId = onlineUsers.get(String(to));
      if (targetSocketId) {
        io.to(targetSocketId).emit('userStopTyping', { from: socket.userId });
      }
    });

    socket.on('disconnect', async () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        await User.findByIdAndUpdate(socket.userId, { isOnline: false, lastSeen: new Date() });
        io.emit('userOffline', socket.userId);
      }
    });
  });

  return onlineUsers;
};

module.exports = { initSocket, onlineUsers };