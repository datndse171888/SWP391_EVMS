export interface FeedbackResponse {
  _id: string;
  userID: string | {
    _id: string;
    fullName: string;
    email: string;
    photoURL?: string;
    phoneNumber?: string;
  };
  rating: number; // 1-5
  comment: string;
  status: 'pending' | 'reviewed' | 'resolved';
  adminResponse?: string;
  respondedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFeedbackRequest {
  rating: number;
  comment: string;
}

export interface RespondFeedbackRequest {
  adminResponse: string;
  status?: 'reviewed' | 'resolved';
}

export interface FeedbackListResponse {
  success: boolean;
  feedbacks: FeedbackResponse[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

