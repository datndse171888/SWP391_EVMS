import { useState, useEffect } from 'react';
import type { Package, IndividualService } from '../../types/Service';
import PackageCard from './PackageSevice';
import ServiceCard from './CardService';
import { Car, Wrench, Zap, Shield, Clock, Bike } from 'lucide-react';
import Clean from '../../assets/images/clean.png';

export const CarService: React.FC = () => {
    const [packages, setPackages] = useState<Package[]>([]);
    const [services, setServices] = useState<IndividualService[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const samplePackages: Package[] = [
        {
            id: 1,
            service_type_id: "car",
            name: "Bảo dưỡng cơ bản",
            price: 49.99,
            description: "Bảo dưỡng cần thiết cho xe ô tô của bạn",
            features: ["Kiểm tra dầu động cơ", "Kiểm tra phanh", "Bôi trơn", "Kiểm tra an toàn", "Vệ sinh cơ bản"],
            display_order: 1,
            created_at: "2024-01-01T00:00:00Z"
        },
        {
            id: 2,
            service_type_id: "car",
            name: "Bảo dưỡng toàn diện",
            price: 89.99,
            description: "Gói bảo dưỡng xe ô tô toàn diện",
            features: ["Tinh chỉnh hoàn toàn", "Cân bằng bánh xe", "Thay cáp", "Kiểm tra an toàn", "Vệ sinh"],
            display_order: 2,
            created_at: "2024-01-01T00:00:00Z"
        },
        {
            id: 3,
            service_type_id: "car",
            name: "Bảo dưỡng cao cấp",
            price: 149.99,
            description: "Khôi phục và nâng cấp xe ô tô hoàn chỉnh",
            features: ["Tháo rời hoàn toàn", "Vệ sinh sâu", "Thay thế linh kiện", "Tối ưu hóa hiệu suất", "Bảo hành 6 tháng"],
            display_order: 3,
            created_at: "2024-01-01T00:00:00Z"
        }
    ];

    const sampleServices: IndividualService[] = [
        { id: 1, service_type_id: "car", name: "Thay dầu động cơ", price: 45.99, description: "Thay dầu động cơ và lọc dầu chuyên nghiệp", duration: "45 phút", display_order: 1, created_at: "2024-01-01T00:00:00Z" },
        { id: 2, service_type_id: "car", name: "Kiểm tra phanh", price: 35.99, description: "Kiểm tra và bảo dưỡng hệ thống phanh", duration: "60 phút", display_order: 2, created_at: "2024-01-01T00:00:00Z" },
        { id: 3, service_type_id: "car", name: "Thay lọc gió", price: 25.99, description: "Thay thế lọc gió động cơ và cabin", duration: "30 phút", display_order: 3, created_at: "2024-01-01T00:00:00Z" },
        { id: 4, service_type_id: "car", name: "Cân bằng lốp", price: 40.99, description: "Cân bằng và căn chỉnh bánh xe", duration: "45 phút", display_order: 4, created_at: "2024-01-01T00:00:00Z" },
        { id: 5, service_type_id: "car", name: "Kiểm tra ắc quy", price: 20.99, description: "Kiểm tra và bảo dưỡng ắc quy", duration: "30 phút", display_order: 5, created_at: "2024-01-01T00:00:00Z" },
        { id: 6, service_type_id: "car", name: "Rửa xe detailing", price: 55.99, description: "Vệ sinh toàn diện nội thất và ngoại thất", duration: "90 phút", display_order: 6, created_at: "2024-01-01T00:00:00Z" }
    ];

    // Temporarily use sample data
    useEffect(() => {
        setPackages(samplePackages);
        setServices(sampleServices);
        setLoading(false);
    }, []);
    const fetchData = async () => {
        try {
            const packageResponse = await fetch('/api/packages?service_type=bike');
            const serviceResponse = await fetch('/api/individual-services?service_type=bike');
            const packageData = await packageResponse.json();
            const serviceData = await serviceResponse.json();
            setPackages(packageData);
            setServices(serviceData);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="text-center text-slate-600">Loading services...</div>
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

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {packages.map((pkg, index) => (
                                <PackageCard key={pkg.id} package={pkg} featured={index === 1} />
                            ))}
                        </div>
                    </div>
                </section>

                {/* Individual Services Section */}
                <section className="py-20 bg-gray-100 services-section">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className='text-center'>
                            <h2 className="text-5xl font-bold text-blue-900 mb-4 border-b-8 border-orange-500 inline-block px-4 py-2 rounded-xl">Dịch vụ đơn</h2>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {services.map((service) => (
                                <ServiceCard key={service.id} service={service} />
                            ))}
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
} 
