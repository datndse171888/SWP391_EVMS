import { useState, useEffect } from 'react';
import type { ServiceResponse } from '../../types/Service';
import { Car } from 'lucide-react';
import Clean from '../../assets/images/clean.png';
import { PackageCard } from './PackageCard';
import { ServiceCard } from './ServiceCard';
import { ServiceDetailModal } from './ServiceDetailModal';
import { PackageDetailModal } from './PackageDetailModal';
import type { ServicePackageResponse } from '../../types/ServicePackage';
import { samplePackages, sampleServices } from '../../constants/mockdata/Service';
import { ServicePackageApi } from '../../api/ServicePackageApi';
import { ServiceApi } from '../../api/ServiceApi';

export const CarService: React.FC = () => {
    const [packages, setPackages] = useState<ServicePackageResponse[]>([]);
    const [services, setServices] = useState<ServiceResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedService, setSelectedService] = useState<ServiceResponse | null>(null);
    const [selectedPackage, setSelectedPackage] = useState<ServicePackageResponse | null>(null);
    const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
    const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Fetch packages and services in parallel
            const [packageResponse, serviceResponse] = await Promise.all([
                ServicePackageApi.getAllServicePackagesByVehicleCategory('CAR'),
                ServiceApi.getServiceByVehicleCategory('CAR')
            ]);

            // Map package data to match ServicePackageResponse type
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

            // Map service data to match ServiceResponse type
            const serviceItems = serviceResponse?.data?.items || [];
            
            if (serviceItems.length === 0) {
                console.warn('No services found for CAR category. Response:', serviceResponse);
            }
            
            const mappedServices: ServiceResponse[] = serviceItems.map((svc: any) => {
                if (!svc || !svc._id) {
                    console.warn('Invalid service data:', svc);
                    return null;
                }
                return {
                    _id: svc._id || String(svc.id || ''),
                    name: svc.name || '',
                    price: typeof svc.price === 'number' ? svc.price : 0,
                    vehicleCategory: svc.vehicleCategory || 'CAR',
                    duration: typeof svc.duration === 'number' ? svc.duration : 0,
                    description: svc.description || '',
                    image: svc.image || ''
                };
            }).filter((svc): svc is ServiceResponse => svc !== null);
            setPackages(mappedPackages);
            setServices(mappedServices);
        } catch (error: any) {
            console.error('Error fetching data:', error);
            setError(error?.message || 'Có lỗi xảy ra khi tải dữ liệu');
            // Fallback to sample data on error
            setPackages(samplePackages);
            setServices(sampleServices);
        } finally {
            setLoading(false);
        }
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
        <div className="relative min-h-screen bg-gray-900">
            <div className="relative z-10">
                {/* Hero Section */}
                <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8" style={{ backgroundImage: `url(${Clean})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="flex justify-center mb-6 mt-5">
                            <Car className="h-16 w-16 text-blue-500" />
                        </div>
                        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-orange-500 block">
                                Dịch vụ bảo dưỡng xe ô tô
                            </span>
                        </h1>
                        <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
                            Giữ cho chiếc xe ô tô của bạn luôn trong tình trạng tốt nhất với các gói dịch vụ và bảo dưỡng cá nhân của chúng tôi.
                        </p>
                    </div>
                </section>


                {/* Search Bar */}
                <section className="pt-8 px-4 sm:px-6 lg:px-8 bg-white">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex flex-col md:flex-row gap-4 ">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm dịch vụ..."
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
                                    className="px-6 py-3 rounded-full bg-orange-500 text-white font-medium transition-all duration-200 hover:bg-orange-600"
                                    onClick={() => {
                                        const packagesSection = document.querySelector('.packages-section');
                                        packagesSection?.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                >
                                    Gói dịch vụ
                                </button>
                                <button
                                    className="px-6 py-3 rounded-full text-gray-600 font-medium transition-all duration-200 hover:bg-white hover:text-orange-500"
                                    onClick={() => {
                                        const servicesSection = document.querySelector('.services-section');
                                        servicesSection?.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                >
                                    Dịch vụ đơn
                                </button>
                            </div>
                        </div>
                    </div>
                </section>


                {/* Packages and Services Sections */}
                <section className='py-20 bg-white packages-section'>
                    <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
                        <div className='text-center'>
                            <h2 className="text-5xl font-bold text-blue-900 mb-4 border-b-8 border-orange-500 inline-block px-4 py-2 rounded-xl">Gói dịch vụ</h2>
                        </div>

                        {packages.length > 0 ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {packages.map((pkg) => (
                                    <PackageCard 
                                        key={pkg._id} 
                                        package={pkg} 
                                        onViewDetail={() => {
                                            setSelectedPackage(pkg);
                                            setIsPackageModalOpen(true);
                                        }}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-gray-500 text-lg">Chưa có gói dịch vụ nào</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Individual Services Section */}
                <section className="py-20 bg-gray-100 services-section">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className='text-center'>
                            <h2 className="text-5xl font-bold text-blue-900 mb-4 border-b-8 border-orange-500 inline-block px-4 py-2 rounded-xl">Dịch vụ đơn</h2>
                        </div>
                        {services.length > 0 ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {services.map((service) => (
                                    <ServiceCard 
                                        key={service._id} 
                                        service={service}
                                        onViewDetail={() => {
                                            setSelectedService(service);
                                            setIsServiceModalOpen(true);
                                        }}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-gray-500 text-lg">Chưa có dịch vụ nào</p>
                            </div>
                        )}
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
        </div>
    );
} 
