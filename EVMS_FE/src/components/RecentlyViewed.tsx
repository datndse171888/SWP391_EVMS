import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import type { RecentlyViewedPart } from '../hooks/useRecentlyViewed';

interface RecentlyViewedProps {
  items: RecentlyViewedPart[];
  onRemove: (partId: string) => void;
  onClear: () => void;
}

export const RecentlyViewed: React.FC<RecentlyViewedProps> = ({ items, onRemove, onClear }) => {
  const navigate = useNavigate();

  if (items.length === 0) {
    return null;
  }

  const currencyFormatter = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  });

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Vừa xem';
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;
    return new Date(timestamp).toLocaleDateString('vi-VN');
  };

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-50 to-orange-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              📌 Linh kiện bạn vừa xem
            </h2>
            <p className="text-gray-600">
              Những linh kiện bạn đã xem gần đây
            </p>
          </div>
          {items.length > 0 && (
            <button
              onClick={onClear}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors border border-gray-200"
            >
              Xóa tất cả
            </button>
          )}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {items.map((part) => (
            <div
              key={part.id || part._id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden group"
            >
              {/* Image Placeholder */}
              <div className="relative w-full h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
                <div className="text-4xl">⚙️</div>
                {/* Remove Button */}
                <button
                  onClick={() => onRemove(part.id || part._id || '')}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Xóa khỏi lịch sử"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4">
                {/* Name */}
                <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-2 hover:text-blue-600 cursor-pointer">
                  {part.name}
                </h3>

                {/* Price */}
                <p className="text-lg font-bold text-orange-500 mb-2">
                  {currencyFormatter.format(part.price)}
                </p>

                {/* Time */}
                <p className="text-xs text-gray-500 mb-3">
                  {formatTime(part.viewedAt)}
                </p>

                {/* View Button */}
                <button
                  onClick={() => navigate(`/parts/${part.id || part._id}`)}
                  className="w-full px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Xem chi tiết
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Info */}
        <div className="mt-8 p-4 bg-white rounded-lg border border-blue-200">
          <p className="text-sm text-gray-600">
            💡 <span className="font-medium">Mẹo:</span> Lịch sử xem của bạn được lưu trên thiết bị này. Xóa dữ liệu trình duyệt sẽ xóa lịch sử.
          </p>
        </div>
      </div>
    </section>
  );
};

export default RecentlyViewed;

