import { Clock } from 'lucide-react';
import type { IndividualService } from '../../types/Service';

interface ServiceCardProps {
  service: IndividualService;
}

export default function ServiceCard({ service }: ServiceCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <h4 className="text-lg font-bold text-slate-900">{service.name}</h4>
        <span className="text-2xl font-bold text-blue-600">{service.price}₫</span>
      </div>
      <p className="text-slate-600 mb-4">{service.description}</p>
      <div className="flex items-center gap-2 text-slate-500 text-sm">
        <Clock size={16} />
        <span>{service.duration}</span>
      </div>
    </div>
  );
}
