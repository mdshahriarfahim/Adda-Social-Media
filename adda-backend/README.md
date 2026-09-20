# Adda (আড্ডা) — Facebook-style Social Media Backend

A complete **MVC** backend for a Facebook-like social platform, built with **Node.js + Express + MongoDB**.

**Everything lives inside MongoDB — nothing touches the local disk.**
Profile pictures, cover photos, post images/videos, and chat attachments are all streamed straight into MongoDB using **GridFS**. There is no `uploads/` folder anywhere in this project.

---

## ✨ Features

- **Auth**: Register / login with JWT, bcrypt password hashing
- **Profiles**: Bio, avatar & cover photo (stored in GridFS), profile update
- **Friends**: Send / accept / reject friend requests, unfriend, user search
- **Posts**: Text + multi-image/video posts, edit, delete, privacy (`public` / `friends` / `only_me`)
- **News Feed**: Paginated feed combining your posts + friends' posts
- **Likes**: Like/unlike posts and comments
- **Comments & Replies**: Nested comments with likes
- **Share**: Re-share a post to your own timeline
- **Real-time Chat**: 1-to-1 messaging with Socket.IO, typing indicators, online/offline presence, media attachments
- **Inbox**: Conversation previews with unread counts (MongoDB aggregation)
- **Notifications**: Likes, comments, friend requests/accepts, shares, messages

## 🏗️ Architecture (MVC)

adda-backend/
├── config/db.js # MongoDB connection + GridFS bucket
├── models/ # Mongoose schemas (M)
│ ├── User.js
│ ├── Post.js
│ ├── Comment.js
│ ├── Message.js
│ └── Notification.js
├── controllers/ # Business logic (C)
│ ├── authController.js
│ ├── userController.js
│ ├── postController.js
│ ├── commentController.js
│ ├── messageController.js
│ └── notificationController.js
├── routes/ # Express routers → controllers (routes act as the "View" layer for a JSON API)
├── middleware/
│ ├── authMiddleware.js # JWT protect()
│ ├── errorMiddleware.js # centralized error handling
│ └── uploadMiddleware.js # multer memoryStorage (buffer only, never disk)
├── utils/
│ ├── gridfsHelper.js # save/stream/delete files in MongoDB
│ └── generateToken.js
├── sockets/socket.js # Socket.IO real-time chat & presence
└── server.js # App entry point


## 🚀 Getting Started

```bash
npm install
cp .env.example .env   # then fill in MONGO_URI and JWT_SECRET
npm run dev             # nodemon (development)
npm start                # production
```

Use a **MongoDB Atlas** connection string in `MONGO_URI` for a fully cloud, disk-free setup.

## 📡 API Reference

### Auth — `/api/auth`
| Method | Route | Description |
|---|---|---|
| POST | `/register` | Create account (Sign Up) |
| POST | `/login` | Login (Sign In), returns JWT |
| GET | `/me` | Current user profile 🔒 |
| POST | `/logout` | Mark offline 🔒 |

### Users — `/api/users`
| Method | Route | Description |
|---|---|---|
| GET | `/search?q=` | Search users 🔒 |
| GET | `/:id` | Public profile 🔒 |
| PUT | `/me` | Update name/bio 🔒 |
| PUT | `/me/avatar` | Upload avatar (`multipart/form-data`, field `avatar`) 🔒 |
| PUT | `/me/cover` | Upload cover photo (field `cover`) 🔒 |
| GET | `/:id/avatar` | Stream avatar image |
| GET | `/:id/cover` | Stream cover image |
| POST | `/:id/friend-request` | Send friend request 🔒 |
| POST | `/:id/accept-request` | Accept request 🔒 |
| POST | `/:id/reject-request` | Reject request 🔒 |
| DELETE | `/:id/unfriend` | Unfriend 🔒 |

### Posts — `/api/posts`
| Method | Route | Description |
|---|---|---|
| GET | `/feed?page=&limit=` | Paginated news feed 🔒 |
| POST | `/` | Create post (`multipart/form-data`, fields `text`, `privacy`, `media` x N) 🔒 |
| GET | `/:id` | Single post 🔒 |
| GET | `/user/:userId` | A user's timeline 🔒 |
| PUT | `/:id` | Edit own post 🔒 |
| DELETE | `/:id` | Delete own post 🔒 |
| GET | `/media/:fileId` | Stream post image/video |
| PUT | `/:id/like` | Toggle like 🔒 |
| POST | `/:id/share` | Share post 🔒 |
| POST | `/:postId/comments` | Add comment/reply 🔒 |
| GET | `/:postId/comments` | List comments 🔒 |

### Comments — `/api/comments`
| Method | Route | Description |
|---|---|---|
| PUT | `/:id` | Edit own comment 🔒 |
| DELETE | `/:id` | Delete own comment 🔒 |
| PUT | `/:id/like` | Toggle like 🔒 |

### Messages — `/api/messages`
| Method | Route | Description |
|---|---|---|
| GET | `/` | Inbox (conversation previews) 🔒 |
| GET | `/:userId` | Full conversation with a user 🔒 |
| POST | `/:receiverId` | Send message (text and/or `media` file) 🔒 |
| GET | `/media/:fileId` | Stream a message attachment |

### Notifications — `/api/notifications`
| Method | Route | Description |
|---|---|---|
| GET | `/` | List notifications 🔒 |
| PUT | `/:id/seen` | Mark one as seen 🔒 |
| PUT | `/seen-all` | Mark all as seen 🔒 |

🔒 = requires `Authorization: Bearer <token>` header

## 🔌 Real-time (Socket.IO)

Client connects, then:
```js
const socket = io('http://localhost:5000');
socket.emit('identify', userId);          // announce presence
socket.emit('typing', { to: otherUserId });
socket.on('newMessage', (msg) => { ... });
socket.on('userOnline', (userId) => { ... });
socket.on('userOffline', (userId) => { ... });
```

## 🔐 Security included
- JWT auth, bcrypt hashing, helmet, CORS, rate limiting on `/api/auth`, centralized error handling, input validation on core routes.

## 📈 Suggested next steps
- Add `express-validator` schemas per route for stricter input validation
- Add refresh tokens / token blacklist on logout
- Add a Redis adapter for Socket.IO if you scale to multiple server instances
- Add stories, groups, marketplace modules following the same MVC pattern