import React from 'react';
import { COLOR } from '../constants/color/Color';
import homeImage from '../assets/images/home.jpg';

const Home: React.FC = () => {
  const services = [
    {
      title: 'Bảo dưỡng ô tô điện',
      description: 'Dịch vụ bảo dưỡng chuyên nghiệp cho các dòng xe ô tô điện hàng đầu với công nghệ tiên tiến',
      icon: '🚗',
      features: ['Kiểm tra pin lithium-ion', 'Bảo dưỡng động cơ điện', 'Cập nhật phần mềm OTA', 'Kiểm tra hệ thống sạc'],
      price: 'Từ 500.000đ'
    },
    {
      title: 'Bảo dưỡng xe máy điện',
      description: 'Chăm sóc và bảo dưỡng xe máy điện với thiết bị chuyên dụng và kỹ thuật viên giàu kinh nghiệm',
      icon: '🏍️',
      features: ['Thay pin lithium', 'Kiểm tra hệ thống điện', 'Bảo trì motor điện', 'Cân chỉnh phanh'],
      price: 'Từ 200.000đ'
    },
    {
      title: 'Bảo dưỡng xe đạp điện',
      description: 'Dịch vụ bảo dưỡng xe đạp điện chất lượng cao, giá cả hợp lý cho mọi đối tượng',
      icon: '🚲',
      features: ['Sửa chữa pin', 'Bảo dưỡng motor', 'Kiểm tra an toàn', 'Thay lốp và phanh'],
      price: 'Từ 100.000đ'
    }
  ];

  const features = [
    {
      title: 'Đội ngũ chuyên gia',
      description: 'Kỹ thuật viên được đào tạo chuyên sâu về xe điện với chứng chỉ quốc tế',
      icon: '👨‍🔧',
      stat: '50+'
    },
    {
      title: 'Thiết bị hiện đại',
      description: 'Máy móc và công cụ chuyên dụng cho xe điện được nhập khẩu từ châu Âu',
      icon: '🔧',
      stat: '100%'
    },
    {
      title: 'Bảo hành uy tín',
      description: 'Chế độ bảo hành linh hoạt và dịch vụ hậu mãi tốt lên đến 24 tháng',
      icon: '🛡️',
      stat: '24 tháng'
    },
    {
      title: 'Khách hàng hài lòng',
      description: 'Mức độ hài lòng của khách hàng luôn đạt trên 95%',
      icon: '⭐',
      stat: '95%'
    }
  ];

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
              className="text-6xl lg:text-7xl font-bold mb-8 leading-tight"
              style={{ 
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                color: 'white',
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 0, 0, 0.5)'
              }}
            >
              Chuyên nghiệp nhanh chóng
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
              <div className="relative h-64 overflow-hidden">
                <img 
                  src="./clean.png"
                  alt="AC Charger Services"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
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
              <div className="relative h-64 overflow-hidden">
                <img 
                  src="/src/assets/images/motoby.jpg"
                  alt="DC Charger Services"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
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
              <div className="relative h-64 overflow-hidden">
                <img 
                  src="/src/assets/images/schedule.png"
                  alt="Home Charger"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
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
      <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: COLOR.gray[0] }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 
              className="text-4xl lg:text-5xl font-bold mb-6"
              style={{ color: COLOR.blue[0] }}
            >
              Dịch vụ của chúng tôi
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Chúng tôi cung cấp đầy đủ các dịch vụ bảo dưỡng cho mọi loại xe điện với chất lượng cao nhất
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className="text-center mb-6">
                  <div 
                    className="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-4xl mb-4"
                    style={{
                      background: `linear-gradient(135deg, ${COLOR.azure[1]}, ${COLOR.blue[1]})`
                    }}
                  >
                    {service.icon}
                  </div>
                  <h3 
                    className="text-2xl font-bold mb-3"
                    style={{ color: COLOR.blue[0] }}
                  >
                    {service.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {service.description}
                  </p>
                  <div 
                    className="text-2xl font-bold mb-4"
                    style={{ color: COLOR.orange[0] }}
                  >
                    {service.price}
                  </div>
                </div>
                <ul className="space-y-3 mb-6">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-gray-700">
                      <span 
                        className="w-2 h-2 rounded-full mr-3"
                        style={{ backgroundColor: COLOR.orange[0] }}
                      ></span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  className="w-full py-3 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg"
                  style={{
                    color: 'white',
                    backgroundColor: COLOR.azure[0]
                  }}
                >
                  Xem chi tiết
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 
              className="text-4xl lg:text-5xl font-bold mb-6"
              style={{ color: COLOR.blue[0] }}
            >
              Tại sao chọn chúng tôi?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Những lý do khiến chúng tôi trở thành lựa chọn hàng đầu cho dịch vụ bảo dưỡng xe điện
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="text-center bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div 
                  className="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-4xl mb-6"
                  style={{
                    background: `linear-gradient(135deg, ${COLOR.orange[0]}, ${COLOR.yellow[0]})`
                  }}
                >
                  {feature.icon}
                </div>
                <div 
                  className="text-3xl font-bold mb-2"
                  style={{ color: COLOR.blue[0] }}
                >
                  {feature.stat}
                </div>
                <h3 
                  className="text-xl font-bold mb-3"
                  style={{ color: COLOR.blue[0] }}
                >
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section 
        className="py-20 px-4 sm:px-6 lg:px-8"
        style={{ backgroundColor: COLOR.gray[0] }}
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
                <p className="text-gray-700 mb-6 italic">
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
          backgroundImage: 'url("./chart.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        
        <div className="relative max-w-7xl mx-auto">
          <div className="max-w-2xl">
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
                backgroundColor: '#3bbada', // Lime green color
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