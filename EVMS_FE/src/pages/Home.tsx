import React, { useState, useEffect } from 'react';
import homeImage from '../assets/images/home1.jpg';
import cleanImage from '../assets/images/clean.png';
import motobyImage from '../assets/images/motoby.jpg';
import scheduleImage from '../assets/images/schedule.png';
import chartImage from '../assets/images/chart.jpg';
import { useNavigate } from 'react-router-dom';
import type { ServicePackageResponse } from '../types/ServicePackage';
import type { ServiceResponse } from '../types/Service';
import { ServicePackageApi } from '../api/ServicePackageApi';

// Add custom animations
const customStyles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes bounceSlow {
    0%, 20%, 50%, 80%, 100% {
      transform: translateY(0);
    }
    40% {
      transform: translateY(-10px);
    }
    60% {
      transform: translateY(-5px);
    }
  }
  
  .animate-fade-in-up {
    animation: fadeInUp 0.8s ease-out forwards;
    opacity: 0;
  }
  
  .animate-bounce-slow {
    animation: bounceSlow 2s infinite;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = customStyles;
  document.head.appendChild(styleSheet);
}

// Debug: Log image paths
console.log('Image paths:', {
  cleanImage,
  motobyImage,
  scheduleImage,
  chartImage
});

const Home: React.FC = () => {
  // Factory images slider state
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  // Service packages state
  const [servicePackages, setServicePackages] = useState<ServicePackageResponse[]>([]);
  const [loadingPackages, setLoadingPackages] = useState(true);

  // Load service packages
  useEffect(() => {
    const loadServicePackages = async () => {
      try {
        setLoadingPackages(true);
        const response = await ServicePackageApi.getServicePackage();

        const packages = response.data.items || [];

        // Sort by discount % (highest first)
        const sortedPackages = packages.sort((a: ServicePackageResponse, b: ServicePackageResponse) => {
          const discountA = a.discount || 0;
          const discountB = b.discount || 0;
          return discountB - discountA;
        });

        setServicePackages(sortedPackages);
      } catch (error) {
        console.error('Error loading service packages:', error);
      } finally {
        setLoadingPackages(false);
      }
    };

    loadServicePackages();
  }, []);

  const factoryImages = [
    {
      url: 'https://assets-persist.lovart.ai/agent_images/e25a3bdd-6089-4f63-9949-675ca4316678.jpg',
      alt: 'Kho linh kiện phụ tùng xe điện'
    },
    {
      url: 'https://assets-persist.lovart.ai/agent_images/b254ee8e-e5b8-4c4b-a356-e78209f0f892.jpg',
      alt: 'Phụ tùng chính hãng cho xe điện'
    },
    {
      url: 'https://assets-persist.lovart.ai/agent_images/e5cd1190-6f8e-463a-8b43-5e880c9c0d6c.jpg',
      alt: 'Linh kiện bảo dưỡng xe điện'
    },
    {
      url: 'https://assets-persist.lovart.ai/agent_images/372b21f5-5ec0-4628-a107-299905cebb39.jpg',
      alt: 'Phụ tùng thay thế xe điện'
    },
    {
      url: 'https://assets-persist.lovart.ai/agent_images/adb47a4b-5f69-4094-9899-150ca57fafba.jpg',
      alt: 'Kho linh kiện đa dạng'
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % factoryImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + factoryImages.length) % factoryImages.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };


  const testimonials = [
    {
      name: 'Anh Nguyễn Văn A',
      role: 'Chủ xe Tesla Model 3',
      content: 'Dịch vụ bảo dưỡng rất chuyên nghiệp, kỹ thuật viên am hiểu sâu về xe điện. Chi phí hợp lý và thời gian nhanh chóng.',
      rating: 5,
      avatar: '👨'
    },
    {
      name: 'Chị Trần Thị B',
      role: 'Chủ xe VinFast VF8',
      content: 'EVMS đã giúp tôi tiết kiệm rất nhiều chi phí bảo dưỡng. Dịch vụ tận tâm và chất lượng vượt mong đợi.',
      rating: 5,
      avatar: '👩'
    },
    {
      name: 'Anh Lê Văn C',
      role: 'Chủ xe máy điện VinFast',
      content: 'Xe máy điện của tôi được bảo dưỡng định kỳ tại đây. Luôn yên tâm về chất lượng và giá cả.',
      rating: 5,
      avatar: '👨'
    }
  ];

  const stats = [
    { number: '5000+', label: 'Xe đã bảo dưỡng' },
    { number: '95%', label: 'Khách hàng hài lòng' },
    { number: '50+', label: 'Kỹ thuật viên' },
    { number: '5+', label: 'Năm kinh nghiệm' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section
        className="relative pt-24 pb-24 px-0 overflow-hidden min-h-screen flex items-center"
        style={{
          backgroundImage: `url(${homeImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          zIndex: 1
        }}
      >

        <div className="relative max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl -ml-4 mt-0">
            {/* Slogan */}
            <h1
              className="text-5xl lg:text-6xl font-semibold mb-8 leading-tight text-left animate-fade-in-up"
              style={{
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                color: '#014091',
                textShadow: '0 1px 2px rgba(255, 255, 255, 0.5), 0 0 4px rgba(255, 255, 255, 0.3), 0 2px 4px rgba(0, 0, 0, 0.15)',
                animationDelay: '0.2s'
              }}
            >
              <span className="whitespace-nowrap">Chuyên nghiệp nhanh chóng</span>
              <br />
              <span className="whitespace-nowrap">tin cậy bền lâu</span>
            </h1>

            {/* Description */}
            <p
              className="text-xl mb-6 leading-relaxed max-w-lg text-left animate-fade-in-up"
              style={{
                color: '#014091',
                textShadow: '0 1px 3px rgba(255, 255, 255, 0.6), 0 0 6px rgba(255, 255, 255, 0.4)',
                animationDelay: '0.4s'
              }}
            >
              Đồng hành cùng quý khách trong mọi chuyến đi
            </p>

            {/* Features */}
            <div className="mb-8 space-y-3">
              <div className="flex items-center space-x-3 animate-fade-in-up hover:scale-105 transition-transform duration-300" style={{ animationDelay: '0.6s' }}>
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                <span className="text-lg font-semibold" style={{ color: '#014091', textShadow: '0 1px 2px rgba(255, 255, 255, 0.5)' }}>
                  Bảo dưỡng chuyên nghiệp
                </span>
              </div>
              <div className="flex items-center space-x-3 animate-fade-in-up hover:scale-105 transition-transform duration-300" style={{ animationDelay: '0.8s' }}>
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                <span className="text-lg font-semibold" style={{ color: '#014091', textShadow: '0 1px 2px rgba(255, 255, 255, 0.5)' }}>
                  Linh kiện chính hãng
                </span>
              </div>
              <div className="flex items-center space-x-3 animate-fade-in-up hover:scale-105 transition-transform duration-300" style={{ animationDelay: '1.0s' }}>
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                <span className="text-lg font-semibold" style={{ color: '#014091', textShadow: '0 1px 2px rgba(255, 255, 255, 0.5)' }}>
                  Giá cả hợp lý
                </span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-start animate-fade-in-up" style={{ animationDelay: '1.2s' }}>
              <button
                className="px-8 py-4 rounded-lg text-white font-bold text-lg uppercase tracking-wider transition-all duration-300 hover:shadow-xl hover:scale-105 hover:bg-yellow-500 animate-bounce-slow"
                style={{
                  backgroundColor: '#f6ae2d',
                  color: '#014091',
                  fontFamily: 'Inter, sans-serif'
                }}
                onClick={() => navigate('/booking')}
              >
                Đặt Lịch
              </button>
              <button
                className="px-8 py-4 rounded-lg text-white font-bold text-lg uppercase tracking-wider transition-all duration-300 hover:shadow-xl border-2 border-white flex items-center justify-center space-x-2 hover:scale-105 hover:bg-gray-600"
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  fontFamily: 'Inter, sans-serif'
                }}
                onClick={() => navigate('/process-guide')}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                <span>Xem Quy Trình</span>
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="mt-8 animate-fade-in-up" style={{ animationDelay: '1.4s' }}>
              <div className="flex flex-wrap items-center gap-6 text-sm" style={{ color: '#014091' }}>
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="font-semibold">5.0/5.0</span>
                  <span>Đánh giá</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-semibold">5000+</span>
                  <span>Xe đã sửa</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-semibold">Chính hãng</span>
                  <span>Linh kiện</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div
                  className="text-4xl lg:text-5xl font-bold mb-2"
                  style={{ color: '#014091' }}
                >
                  {stat.number}
                </div>
                <div
                  className="text-lg font-semibold"
                  style={{ color: '#5f6777' }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who We Are Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Image */}
            <div className="relative">
              <div
                className="relative overflow-hidden rounded-lg"
                style={{ border: `2px solid #f6ae2d` }}
              >
                <div
                  className="aspect-[4/3] bg-cover bg-center"
                  style={{
                    backgroundImage: 'url("https://assets-persist.lovart.ai/agent_images/92f797af-7a05-414f-8aea-bdc419840094.jpg")'
                  }}
                ></div>
              </div>

              {/* Experience Badge */}
              <div
                className="absolute -top-4 -left-4 bg-white rounded-lg shadow-lg p-4 border-2"
                style={{ borderColor: '#f6ae2d' }}
              >
                <div
                  className="text-3xl font-bold text-center"
                  style={{ color: '#f6ae2d' }}
                >
                  5+
                </div>
                <div
                  className="text-xs font-bold uppercase tracking-wider text-center"
                  style={{ color: '#014091' }}
                >
                  Năm kinh nghiệm
                </div>
              </div>
            </div>

            {/* Right Column - Content */}
            <div className="space-y-6">
              <div
                className="text-sm font-bold uppercase tracking-wider"
                style={{ color: '#0991f3' }}
              >
                CHÚNG TÔI LÀ AI
              </div>

              <h2
                className="text-4xl lg:text-5xl font-bold leading-tight"
                style={{ color: '#014091' }}
              >
                Chúng tôi là bạn đồng hành bảo đảm sức khỏe cho xe của bạn!
              </h2>

              <p className="text-gray-600 text-lg leading-relaxed">
                Với đội ngũ kỹ thuật viên giàu kinh nghiệm và trang thiết bị hiện đại, chúng tôi cam kết mang đến dịch vụ sửa chữa, bảo dưỡng xe hàng đầu. Từ xe máy truyền thống đến xe điện thông minh, chúng tôi luôn bắt kịp xu hướng công nghệ mới nhất.
              </p>

              <p className="text-gray-600 leading-relaxed">
                Chúng tôi hiểu rằng xe không chỉ là phương tiện di chuyển, mà còn là người bạn đồng hành tin cậy trong cuộc sống hàng ngày của bạn. Với phương châm "Chuyên nghiệp - Nhanh chóng - Tin cậy bền lâu", chúng tôi không ngừng nâng cao chất lượng dịch vụ để xứng đáng với sự tin tưởng của khách hàng.
              </p>

              <button
                className="px-8 py-4 rounded-lg text-white font-bold text-lg uppercase tracking-wider transition-all duration-200 hover:shadow-xl hover:scale-105"
                style={{
                  backgroundColor: '#f6ae2d',
                  color: '#014091'
                }}
                onClick={() => navigate('/about-us')}
              >
                THÊM VỀ CHÚNG TÔI
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Electric Vehicle Charging Solution Section */}
      <section id="services" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="grid lg:grid-cols-2 mb-8">
            <div>
              <div
                className="text-sm font-bold uppercase tracking-wider mb-4"
                style={{ color: '#0991f3' }}
              >
                CHÚNG TÔI MANG ĐẾN
              </div>
              <h2
                className="text-4xl lg:text-5xl font-bold leading-tight mb-4"
                style={{ color: '#014091' }}
              >
                Sửa Chữa &
                <br />
                Bảo Dưỡng Toàn Diện
              </h2>
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-gray-600 text-lg leading-relaxed mb-3">
                Với đội ngũ kỹ thuật viên chuyên nghiệp và trang thiết bị hiện đại, chúng tôi cung cấp dịch vụ sửa chữa, bảo dưỡng cho mọi loại xe từ truyền thống đến điện. Cam kết chất lượng cao, giá cả hợp lý và thời gian nhanh chóng.
              </p>
              <a
                href="#services"
                className="inline-flex items-center text-lg font-semibold transition-all duration-200 hover:opacity-80"
                style={{ color: '#0991f3' }}
              >
                TẤT CẢ DỊCH VỤ
                <svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>

          {/* Services Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* AC Charger Services Card */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
              <div className="p-6">
                <h3
                  className="text-xl font-bold mb-3"
                  style={{ color: '#014091' }}
                >
                  Bảo Dưỡng Định Kỳ
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  Thay dầu máy, lọc gió, bugi. Kiểm tra hệ thống phanh, lốp xe. Vệ sinh xe toàn diện để đảm bảo xe luôn hoạt động ổn định.
                </p>
                <div
                  className="w-12 h-0.5 mb-4"
                  style={{ backgroundColor: '#f6ae2d' }}
                ></div>
              </div>
              <div
                className="relative h-64 overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, #8dcdfa, #8abdfe)`
                }}
              >
                <img
                  src={scheduleImage}
                  alt="AC Charger Services"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.log('Error loading clean image:', e);
                    console.log('Clean image path:', cleanImage);
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-opacity-20"></div>
                <button
                  className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg text-white text-sm font-semibold transition-all duration-200 hover:bg-opacity-80"
                  style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
                >
                  ĐỌC THÊM
                </button>
              </div>
            </div>

            {/* DC Charger Services Card */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
              <div className="p-6">
                <h3
                  className="text-xl font-bold mb-3"
                  style={{ color: '#014091' }}
                >
                  Vệ Sinh Xe Toàn Diện
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  Rửa xe chuyên nghiệp, vệ sinh nội thất, đánh bóng sơn xe. Khử mùi, diệt khuẩn và bảo vệ bề mặt xe lâu dài.
                </p>
                <div
                  className="w-12 h-0.5 mb-4"
                  style={{ backgroundColor: '#f6ae2d' }}
                ></div>
              </div>
              <div
                className="relative h-64 overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, #8abdfe, #0991f3)`
                }}
              >
                <img
                  src={cleanImage}
                  alt="DC Charger Services"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.log('Error loading motoby image:', e);
                    console.log('Motoby image path:', motobyImage);
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-opacity-20"></div>
                <button
                  className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg text-white text-sm font-semibold transition-all duration-200 hover:bg-opacity-80"
                  style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
                >
                  ĐỌC THÊM
                </button>
              </div>
            </div>

            {/* Home Charger Card */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
              <div className="p-6">
                <h3
                  className="text-xl font-bold mb-3"
                  style={{ color: '#014091' }}
                >
                  Bảo Dưỡng Xe Máy Điện
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  Kiểm tra pin, sạc điện, bảo dưỡng motor điện. Chẩn đoán hệ thống điều khiển và thay thế linh kiện xe điện chuyên dụng.
                </p>
                <div
                  className="w-12 h-0.5 mb-4"
                  style={{ backgroundColor: '#f6ae2d' }}
                ></div>
              </div>
              <div
                className="relative h-64 overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, #fad38e, #8abdfe)`
                }}
              >
                <img
                  src={motobyImage}
                  alt="Home Charger"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.log('Error loading schedule image:', e);
                    console.log('Schedule image path:', scheduleImage);
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-opacity-20"></div>
                <button
                  className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg text-white text-sm font-semibold transition-all duration-200 hover:bg-opacity-80"
                  style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
                >
                  ĐỌC THÊM
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div
              className="text-sm font-bold uppercase tracking-wider mb-4"
              style={{ color: '#0991f3' }}
            >
              GÓI DỊCH VỤ
            </div>
            <h2
              className="text-4xl lg:text-5xl font-bold mb-6"
              style={{ color: '#014091' }}
            >
              Chọn gói dịch vụ phù hợp với nhu cầu của bạn
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Chúng tôi cung cấp các gói dịch vụ bảo dưỡng xe điện đa dạng, từ cơ bản đến cao cấp, đáp ứng mọi nhu cầu và ngân sách của khách hàng.
            </p>
          </div>

          {loadingPackages ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Đang tải gói dịch vụ...</p>
            </div>
          ) : servicePackages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Chưa có gói dịch vụ nào</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {(() => {
                // Get top 3 packages with highest discount
                const topPackages = servicePackages.slice(0, 3);

                // Arrange: 2nd highest in left, highest in middle, 3rd highest in right
                const arrangedPackages = [
                  topPackages[1] || topPackages[0], // Left (2nd highest)
                  topPackages[0], // Middle (highest)
                  topPackages[2] || topPackages[0]  // Right (3rd highest)
                ];

                return arrangedPackages.map((pkg, index) => {
                  if (!pkg) return null;

                  const isMiddle = index === 1;
                  const discountedPrice = pkg.price;
                  const originalPrice = pkg.discount > 0 ? pkg.price / (1 - pkg.discount / 100) : pkg.price;
                  const services = Array.isArray(pkg.services) ? pkg.services : [];

                  return (
                    <div
                      key={pkg._id}
                      className={`bg-white rounded-2xl p-2 shadow-lg hover:shadow-xl transition-all duration-300 relative ${
                        isMiddle ? 'transform scale-105' : ''
                      }`}
                    >
                      {isMiddle && (
                        <div
                          className="absolute -top-2 -right-2 px-4 py-1 rounded-lg text-sm font-bold z-10"
                          style={{
                            backgroundColor: '#f6ae2d',
                            color: '#014091'
                          }}
                        >
                          TIẾT KIỆM NHẤT
                        </div>
                      )}

                      <div
                        className={`rounded-xl p-8 h-full ${
                          isMiddle
                            ? ''
                            : 'bg-gray-100'
                        }`}
                        style={
                          isMiddle
                            ? {
                                background: `linear-gradient(135deg, #67a9fd, #8abdfe, #014091)`
                              }
                            : {}
                        }
                      >
                        <h3
                          className={`text-3xl font-bold mb-4 text-center ${
                            isMiddle ? 'text-white' : ''
                          }`}
                          style={!isMiddle ? { color: '#014091' } : {}}
                        >
                          {pkg.name}
                        </h3>
                        <p className={`mb-6 text-center ${isMiddle ? 'text-white' : 'text-gray-500'}`}>
                          {pkg.description || 'Gói dịch vụ chất lượng'}
                        </p>

                        {/* Price */}
                        <div className="mb-6 text-center">
                          {pkg.discount > 0 && (
                            <div className="mb-2">
                              <span className={`text-2xl line-through ${isMiddle ? 'text-white/70' : 'text-gray-400'}`}>
                                {Math.round(originalPrice).toLocaleString('vi-VN')}₫
                              </span>
                              <span
                                className="ml-2 px-2 py-1 rounded text-sm font-bold"
                                style={{
                                  backgroundColor: '#f6ae2d',
                                  color: '#014091'
                                }}
                              >
                                -{pkg.discount}%
                              </span>
                            </div>
                          )}
                          <span
                            className={`text-5xl font-bold ${isMiddle ? 'text-white' : ''}`}
                            style={!isMiddle ? { color: '#014091' } : {}}
                          >
                            {discountedPrice.toLocaleString('vi-VN')}₫
                          </span>
                          <span className={`ml-2 ${isMiddle ? 'text-white' : 'text-gray-500'}`}>/lần</span>
                        </div>

                        {/* Services List */}
                        <ul className="space-y-4 mb-8">
                          {services.slice(0, 5).map((service: any, idx: number) => (
                            <li key={idx} className="flex items-center">
                              <svg className={`w-5 h-5 mr-3 ${isMiddle ? 'text-green-400' : 'text-green-500'}`} fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              <span className={isMiddle ? 'text-white' : 'text-gray-700'}>
                                {typeof service === 'string' ? service : service.name}
                              </span>
                            </li>
                          ))}
                          {services.length > 5 && (
                            <li className="flex items-center">
                              <svg className={`w-5 h-5 mr-3 ${isMiddle ? 'text-green-400' : 'text-green-500'}`} fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              <span className={isMiddle ? 'text-white' : 'text-gray-700'}>
                                Và {services.length - 5} dịch vụ khác...
                              </span>
                            </li>
                          )}
                        </ul>

                        <button
                          onClick={() => navigate('/booking')}
                          className="w-full py-3 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg"
                          style={
                            isMiddle
                              ? {
                                  color: '#014091',
                                  backgroundColor: '#f6ae2d'
                                }
                              : {
                                  color: 'white',
                                  backgroundColor: '#014091'
                                }
                          }
                        >
                          CHỌN GÓI
                        </button>

                        {pkg.periodicEnabled && (
                          <p className={`text-xs mt-4 text-center ${isMiddle ? 'text-white' : 'text-gray-400'}`}>
                            *Gói định kỳ {pkg.intervalMonths} tháng
                          </p>
                        )}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          )}
        </div>
      </section>

      {/* Our Factory Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          {/* Top Half - Text and Button */}
          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            {/* Left Column - Heading */}
            <div>
              <div
                className="text-sm font-bold uppercase tracking-wider mb-4"
                style={{ color: '#0991f3' }}
              >
                KHO LINH KIỆN CỦA CHÚNG TÔI
              </div>
              <h2
                className="text-4xl lg:text-5xl font-bold leading-tight mb-4"
                style={{ color: '#014091' }}
              >
                Phụ tùng chính hãng với chất lượng đảm bảo
              </h2>
              <div
                className="w-16 h-1 mb-8"
                style={{ backgroundColor: '#f6ae2d' }}
              ></div>
            </div>

            {/* Right Column - Description and Button */}
            <div className="flex flex-col justify-center">
              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                Với kho linh kiện đa dạng và phong phú, chúng tôi luôn sẵn sàng cung cấp phụ tùng chính hãng cho mọi dòng xe. Từ linh kiện cơ bản như dầu máy, lọc gió, bugi đến các bộ phận chuyên dụng cho xe điện như pin lithium, motor điện, controller. Tất cả đều được nhập khẩu từ các thương hiệu uy tín và có chế độ bảo hành rõ ràng.
              </p>
              <button
                className="px-8 py-4 rounded-lg text-white font-bold text-lg uppercase tracking-wider transition-all duration-200 hover:shadow-xl hover:scale-105 self-start"
                style={{
                  backgroundColor: '#f6ae2d',
                  color: '#014091'
                }}
                onClick={() => navigate('/parts-explore')}
              >
                KHÁM PHÁ THÊM
              </button>
            </div>
          </div>

          {/* Bottom Half - Image Carousel */}
          <div className="relative">
            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 text-black hover:text-gray-600 transition-all duration-200"
              style={{ marginLeft: '-60px' }}
            >
              <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
              </svg>
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 text-black hover:text-gray-600 transition-all duration-200"
              style={{ marginRight: '-60px' }}
            >
              <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z" />
              </svg>
            </button>

            {/* Image Slider */}
            <div className="overflow-hidden rounded-lg">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {Array.from({ length: Math.ceil(factoryImages.length / 4) }, (_, slideIndex) => (
                  <div key={slideIndex} className="w-full flex-shrink-0">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center">
                      {factoryImages.slice(slideIndex * 4, (slideIndex + 1) * 4).map((img, imgIndex) => (
                        <div key={imgIndex} className="relative overflow-hidden rounded-lg w-full max-w-xs">
                          <div
                            className="aspect-square bg-cover bg-center"
                            style={{
                              backgroundImage: `url("${img.url}")`
                            }}
                          ></div>
                          <div className="absolute inset-0 bg-opacity-20"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pagination Dots */}
            <div className="flex justify-center mt-8 space-x-2">
              {Array.from({ length: Math.ceil(factoryImages.length / 4) }, (_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${index === currentSlide ? '' : 'bg-gray-400'
                    }`}
                  style={{
                    backgroundColor: index === currentSlide ? '#f6ae2d' : '#9CA3AF'
                  }}
                ></button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section
        className="py-20 px-4 sm:px-6 lg:px-8 bg-white"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2
              className="text-4xl lg:text-5xl font-bold mb-6"
              style={{ color: '#014091' }}
            >
              Khách hàng nói gì về chúng tôi?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Phản hồi từ những khách hàng đã tin tưởng sử dụng dịch vụ của chúng tôi
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-xl">⭐</span>
                  ))}
                </div>
                <p
                  className="text-gray-700 mb-6 italic overflow-hidden"
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                  }}
                >
                  "{testimonial.content}"
                </p>
                <div className="flex items-center">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-2xl mr-4"
                    style={{ backgroundColor: '#8dcdfa' }}
                  >
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div
                      className="font-bold"
                      style={{ color: '#014091' }}
                    >
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Future Electric Section */}
      <section
        className="relative py-32 px-4 sm:px-6 lg:px-8 overflow-hidden"
        style={{
          backgroundImage: `url(${chartImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-opacity-50"></div>

        <div className="relative max-w-7xl mx-auto">
          <div className="max-w-2xl text-left">
            {/* Main Slogan */}
            <h2
              className="text-5xl lg:text-6xl font-bold mb-6 leading-tight"
              style={{
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                color: 'white',
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)'
              }}
            >
              Sẵn sàng bảo dưỡng
              <br />
              xe điện của bạn?
            </h2>

            {/* Sub-headline */}
            <h3
              className="text-2xl font-bold mb-6"
              style={{
                color: 'white',
                textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)'
              }}
            >
              Liên hệ ngay với chúng tôi để được tư vấn miễn phí và đặt lịch bảo dưỡng
            </h3>

            {/* CTA Button */}
            <button
              className="px-10 py-4 rounded-lg text-white font-bold text-xl uppercase tracking-wider transition-all duration-200 hover:shadow-xl hover:scale-105"
              style={{
                backgroundColor: '#fd8c40', // Lime green color
                fontFamily: 'Inter, sans-serif'
              }}
            >
              📞 Gọi ngay: 1900-xxxx
            </button>
          </div>
        </div>
      </section>

      {/* Footer chuyển sang component riêng */}
    </div>
  );
};

export default Home;