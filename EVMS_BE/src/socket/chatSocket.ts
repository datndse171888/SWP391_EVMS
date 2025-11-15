import { Server } from 'socket.io';
import { AuthenticatedSocket } from '../middleware/socketAuth.js';
import { Message } from '../models/Message.js';
import { Conversation } from '../models/Conversation.js';
import { User } from '../models/User.js';

export const setupChatSocket = (io: Server) => {
  // Socket.io connection with authentication
  io.on('connection', async (socket: AuthenticatedSocket) => {
    const userId = socket.userId;
    if (!userId) {
      socket.disconnect();
      return;
    }

    console.log(`User ${userId} connected (Socket ID: ${socket.id})`);

    // Join conversation room
    socket.on('joinConversation', async (conversationID: string) => {
      try {
        // Verify user belongs to conversation
        const conv = await Conversation.findById(conversationID).lean();
        if (!conv) {
          socket.emit('error', { message: 'Conversation not found' });
          return;
        }

        const isMember =
          String(conv.userID) === userId ||
          (conv.staffID && String(conv.staffID) === userId);

        if (isMember) {
          socket.join(`conversation:${conversationID}`);
          console.log(`User ${userId} joined conversation ${conversationID}`);
          socket.emit('joinedConversation', { conversationID });
        } else {
          socket.emit('error', { message: 'Not authorized to join this conversation' });
        }
      } catch (error) {
        console.error('Error joining conversation:', error);
        socket.emit('error', { message: 'Failed to join conversation' });
      }
    });

    // Leave conversation room
    socket.on('leaveConversation', (conversationID: string) => {
      socket.leave(`conversation:${conversationID}`);
      console.log(`User ${userId} left conversation ${conversationID}`);
    });

    // Handle new message
    socket.on('sendMessage', async (data: {
      conversationID: string;
      content: string;
      imageUrl?: string;
      imageUrls?: string[];
    }) => {
      try {
        // Verify conversation exists and user is member
        const conv = await Conversation.findById(data.conversationID).lean();
        if (!conv) {
          socket.emit('error', { message: 'Conversation not found' });
          return;
        }

        const isMember =
          String(conv.userID) === userId ||
          (conv.staffID && String(conv.staffID) === userId);

        if (!isMember) {
          socket.emit('error', { message: 'Not authorized to send message' });
          return;
        }

        // Save message to database
        const messageData: any = {
          conversationID: data.conversationID,
          senderID: userId,
          content: data.content.trim() || '📷',
        };

        // Handle images
        if (data.imageUrls && Array.isArray(data.imageUrls) && data.imageUrls.length > 0) {
          const validImageUrls = data.imageUrls
            .filter((url) => url && typeof url === 'string' && url.trim())
            .map((url) => url.trim());
          if (validImageUrls.length > 0) {
            messageData.imageUrls = validImageUrls;
            if (validImageUrls.length === 1) {
              messageData.imageUrl = validImageUrls[0];
            }
          }
        } else if (data.imageUrl && data.imageUrl.trim()) {
          messageData.imageUrl = data.imageUrl.trim();
        }

        const message = await Message.create(messageData);

        // Populate sender info
        await message.populate('senderID', 'userName fullName role photoURL');

        // Prepare message response
        const messageResponse = {
          _id: message._id.toString(),
          conversationID: message.conversationID.toString(),
          senderID: {
            _id: (message.senderID as any)._id.toString(),
            userName: (message.senderID as any).userName,
            fullName: (message.senderID as any).fullName,
            role: (message.senderID as any).role,
            photoURL: (message.senderID as any).photoURL,
          },
          content: message.content,
          imageUrl: message.imageUrl,
          imageUrls: message.imageUrls,
          timestamp: message.timestamp.toISOString(),
        };

        // Emit to all users in this conversation room
        io.to(`conversation:${data.conversationID}`).emit('newMessage', messageResponse);

        console.log(`Message sent in conversation ${data.conversationID} by user ${userId}`);
      } catch (error) {
        console.error('Error sending message via socket:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicator
    socket.on('typing', (data: { conversationID: string; isTyping: boolean }) => {
      socket.to(`conversation:${data.conversationID}`).emit('userTyping', {
        userId,
        conversationID: data.conversationID,
        isTyping: data.isTyping,
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User ${userId} disconnected (Socket ID: ${socket.id})`);
    });
  });
};

