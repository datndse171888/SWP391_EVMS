// src/pages/booking/Service.tsx
import React, { useEffect, useState } from 'react'
import { Check } from 'lucide-react'
import type { ServiceResponse } from '../../types/Service'
import type { ServicePackageResponse } from '../../types/ServicePackage'
import type { VehicleCategory } from '../../types/Vehicle'
import { Button } from '../../components/ui/Button'
import { Loading } from '../../components/Loading'
import { ServicePackageCard, ServiceCard } from '../../components/ui/Card'
import { ServiceApi } from '../../api/ServiceApi'
import { ServicePackageApi } from '../../api/ServicePackageApi'
import type { DataResponse } from '../../types/DataResponse'


interface ServiceProps {
  vehicleCategory: VehicleCategory;
  formData: (selectedId: string, selectedType: 'service' | 'package') => void;
  onNext: () => void;
  onPrevious: () => void;
}

// Main Service Component
const Service: React.FC<ServiceProps> = ({ vehicleCategory, formData, onNext, onPrevious }) => {
  // ================================
  // UseStates & Variables  
  // ================================

  const [services, setServices] = useState<ServiceResponse[]>([]);
  const [servicePackages, setServicePackages] = useState<ServicePackageResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'service' | 'package' | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ================================
  // UseEffects & CallAPIs
  // ================================

  useEffect(() => {
    fetchServiceData();
  }, [vehicleCategory]);

  const fetchServiceData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const serviceResponse = await ServiceApi.getService(vehicleCategory);
      const servicePackageResponse = await ServicePackageApi.getServicePackage(vehicleCategory);

      const serviceData: DataResponse<ServiceResponse> = serviceResponse.data;
      const servicePackageData: DataResponse<ServicePackageResponse> = servicePackageResponse.data;

      setServices(serviceData.items || []);
      setServicePackages(servicePackageData.items || []);

    } catch (error: any) {
      console.error('Error fetching service data:', error);
      setError('Không thể tải danh sách dịch vụ. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  // ================================
  // Handlers & Functions
  // ================================

  const handleServiceSelect = (serviceId: string) => {
    setSelectedId(serviceId);
    setSelectedType('service');
  };

  const handlePackageSelect = (packageId: string) => {
    setSelectedId(packageId);
    setSelectedType('package');
  };

  const handleNext = () => {
    if (selectedId && selectedType) {
      formData(selectedId, selectedType);
      onNext();
    }
  };

  const getVehicleCategoryName = () => {
    switch (vehicleCategory) {
      case 'CAR': return 'ô tô điện';
      case 'MOTOBIKE': return 'xe máy điện';
      case 'BICYCLE': return 'xe đạp điện';
      default: return 'xe điện';
    }
  };

  // ================================
  // Render
  // ================================

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error}</div>
        <Button
          variant="outline"
          size="sm"
          type="button"
          onClick={fetchServiceData}
        >
          Thử lại
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-blue-900 mb-4">Chọn dịch vụ</h2>
        <p className="text-gray-600">
          Chọn gói dịch vụ hoặc dịch vụ đơn lẻ phù hợp cho {getVehicleCategoryName()} của bạn
        </p>
      </div>

      {/* Service Packages Section */}
      {servicePackages.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-800">Gói dịch vụ</h3>
            <span className="ml-3 bg-orange-100 text-orange-600 text-sm font-medium px-3 py-1 rounded-full">
              Tiết kiệm hơn
            </span>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {servicePackages.map((pkg) => (
              <ServicePackageCard
                key={pkg._id}
                servicePackage={pkg}
                isSelected={selectedId === pkg._id && selectedType === 'package'}
                onSelect={() => handlePackageSelect(pkg._id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Individual Services Section */}
      {services.length > 0 && (
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Dịch vụ đơn lẻ</h3>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <ServiceCard
                key={service._id}
                service={service}
                isSelected={selectedId === service._id && selectedType === 'service'}
                onSelect={() => handleServiceSelect(service._id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Selection Summary */}
      {selectedId && selectedType && (
        <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <Check className="w-5 h-5 text-blue-600 mr-2" />
            <span className="text-blue-800 font-medium">
              Đã chọn: {selectedType === 'package' ? 'Gói dịch vụ' : 'Dịch vụ'} -
              {selectedType === 'package'
                ? servicePackages.find(p => p._id === selectedId)?.name
                : services.find(s => s._id === selectedId)?.name
              }
            </span>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6 border-t border-gray-200">
        <Button
          variant="outline"
          size="sm"
          type="button"
          onClick={onPrevious}
        >
          Quay lại
        </Button>

        <Button
          variant="primary"
          size="sm"
          type="button"
          onClick={handleNext}
          disabled={!selectedId || !selectedType}
        >
          Tiếp theo
        </Button>
      </div>
    </>
  );
};

export default Service;