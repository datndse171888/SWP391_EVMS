import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Wrench, Shield } from 'lucide-react';
import type { Part } from '../types/Part';

interface PartCardProps {
  part: Part;
}

export const PartCard: React.FC<PartCardProps> = ({ part }) => {
  const navigate = useNavigate();
  const partId = part._id || part.id;

  const currencyFormatter = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  });

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-orange-300 group">
      {/* Header with icon */}
      <div className="bg-gradient-to-r from-orange-50 to-blue-50 p-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
            <Package className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
              {part.name}
            </h3>
            {part.manufacturer && (
              <p className="text-sm text-gray-500">Hãng: {part.manufacturer}</p>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Description */}
        {part.description && (
          <div>
            <p className="text-gray-600 text-sm line-clamp-3">
              {part.description}
            </p>
          </div>
        )}

        {/* Part Number */}
        {part.partNumber && (
          <div className="flex items-center space-x-2 text-sm">
            <Wrench className="w-4 h-4 text-blue-500" />
            <span className="text-gray-600">Mã: <span className="font-semibold text-gray-900">{part.partNumber}</span></span>
          </div>
        )}

        {/* Warranty Info */}
        {part.warrantyPeriod && (
          <div className="flex items-center space-x-2 text-sm">
            <Shield className="w-4 h-4 text-green-500" />
            <span className="text-gray-600">
              Bảo hành: <span className="font-semibold text-gray-900">{part.warrantyPeriod} {part.warrantyCondition || 'tháng'}</span>
            </span>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-gray-100"></div>

        {/* Price and Status */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <p className="text-xs text-gray-500 mb-1">Giá</p>
            <p className="text-2xl font-bold text-orange-600">
              {currencyFormatter.format(part.price)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 mb-1">Trạng thái</p>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
              part.status === 'active' 
                ? 'bg-green-100 text-green-800' 
                : part.status === 'inactive'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {part.status === 'active' ? 'Có sẵn' : part.status === 'inactive' ? 'Tạm hết' : 'Ẩn'}
            </span>
          </div>
        </div>
      </div>

      {/* Footer - Action Button */}
      <div className="px-6 pb-6">
        <button
          onClick={() => navigate(`/parts/${partId}`)}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
        >
          Xem chi tiết
        </button>
      </div>
    </div>
  );
};

export default PartCard;

