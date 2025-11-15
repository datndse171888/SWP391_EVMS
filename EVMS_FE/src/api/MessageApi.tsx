import { api } from "../utils/Axios";

export interface Message {
  _id: string;
  conversationID: string;
  senderID: {
    _id: string;
    userName: string;
    fullName?: string;
    role: string;
    photoURL?: string;
  } | string;
  content: string;
  imageUrl?: string; // For backward compatibility
  imageUrls?: string[]; // Array of image URLs
  timestamp: string;
}

export interface MessageResponse {
  success: boolean;
  data: Message;
}

export interface MessageListResponse {
  success: boolean;
  data: Message[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
  };
}

export const messageApi = {
  // Gửi tin nhắn
  sendMessage: (conversationID: string, content: string, imageUrl?: string, imageUrls?: string[]) => {
    return api.post<MessageResponse>('/messages', { conversationID, content, imageUrl, imageUrls });
  },

  // Upload ảnh
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post<{ success: boolean; imageUrl: string }>('/uploads/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Lấy danh sách tin nhắn theo conversation
  getMessagesByConversation: (conversationID: string, params?: {
    page?: number;
    limit?: number;
  }) => {
    return api.get<MessageListResponse>(`/messages/by-conversation/${conversationID}`, { params });
  },
};

