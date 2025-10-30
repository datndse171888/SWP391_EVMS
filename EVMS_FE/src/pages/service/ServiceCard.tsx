import { Clock, ImageIcon } from 'lucide-react';
import type React from 'react';
import type { ServiceResponse } from '../../types/Service';

interface ServiceCardProps {
  service: ServiceResponse;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  const priceFormatted = new Intl.NumberFormat('vi-VN').format(Number(service.price ?? 0));
  const initials = String(service.name || '?').trim().split(' ').slice(0,2).map(s => s[0]).join('').toUpperCase();

  return (
    <article
      className="group relative bg-white rounded-2xl shadow-md hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 overflow-hidden border border-transparent hover:border-orange-100"
      role="article"
      aria-labelledby={`svc-${service._id}-title`}
    >
      {/* Top band / image */}
      <div className="relative h-40 bg-gradient-to-r from-orange-50 to-white">
        {service.image ? (
          <img
            src={service.image}
            alt={service.name}
            className="absolute inset-0 w-full h-full object-cover opacity-95"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-orange-100 to-blue-50">
            <div className="flex items-center justify-center w-20 h-20 rounded-xl bg-gradient-to-br from-orange-400 to-blue-500 text-white text-2xl font-extrabold shadow-lg">
              {initials}
            </div>
          </div>
        )}

        {/* category badge */}
        <span className="absolute top-3 right-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/90 text-orange-600 shadow-sm">
          {service.vehicleCategory ?? '—'}
        </span>
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h4 id={`svc-${service._id}-title`} className="text-lg lg:text-xl font-extrabold text-slate-900 break-words">
              {service.name}
            </h4>
            <div className="mt-2 text-sm text-slate-600 line-clamp-2">
              {service.description || 'Không có mô tả.'}
            </div>
          </div>

          <div className="flex-shrink-0 ml-4 text-right">
            <div className="inline-flex items-center gap-1 px-3 py-2 rounded-full bg-white text-orange-600 font-extrabold text-lg lg:text-2xl shadow">
              {priceFormatted}₫
            </div>
            <div className="mt-1 text-xs text-slate-500">Giá đã bao gồm VAT</div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 bg-white/90 px-3 py-1 rounded-full shadow-sm text-sm text-slate-700">
              <Clock size={16} />
              <span className="font-medium">{service.duration} phút</span>
            </div>
          </div>
        </div>

        
      </div>

      {/* decorative accent */}
      <div className="pointer-events-none absolute -right-10 -top-10 w-36 h-36 rounded-full bg-gradient-to-br from-orange-200 to-transparent opacity-40 blur-2xl transform rotate-12" />
    </article>
  );
};

export default ServiceCard;