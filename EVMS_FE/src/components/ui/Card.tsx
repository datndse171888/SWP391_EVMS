import { Check, Clock } from "lucide-react";
import type { ServiceResponse } from "../../types/Service";
import type { ServicePackageResponse } from "../../types/ServicePackage";
import type { VehicleCategory } from "../../types/Vehicle";


// =======================================
// Service Card Component
// =======================================

interface ServiceCardProps {
  service: ServiceResponse;
  isSelected: boolean;
  onSelect: () => void;
  vehicleCategory: VehicleCategory;
}

// Service Card Component
export const ServiceCard: React.FC<ServiceCardProps> = ({ service, isSelected, onSelect, vehicleCategory }) => {
  const getServicePrice = () => {
    if (typeof service.pricing === 'number') {
      return service.pricing;
    }
    if (Array.isArray(service.pricing)) {
      const categoryPricing = service.pricing.find(p => p.category === vehicleCategory);
      return categoryPricing?.price || 0;
    }
    return 0;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDuration = (duration: number) => {
    if (duration >= 60) {
      const hours = Math.floor(duration / 60);
      const minutes = duration % 60;
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
    return `${duration}m`;
  };

  return (
    <div 
      className={`relative bg-white rounded-lg shadow-md p-6 cursor-pointer transition-all duration-300 hover:shadow-lg border-2 ${
        isSelected 
          ? 'border-orange-500 bg-orange-50 shadow-lg' 
          : 'border-gray-200 hover:border-orange-300'
      }`}
      onClick={onSelect}
    >
      {/* Selection Circle */}
      <div className="absolute top-4 right-4">
        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
          isSelected
            ? 'border-orange-500 bg-orange-500'
            : 'border-gray-300 bg-white hover:border-orange-300'
        }`}>
          {isSelected && (
            <Check className="w-4 h-4 text-white" />
          )}
        </div>
      </div>

      {/* Service Content */}
      <div className="pr-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
          {service.name}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {service.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center text-gray-500 text-sm">
            <Clock className="w-4 h-4 mr-1" />
            <span>{formatDuration(service.duration)}</span>
          </div>
          
          <div className="text-right">
            <span className="text-xl font-bold text-orange-600">
              {formatPrice(getServicePrice())}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};







// =======================================
// Service Package Card Component
// =======================================

interface ServicePackageCardProps {
  servicePackage: ServicePackageResponse;
  isSelected: boolean;
  onSelect: () => void;
}

// Service Package Card Component  
export const ServicePackageCard: React.FC<ServicePackageCardProps> = ({ servicePackage, isSelected, onSelect }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDuration = (duration: number) => {
    if (duration >= 60) {
      const hours = Math.floor(duration / 60);
      const minutes = duration % 60;
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
    return `${duration}m`;
  };

  const getTotalOriginalPrice = () => {
    if (!servicePackage.services || servicePackage.services.length === 0) {
      return servicePackage.price;
    }
    return servicePackage.services.reduce((total, service) => total + service.price, 0);
  };

  const getDiscountAmount = () => {
    const originalPrice = getTotalOriginalPrice();
    return originalPrice - servicePackage.price;
  };

  const getDiscountPercentage = () => {
    const originalPrice = getTotalOriginalPrice();
    if (originalPrice === 0) return 0;
    return Math.round((getDiscountAmount() / originalPrice) * 100);
  };

  return (
    <div 
      className={`relative bg-white rounded-lg shadow-md p-6 cursor-pointer transition-all duration-300 hover:shadow-lg border-2 ${
        isSelected 
          ? 'border-orange-500 bg-orange-50 shadow-lg' 
          : 'border-gray-200 hover:border-orange-300'
      }`}
      onClick={onSelect}
    >
      {/* Selection Circle */}
      <div className="absolute top-4 right-4">
        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
          isSelected
            ? 'border-orange-500 bg-orange-500'
            : 'border-gray-300 bg-white hover:border-orange-300'
        }`}>
          {isSelected && (
            <Check className="w-4 h-4 text-white" />
          )}
        </div>
      </div>

      {/* Package Content */}
      <div className="pr-8">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-bold text-gray-800">
            {servicePackage.name}
          </h3>
          {servicePackage.discount && servicePackage.discount > 0 && (
            <span className="bg-red-100 text-red-600 text-xs font-medium px-2 py-1 rounded-full">
              -{getDiscountPercentage()}%
            </span>
          )}
        </div>

        {servicePackage.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {servicePackage.description}
          </p>
        )}

        {/* Services List */}
        {servicePackage.services && servicePackage.services.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Dịch vụ bao gồm:</h4>
            <ul className="space-y-1">
              {servicePackage.services.map((service, index) => (
                <li key={index} className="flex items-center text-sm text-gray-600">
                  <Check className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                  <span className="line-clamp-1">{service.name}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Price and Duration */}
        <div className="flex items-center justify-between">
          <div className="flex items-center text-gray-500 text-sm">
            <Clock className="w-4 h-4 mr-1" />
            <span>{formatDuration(servicePackage.duration)}</span>
          </div>
          
          <div className="text-right">
            {getDiscountAmount() > 0 && (
              <div className="text-sm text-gray-500 line-through">
                {formatPrice(getTotalOriginalPrice())}
              </div>
            )}
            <div className="text-xl font-bold text-orange-600">
              {formatPrice(servicePackage.price)}
            </div>
            {getDiscountAmount() > 0 && (
              <div className="text-xs text-green-600">
                Tiết kiệm {formatPrice(getDiscountAmount())}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};