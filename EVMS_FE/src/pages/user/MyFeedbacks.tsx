import { useEffect, useState } from 'react';
import { MessageSquare, Star, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { feedbackApi } from '../../api/FeedbackApi';
import type { FeedbackResponse } from '../../types/Feedback';
import { UserProfileLayout } from '../../components/layout/UserProfileLayout';
import { UserProfileSidebar } from '../../components/layout/UserProfileSidebar';
import { UserProfileHeader } from '../../components/layout/UserProfileHeader';

export default function MyFeedbacks() {
  const [feedbacks, setFeedbacks] = useState<FeedbackResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadFeedbacks();
  }, []);

  const loadFeedbacks = async () => {
    try {
      setLoading(true);
      console.log('Loading feedbacks...');
      console.log('Token:', localStorage.getItem('accessToken'));
      const response = await feedbackApi.getMyFeedbacks();
      console.log('Feedbacks loaded:', response.data);
      setFeedbacks(response.data.feedbacks);
    } catch (err: any) {
      console.error('Error loading feedbacks:', err);
      console.error('Error response:', err.response);
      console.error('Error status:', err.response?.status);
      console.error('Error data:', err.response?.data);
      setError(err.response?.data?.message || 'Không thể tải phản hồi');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock size={12} />
            Đang chờ
          </span>
        );
      case 'reviewed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <AlertCircle size={12} />
            Đã xem
          </span>
        );
      case 'resolved':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle size={12} />
            Đã giải quyết
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <UserProfileLayout>
      <div className="flex flex-row w-full">
        <UserProfileSidebar />
        <div className="flex-1">
          <div className="w-full px-8 py-8">
            <UserProfileHeader
              title="Lịch sử phản hồi"
              description="Xem các phản hồi và đánh giá bạn đã gửi"
            />

            <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
              {error}
            </div>
          ) : feedbacks.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">Bạn chưa gửi phản hồi nào</p>
            </div>
          ) : (
            <div className="space-y-4">
              {feedbacks.map((feedback) => (
                <div key={feedback._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={16}
                            className={star <= feedback.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {feedback.rating}/5
                      </span>
                    </div>
                    {getStatusBadge(feedback.status)}
                  </div>

                  <p className="text-gray-700 mb-3">{feedback.comment}</p>

                  {feedback.adminResponse && (
                    <div className="mt-4 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                      <p className="text-sm font-semibold text-blue-900 mb-1">Phản hồi từ quản trị viên:</p>
                      <p className="text-sm text-blue-800">{feedback.adminResponse}</p>
                      {feedback.respondedAt && (
                        <p className="text-xs text-blue-600 mt-2">
                          {formatDate(feedback.respondedAt)}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="mt-4 text-xs text-gray-500">
                    Gửi lúc: {formatDate(feedback.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          )}
            </div>
          </div>
        </div>
      </div>
    </UserProfileLayout>
  );
}

