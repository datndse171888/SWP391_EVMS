import { api } from "../utils/Axios";

export interface Conversation {
  _id: string;
  userID: string | {
    _id: string;
    userName: string;
    fullName?: string;
    email: string;
    photoURL?: string;
  };
  staffID?: string | null;
  status: 'open' | 'assigned';
  createdAt: string;
  closedAt?: string | null;
  lastMessage?: {
    _id: string;
    conversationID: string;
    senderID: string;
    content: string;
    timestamp: string;
  } | null;
}

export interface ConversationResponse {
  success: boolean;
  data: Conversation;
}

export interface ConversationListResponse {
  success: boolean;
  data: Conversation[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
  };
}

export const conversationApi = {
  // Customer tạo conversation mới
  createConversation: (userID: string) => {
    return api.post<ConversationResponse>('/conversations', { userID });
  },

  // Customer lấy conversation của mình
  getMyConversation: () => {
    return api.get<ConversationResponse>('/conversations/my-conversation');
  },

  // Admin/Staff lấy tất cả conversations
  getAllConversations: (params?: {
    status?: 'open' | 'assigned';
    userID?: string;
    staffID?: string;
    page?: number;
    limit?: number;
  }) => {
    return api.get<ConversationListResponse>('/conversations', { params });
  },

  // Admin/Staff lấy conversation theo ID
  getConversationByID: (id: string) => {
    return api.get<ConversationResponse>(`/conversations/${id}`);
  },

  // Staff assign conversation
  assignConversation: (id: string) => {
    return api.patch<ConversationResponse>(`/conversations/${id}/assign`);
  },

  // Admin/Staff lấy tất cả conversation có status open
  getAllConversationOpen: (params?: {
    page?: number;
    limit?: number;
  }) => {
    return api.get<ConversationListResponse>('/conversations/open', { params });
  },

  // Staff lấy tất cả conversation đã assigned cho mình
  getAllConversationAssigned: (params?: {
    page?: number;
    limit?: number;
  }) => {
    return api.get<ConversationListResponse>('/conversations/assigned', { params });
  },
};

