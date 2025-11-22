import { useState, useEffect } from 'react';
import type { ServiceResponse } from '../../types/Service';
import ServiceBg from '../../assets/images/service.png';
import { PackageCard } from './PackageCard';
import { ServiceCard } from './ServiceCard';
import { ServiceDetailModal } from './ServiceDetailModal';
import { PackageDetailModal } from './PackageDetailModal';
import type { ServicePackageResponse } from '../../types/ServicePackage';
import { samplePackages, sampleServices } from '../../constants/mockdata/Service';
import { ServicePackageApi } from '../../api/ServicePackageApi';
import { ServiceApi } from '../../api/ServiceApi';
import { Car, Box, Wrench, Repeat, Clock } from 'lucide-react'

export const CarService: React.FC = () => {
    const [packages, setPackages] = useState<ServicePackageResponse[]>([]);
    const [services, setServices] = useState<ServiceResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedService, setSelectedService] = useState<ServiceResponse | null>(null);
    const [selectedPackage, setSelectedPackage] = useState<ServicePackageResponse | null>(null);
    const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
    const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState<string>('');

    const [activeTab, setActiveTab] = useState<'packages' | 'services' | 'packages-periodic' | 'services-periodic'>('packages')

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [packageResponse, serviceResponse] = await Promise.all([
                ServicePackageApi.getAllServicePackagesByVehicleCategory('CAR'),
                ServiceApi.getServiceByVehicleCategory('CAR')
            ]);

            const mappedPackages: ServicePackageResponse[] = (packageResponse.data.items || []).map((pkg: any) => ({
                _id: pkg._id || String(pkg.id || ''),
                name: pkg.name || '',
                description: pkg.description || '',
                vehicleCategory: pkg.vehicleCategory || 'CAR',
                price: typeof pkg.price === 'number' ? pkg.price : 0,
                duration: typeof pkg.duration === 'number' ? pkg.duration : 0,
                discount: typeof pkg.discount === 'number' ? pkg.discount : 0,
                status: pkg.status || 'active',
                services: Array.isArray(pkg.services) ? pkg.services.map((svc: any) => ({
                    _id: svc._id || svc.id || '',
                    name: svc.name || '',
                    price: typeof svc.price === 'number' ? svc.price : 0,
                    vehicleCategory: svc.vehicleCategory || 'CAR',
                    duration: typeof svc.duration === 'number' ? svc.duration : 0,
                    description: svc.description || '',
                    image: svc.image || ''
                })) : [],
                createAt: pkg.createAt || pkg.createdAt || new Date().toISOString(),
                updateAt: pkg.updateAt || pkg.updatedAt || new Date().toISOString()
            }));

            // normalize service items safely
            const serviceItems = serviceResponse?.data?.items || [];
            const mappedServices: ServiceResponse[] = (Array.isArray(serviceItems) ? serviceItems : []).reduce<ServiceResponse[]>((acc, svc: any) => {
                if (!svc || !svc._id) {
                    console.warn('Invalid service data, skipping:', svc);
                    return acc;
                }
                acc.push({
                    _id: String(svc._id),
                    name: svc.name || '',
                    price: typeof svc.price === 'number' ? svc.price : 0,
                    vehicleCategory: svc.vehicleCategory || 'CAR',
                    duration: typeof svc.duration === 'number' ? svc.duration : 0,
                    description: svc.description || '',
                    image: svc.image || '',
                    periodicEnabled: svc.periodicEnabled || false,
                    intervalMonths: svc.intervalMonths,
                    defaultTotalVisits: svc.defaultTotalVisits
                });
                return acc;
            }, []);

            setPackages(mappedPackages);
            setServices(mappedServices);
        } catch (error: any) {
            console.error('Error fetching data:', error);
            setError(error?.message || 'Có lỗi xảy ra khi tải dữ liệu');
            setPackages(samplePackages);
            setServices(sampleServices);
        } finally {
            setLoading(false);
        }
    };

    // --- TabBar + TabContent inline components (match Service.tsx style) ---
    const ServiceTabBar: React.FC = () => {
        const tabs = [
            { id: 'packages' as const, label: 'Gói dịch vụ', icon: <Box className="w-5 h-5" />, visible: packages.length > 0, count: packages.length },
            { id: 'services' as const, label: 'Dịch vụ đơn lẻ', icon: <Wrench className="w-5 h-5" />, visible: services.length > 0, count: services.length },
            { id: 'packages-periodic' as const, label: 'Gói định kỳ', icon: <Repeat className="w-5 h-5" />, visible: false, count: 0 },
            { id: 'services-periodic' as const, label: 'Dịch vụ định kỳ', icon: <Clock className="w-5 h-5" />, visible: false, count: 0 },
        ];
        const visibleTabs = tabs.filter(t => t.visible);
        if (visibleTabs.length === 0) return null;
    };

    const TabContent: React.FC<{
        isActive: boolean;
        type: 'package' | 'service';
        title?: string;
        description?: string;
    }> = ({ isActive, type, title, description }) => {
        if (!isActive) return null;

        if ((type === 'package' ? packages : services).length === 0) {
            return (
                <div className="py-12 text-center">
                    <div className="flex justify-center mb-4">{type === 'package' ? <Box className="w-8 h-8 text-orange-500" /> : <Wrench className="w-8 h-8 text-blue-500" />}</div>
                    <p className="text-gray-500 text-lg">Hiện chưa có {type === 'package' ? 'gói dịch vụ' : 'dịch vụ'} nào</p>
                </div>
            );
        }

        const items = type === 'package' ? packages : services;
        const filtered = searchTerm.trim() === '' ? items : items.filter((it: any) => (it.name || '').toLowerCase().includes(searchTerm.toLowerCase()));

        return (
            <div className="animate-fadeIn">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                    {filtered.map((it: any) => (
                        type === 'package'
                            ? <PackageCard key={it._id} package={it} onViewDetail={() => { setSelectedPackage(it); setIsPackageModalOpen(true); }} />
                            : <ServiceCard key={it._id} service={it} onViewDetail={() => { setSelectedService(it); setIsServiceModalOpen(true); }} />
                    ))}
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="text-center text-slate-600">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
                    <p className="mt-4">Đang tải dịch vụ...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="text-center text-red-600">
                    <p className="text-lg font-semibold">{error}</p>
                    <button
                        onClick={fetchData}
                        className="mt-4 px-6 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800"
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-white">
            <div className="relative z-10">
                <section className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8" style={{ backgroundImage: `url(${ServiceBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                    <div className="absolute inset-0 bg-black/50"></div>
                    <div className="relative z-10 max-w-4xl mx-auto text-center">
                        <div className="flex justify-center mb-6 mt-5">
                            <Car className="h-16 w-16 text-white drop-shadow-lg" />
                        </div>
                        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
                            <span className="text-white block">Dịch vụ bảo dưỡng xe ô tô</span>
                        </h1>
                        <p className="text-xl text-white mb-8 max-w-3xl mx-auto drop-shadow-md">
                            Giữ cho chiếc xe ô tô của bạn luôn trong tình trạng tốt nhất với các gói dịch vụ và bảo dưỡng cá nhân của chúng tôi.
                        </p>
                    </div>
                </section>

                {/* Tab bar like Service.tsx */}
                <div className="bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <ServiceTabBar />
                    </div>
                </div>

                {/* Search + small pill controls */}
                <section className="pt-8 px-4 sm:px-6 lg:px-8 bg-white">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex flex-col md:flex-row gap-4 ">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm dịch vụ..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full px-6 py-4 pl-12 text-lg border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-lg"
                                />
                                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                                    <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                            </div>

                            <div className="flex bg-gray-100 rounded-full p-1 shadow-lg">
                                <button
                                    className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${activeTab === 'packages' ? 'bg-orange-500 text-white hover:bg-orange-600' : 'text-gray-600 hover:bg-white hover:text-orange-500'}`}
                                    onClick={() => setActiveTab('packages')}
                                >
                                    Gói dịch vụ
                                </button>
                                <button
                                    className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${activeTab === 'services' ? 'bg-orange-500 text-white hover:bg-orange-600' : 'text-gray-600 hover:bg-white hover:text-orange-500'}`}
                                    onClick={() => setActiveTab('services')}
                                >
                                    Dịch vụ đơn
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Tab contents */}
                <section className={`py-16 ${activeTab === 'packages' ? 'bg-white' : 'bg-gray-100'}`}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-8">
                            <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-4 inline-block px-4 py-2">
                                {activeTab === 'packages' && <span className="border-b-8 border-orange-500 rounded-xl px-4 py-2">Gói dịch vụ</span>}
                                {activeTab === 'services' && <span className="border-b-8 border-orange-500 rounded-xl px-4 py-2">Dịch vụ đơn</span>}
                            </h2>
                        </div>

                        <TabContent isActive={activeTab === 'packages'} type="package"  />
                        <TabContent isActive={activeTab === 'services'} type="service"  />
                    </div>
                </section>
            </div>

            {/* Modals */}
            <ServiceDetailModal
                isOpen={isServiceModalOpen}
                onClose={() => setIsServiceModalOpen(false)}
                service={selectedService}
            />
            <PackageDetailModal
                isOpen={isPackageModalOpen}
                onClose={() => setIsPackageModalOpen(false)}
                package={selectedPackage}
            />

            <style>{`
                @keyframes fadeIn {
                  from { opacity: 0; transform: translateY(10px); }
                  to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn { animation: fadeIn 0.25s ease-in-out; }
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}

export default CarService;
