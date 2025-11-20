import { api } from '../utils/Axios';
import type { FeedbackResponse, CreateFeedbackRequest, RespondFeedbackRequest, FeedbackListResponse } from '../types/Feedback';

export const feedbackApi = {
  // Tạo feedback mới (customer)
  createFeedback: (data: CreateFeedbackRequest) => {
    return api.post<{ message: string; feedback: FeedbackResponse }>('/feedbacks', data);
  },

  // Lấy feedback của user hiện tại
  getMyFeedbacks: () => {
    return api.get<FeedbackListResponse>('/feedbacks/my');
  },

  // Lấy tất cả feedbacks (admin)
  getAllFeedbacks: (params?: {
    status?: 'pending' | 'reviewed' | 'resolved';
    rating?: number;
    page?: number;
    limit?: number;
  }) => {
    return api.get<FeedbackListResponse>('/feedbacks', { params });
  },

  // Admin phản hồi feedback
  respondToFeedback: (id: string, data: RespondFeedbackRequest) => {
    return api.patch<{ message: string; feedback: FeedbackResponse }>(`/feedbacks/${id}/respond`, data);
  },

  // Xóa feedback
  deleteFeedback: (id: string) => {
    return api.delete<{ message: string }>(`/feedbacks/${id}`);
  },
};

