import React from 'react';
import { Car, Zap, Shield, Clock, Bike, CircleDot as Motorcycle, ArrowRight } from 'lucide-react';
import ServiceBg from '../../assets/images/service.png';
import { Link } from 'react-router-dom';


export const CarServicePage: React.FC = () => {

    return (
        <div className="relative min-h-screen bg-white">
            <div className="relative z-10 ">
                {/* Hero Section */}
                <section className="relative py-20 pt-20 pb-16 px-4 sm:px-6 lg:px-8" style={{ backgroundImage: `url(${ServiceBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                    <div className="absolute inset-0 bg-black/50"></div>
                    <div className="relative z-10 max-w-4xl mx-auto text-center">
                        <h1 className="text-6x md:text-6xl font-bold text-white mb-6 mt-10 drop-shadow-lg border-b-8 border-orange-500 inline-block px-4 py-2">
                            Dịch vụ
                        </h1>
                        <p className="text-xl text-white mb-8 max-w-3xl mx-auto drop-shadow-md">
                            Dịch vụ chăm sóc chuyên nghiệp cho ô tô điện, xe máy điện và xe đạp điện với chẩn đoán tiên tiến, 
                            kỹ thuật viên chuyên nghiệp và công nghệ tiên tiến để giữ cho phương tiện của bạn hoạt động ở hiệu suất tối ưu.
                        </p>
                    </div>
                </section>


                {/* Services Section */}
                <section id="services" className="py-20">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <Link to="/carService" className="group">
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 backdrop-blur-sm rounded-xl p-8 border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 group-hover:transform group-hover:scale-105 shadow-md hover:shadow-xl">
                                    <div className="text-blue-600 mb-6 flex justify-center">
                                        <Car size={48} className="drop-shadow-lg" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-blue-900 mb-4">Dịch vụ bảo dưỡng xe ô tô</h3>
                                    <p className="text-gray-700 mb-6">
                                        Dịch vụ chăm sóc ô tô toàn diện từ bảo trì định kỳ đến sửa chữa phức tạp
                                    </p>
                                    <div className="flex items-center text-blue-600 font-semibold group-hover:text-blue-700 transition-colors">
                                        Tìm hiểu thêm <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </Link>

                            <Link to="/motoService" className="group">
                                <div className="bg-gradient-to-br from-orange-50 to-red-50 backdrop-blur-sm rounded-xl p-8 border-2 border-orange-200 hover:border-orange-400 transition-all duration-300 group-hover:transform group-hover:scale-105 shadow-md hover:shadow-xl">
                                    <div className="text-orange-600 mb-6 flex justify-center">
                                        <svg 
                                            xmlns="http://www.w3.org/2000/svg" 
                                            viewBox="0 0 24 24" 
                                            fill="none" 
                                            stroke="currentColor" 
                                            strokeWidth="2" 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round"
                                            className="w-12 h-12 drop-shadow-lg"
                                        >
                                            <circle cx="6" cy="18" r="3"/>
                                            <circle cx="18" cy="18" r="3"/>
                                            <path d="M12 18h-2a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2"/>
                                            <path d="M10 12h4"/>
                                            <path d="M8 8h8"/>
                                        </svg>
                                    </div>
                                    <h3 className="text-2xl font-bold text-orange-900 mb-4">Dịch vụ bảo dưỡng xe máy</h3>
                                    <p className="text-gray-700 mb-6">
                                        Dịch vụ bảo trì và sửa chữa xe máy và tối ưu hóa hiệu suất
                                    </p>
                                    <div className="flex items-center text-orange-600 font-semibold group-hover:text-orange-700 transition-colors">
                                        Tìm hiểu thêm <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </Link>

                            <Link to="/bikeService" className="group">
                                <div className="bg-gradient-to-br from-yellow-50 to-amber-50 backdrop-blur-sm rounded-xl p-8 border-2 border-yellow-200 hover:border-yellow-400 transition-all duration-300 group-hover:transform group-hover:scale-105 shadow-md hover:shadow-xl">
                                    <div className="text-yellow-600 mb-6 flex justify-center">
                                        <Bike size={48} className="drop-shadow-lg" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-yellow-900 mb-4">Dịch vụ bảo dưỡng xe đạp </h3>
                                    <p className="text-gray-700 mb-6">
                                        Dịch vụ bảo trì và sửa chữa xe đạp chuyên nghiệp
                                    </p>
                                    <div className="flex items-center text-yellow-600 font-semibold group-hover:text-yellow-700 transition-colors">
                                        Tìm hiểu thêm <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </div>
                </section>



                {/* Why Maintenance Section */}
                <section id="maintenance" className="py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-5xl font-bold text-blue-900 mb-4">Tại sao bảo trì phương tiện là cần thiết</h2>
                            <p className="text-xl text-blue-500 max-w-3xl mx-auto">
                                Bảo trì định kỳ không chỉ được khuyến nghị mà còn là điều cần thiết cho sự an toàn, tài chính và tâm trí của bạn. Đây là lý do tại sao việc chăm sóc phương tiện chuyên nghiệp lại quan trọng.
                            </p>
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
                <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-200 mt-20">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-4xl font-bold text-gray-800 mb-6">Sẵn Sàng Để Bảo Trì Xe Của Bạn?</h2>
                        <p className="text-xl text-gray-600 mb-8">
                            Đặt lịch hẹn của bạn hôm nay và trải nghiệm sự khác biệt của dịch vụ ô tô chuyên nghiệp.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105">
                                Đặt Lịch Hẹn
                            </button>
                            <button className="border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300">
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
