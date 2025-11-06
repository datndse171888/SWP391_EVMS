import React from 'react';
import { X, Clock, Tag, DollarSign } from 'lucide-react';
import type { ServiceResponse } from '../../types/Service';
import { Link } from 'react-router-dom';

interface ServiceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: ServiceResponse | null;
}

export const ServiceDetailModal: React.FC<ServiceDetailModalProps> = ({ isOpen, onClose, service }) => {
  if (!isOpen || !service) return null;

  const priceFormatted = new Intl.NumberFormat('vi-VN').format(service.price ?? 0);
  const initials = String(service.name || '?').trim().split(' ').slice(0, 2).map(s => s[0]).join('').toUpperCase();

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'CAR': return 'Xe ô tô điện';
      case 'MOTOBIKE': return 'Xe máy điện';
      case 'BICYCLE': return 'Xe đạp điện';
      default: return category;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative h-64 bg-gradient-to-r from-orange-100 to-blue-100">
          {service.image ? (
            <img
              src={service.image}
              alt={service.name}
              className="w-full h-full object-cover rounded-t-2xl"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="flex items-center justify-center w-32 h-32 rounded-xl bg-gradient-to-br from-orange-400 to-blue-500 text-white text-4xl font-extrabold shadow-lg">
                {initials}
              </div>
            </div>
          )}

          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-lg transition-all hover:scale-110"
          >
            <X size={20} className="text-gray-700" />
          </button>

          <div className="absolute bottom-4 left-4">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-white/90 text-orange-600 shadow-lg">
              {getCategoryName(service.vehicleCategory)}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{service.name}</h2>

          {service.description && (
            <p className="text-gray-600 text-lg mb-6 leading-relaxed">
              {service.description}
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Price */}
            <div className="bg-orange-50 rounded-xl p-6 border-2 border-orange-200">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="text-orange-600" size={24} />
                <span className="text-gray-600 font-medium">Giá dịch vụ</span>
              </div>
              <p className="text-3xl font-bold text-orange-600">{priceFormatted}₫</p>
              <p className="text-sm text-gray-500 mt-1">Đã bao gồm VAT</p>
            </div>

            {/* Duration */}
            <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="text-blue-600" size={24} />
                <span className="text-gray-600 font-medium">Thời gian</span>
              </div>
              <p className="text-3xl font-bold text-blue-600">
                {typeof service.duration === 'number' ? service.duration : parseInt(service.duration) || 0} phút
              </p>
              <p className="text-sm text-gray-500 mt-1">Thời gian ước tính</p>
            </div>
          </div>

          {/* Vehicle Category */}
          <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
            <div className="flex items-center gap-3">
              <Tag className="text-gray-600" size={20} />
              <span className="text-gray-600 font-medium">Loại phương tiện: </span>
              <span className="text-gray-900 font-semibold">{getCategoryName(service.vehicleCategory)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
            >
              Đóng
            </button>
            <Link to="/booking" className="bg-gradient-to-r from-orange-600 to-blue-600 text-white rounded-lg hover:from-orange-700 hover:to-blue-700 transition-all font-semibold shadow-lg flex-1 flex items-center justify-center px-6 py-3">
               Đặt lịch ngay
            </Link>
          </div>
          </div>
        </div>
      </div>
  );
};

