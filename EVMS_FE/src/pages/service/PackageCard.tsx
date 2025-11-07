import React from 'react';
import { Check, Clock, Package as PackageIcon } from 'lucide-react';
import type { ServicePackageResponse } from '../../types/ServicePackage';

interface PackageCardProps {
  package: ServicePackageResponse;
  onViewDetail?: () => void;
}

export const PackageCard: React.FC<PackageCardProps> = ({ package: pkg, onViewDetail }) => {
  const priceFormatted = new Intl.NumberFormat('vi-VN').format(pkg.price ?? 0);
  const discountPrice = pkg.discount > 0 
    ? pkg.price * (1 - pkg.discount / 100) 
    : pkg.price;
  const discountPriceFormatted = new Intl.NumberFormat('vi-VN').format(discountPrice);

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 overflow-hidden border-2 border-gray-200 hover:border-orange-400 flex flex-col h-full">
      {/* Header với gradient */}
      <div className="bg-gradient-to-r from-blue-600 to-orange-500 p-6 text-white relative">
        <div className="flex items-center gap-2 mb-2">
          <PackageIcon size={24} />
          <h3 className="text-2xl font-bold">{pkg.name}</h3>
        </div>
        {pkg.description && (
          <p className="text-white/90 text-sm line-clamp-2">{pkg.description}</p>
        )}
        
        {/* Discount badge */}
        {pkg.discount > 0 && (
          <div className="absolute top-4 right-4 bg-yellow-400 text-blue-900 px-3 py-1 rounded-full text-xs font-bold">
            -{pkg.discount}%
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col">
        {/* Price Section */}
        <div className="mb-6 text-center">
          {pkg.discount > 0 ? (
            <div>
              <div className="text-gray-400 text-lg line-through mb-1">
                {priceFormatted}₫
              </div>
              <div className="text-4xl font-bold text-orange-600 mb-2">
                {discountPriceFormatted}₫
              </div>
            </div>
          ) : (
            <div className="text-4xl font-bold text-blue-900 mb-2">
              {priceFormatted}₫
            </div>
          )}
          <div className="flex items-center justify-center gap-2 text-gray-600 text-sm">
            <Clock size={16} />
            <span>{pkg.duration} phút</span>
          </div>
        </div>

        {/* Services List */}
        <div className="flex-1 mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            Bao gồm {pkg.services.length} dịch vụ:
          </h4>
          <ul className="space-y-2 max-h-48 overflow-y-auto">
            {pkg.services.map((service, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{service.name}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-auto">
          <button
            onClick={onViewDetail}
            className="flex-1 px-4 py-3 bg-white border-2 border-orange-500 text-orange-600 rounded-lg font-semibold hover:bg-orange-50 transition-all duration-200"
          >
            Chi tiết
          </button>
        </div>
      </div>
    </div>
  );
}
