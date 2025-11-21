import React, { useEffect, useState } from 'react'
import { Check, Package, Wrench, Clock, Repeat } from 'lucide-react'
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

interface ServicePropsExtended extends ServiceProps {
  locked?: boolean;
}

// ================================
// Tab Bar Component
// ================================

interface ServiceTabBarProps {
  activeTab: 'packages' | 'services' | 'packages-periodic' | 'services-periodic';
  onTabChange: (tab: 'packages' | 'services' | 'packages-periodic' | 'services-periodic') => void;
  hasPackages: boolean;
  hasServices: boolean;
  hasPackagesPeriodic: boolean;
  hasServicesPeriodic: boolean;
  packageCount: number;
  serviceCount: number;
  packagePeriodicCount: number;
  servicePeriodicCount: number;
}

const ServiceTabBar: React.FC<ServiceTabBarProps> = ({
  activeTab,
  onTabChange,
  hasPackages,
  hasServices,
  hasPackagesPeriodic,
  hasServicesPeriodic,
  packageCount,
  serviceCount,
  packagePeriodicCount,
  servicePeriodicCount
}) => {
  const tabs = [
    {
      id: 'packages' as const,
      label: 'Gói dịch vụ',
      icon: <Package className="w-5 h-5" />,
      visible: hasPackages,
      count: packageCount
    },
    {
      id: 'services' as const,
      label: 'Dịch vụ đơn lẻ',
      icon: <Wrench className="w-5 h-5" />,
      visible: hasServices,
      count: serviceCount
    },
    {
      id: 'packages-periodic' as const,
      label: 'Gói định kỳ',
      icon: <Repeat className="w-5 h-5" />,
      visible: hasPackagesPeriodic,
      count: packagePeriodicCount
    },
    {
      id: 'services-periodic' as const,
      label: 'Dịch vụ định kỳ',
      icon: <Clock className="w-5 h-5" />,
      visible: hasServicesPeriodic,
      count: servicePeriodicCount
    }
  ];

  const visibleTabs = tabs.filter(tab => tab.visible);

  if (visibleTabs.length === 0) return null;

  return (
    <div className="sticky top-0 z-10 border-b border-gray-200 bg-white mb-8">
      <div className="flex justify-around gap-0 overflow-x-auto scrollbar-hide">
        {visibleTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`relative flex items-center gap-3 px-6 py-4 font-medium text-sm whitespace-nowrap transition-all duration-300 group ${
              activeTab === tab.id
                ? 'text-orange-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {/* Icon */}
            <span className={`transition-all duration-300 ${
              activeTab === tab.id 
                ? 'text-orange-600' 
                : 'text-gray-400 group-hover:text-gray-600'
            }`}>
              {tab.icon}
            </span>

            {/* Label */}
            <span>{tab.label}</span>

            {/* Count Badge */}
            <span className={`inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full text-xs font-bold transition-all duration-300 ${
              activeTab === tab.id
                ? 'bg-orange-100 text-orange-700'
                : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
            }`}>
              {tab.count}
            </span>

            {/* Active Indicator */}
            {activeTab === tab.id && (
              <>
                <span className="ml-1 w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-orange-400"></div>
              </>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

// ================================
// Tab Content Component
// ================================

interface TabContentProps {
  isActive: boolean;
  items: ServiceResponse[] | ServicePackageResponse[];
  type: 'service' | 'package';
  selectedId: string | null;
  selectedType: 'service' | 'package' | null;
  onSelect: (id: string) => void;
  disabled?: boolean;
  icon: React.ReactNode;
  title: string;
  description: string;
  emptyMessage: string;
}

const TabContent: React.FC<TabContentProps> = ({
  isActive,
  items,
  type,
  selectedId,
  selectedType,
  onSelect,
  disabled = false,
  icon,
  title,
  description,
  emptyMessage
}) => {
  if (!isActive) return null;

  if (items.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="flex justify-center mb-4">{icon}</div>
        <p className="text-gray-500 text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          {icon}
          <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
        </div>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {type === 'package' ? (
          (items as ServicePackageResponse[]).map((pkg) => (
            <ServicePackageCard
              key={pkg._id}
              servicePackage={pkg}
              isSelected={selectedId === pkg._id && selectedType === 'package'}
              onSelect={() => onSelect(pkg._id)}
              disabled={disabled}
            />
          ))
        ) : (
          (items as ServiceResponse[]).map((service) => (
            <ServiceCard
              key={service._id}
              service={service}
              isSelected={selectedId === service._id && selectedType === 'service'}
              onSelect={() => onSelect(service._id)}
              disabled={disabled}
            />
          ))
        )}
      </div>
    </div>
  );
};

// ================================
// Main Service Component
// ================================

const Service: React.FC<ServicePropsExtended> = ({
  vehicleCategory,
  formData,
  onNext,
  onPrevious,
  vehicleId,
  locked = false
}) => {
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
  const [activePeriodicKey, setActivePeriodicKey] = useState<string | null>(null);
  const [activeSub, setActiveSub] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'packages' | 'services' | 'packages-periodic' | 'services-periodic'>('packages');

  // ================================
  // UseEffects & CallAPIs
  // ================================

  useEffect(() => {
    fetchServiceData();
  }, [vehicleCategory]);

  useEffect(() => {
    const run = async () => {
      try {
        if (!vehicleId) {
          setActivePeriodicKey(null);
          return;
        }
        const subs = await VehicleApi.getMyPeriodicSubscriptions();
        const items = (subs.data?.items || []) as any[];
        const found = items.find(
          (s) =>
            String(s.vehicleId) === String(vehicleId) &&
            Number(s.remainingVisits) > 0
        );
        if (found) {
          setActiveSub(found);
          setActivePeriodicKey(
            (found.sourceType === 'service' ? 'S:' : 'P:') + found.sourceId
          );
        } else {
          setActiveSub(null);
          setActivePeriodicKey(null);
        }
      } catch {
        setActiveSub(null);
        setActivePeriodicKey(null);
      }
    };
    run();
  }, [vehicleId]);

  const fetchServiceData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const serviceResponse = await ServiceApi.getService(vehicleCategory);
      const servicePackageResponse = await ServicePackageApi.getServicePackage(
        vehicleCategory
      );

      const serviceData: DataResponse<ServiceResponse> = serviceResponse.data;
      const servicePackageData: DataResponse<ServicePackageResponse> =
        servicePackageResponse.data;

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
  const servicesPeriodic = services.filter((s) => (s as any).periodicEnabled);
  const servicesNormal = services.filter((s) => !(s as any).periodicEnabled);
  const packagesPeriodic = servicePackages.filter((p) => (p as any).periodicEnabled);
  const packagesNormal = servicePackages.filter((p) => !(p as any).periodicEnabled);

  // ================================
  // Handlers & Functions
  // ================================

  const handleServiceSelect = (serviceId: string) => {
    if (locked) {
      console.log('Blocked: Cannot select service when locked (periodic booking flow)');
      return;
    }
    const service = services.find((s) => s._id === serviceId);
    if (!service) return;
    const isPeriodic = !!(service as any).periodicEnabled;
    if (activePeriodicKey && isPeriodic) {
      console.log(
        'Blocked: Cannot select periodic service when another periodic is active'
      );
      return;
    }
    setSelectedId(serviceId);
    setSelectedType('service');
  };

  const handlePackageSelect = (packageId: string) => {
    if (locked) {
      console.log('Blocked: Cannot select package when locked (periodic booking flow)');
      return;
    }
    const pkg = servicePackages.find((p) => p._id === packageId);
    if (!pkg) return;
    const isPeriodic = !!(pkg as any).periodicEnabled;
    if (activePeriodicKey && isPeriodic) {
      console.log(
        'Blocked: Cannot select periodic package when another periodic is active'
      );
      return;
    }
    setSelectedId(packageId);
    setSelectedType('package');
  };

  const handleTabChange = (
    tab: 'packages' | 'services' | 'packages-periodic' | 'services-periodic'
  ) => {
    if (locked) return; // khóa tab khi booking theo định kỳ
    setActiveTab(tab);
  };

  const handleNext = () => {
    // Nếu đang đặt lịch theo định kỳ từ Maintenance: bỏ qua chọn dịch vụ
    if (locked) {
      onNext();
      return;
    }
    const isPeriodicSelection =
      selectedType === 'service'
        ? servicesPeriodic.some((s) => s._id === selectedId)
        : packagesPeriodic.some((p) => p._id === selectedId);
    if (activePeriodicKey && isPeriodicSelection) {
      return;
    }
    if (selectedId && selectedType) {
      formData(selectedId, selectedType);
      onNext();
    }
  };

  useEffect(() => {
    const run = async () => {
      try {
        if (!vehicleId || !selectedId || !selectedType) {
          setPeriodicInfo(null);
          return;
        }
        const params =
          selectedType === 'service'
            ? { serviceId: selectedId }
            : { servicePackageId: selectedId };
        const res = await VehicleApi.getVehiclePeriodicStatus(vehicleId, params);
        setPeriodicInfo(res.data);
      } catch (e) {
        setPeriodicInfo(null);
      }
    };
    run();
  }, [vehicleId, selectedId, selectedType]);

  useEffect(() => {
    if (!activePeriodicKey) return;
    if (!selectedId || !selectedType) return;
    let isPeriodicSelection = false;
    if (selectedType === 'service') {
      const service = services.find((s) => s._id === selectedId);
      isPeriodicSelection = service ? !!(service as any).periodicEnabled : false;
    } else {
      const pkg = servicePackages.find((p) => p._id === selectedId);
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
      case 'CAR':
        return 'ô tô điện';
      case 'MOTOBIKE':
        return 'xe máy điện';
      case 'BICYCLE':
        return 'xe đạp điện';
      default:
        return 'xe điện';
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
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-blue-900 mb-4">Chọn dịch vụ</h2>
        <p className="text-gray-600">
          Chọn gói dịch vụ hoặc dịch vụ đơn lẻ phù hợp cho{' '}
          {getVehicleCategoryName()} của bạn
        </p>
      </div>

      {/* Tab Bar - Ẩn khi locked */}
      {!locked && (
        <ServiceTabBar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          hasPackages={packagesNormal.length > 0}
          hasServices={servicesNormal.length > 0}
          hasPackagesPeriodic={packagesPeriodic.length > 0}
          hasServicesPeriodic={servicesPeriodic.length > 0}
          packageCount={packagesNormal.length}
          serviceCount={servicesNormal.length}
          packagePeriodicCount={packagesPeriodic.length}
          servicePeriodicCount={servicesPeriodic.length}
        />
      )}

      {/* Tab Content Panels */}
      {!locked ? (
        <div className="mb-12">
          {/* Service Packages - Non periodic */}
          <TabContent
            isActive={activeTab === 'packages'}
            items={packagesNormal}
            type="package"
            selectedId={selectedId}
            selectedType={selectedType}
            onSelect={handlePackageSelect}
            disabled={false}
            icon={<Package className="w-8 h-8 text-orange-500" />}
            title="Gói dịch vụ"
            description="Những gói dịch vụ toàn diện được thiết kế để tối ưu hóa chi phí bảo trì"
            emptyMessage="Hiện chưa có gói dịch vụ nào"
          />

          {/* Individual Services - Non periodic */}
          <TabContent
            isActive={activeTab === 'services'}
            items={servicesNormal}
            type="service"
            selectedId={selectedId}
            selectedType={selectedType}
            onSelect={handleServiceSelect}
            disabled={false}
            icon={<Wrench className="w-8 h-8 text-blue-500" />}
            title="Dịch vụ đơn lẻ"
            description="Các dịch vụ riêng lẻ giúp bạn chọn chính xác những gì bạn cần"
            emptyMessage="Hiện chưa có dịch vụ đơn lẻ nào"
          />

          {/* Service Packages - Periodic */}
          <TabContent
            isActive={activeTab === 'packages-periodic'}
            items={packagesPeriodic}
            type="package"
            selectedId={selectedId}
            selectedType={selectedType}
            onSelect={handlePackageSelect}
            disabled={!!activePeriodicKey}
            icon={<Repeat className="w-8 h-8 text-green-500" />}
            title="Gói dịch vụ định kỳ"
            description="Các gói bảo dưỡng định kỳ đảm bảo xe của bạn luôn ở trạng thái tốt nhất"
            emptyMessage="Hiện chưa có gói dịch vụ định kỳ nào"
          />

          {/* Individual Services - Periodic */}
          <TabContent
            isActive={activeTab === 'services-periodic'}
            items={servicesPeriodic}
            type="service"
            selectedId={selectedId}
            selectedType={selectedType}
            onSelect={handleServiceSelect}
            disabled={!!activePeriodicKey}
            icon={<Clock className="w-8 h-8 text-purple-500" />}
            title="Dịch vụ đơn lẻ định kỳ"
            description="Các dịch vụ định kỳ được lập lịch tự động theo nhu cầu của bạn"
            emptyMessage="Hiện chưa có dịch vụ đơn lẻ định kỳ nào"
          />
        </div>
      ) : (
        <div className="mb-12 py-12 text-center">
          <div className="flex justify-center mb-4">
            <Package className="w-12 h-12 text-gray-400" />
          </div>
          <p className="text-gray-500 text-lg">
            Bạn đang đặt lịch theo gói/dịch vụ định kỳ. Vui lòng nhấn "Tiếp theo" để chọn ngày giờ.
          </p>
        </div>
      )}

      {(activeSub || locked) && (
        <div className="mt-4 text-sm text-orange-700 bg-orange-50 border border-orange-200 rounded px-3 py-2">
          {locked
            ? 'Bạn đang đặt lịch theo gói/dịch vụ định kỳ đã chọn từ trang Bảo dưỡng định kỳ. Bỏ qua bước chọn dịch vụ và tiếp tục chọn ngày giờ.'
            : `Xe này đang có gói/dịch vụ định kỳ còn hiệu lực (${
                activeSub?.name || '—'
              } - còn ${activeSub?.remainingVisits}/${activeSub?.totalVisits}). Không thể chọn thêm bất kỳ dịch vụ/gói định kỳ nào tại bước này. Vui lòng đặt lịch lần kế tiếp từ trang Bảo dưỡng định kỳ, hoặc chọn gói/dịch vụ không định kỳ.`}
        </div>
      )}

      {/* Selection Summary - Ẩn khi locked */}
      {!locked && selectedId && selectedType && (
        <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg mt-8">
          <div className="flex items-center">
            <Check className="w-5 h-5 text-blue-600 mr-2" />
            <span className="text-blue-800 font-medium">
              Đã chọn: {selectedType === 'package' ? 'Gói dịch vụ' : 'Dịch vụ'} -
              {selectedType === 'package'
                ? servicePackages.find((p) => p._id === selectedId)?.name
                : services.find((s) => s._id === selectedId)?.name}
            </span>
          </div>
          {periodicInfo?.periodicEnabled && (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div className="bg-white rounded border p-2">
                <div className="text-gray-500">Còn lại</div>
                <div className="font-semibold">
                  {periodicInfo.remainingVisits} / {periodicInfo.totalVisits} lần
                </div>
              </div>
              <div className="bg-white rounded border p-2">
                <div className="text-gray-500">Đã dùng</div>
                <div className="font-semibold">{periodicInfo.visitsUsed}</div>
              </div>
              <div className="bg-white rounded border p-2">
                <div className="text-gray-500">Đến hạn kế tiếp</div>
                <div className="font-semibold">
                  {periodicInfo.nextDueDate
                    ? new Date(periodicInfo.nextDueDate).toLocaleDateString(
                        'vi-VN'
                      )
                    : '—'}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6 border-t border-gray-200 mt-8">
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
          disabled={
            !locked && (
              !selectedId ||
              !selectedType ||
              (!!activePeriodicKey &&
                (selectedType === 'service'
                  ? servicesPeriodic.some((s) => s._id === selectedId)
                  : packagesPeriodic.some((p) => p._id === selectedId)))
            )
          }
        >
          Tiếp theo
        </Button>
      </div>

      {/* Add custom animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
};

export default Service;