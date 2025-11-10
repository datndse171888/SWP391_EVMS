# 🔄 Luồng Tích Hợp Socket.io - Chi Tiết Từ Backend Đến Frontend

## 📋 Tổng Quan

Socket.io cho phép **real-time bidirectional communication** giữa client và server. Thay vì client phải polling (hỏi server liên tục), server có thể **push** data ngay khi có sự kiện xảy ra.

---

## 🏗️ PHẦN 1: BACKEND SETUP

### **Bước 1: Cài Đặt Package**

```bash
npm install socket.io
```

### **Bước 2: Setup Socket.io Server (index.ts)**

```typescript
// 1. Import dependencies
import http from 'http';
import { Server } from 'socket.io';

// 2. Tạo HTTP server từ Express app
const app = express();
const server = http.createServer(app);  // ← Socket.io cần HTTP server

// 3. Khởi tạo Socket.io Server
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',  // Frontend URL
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// 4. Apply authentication middleware
io.use(socketAuth);  // ← Xác thực user trước khi kết nối

// 5. Setup event handlers
setupChatSocket(io);

// 6. Start server
server.listen(4000);  // ← Dùng server, không phải app
```

**Giải thích:**
- Socket.io cần **HTTP server**, không phải Express app trực tiếp
- CORS config cho phép frontend kết nối
- Middleware `socketAuth` xác thực user trước khi cho phép kết nối

---

### **Bước 3: Authentication Middleware (socketAuth.ts)**

```typescript
export const socketAuth = async (socket, next) => {
  // 1. Lấy token từ handshake
  const token = socket.handshake.auth.token;
  
  // 2. Verify JWT token
  const decoded = jwt.verify(token, secret);
  
  // 3. Lấy user từ database
  const user = await User.findById(decoded.sub);
  
  // 4. Attach user info vào socket object
  socket.userId = user._id.toString();
  socket.userRole = user.role;
  
  // 5. Cho phép kết nối
  next();
};
```

**Luồng:**
```
Client kết nối → Socket.io nhận connection request
→ socketAuth middleware chạy
→ Verify token → Lấy user từ DB
→ Attach userId vào socket
→ next() → Cho phép kết nối
```

---

### **Bước 4: Setup Event Handlers (chatSocket.ts)**

```typescript
export const setupChatSocket = (io: Server) => {
  // 1. Listen for connection
  io.on('connection', (socket) => {
    console.log(`User ${socket.userId} connected`);
    
    // 2. Event: joinConversation
    socket.on('joinConversation', async (conversationID) => {
      // Verify user belongs to conversation
      const conv = await Conversation.findById(conversationID);
      const isMember = conv.userID === socket.userId || conv.staffID === socket.userId;
      
      if (isMember) {
        // Join room (group users by conversation)
        socket.join(`conversation:${conversationID}`);
        socket.emit('joinedConversation', { conversationID });
      }
    });
    
    // 3. Event: sendMessage
    socket.on('sendMessage', async (data) => {
      // Save to database
      const message = await Message.create({
        conversationID: data.conversationID,
        senderID: socket.userId,
        content: data.content,
        imageUrls: data.imageUrls,
      });
      
      // Populate sender info
      await message.populate('senderID', 'userName fullName photoURL');
      
      // Emit to ALL users in this conversation room
      io.to(`conversation:${data.conversationID}`).emit('newMessage', {
        _id: message._id,
        senderID: message.senderID,
        content: message.content,
        timestamp: message.timestamp,
      });
    });
    
    // 4. Event: disconnect
    socket.on('disconnect', () => {
      console.log(`User ${socket.userId} disconnected`);
    });
  });
};
```

**Giải thích:**
- **Rooms**: Socket.io cho phép nhóm users vào "rooms"
  - `socket.join('roomName')` - Join room
  - `io.to('roomName').emit()` - Gửi đến tất cả users trong room
- **Events**: 
  - `socket.on('eventName')` - Listen event từ client
  - `socket.emit('eventName')` - Gửi event đến client này
  - `io.emit('eventName')` - Gửi đến tất cả clients
  - `io.to('room').emit('eventName')` - Gửi đến tất cả clients trong room

---

## 🎨 PHẦN 2: FRONTEND SETUP

### **Bước 1: Cài Đặt Package**

```bash
npm install socket.io-client
```

### **Bước 2: Tạo Socket Context (SocketContext.tsx)**

```typescript
export const SocketProvider = ({ children }) => {
  const { user, token, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Chỉ kết nối khi user đã login
    if (isAuthenticated && user && token) {
      // 1. Tạo socket connection
      const newSocket = io('http://localhost:4000', {
        auth: {
          token,  // ← Gửi JWT token để authenticate
        },
        transports: ['websocket', 'polling'],  // Fallback
        reconnection: true,  // Tự động reconnect
      });

      // 2. Listen connection events
      newSocket.on('connect', () => {
        console.log('Connected:', newSocket.id);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected');
      });

      // 3. Store socket instance
      setSocket(newSocket);

      // 4. Cleanup khi unmount
      return () => {
        newSocket.close();
      };
    }
  }, [isAuthenticated, user, token]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
```

**Luồng:**
```
User login → AuthContext có token
→ SocketProvider detect isAuthenticated = true
→ Tạo socket connection với token
→ Backend verify token qua socketAuth
→ Connection thành công
→ Socket instance được store trong Context
```

---

### **Bước 3: Wrap App với SocketProvider (main.tsx)**

```typescript
<AuthProvider>
  <SocketProvider>  {/* ← SocketProvider bên trong AuthProvider */}
    <Router />
  </SocketProvider>
</AuthProvider>
```

**Lý do:** SocketProvider cần `token` từ AuthContext, nên phải wrap bên trong.

---

### **Bước 4: Sử Dụng Socket trong Components**

#### **4.1. Import Hook**

```typescript
import { useSocket } from '../../contexts/SocketContext';

const ChatComponent = () => {
  const socket = useSocket();  // ← Lấy socket instance
  // ...
};
```

#### **4.2. Join Conversation Room**

```typescript
useEffect(() => {
  if (socket && conversationID) {
    // Join room khi conversation được chọn
    socket.emit('joinConversation', conversationID);
    
    return () => {
      // Leave room khi unmount hoặc đổi conversation
      socket.emit('leaveConversation', conversationID);
    };
  }
}, [socket, conversationID]);
```

**Luồng:**
```
User chọn conversation → conversationID thay đổi
→ useEffect trigger
→ socket.emit('joinConversation', conversationID)
→ Backend nhận event
→ Verify user belongs to conversation
→ socket.join(`conversation:${conversationID}`)
→ User được add vào room
```

#### **4.3. Listen for New Messages**

```typescript
useEffect(() => {
  if (!socket) return;

  const handleNewMessage = (message) => {
    // Xử lý message mới
    if (message.senderID._id !== user?.id) {
      // Message từ người khác
      setMessages(prev => [...prev, message]);
    } else {
      // Message của mình (replace optimistic update)
      setMessages(prev => 
        prev.map(msg => 
          msg.id.startsWith('temp-') 
            ? message  // Replace temp message
            : msg
        )
      );
    }
  };

  // Listen event
  socket.on('newMessage', handleNewMessage);

  // Cleanup
  return () => {
    socket.off('newMessage', handleNewMessage);
  };
}, [socket, user]);
```

**Luồng:**
```
Backend emit 'newMessage' → Tất cả clients trong room nhận được
→ Frontend socket.on('newMessage') trigger
→ handleNewMessage được gọi
→ Update UI với message mới
```

#### **4.4. Send Message**

```typescript
const sendMessage = async () => {
  // 1. Upload images (nếu có)
  const uploadedImageUrls = [];
  for (const image of selectedImages) {
    const response = await messageApi.uploadImage(image);
    uploadedImageUrls.push(response.data.imageUrl);
  }

  // 2. Optimistic update (hiển thị ngay)
  const tempMessage = {
    id: `temp-${Date.now()}`,
    text: messageText,
    fromMe: true,
  };
  setMessages(prev => [...prev, tempMessage]);

  // 3. Send via Socket
  socket.emit('sendMessage', {
    conversationID,
    content: messageText,
    imageUrls: uploadedImageUrls,
  });

  // 4. Server sẽ emit 'newMessage' → Replace temp message
};
```

**Luồng:**
```
User gửi message
→ Upload images (nếu có)
→ Optimistic update (hiển thị ngay)
→ socket.emit('sendMessage', {...})
→ Backend nhận event
→ Save to database
→ Backend emit 'newMessage' to room
→ Frontend nhận 'newMessage'
→ Replace temp message với real message
```

---

## 🔄 LUỒNG HOẠT ĐỘNG TỔNG THỂ

### **Scenario: User A gửi message cho User B**

```
┌─────────────┐                    ┌─────────────┐
│  User A     │                    │  Backend    │
│ (Frontend)  │                    │  (Server)   │
└─────────────┘                    └─────────────┘
      │                                   │
      │ 1. socket.emit('sendMessage')    │
      │ ────────────────────────────────>│
      │                                   │
      │                                   │ 2. Verify conversation
      │                                   │ 3. Save to MongoDB
      │                                   │ 4. io.to('room').emit('newMessage')
      │                                   │
      │                                   │ ────────────────────┐
      │                                   │                     │
      │                                   │                     ▼
      │                                   │            ┌─────────────┐
      │                                   │            │  User B     │
      │                                   │            │ (Frontend)  │
      │                                   │            └─────────────┘
      │                                   │                     │
      │                                   │                     │ 5. socket.on('newMessage')
      │                                   │                     │    → Update UI
      │                                   │                     │
      │ 6. socket.on('newMessage')       │                     │
      │    → Replace temp message        │                     │
      │ <────────────────────────────────│                     │
      │                                   │                     │
```

### **Chi Tiết Từng Bước:**

1. **User A gửi message:**
   - Frontend: `socket.emit('sendMessage', { conversationID, content, ... })`
   - Optimistic update: Hiển thị message ngay (với temp ID)

2. **Backend nhận event:**
   - Verify user belongs to conversation
   - Save message to MongoDB
   - Populate sender info

3. **Backend broadcast:**
   - `io.to('conversation:123').emit('newMessage', messageData)`
   - Tất cả users trong room nhận được

4. **User B nhận message:**
   - `socket.on('newMessage')` trigger
   - Update UI: Add message vào chat

5. **User A nhận confirmation:**
   - `socket.on('newMessage')` trigger
   - Replace temp message với real message (có _id từ DB)

---

## 🎯 CÁC KHÁI NIỆM QUAN TRỌNG

### **1. Rooms (Phòng)**
- **Mục đích**: Nhóm users lại với nhau
- **Ví dụ**: `conversation:123` = Tất cả users trong conversation 123
- **Cách dùng**:
  ```typescript
  socket.join('roomName');           // Join room
  io.to('roomName').emit('event');  // Gửi đến room
  socket.leave('roomName');          // Leave room
  ```

### **2. Events (Sự kiện)**
- **Client → Server**: `socket.emit('eventName', data)`
- **Server → Client**: `socket.emit('eventName', data)` hoặc `io.emit('eventName', data)`
- **Listen**: `socket.on('eventName', handler)`

### **3. Authentication**
- Token được gửi trong `handshake.auth.token`
- Middleware `socketAuth` verify trước khi cho phép kết nối
- User info được attach vào `socket.userId`

### **4. Reconnection**
- Socket.io tự động reconnect khi mất kết nối
- Config: `reconnection: true, reconnectionDelay: 1000`

---

## ✅ CHECKLIST TÍCH HỢP

### **Backend:**
- [x] Cài đặt `socket.io`
- [x] Tạo HTTP server từ Express app
- [x] Khởi tạo Socket.io Server với CORS config
- [x] Tạo authentication middleware
- [x] Setup event handlers (joinConversation, sendMessage)
- [x] Emit events đến rooms

### **Frontend:**
- [x] Cài đặt `socket.io-client`
- [x] Tạo SocketContext với SocketProvider
- [x] Wrap app với SocketProvider
- [x] Import `useSocket` hook trong components
- [x] Join conversation room khi chọn conversation
- [x] Listen `newMessage` event
- [x] Emit `sendMessage` event
- [x] Handle optimistic updates

---

## 🚀 KẾT QUẢ

- ✅ **Real-time messaging**: Tin nhắn hiển thị ngay, không cần refresh
- ✅ **Tiết kiệm tài nguyên**: Không cần polling (hỏi server liên tục)
- ✅ **Auto-reconnect**: Tự động kết nối lại khi mất kết nối
- ✅ **Scalable**: Dễ dàng mở rộng với rooms và namespaces
- ✅ **Secure**: Authentication qua JWT token

---

## 📝 LƯU Ý

1. **Cleanup**: Luôn cleanup event listeners trong `useEffect` return
2. **Error handling**: Listen `error` event từ socket
3. **Fallback**: Có fallback API nếu socket không kết nối
4. **Optimistic updates**: Giữ optimistic updates cho UX tốt
5. **Duplicate prevention**: Kiểm tra senderID để tránh duplicate messages

