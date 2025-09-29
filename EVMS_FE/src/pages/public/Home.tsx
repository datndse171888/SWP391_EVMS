import React, { useState } from 'react';
import homeImage from '../../assets/images/home.jpg';
import cleanImage from '../../assets/images/clean.png';
import motobyImage from '../../assets/images/motoby.jpg';
import scheduleImage from '../../assets/images/schedule.png';
import chartImage from '../../assets/images/chart.jpg';
import { COLOR } from '../../constants/color/Color';

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
        className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden min-h-screen flex items-center"
        style={{
          backgroundImage: `url(${homeImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        
        <div className="relative max-w-7xl mx-auto w-full">
          <div className="max-w-2xl">
            {/* Slogan */}
            <h1 
              className="text-5xl lg:text-6xl font-bold mb-8 leading-tight"
              style={{ 
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                color: 'white',
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 0, 0, 0.5)'
              }}
            >
              Chuyên nghiệp 
              <br />
              nhanh chóng
              <br />
              tin cậy bền lâu
            </h1>
            
            {/* Description */}
            <p 
              className="text-xl mb-10 leading-relaxed max-w-lg"
              style={{
                color: 'white',
                textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)'
              }}
            >
              Đồng hành cùng quý khách trong mọi chuyến đi
            </p>
            
            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                className="px-8 py-4 rounded-lg text-white font-bold text-lg uppercase tracking-wider transition-all duration-200 hover:shadow-xl hover:scale-105"
                style={{
                  backgroundColor: COLOR.yellow[0],
                  color: COLOR.blue[0],
                  fontFamily: 'Inter, sans-serif'
                }}
              >
                Đặt Lịch
              </button>
              <button
                className="px-8 py-4 rounded-lg text-white font-bold text-lg uppercase tracking-wider transition-all duration-200 hover:shadow-xl border-2 border-white flex items-center justify-center space-x-2"
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  fontFamily: 'Inter, sans-serif'
                }}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                <span>Xem Quy Trình</span>
              </button>
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
                  style={{ color: COLOR.blue[0] }}
                >
                  {stat.number}
                </div>
                <div 
                  className="text-lg font-semibold"
                  style={{ color: COLOR.gray[6] }}
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
                style={{ border: `2px solid ${COLOR.yellow[0]}` }}
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
                style={{ borderColor: COLOR.yellow[0] }}
              >
                <div 
                  className="text-3xl font-bold text-center"
                  style={{ color: COLOR.yellow[0] }}
                >
                  5+
                </div>
                <div 
                  className="text-xs font-bold uppercase tracking-wider text-center"
                  style={{ color: COLOR.blue[0] }}
                >
                  Năm kinh nghiệm
                </div>
              </div>
            </div>

            {/* Right Column - Content */}
            <div className="space-y-6">
              <div 
                className="text-sm font-bold uppercase tracking-wider"
                style={{ color: COLOR.azure[0] }}
              >
                CHÚNG TÔI LÀ AI
              </div>
              
              <h2 
                className="text-4xl lg:text-5xl font-bold leading-tight"
                style={{ color: COLOR.blue[0] }}
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
                  backgroundColor: COLOR.yellow[0],
                  color: COLOR.blue[0]
                }}
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
                style={{ color: COLOR.azure[0] }}
              >
                CHÚNG TÔI MANG ĐẾN
              </div>
              <h2 
                className="text-4xl lg:text-5xl font-bold leading-tight mb-4"
                style={{ color: COLOR.blue[0] }}
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
                style={{ color: COLOR.azure[0] }}
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
                  style={{ color: COLOR.blue[0] }}
                >
                  Bảo Dưỡng Định Kỳ
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                Thay dầu máy, lọc gió, bugi. Kiểm tra hệ thống phanh, lốp xe. Vệ sinh xe toàn diện để đảm bảo xe luôn hoạt động ổn định.
                </p>
                <div 
                  className="w-12 h-0.5 mb-4"
                  style={{ backgroundColor: COLOR.yellow[0] }}
                ></div>
              </div>
              <div 
                className="relative h-64 overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${COLOR.azure[1]}, ${COLOR.blue[1]})`
                }}
              >
                <img 
                  src="/images/schedule.png"
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
                  style={{ color: COLOR.blue[0] }}
                >
                  Vệ Sinh Xe Toàn Diện
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                Rửa xe chuyên nghiệp, vệ sinh nội thất, đánh bóng sơn xe. Khử mùi, diệt khuẩn và bảo vệ bề mặt xe lâu dài.
                </p>
                <div 
                  className="w-12 h-0.5 mb-4"
                  style={{ backgroundColor: COLOR.yellow[0] }}
                ></div>
              </div>
              <div 
                className="relative h-64 overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${COLOR.blue[1]}, ${COLOR.azure[0]})`
                }}
              >
                <img 
                  src="/images/clean.png"
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
                  style={{ color: COLOR.blue[0] }}
                >
                  Bảo Dưỡng Xe Máy Điện
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                Kiểm tra pin, sạc điện, bảo dưỡng motor điện. Chẩn đoán hệ thống điều khiển và thay thế linh kiện xe điện chuyên dụng.
                </p>
                <div 
                  className="w-12 h-0.5 mb-4"
                  style={{ backgroundColor: COLOR.yellow[0] }}
                ></div>
              </div>
              <div 
                className="relative h-64 overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${COLOR.yellow[1]}, ${COLOR.blue[1]})`
                }}
              >
                <img 
                  src="/images/motoby.jpg"
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
              style={{ color: COLOR.azure[0] }}
            >
              GÓI DỊCH VỤ
            </div>
            <h2 
              className="text-4xl lg:text-5xl font-bold mb-6"
              style={{ color: COLOR.blue[0] }}
            >
              Chọn gói dịch vụ phù hợp với nhu cầu của bạn
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Chúng tôi cung cấp các gói dịch vụ bảo dưỡng xe điện đa dạng, từ cơ bản đến cao cấp, đáp ứng mọi nhu cầu và ngân sách của khách hàng.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Basic Plan */}
            <div className="bg-white rounded-2xl p-2 shadow-lg hover:shadow-xl transition-all duration-300 relative">
              <div className="bg-gray-100 rounded-xl p-8 h-full">
                <h3 
                  className="text-3xl font-bold mb-4 text-center"
                  style={{ color: COLOR.blue[0] }}
                >
                  Cơ Bản
                </h3>
                <p className="text-gray-500 mb-6 text-center">
                  Dịch vụ bảo dưỡng cơ bản cho xe điện với các kiểm tra thiết yếu
                </p>
                <div className="mb-6 text-center">
                  <span 
                    className="text-5xl font-bold"
                    style={{ color: COLOR.blue[0] }}
                  >
                    200.000₫
                  </span>
                  <span className="text-gray-500 ml-2">/lần</span>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">Kiểm tra pin lithium-ion</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">Kiểm tra hệ thống điện</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">Kiểm tra an toàn cơ bản</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-gray-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-400">Bảo dưỡng động cơ điện</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-gray-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-400">Cập nhật phần mềm OTA</span>
                  </li>
                </ul>
                <button
                  className="w-full py-3 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg"
                  style={{
                    color: 'white',
                    backgroundColor: COLOR.blue[0]
                  }}
                >
                  CHỌN GÓI
                </button>
                <p className="text-xs text-gray-400 mt-4 text-center">
                  *Áp dụng cho xe máy điện và xe đạp điện
                </p>
              </div>
            </div>

            {/* Standard Plan - Featured */}
            <div className="bg-white rounded-2xl p-2 shadow-xl transition-all duration-300 relative transform scale-105">
              {/* Best Choice Ribbon */}
              <div 
                className="absolute -top-2 -right-2 px-4 py-1 rounded-lg text-sm font-bold"
                style={{ 
                  backgroundColor: COLOR.yellow[0],
                  color: COLOR.blue[0]
                }}
              >
                LỰA CHỌN TỐT NHẤT
              </div>
              
              <div 
                className="rounded-xl p-8 h-full"
                style={{
                  background: `linear-gradient(135deg, ${COLOR.blue[2]}, ${COLOR.blue[1]}, ${COLOR.blue[0]})`
                }}
              >
                <h3 className="text-3xl font-bold mb-4 text-white text-center">
                  Tiêu Chuẩn
                </h3>
                <p className="text-white mb-6 text-center">
                  Dịch vụ bảo dưỡng toàn diện với đầy đủ tính năng cho xe điện
                </p>
                <div className="mb-6 text-center">
                  <span className="text-5xl font-bold text-white">
                    500.000₫
                  </span>
                  <span className="text-white ml-2">/lần</span>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-white">Kiểm tra pin lithium-ion</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-white">Bảo dưỡng động cơ điện</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-white">Cập nhật phần mềm OTA</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-white">Kiểm tra hệ thống sạc</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-white">Bảo hành 6 tháng</span>
                  </li>
                </ul>
                <button
                  className="w-full py-3 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg"
                    style={{
                    color: COLOR.blue[0],
                    backgroundColor: COLOR.yellow[0]
                  }}
                >
                  CHỌN GÓI
                </button>
                <p className="text-xs text-white mt-4 text-center">
                  *Áp dụng cho tất cả loại xe điện
                </p>
              </div>
                  </div>

            {/* Premium Plan */}
            <div className="bg-white rounded-2xl p-2 shadow-lg hover:shadow-xl transition-all duration-300 relative">
              <div className="bg-gray-100 rounded-xl p-8 h-full">
                  <h3 
                  className="text-3xl font-bold mb-4 text-center"
                    style={{ color: COLOR.blue[0] }}
                  >
                  Cao Cấp
                  </h3>
                <p className="text-gray-500 mb-6 text-center">
                  Dịch vụ bảo dưỡng cao cấp với hỗ trợ 24/7 và bảo hành dài hạn
                </p>
                <div className="mb-6 text-center">
                  <span 
                    className="text-5xl font-bold"
                    style={{ color: COLOR.blue[0] }}
                  >
                    800.000₫
                  </span>
                  <span className="text-gray-500 ml-2">/lần</span>
                  </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">Tất cả dịch vụ Tiêu Chuẩn</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">Hỗ trợ kỹ thuật 24/7</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">Bảo hành 12 tháng</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">Dịch vụ tại nhà</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">Ưu tiên đặt lịch</span>
                    </li>
                </ul>
                <button
                  className="w-full py-3 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg"
                  style={{
                    color: 'white',
                    backgroundColor: COLOR.blue[0]
                  }}
                >
                  CHỌN GÓI
                </button>
                <p className="text-xs text-gray-400 mt-4 text-center">
                  *Dành cho khách hàng doanh nghiệp
                </p>
              </div>
              </div>
          </div>
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
                style={{ color: COLOR.azure[0] }}
              >
                KHO LINH KIỆN CỦA CHÚNG TÔI
              </div>
              <h2 
                className="text-4xl lg:text-5xl font-bold leading-tight mb-4"
                style={{ color: COLOR.blue[0] }}
              >
                Phụ tùng chính hãng với chất lượng đảm bảo
              </h2>
              <div 
                className="w-16 h-1 mb-8"
                style={{ backgroundColor: COLOR.yellow[0] }}
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
                  backgroundColor: COLOR.yellow[0],
                  color: COLOR.blue[0]
                }}
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
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
              </svg>
            </button>
            <button 
              onClick={nextSlide}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 text-black hover:text-gray-600 transition-all duration-200"
              style={{ marginRight: '-60px' }}
            >
              <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/>
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
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    index === currentSlide ? '' : 'bg-gray-400'
                  }`}
                  style={{ 
                    backgroundColor: index === currentSlide ? COLOR.yellow[0] : '#9CA3AF'
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
              style={{ color: COLOR.blue[0] }}
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
                    style={{ backgroundColor: COLOR.azure[1] }}
                  >
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div 
                      className="font-bold"
                      style={{ color: COLOR.blue[0] }}
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