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
import { VehicleApi } from '../../api/VehicleApi'


interface ServiceProps {
  vehicleCategory: VehicleCategory;
  formData: (selectedId: string, selectedType: 'service' | 'package') => void;
  onNext: () => void;
  onPrevious: () => void;
  vehicleId?: string;
}

// Main Service Component
interface ServicePropsExtended extends ServiceProps {
  locked?: boolean;
}

const Service: React.FC<ServicePropsExtended> = ({ vehicleCategory, formData, onNext, onPrevious, vehicleId, locked = false }) => {
  // ================================
  // UseStates & Variables  
  // ================================

  const [services, setServices] = useState<ServiceResponse[]>([]);
  const [servicePackages, setServicePackages] = useState<ServicePackageResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'service' | 'package' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [periodicInfo, setPeriodicInfo] = useState<any>(null);
  const [activePeriodicKey, setActivePeriodicKey] = useState<string | null>(null); // 'S:<id>' | 'P:<id>'
  const [activeSub, setActiveSub] = useState<any | null>(null);

  // ================================
  // UseEffects & CallAPIs
  // ================================

  useEffect(() => {
    fetchServiceData();
  }, [vehicleCategory]);
  // Load active periodic for this vehicle (remainingVisits>0)
  useEffect(() => {
    const run = async () => {
      try {
        if (!vehicleId) { setActivePeriodicKey(null); return; }
        const subs = await VehicleApi.getMyPeriodicSubscriptions();
        const items = (subs.data?.items || []) as any[];
        const found = items.find(s => String(s.vehicleId) === String(vehicleId) && Number(s.remainingVisits) > 0);
        if (found) {
          setActiveSub(found);
          setActivePeriodicKey((found.sourceType === 'service' ? 'S:' : 'P:') + found.sourceId);
        } else { setActiveSub(null); setActivePeriodicKey(null); }
      } catch { setActiveSub(null); setActivePeriodicKey(null); }
    };
    run();
  }, [vehicleId]);


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
  // Split into 4 groups
  const servicesPeriodic = services.filter(s => (s as any).periodicEnabled);
  const servicesNormal = services.filter(s => !(s as any).periodicEnabled);
  const packagesPeriodic = servicePackages.filter(p => (p as any).periodicEnabled);
  const packagesNormal = servicePackages.filter(p => !(p as any).periodicEnabled);


  // ================================
  // Handlers & Functions
  // ================================

  const handleServiceSelect = (serviceId: string) => {
    // Only block if selecting a periodic service when another periodic is active
    const service = services.find(s => s._id === serviceId);
    if (!service) return; // Service not found
    const isPeriodic = !!(service as any).periodicEnabled;
    if (activePeriodicKey && isPeriodic) {
      console.log('Blocked: Cannot select periodic service when another periodic is active');
      return; // block selecting periodic when active exists
    }
    console.log('Selecting service:', serviceId, 'isPeriodic:', isPeriodic, 'activePeriodicKey:', activePeriodicKey);
    setSelectedId(serviceId);
    setSelectedType('service');
  };

  const handlePackageSelect = (packageId: string) => {
    // Only block if selecting a periodic package when another periodic is active
    const pkg = servicePackages.find(p => p._id === packageId);
    if (!pkg) return; // Package not found
    const isPeriodic = !!(pkg as any).periodicEnabled;
    if (activePeriodicKey && isPeriodic) {
      console.log('Blocked: Cannot select periodic package when another periodic is active');
      return; // block selecting periodic when active exists
    }
    console.log('Selecting package:', packageId, 'isPeriodic:', isPeriodic, 'activePeriodicKey:', activePeriodicKey);
    setSelectedId(packageId);
    setSelectedType('package');
  };

  const handleNext = () => {
    // Block if trying to proceed with a periodic selection while another is active
    const isPeriodicSelection = selectedType === 'service'
      ? servicesPeriodic.some(s => s._id === selectedId)
      : packagesPeriodic.some(p => p._id === selectedId);
    if (activePeriodicKey && isPeriodicSelection) {
      return; // no-op
    }
    if (selectedId && selectedType) {
      formData(selectedId, selectedType);
      onNext();
    }
  };

  // Fetch periodic status for current selection
  useEffect(() => {
    const run = async () => {
      try {
        if (!vehicleId || !selectedId || !selectedType) { setPeriodicInfo(null); return; }
        const params = selectedType === 'service' ? { serviceId: selectedId } : { servicePackageId: selectedId };
        const res = await VehicleApi.getVehiclePeriodicStatus(vehicleId, params);
        setPeriodicInfo(res.data);
      } catch (e) {
        setPeriodicInfo(null);
      }
    };
    run();
  }, [vehicleId, selectedId, selectedType]);

  // If activePeriodicKey becomes true while a periodic item is selected, clear selection
  useEffect(() => {
    if (!activePeriodicKey) return;
    if (!selectedId || !selectedType) return;
    let isPeriodicSelection = false;
    if (selectedType === 'service') {
      const service = services.find(s => s._id === selectedId);
      isPeriodicSelection = service ? !!(service as any).periodicEnabled : false;
    } else {
      const pkg = servicePackages.find(p => p._id === selectedId);
      isPeriodicSelection = pkg ? !!(pkg as any).periodicEnabled : false;
    }
    if (isPeriodicSelection) {
      setSelectedId(null);
      setSelectedType(null);
      setPeriodicInfo(null);
    }
  }, [activePeriodicKey, selectedId, selectedType, services, servicePackages]);

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

      {/* Service Packages - Non periodic */}
      {packagesNormal.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-800">Gói dịch vụ</h3>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packagesNormal.map((pkg) => (
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

      {/* Individual Services - Non periodic */}
      {servicesNormal.length > 0 && (
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Dịch vụ đơn lẻ</h3>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {servicesNormal.map((service) => (
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

      {/* Service Packages - Periodic */}
      {packagesPeriodic.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-800">Gói dịch vụ định kỳ</h3>
            <span className="ml-3 bg-green-100 text-green-700 text-sm font-medium px-3 py-1 rounded-full">Định kỳ</span>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packagesPeriodic.map((pkg) => (
              <ServicePackageCard
                key={pkg._id}
                servicePackage={pkg}
                isSelected={selectedId === pkg._id && selectedType === 'package'}
                onSelect={() => handlePackageSelect(pkg._id)}
                disabled={!!activePeriodicKey}
              />
            ))}
          </div>
        </div>
      )}

      {/* Individual Services - Periodic */}
      {servicesPeriodic.length > 0 && (
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Dịch vụ đơn lẻ định kỳ</h3>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {servicesPeriodic.map((service) => (
              <ServiceCard
                key={service._id}
                service={service}
                isSelected={selectedId === service._id && selectedType === 'service'}
                onSelect={() => handleServiceSelect(service._id)}
                disabled={!!activePeriodicKey}
              />
            ))}
          </div>
        </div>
      )}

      {(activeSub || locked) && (
        <div className="mt-4 text-sm text-orange-700 bg-orange-50 border border-orange-200 rounded px-3 py-2">
          {locked
            ? 'Bạn đang đặt lịch theo gói/dịch vụ định kỳ đã chọn từ trang Bảo dưỡng định kỳ. Bỏ qua bước chọn dịch vụ và tiếp tục chọn ngày giờ.'
            : `Xe này đang có gói/dịch vụ định kỳ còn hiệu lực (${activeSub?.name || '—'} - còn ${activeSub?.remainingVisits}/${activeSub?.totalVisits}). Không thể chọn thêm bất kỳ dịch vụ/gói định kỳ nào tại bước này. Vui lòng đặt lịch lần kế tiếp từ trang Bảo dưỡng định kỳ, hoặc chọn gói/dịch vụ không định kỳ.`}
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
          {periodicInfo?.periodicEnabled && (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div className="bg-white rounded border p-2">
                <div className="text-gray-500">Còn lại</div>
                <div className="font-semibold">{periodicInfo.remainingVisits} / {periodicInfo.totalVisits} lần</div>
              </div>
              <div className="bg-white rounded border p-2">
                <div className="text-gray-500">Đã dùng</div>
                <div className="font-semibold">{periodicInfo.visitsUsed}</div>
              </div>
              <div className="bg-white rounded border p-2">
                <div className="text-gray-500">Đến hạn kế tiếp</div>
                <div className="font-semibold">{periodicInfo.nextDueDate ? new Date(periodicInfo.nextDueDate).toLocaleDateString('vi-VN') : '—'}</div>
              </div>
            </div>
          )}
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
          disabled={!selectedId || !selectedType || (!!activePeriodicKey && (
            selectedType === 'service' ? servicesPeriodic.some(s => s._id === selectedId) : packagesPeriodic.some(p => p._id === selectedId)
          ))}
        >
          Tiếp theo
        </Button>
      </div>
    </>
  );
};

export default Service;