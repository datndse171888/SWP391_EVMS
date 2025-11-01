import React from 'react';
import { X, Clock, Check, DollarSign, Package, Tag } from 'lucide-react';
import type { ServicePackageResponse } from '../../types/ServicePackage';

interface PackageDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  package: ServicePackageResponse | null;
}

export const PackageDetailModal: React.FC<PackageDetailModalProps> = ({ isOpen, onClose, package: pkg }) => {
  if (!isOpen || !pkg) return null;

  const priceFormatted = new Intl.NumberFormat('vi-VN').format(pkg.price ?? 0);
  const discountPrice = pkg.discount > 0 
    ? pkg.price * (1 - pkg.discount / 100) 
    : pkg.price;
  const discountPriceFormatted = new Intl.NumberFormat('vi-VN').format(discountPrice);

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'CAR': return 'Xe ô tô điện';
      case 'MOTOBIKE': return 'Xe máy điện';
      case 'BICYCLE': return 'Xe đạp điện';
      default: return category;
    }
  };

  const totalServicePrice = pkg.services.reduce((sum, svc) => sum + (svc.price || 0), 0);
  const savings = totalServicePrice - discountPrice;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-orange-500 to-blue-600 rounded-t-2xl p-8 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all hover:scale-110"
          >
            <X size={20} className="text-white" />
          </button>

          <div className="flex items-center gap-3 mb-4">
            <Package className="text-white" size={32} />
            <h2 className="text-3xl font-bold">{pkg.name}</h2>
          </div>

          {pkg.description && (
            <p className="text-white/90 text-lg leading-relaxed">{pkg.description}</p>
          )}

          <div className="mt-4">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-white/20 backdrop-blur-sm">
              <Tag size={16} className="mr-2" />
              {getCategoryName(pkg.vehicleCategory)}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Price Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="md:col-span-2 bg-gradient-to-br from-orange-50 to-blue-50 rounded-xl p-6 border-2 border-orange-200">
              <div className="flex items-center gap-3 mb-3">
                <DollarSign className="text-orange-600" size={24} />
                <span className="text-gray-700 font-semibold text-lg">Giá gói dịch vụ</span>
              </div>
              {pkg.discount > 0 && (
                <div className="mb-2">
                  <span className="text-xl text-gray-500 line-through">{priceFormatted}₫</span>
                  <span className="ml-3 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-bold">
                    Giảm {pkg.discount}%
                  </span>
                </div>
              )}
              <p className="text-4xl font-bold text-orange-600">{discountPriceFormatted}₫</p>
              {savings > 0 && (
                <p className="text-sm text-green-600 font-semibold mt-2">
                  Tiết kiệm: {new Intl.NumberFormat('vi-VN').format(savings)}₫
                </p>
              )}
            </div>

            <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
              <div className="flex items-center gap-3 mb-3">
                <Clock className="text-blue-600" size={20} />
                <span className="text-gray-700 font-medium">Thời gian</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">{pkg.duration} phút</p>
              <p className="text-xs text-gray-500 mt-1">Tổng thời gian</p>
            </div>
          </div>

          {/* Services Included */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Check className="text-green-600" size={24} />
              Dịch vụ bao gồm ({pkg.services.length} dịch vụ)
            </h3>
            
            <div className="space-y-3">
              {pkg.services.map((service, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <Check className="text-green-600" size={16} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{service.name}</p>
                      {service.description && (
                        <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-bold text-orange-600">{new Intl.NumberFormat('vi-VN').format(service.price || 0)}₫</p>
                    <p className="text-xs text-gray-500">{service.duration} phút</p>
                  </div>
                </div>
              ))}
            </div>

            {totalServicePrice > 0 && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-semibold">Tổng giá nếu mua lẻ:</span>
                  <span className="text-xl font-bold text-gray-700">
                    {new Intl.NumberFormat('vi-VN').format(totalServicePrice)}₫
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-blue-300">
                  <span className="text-gray-700 font-semibold">Giá gói (sau giảm giá):</span>
                  <span className="text-2xl font-bold text-orange-600">
                    {discountPriceFormatted}₫
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
            >
              Đóng
            </button>
            <button
              className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-600 to-blue-600 text-white rounded-lg hover:from-orange-700 hover:to-blue-700 transition-all font-semibold shadow-lg"
            >
              Chọn gói này
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

