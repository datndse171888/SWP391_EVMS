import { Check, Clock } from "lucide-react";
import type { ServiceResponse } from "../../types/Service";
import type { ServicePackageResponse } from "../../types/ServicePackage";
import { formatDuration, formatPrice } from "../../utils/DataFormat";
import { useState } from "react";

// =======================================
// Service Card Component
// =======================================

interface ServiceCardProps {
  service: ServiceResponse;
  isSelected: boolean;
  onSelect: () => void;
  disabled?: boolean;
}

// Service Card Component
export const ServiceCard: React.FC<ServiceCardProps> = ({ service, isSelected, onSelect, disabled = false }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Truncate text function
  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div
      className={`relative bg-white rounded-lg shadow-md transition-all duration-300 border-2 h-full flex flex-col ${
        disabled 
          ? 'opacity-60 cursor-not-allowed border-gray-200' 
          : 'cursor-pointer hover:shadow-lg hover:-translate-y-1'
      } ${
        isSelected && !disabled 
          ? 'border-orange-500 bg-orange-50 shadow-lg' 
          : (!disabled ? 'border-gray-200 hover:border-orange-300' : '')
      }`}
      onClick={() => !disabled && onSelect()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Selection Circle */}
      <div className="absolute top-4 right-4 z-10">
        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
          (isSelected && !disabled)
            ? 'border-orange-500 bg-orange-500'
            : 'border-gray-300 bg-white hover:border-orange-300'
        }`}>
          {(isSelected && !disabled) && (
            <Check className="w-4 h-4 text-white" />
          )}
        </div>
      </div>

      {/* Service Content */}
      <div className="p-6 flex-1 flex flex-col">
        {/* Service Name */}
        <div className="mb-3 h-6 flex items-start">
          <h3 
            className={`font-semibold text-gray-800 leading-tight transition-all duration-300 ${
              isHovered ? 'overflow-visible' : 'overflow-hidden'
            }`}
            style={{
              display: isHovered ? 'block' : '-webkit-box',
              WebkitLineClamp: isHovered ? 'unset' : 2,
              WebkitBoxOrient: 'vertical',
              lineHeight: '1.4em',
              maxHeight: isHovered ? 'none' : '2.8em'
            }}
            title={service.name}
          >
            {isHovered ? service.name : truncateText(service.name || '', 50)}
          </h3>
        </div>

        {/* Service Description */}
        <div className="mb-2 mt-3 flex-1 min-h-[10px] flex items-start">
          <p 
            className={`text-gray-600 text-sm leading-relaxed transition-all duration-300 ${
              isHovered ? 'overflow-visible' : 'overflow-hidden'
            }`}
            style={{
              display: isHovered ? 'block' : '-webkit-box',
              WebkitLineClamp: isHovered ? 'unset' : 3,
              WebkitBoxOrient: 'vertical',
              lineHeight: '1.5em',
              maxHeight: isHovered ? 'none' : '4.5em'
            }}
            title={service.description}
          >
            {isHovered 
              ? service.description 
              : truncateText(service.description || 'Không có mô tả chi tiết.', 100)
            }
          </p>
        </div>

        {/* Price and Duration - Always at bottom */}
        <div className="mt-auto ">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-gray-500 text-sm">
              <Clock className="w-4 h-4 mr-1 flex-shrink-0" />
              <span className="font-medium">{formatDuration(service.duration)}</span>
            </div>

            <div className="text-right">
              <span className="text-lg font-bold text-orange-600">
                {formatPrice(service.price)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// =======================================
// Service Package Card Component - Updated
// =======================================

interface ServicePackageCardProps {
  servicePackage: ServicePackageResponse;
  isSelected: boolean;
  onSelect: () => void;
  disabled?: boolean;
}

// Service Package Card Component  
export const ServicePackageCard: React.FC<ServicePackageCardProps> = ({ 
  servicePackage, 
  isSelected, 
  onSelect, 
  disabled = false 
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const formatPriceLocal = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDurationLocal = (duration: number) => {
    if (duration >= 60) {
      const hours = Math.floor(duration / 60);
      const minutes = duration % 60;
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
    return `${duration}m`;
  };

  const getFinalPrice = () => {
    return servicePackage.price - getDiscountAmount();
  };

  const getDiscountAmount = () => {
    return servicePackage.price * (servicePackage.discount ? servicePackage.discount / 100 : 0);
  }

  // Truncate text function
  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div
      className={`relative bg-white rounded-lg shadow-md transition-all duration-500 border-2 h-full flex flex-col ${
        disabled 
          ? 'opacity-60 cursor-not-allowed border-gray-200' 
          : 'cursor-pointer hover:shadow-2xl'
      } ${
        isSelected && !disabled 
          ? 'border-orange-500 bg-orange-50 shadow-lg' 
          : (!disabled ? 'border-gray-200 hover:border-orange-300' : '')
      } ${
        isHovered && !disabled 
          ? 'transform scale-110 z-20 hover:-translate-y-2' 
          : 'transform scale-100 hover:-translate-y-1'
      }`}
      style={{
        transformOrigin: 'center center',
        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
      onClick={() => !disabled && onSelect()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Selection Circle */}
      <div className="absolute top-4 right-4 z-10">
        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
          (isSelected && !disabled)
            ? 'border-orange-500 bg-orange-500'
            : 'border-gray-300 bg-white hover:border-orange-300'
        }`}>
          {(isSelected && !disabled) && (
            <Check className="w-4 h-4 text-white" />
          )}
        </div>
      </div>

      {/* Package Content */}
      <div className="p-6 flex-1 flex flex-col">
        {/* Package Header */}
        <div className="flex items-end justify-between mb-3 min-h-[32px]">
          <div className="flex-1 pr-2">
            <h3 
              className={`font-bold text-gray-800 leading-tight transition-all duration-300 ${
                isHovered ? 'overflow-visible' : 'overflow-hidden'
              }`}
              style={{
                display: isHovered ? 'block' : '-webkit-box',
                WebkitLineClamp: isHovered ? 'unset' : 2,
                WebkitBoxOrient: 'vertical',
                lineHeight: '1.4em',
                maxHeight: isHovered ? 'none' : '2.8em'
              }}
              title={servicePackage.name}
            >
              {isHovered ? servicePackage.name : truncateText(servicePackage.name || '', 45)}
            </h3>
          </div>
          
          {servicePackage.discount && servicePackage.discount > 0 && (
            <span className="bg-red-100 text-red-600 text-xs font-medium px-2 py-1 rounded-full flex-shrink-0">
              -{servicePackage.discount}%
            </span>
          )}
        </div>

        {/* Package Description */}
        {servicePackage.description && (
          <div className="mb-4 min-h-[25px] flex items-start">
            <p 
              className={`text-gray-600 text-sm leading-relaxed transition-all duration-300 ${
                isHovered ? 'overflow-visible' : 'overflow-hidden'
              }`}
              style={{
                display: isHovered ? 'block' : '-webkit-box',
                WebkitLineClamp: isHovered ? 'unset' : 2,
                WebkitBoxOrient: 'vertical',
                lineHeight: '1.5em',
                maxHeight: isHovered ? 'none' : '3em'
              }}
              title={servicePackage.description}
            >
              {isHovered 
                ? servicePackage.description 
                : truncateText(servicePackage.description, 80)
              }
            </p>
          </div>
        )}

        {/* Services Count & List - Hidden by default, shows on hover */}
        {servicePackage.services && servicePackage.services.length > 0 && (
          <div className="flex-1">
            
            {/* Services list - only shows on hover */}
            <div 
              className={`transition-all duration-500 ease-in-out ${
                isHovered 
                  ? 'max-h-96 opacity-100 visible transform translate-y-0' 
                  : 'max-h-0 opacity-0 invisible transform -translate-y-2'
              } overflow-hidden`}
            >
              {isHovered && (
                <div className="bg-gradient-to-br from-blue-50 to-orange-50 rounded-lg p-3 border border-blue-100">
                  <ul className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    {servicePackage.services.map((service, index) => (
                      <li key={index} className="flex items-start text-sm text-gray-700 hover:text-gray-900 transition-colors">
                        <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <span className="font-medium leading-tight block">
                            {(service as ServiceResponse).name}
                          </span>
                          {(service as ServiceResponse).description && (
                            <span className="text-xs text-gray-500 block mt-1">
                              {truncateText((service as ServiceResponse).description || '', 60)}
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            {/* Placeholder when not hovered */}
            {!isHovered && (
              <div className="bg-gray-50 rounded-lg p-3 border border-dashed border-gray-200">
                <div className="text-center text-gray-400 text-sm">
                  <span className="text-xs mt-1 block">Hover để xem chi tiết</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Price and Duration - Always at bottom */}
        <div className="mt-auto pt-4 border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-gray-500 text-sm">
              <Clock className="w-4 h-4 mr-1 flex-shrink-0" />
              <span className="font-medium">{formatDurationLocal(servicePackage.duration)}</span>
            </div>

            <div className="text-right">
              {getDiscountAmount() > 0 && (
                <div className="text-sm text-gray-400 line-through">
                  {formatPriceLocal(servicePackage.price)}
                </div>
              )}
              <div className="text-lg font-bold text-orange-600">
                {formatPriceLocal(getFinalPrice())}
              </div>
            </div>
          </div>
          
          {getDiscountAmount() > 0 && (
            <div className="text-right">
              <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                Tiết kiệm {formatPriceLocal(getDiscountAmount())}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Hover indicator overlay */}
      {isHovered && (
        <div className="absolute inset-0 border-2 border-orange-400 rounded-lg pointer-events-none bg-gradient-to-br from-orange-50/30 to-blue-50/30"></div>
      )}
    </div>
  );
};
