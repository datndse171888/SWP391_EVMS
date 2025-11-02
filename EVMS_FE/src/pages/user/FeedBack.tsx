import { useEffect, useState } from 'react';
import { CheckCircle, Send } from 'lucide-react';
import StarRating from '../../components/StarRating';

const CHAR_LIMIT = 400;

export default function FeedbackPage() {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (!ok) return;
    const t = window.setTimeout(() => setOk(false), 2800);
    return () => clearTimeout(t);
  }, [ok]);

  const canSubmit = rating > 0 && comment.trim().length > 0 && comment.length <= CHAR_LIMIT;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    try {
      // TODO: call API here, e.g. await feedbackApi.send({ rating, comment })
      await new Promise((r) => setTimeout(r, 800));
      setOk(true);
      setRating(0);
      setComment('');
    } catch (err) {
      console.error(err);
      // show error toast if you have one
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-slate-50 to-white mt-10">
      <div className="w-full max-w-xl">
        <div className="bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-100">
          <div className="p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <h1 className="text-3xl font-semibold text-blue-800">Phản hồi & Đánh giá</h1>
                <h2 className="text-blue-500">Chia sẻ trải nghiệm của bạn để chúng tôi phục vụ tốt hơn.</h2>
              </div>
              <div className="text-sm text-slate-400">{rating ? `${rating}/5` : 'Chưa đánh giá'}</div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center gap-4">
                <StarRating rating={rating} onRatingChange={setRating} />
                <div className="text-sm text-slate-500 hidden sm:block">{rating ? sentiment(rating) : 'Đánh giá của bạn'}</div>
              </div>

              <div>
                <label htmlFor="comment" className="sr-only">Bình luận</label>
                <textarea
                  id="comment"
                  rows={5}
                  value={comment}
                  onChange={(e) => { if (e.target.value.length <= CHAR_LIMIT) setComment(e.target.value); }}
                  placeholder="Viết cảm nhận, góp ý hoặc mô tả vấn đề..."
                  className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
                
                {/* Gợi ý bình luận */}
                {!comment.trim() && (
                  <div className="mt-2 mb-3">
                    <div className="text-xs text-slate-600 mb-2">Gợi ý:</div>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "Giao diện thân thiện và dễ sử dụng",
                        "Tính năng hữu ích",
                        "Cần cải thiện tốc độ tải trang",
                        "Thêm tính năng tìm kiếm",
                        "Hướng dẫn sử dụng rõ ràng hơn",
                        "Thiết kế đẹp mắt"
                      ].map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setComment(suggestion)}
                          className="text-xs px-3 py-1 rounded-full bg-gray-100 text-slate-600 hover:bg-gray-200 transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                  <div>{comment.trim() ? `${comment.trim().length} / ${CHAR_LIMIT}` : `Tối đa ${CHAR_LIMIT} ký tự`}</div>
                  <div className={`font-medium ${comment.length > CHAR_LIMIT ? 'text-red-500' : 'text-emerald-600'}`}>
                    {comment.length > CHAR_LIMIT ? 'Quá giới hạn' : ''}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={!canSubmit || loading}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-60"
                >
                  {loading ? (
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4A4 4 0 004 12z" />
                    </svg>
                  ) : (
                    <Send size={14} />
                  )}
                  Gửi phản hồi
                </button>

                <button
                  type="button"
                  onClick={() => { setRating(0); setComment(''); }}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-slate-700 hover:bg-gray-50"
                >
                  Xóa
                </button>
              </div>
            </form>
          </div>

          <div className="border-t border-gray-100 px-6 py-3 bg-gradient-to-t from-white to-transparent">
            <div className="text-xs text-slate-500">
              Phản hồi của bạn sẽ được ghi nhận; chúng tôi có thể liên hệ nếu cần làm rõ.
            </div>
          </div>
        </div>

        {/* toast */}
       
        {ok && (
          <div className="fixed top-8 right-6 z-50 flex items-center gap-3 rounded-lg bg-white shadow-lg border border-gray-100 px-4 py-3 mt-15">
            <CheckCircle className="text-emerald-600" />
            <div>
              <div className="text-sm font-semibold">Cảm ơn bạn!</div>
              <div className="text-xs text-slate-500">Phản hồi đã gửi thành công.</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function sentiment(r: number) {
  if (r >= 5) return 'Tuyệt vời';
  if (r === 4) return 'Rất tốt';
  if (r === 3) return 'Tốt';
  if (r === 2) return 'Cần cải thiện';
  return 'Kém';
}