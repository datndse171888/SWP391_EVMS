import { Check } from 'lucide-react';
import type { Package } from '../../types/Service';

interface PackageCardProps {
  package: Package;
  featured?: boolean;
}

export default function PackageCard({ package: pkg, featured = false }: PackageCardProps) {
  return (
    <div className="bg-orange-400 rounded-2xl p-2 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 relative">
      {featured && (
        <div 
          className="absolute -top-2 -right-2 px-4 py-1 rounded-lg text-sm font-bold"
          style={{ 
            backgroundColor: '#f6ae2d',
            color: '#014091'
          }}
        >
          LỰA CHỌN TỐT NHẤT
        </div>
      )}
      
      <div 
        className={`rounded-xl p-8 h-full ${featured ? '' : 'bg-gray-100'}`}
        style={featured ? {
          background: `linear-gradient(135deg, #67a9fd, #8abdfe, #014091)`
        } : {}}
      >
        <h3 
          className={`text-3xl font-bold mb-4 text-center ${featured ? 'text-white' : ''}`}
          style={!featured ? { color: '#014091' } : {}}
        >
          {pkg.name}
        </h3>
        <p className={`mb-6 text-center ${featured ? 'text-white' : 'text-gray-500'}`}>
          {pkg.description}
        </p>
        <div className="mb-6 text-center">
          <span 
            className={`text-5xl font-bold ${featured ? 'text-white' : ''}`}
            style={!featured ? { color: '#014091' } : {}}
          >
            {pkg.price}₫
          </span>
          <span className={`ml-2 ${featured ? 'text-white' : 'text-gray-500'}`}>/lần</span>
        </div>
        <ul className="space-y-4 mb-8">
          {pkg.features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <Check className="w-5 h-5 text-green-500 mr-3" />
              <span className={featured ? 'text-white' : 'text-gray-700'}>{feature}</span>
            </li>
          ))}
        </ul>
        <button
          className="w-full py-3 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg"
          style={featured ? {
            color: '#014091',
            backgroundColor: '#f6ae2d'
          } : {
            color: 'white',
            backgroundColor: '#014091'
          }}
        >
          CHỌN GÓI
        </button>
        <p className={`text-xs mt-4 text-center ${featured ? 'text-white' : 'text-gray-400'}`}>
          *Áp dụng cho tất cả loại xe điện
        </p>
      </div>
    </div>

  );
}


