import React from 'react';
import { Car, Wrench, Zap, Shield, Clock, Settings, Cog } from 'lucide-react';
import Clean from '../../assets/images/clean.png';
import { DollarSign, AlertTriangle, Heart } from 'lucide-react';
import { carService } from '../../constants/mockdata/CarService';
import { Link } from 'react-router-dom';
import { Bike, Recycle as Motorcycle, ArrowRight } from 'lucide-react';
import { reasons } from '../../constants/mockdata/Service';


export const CarServicePage: React.FC = () => {

    const services = [
        {
            icon: <Wrench className="h-12 w-12 text-blue-500" />,
            title: "Basic Maintenance",
            description: "Essential car care services",
            price: "$99",
            features: [
                "Oil change & filter replacement",
                "Tire pressure check",
                "Fluid level inspection",
                "Basic diagnostic scan",
                "Visual safety inspection"
            ]
        },
        {
            icon: <Car className="h-12 w-12 text-orange-500" />,
            title: "Premium Service",
            description: "Comprehensive vehicle care",
            price: "$199",
            features: [
                "Complete maintenance package",
                "Brake system inspection",
                "Engine performance tuning",
                "Electrical system check",
                "Air conditioning service",
                "6-month warranty"
            ],
            popular: true
        },
        {
            icon: <Zap className="h-12 w-12 text-yellow-500" />,
            title: "Performance Upgrade",
            description: "High-performance modifications",
            price: "$399",
            features: [
                "ECU tuning & optimization",
                "Performance exhaust system",
                "Cold air intake installation",
                "Suspension upgrades",
                "Custom modifications",
                "1-year performance warranty"
            ]
        }
    ];

    return (
        <div className="relative min-h-screen bg-white">
            <div className="relative z-10 ">
                {/* Hero Section */}
                <section className=" py-20 pt-20 pb-16 px-4 sm:px-6 lg:px-8" style={{ backgroundImage: `url(${Clean})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-6x md:text-6xl font-bold text-blue-900 mb-6 mt-10 drop-shadow-lg ">
                                Dịch vụ 
                        </h1>
                        <p className="text-xl text-blue-300 mb-8 max-w-3xl mx-auto">
                            Dịch vụ chăm sóc ô tô hiện đại với chẩn đoán tiên tiến, kỹ thuật viên chuyên nghiệp,
                            và công nghệ tiên tiến để giữ cho xe của bạn hoạt động ở hiệu suất tối ưu.
                        </p>
                    </div>
                </section>


                {/* Services Section */}
                <section id="services" className="py-20">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-5xl font-bold text-blue-900 mb-4 border-b-8 border-orange-500 inline-block px-4 py-2 rounded-xl">Dịch vụ của chúng tôi</h2>
                            <p className="text-blue-500 text-lg max-w-2xl mx-auto">
                                Dịch vụ bảo trì và sửa chữa chuyên nghiệp cho tất cả các phương tiện của bạn
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <Link to="/car-service" className="group">
                                <div className="bg-orange-50 backdrop-blur-sm rounded-xl p-8 border border-gray-700 hover:border-blue-500/50 transition-all duration-300 group-hover:transform group-hover:scale-105">
                                    <div className="text-blue-500 mb-6">
                                        <Car size={48} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-blue-900 mb-4">Dịch vụ ô tô</h3>
                                    <p className="text-blue-800 mb-6">
                                        Dịch vụ chăm sóc ô tô toàn diện từ bảo trì định kỳ đến sửa chữa phức tạp
                                    </p>
                                    <div className="flex items-center text-orange-500 font-semibold">
                                        Tìm hiểu thêm <ArrowRight className="ml-2 h-4 w-4" />
                                    </div>
                                </div>
                            </Link>

                            <Link to="/moto-service" className="group">
                                <div className="bg-orange-50 backdrop-blur-sm rounded-xl p-8 border border-gray-700 hover:border-orange-500/50 transition-all duration-300 group-hover:transform group-hover:scale-105">
                                    <div className="text-orange-500 mb-6">
                                        <Motorcycle size={48} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-blue-900 mb-4">Dịch vụ xe máy</h3>
                                    <p className="text-blue-800 mb-6">
                                        Dịch vụ bảo trì và sữa chữa xe máy và tối ưu hóa hiệu suất
                                    </p>
                                    <div className="flex items-center text-orange-500 font-semibold">
                                        Tìm hiểu thêm <ArrowRight className="ml-2 h-4 w-4" />
                                    </div>
                                </div>
                            </Link>

                            <Link to="/bike-service" className="group">
                                <div className="bg-orange-50 backdrop-blur-sm rounded-xl p-8 border border-gray-700 hover:border-yellow-500/50 transition-all duration-300 group-hover:transform group-hover:scale-105">
                                    <div className="text-yellow-500 mb-6">
                                        <Bike size={48} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-blue-900 mb-4">Dịch vụ xe đạp</h3>
                                    <p className="text-blue-800 mb-6">
                                        Dịch vụ bảo trì và sửa chữa xe đạp chuyên nghiệp
                                    </p>
                                    <div className="flex items-center text-orange-500 font-semibold">
                                        Tìm hiểu thêm <ArrowRight className="ml-2 h-4 w-4" />
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </div>
                </section>



                {/* Why Maintenance Section */}
                <section id="maintenance" className="py-20 bg-gradient-to-t from-orange-100 to-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-5xl font-bold text-blue-900 mb-4">Tại sao bảo trì phương tiện là cần thiết</h2>
                            <p className="text-xl text-blue-500 max-w-3xl mx-auto">
                                Bảo trì định kỳ không chỉ được khuyến nghị mà còn là điều cần thiết cho sự an toàn, tài chính và tâm trí của bạn. Đây là lý do tại sao việc chăm sóc phương tiện chuyên nghiệp lại quan trọng.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {reasons.map((reason, index) => {
                                const IconComponent = reason.icon;
                                return (
                                    <div
                                        key={index}
                                        className="bg-orange-50 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                                    >
                                        <div className={`${reason.color} w-16 h-16 rounded-lg flex items-center justify-center mb-6`}>
                                            <IconComponent className="h-8 w-8 text-white" />
                                        </div>
                                        <h3 className="text-xl font-bold text-blue-900 mb-4">{reason.title}</h3>
                                        <p className="text-blue-800 leading-relaxed">{reason.description}</p>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-16 bg-orange-100 rounded-2xl p-8 lg:p-12 shadow-lg">
                            <div className="grid lg:grid-cols-2 gap-12 items-center">
                                <div>
                                    <h3 className="text-3xl font-bold text-blue-900 mb-6">Chi Phí Của Việc Bỏ Qua</h3>
                                    <div className="space-y-6">
                                        <div className="flex items-start space-x-4">
                                            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                                <span className="text-red-600 font-bold">1</span>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900 mb-2">Lỗi động cơ</h4>
                                                <p className="text-gray-600">Bỏ qua thay dầu có thể dẫn đến việc động cơ bị kẹt, tốn từ 3,000 đến 10,000 đô la để thay thế.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start space-x-4">
                                            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                                <span className="text-red-600 font-bold">2</span>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900 mb-2">Hư Hỏng Hệ Thống Phanh</h4>
                                                <p className="text-gray-600">Bánh phanh bị mòn có thể làm hỏng đĩa phanh, biến một dịch vụ 150 đô la thành sửa chữa 800 đô la trở lên.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start space-x-4">
                                            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                                <span className="text-red-600 font-bold">3</span>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900 mb-2">Rủi Ro An Toàn</h4>
                                                <p className="text-gray-600">Bỏ qua bảo trì làm tăng nguy cơ tai nạn và có thể làm mất hiệu lực bảo hiểm.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="relative">
                                    <img
                                        src="https://images.pexels.com/photos/3806288/pexels-photo-3806288.jpeg?auto=compress&cs=tinysrgb&w=600"
                                        alt="Vehicle maintenance"
                                        className="rounded-lg shadow-lg w-full h-80 object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-lg"></div>
                                    <div className="absolute bottom-4 left-4 text-white">
                                        <p className="font-semibold text-lg">Đừng chờ đợi cho đến khi có vấn đề</p>
                                        <p className="text-blue-200">Phòng ngừa luôn tốt hơn sửa chữa</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold text-blue-900 mb-4">Công Nghệ Tiên Tiến</h2>
                            <p className="text-blue-600 text-lg">Trải nghiệm tương lai của dịch vụ ô tô</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[
                                {
                                    icon: <Zap className="h-8 w-8 text-blue-500" />,
                                    title: "Digital Diagnostics",
                                    description: "AI-powered vehicle analysis"
                                },
                                {
                                    icon: <Shield className="h-8 w-8 text-green-500" />,
                                    title: "Quality Guarantee",
                                    description: "100% satisfaction assured"
                                },
                                {
                                    icon: <Clock className="h-8 w-8 text-orange-500" />,
                                    title: "Fast Service",
                                    description: "Same-day completion available"
                                },
                                {
                                    icon: <Car className="h-8 w-8 text-purple-500" />,
                                    title: "All Makes & Models",
                                    description: "Expertise across all brands"
                                }
                            ].map((feature, index) => (
                                <div key={index} className="bg-orange-50 backdrop-blur-sm rounded-lg p-6 text-center border border-gray-700">
                                    <div className="flex justify-center mb-4">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-lg font-semibold text-blue-800 mb-2">{feature.title}</h3>
                                    <p className="text-blue-500">{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-300 to-orange-300 mt-20">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-4xl font-bold text-blue-800 mb-6">Sẵn Sàng Để Bảo Trì Xe Của Bạn?</h2>
                        <p className="text-xl text-blue-500 mb-8">
                            Đặt lịch hẹn của bạn hôm nay và trải nghiệm sự khác biệt của dịch vụ ô tô chuyên nghiệp.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button className="bg-orange-200 hover:bg-orange-700 text-blue-900 px-8 py-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105">
                                Đặt Lịch Hẹn
                            </button>
                            <button className="border border-orange-500 text-orange-400 hover:bg-orange-500 hover:text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300">
                                Nhận Báo Giá
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};
export default CarServicePage;
