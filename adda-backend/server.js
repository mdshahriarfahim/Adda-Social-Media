require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { Server } = require('socket.io');

const { connectDB } = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { initSocket } = require('./sockets/socket');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');
const messageRoutes = require('./routes/messageRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || '*', credentials: true },
});

// ---------- Middleware ----------
app.use(helmet({ crossOriginResourcePolicy: false })); // allow media streaming
app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

// Basic rate limiting to protect auth endpoints from brute force
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api/auth', authLimiter);

// ---------- Routes ----------
app.get('/', (req, res) => {
  res.json({ success: true, message: '🚀 Adda (আড্ডা) API is running — everything lives in MongoDB' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);

app.use(notFound);
app.use(errorHandler);

// ---------- Boot ----------
const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();

  const onlineUsers = initSocket(io);
  app.set('io', io);
  app.set('onlineUsers', onlineUsers);

  server.listen(PORT, () => {
    console.log(`🚀 Adda backend running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  });
};

start();

process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

module.exports = { app, server, io };