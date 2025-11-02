import React from 'react';
import { Package, Shield, Info } from 'lucide-react';
import type { Part } from '../types/Part';
import { Link } from 'react-router-dom';

interface PartCardProps {
  part: Part;
}

const PartCard: React.FC<PartCardProps> = ({ part }) => {
  const priceFormatted = new Intl.NumberFormat('vi-VN').format(part.price || 0);
  const initials = String(part.name || '?').trim().split(' ').slice(0, 2).map(s => s[0]).join('').toUpperCase();

  return (
    <article
      className="group relative bg-white rounded-2xl shadow-md hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 overflow-hidden border border-transparent hover:border-orange-100"
      role="article"
      aria-labelledby={`part-${part.id}-title`}
    >
      {/* Top section with icon/placeholder */}
      <div className="relative h-40 bg-gradient-to-br from-blue-50 to-orange-50">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-center justify-center w-20 h-20 rounded-xl bg-gradient-to-br from-blue-600 to-orange-500 text-white text-2xl font-extrabold shadow-lg">
            <Package size={32} />
          </div>
        </div>

        {/* Status badge */}
        <span
          className={`absolute top-3 right-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-md border ${
            part.status === 'active'
              ? 'bg-green-100 text-green-700 border-green-200'
              : part.status === 'inactive'
              ? 'bg-gray-100 text-gray-700 border-gray-200'
              : 'bg-red-100 text-red-700 border-red-200'
          }`}
        >
          {part.status === 'active' ? 'Có sẵn' : part.status === 'inactive' ? 'Tạm hết' : 'Ẩn'}
        </span>
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h4
              id={`part-${part.id}-title`}
              className="text-lg lg:text-xl font-extrabold text-slate-900 break-words mb-2"
            >
              {part.name}
            </h4>
            {part.manufacturer && (
              <div className="text-sm text-slate-600 mb-2">
                <span className="font-medium">Hãng:</span> {part.manufacturer}
              </div>
            )}
            {part.partNumber && (
              <div className="text-xs text-slate-500 mb-2">
                <span className="font-medium">Mã:</span> {part.partNumber}
              </div>
            )}
            <div className="mt-2 text-sm text-slate-600 line-clamp-2">
              {part.description || 'Không có mô tả.'}
            </div>
          </div>

          <div className="flex-shrink-0 ml-4 text-right">
            <div className="inline-flex items-center gap-1 px-3 py-2 rounded-full bg-white text-orange-600 font-extrabold text-lg lg:text-2xl shadow">
              {priceFormatted}₫
            </div>
            <div className="mt-1 text-xs text-slate-500">Giá đã bao gồm VAT</div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-4 flex-wrap">
          {part.warrantyPeriod && (
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-2 bg-white/90 px-3 py-1 rounded-full shadow-sm text-sm text-slate-700">
                <Shield size={16} className="text-green-600" />
                <span className="font-medium">Bảo hành {part.warrantyPeriod} tháng</span>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
          <Link
            to={`/part/${part.id}`}
            className="flex-1 px-4 py-2 bg-white border-2 border-orange-500 text-orange-600 rounded-lg hover:bg-orange-50 transition-all duration-200 font-semibold text-center"
          >
            Chi tiết
          </Link>
          <button
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 font-semibold"
            disabled={part.status !== 'active'}
          >
            {part.status === 'active' ? 'Thêm vào giỏ' : 'Không có sẵn'}
          </button>
        </div>
      </div>
    </article>
  );
};

export default PartCard;

