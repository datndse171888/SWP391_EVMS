import React from 'react';
import {
  Zap,
  Shield,
  Users,
  Award,
  Battery,
  Settings,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import schedule from '../assets/images/schedule.png'

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

  @keyframes slideInLeft {
    from {
      opacity: 0;
      transform: translateX(-50px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes glow {
    0%, 100% {
      box-shadow: 0 0 20px rgba(246, 174, 45, 0.3);
    }
    50% {
      box-shadow: 0 0 30px rgba(246, 174, 45, 0.6);
    }
  }

  .animate-fade-in-up {
    animation: fadeInUp 0.8s ease-out forwards;
    opacity: 0;
  }

  .animate-slide-in-left {
    animation: slideInLeft 0.8s ease-out forwards;
    opacity: 0;
  }

  .animate-glow {
    animation: glow 2s ease-in-out infinite;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = customStyles;
  document.head.appendChild(styleSheet);
}

const Introduction: React.FC = () => {
const services = [
    {
      icon: Battery,
      title: "Chẩn đoán Pin",
      description: "Kiểm tra và giám sát sức khỏe tiên tiến cho tất cả các hệ thống pin EV"
    },
    {
      icon: Settings,
      title: "Bảo trì Định kỳ",
      description: "Bảo trì định kỳ để giữ cho xe điện của bạn hoạt động hiệu quả"
    },
    {
      icon: Zap,
      title: "Sửa chữa Cổng Sạc & Bộ Sạc Onboard",
      description: "Sửa chữa và bảo trì chuyên nghiệp các cổng sạc và bộ sạc onboard"
    },
    {
      icon: Shield,
      title: "Cập nhật Phần mềm",
      description: "Cập nhật firmware mới nhất và tối ưu hóa hệ thống cho hiệu suất tối ưu"
    }
  ];

  const stats = [
    { number: "10,000+", label: "EVs Serviced" },
    { number: "98%", label: "Chỉ số hài lòng của khách hàng" },
    { number: "15+", label: "Năm Kinh nghiệm" },
    { number: "24/7", label: "Hỗ trợ Có sẵn" }
  ];

  const teamMembers = [
    {
      name: "Sarah Johnson",
      role: "Lead EV Technician", 
      experience: "12+ năm trong hệ thống xe điện"
    },
    {
      name: "Michael Chen",
      role: "Battery Specialist",
      experience: "Chuyên gia về công nghệ pin lithium-ion"
    },
    {
      name: "Emily Rodriguez",
      role: "Service Manager",
      experience: "Xuất sắc trong hoạt động và dịch vụ khách hàng"
    }
  ];
  return (
     <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section
        className="relative pt-32 pb-32 px-0 overflow-hidden min-h-screen flex items-center"
        style={{
          backgroundImage: `url(${schedule})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          zIndex: 1
        }}
      >
        {/* Enhanced overlay with gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30"></div>

        <div className="relative max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            {/* Main Title */}
            <h1
              className="text-6xl lg:text-7xl font-bold mb-8 leading-tight text-left animate-fade-in-up"
              style={{
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                color: 'white',
                textShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
                animationDelay: '0.2s'
              }}
            >
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400">
                Giới Thiệu
              </span>
              <span className="block">Về Chúng Tôi</span>
            </h1>

            {/* Description */}
            <p
              className="text-2xl mb-12 leading-relaxed max-w-2xl text-left animate-fade-in-up font-light"
              style={{
                color: 'rgba(255, 255, 255, 0.95)',
                textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
                animationDelay: '0.4s'
              }}
            >
              Chúng tôi cam kết cung cấp dịch vụ bảo trì và sửa chữa xe điện chất lượng cao, giúp bạn yên tâm trên mọi hành trình xanh.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-start animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              <button
                className="px-10 py-4 rounded-lg font-bold text-lg uppercase tracking-wider transition-all duration-300 hover:shadow-2xl hover:scale-110 animate-glow"
                style={{
                  backgroundColor: '#f6ae2d',
                  color: '#014091',
                  fontFamily: 'Inter, sans-serif'
                }}
              >
                🗓️
              </button>
              <button
                className="px-10 py-4 rounded-lg text-white font-bold text-lg uppercase tracking-wider transition-all duration-300 hover:shadow-2xl border-2 border-white flex items-center justify-center space-x-2 hover:scale-110 hover:bg-white/20 backdrop-blur-sm"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  fontFamily: 'Inter, sans-serif'
                }}
              >
                <ArrowRight className="h-5 w-5" />
                <span>Tìm Hiểu Thêm</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center p-8 rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-2"
              >
                <div
                  className="text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-orange-400 to-yellow-300 bg-clip-text text-transparent"
                >
                  {stat.number}
                </div>
                <div
                  className="text-lg font-semibold"
                  style={{ color: '#014091' }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div
                className="text-sm font-bold uppercase tracking-widest px-4 py-2 bg-blue-100 rounded-full inline-block"
                style={{ color: '#0991f3' }}
              >
                ✨ VỀ CHÚNG TÔI
              </div>

              <h2
                className="text-5xl lg:text-6xl font-bold leading-tight"
                style={{ color: '#014091' }}
              >
                Cách mạng hóa dịch vụ bảo trì xe điện
              </h2>

              <div className="space-y-6">
                <p className="text-gray-700 text-lg leading-relaxed">
                  Được thành lập với tầm nhìn hỗ trợ cuộc cách mạng xe điện, chúng tôi đã phát triển từ một hoạt động gara nhỏ thành cơ sở bảo trì xe điện đáng tin cậy nhất trong khu vực.
                </p>

                <p className="text-gray-700 leading-relaxed">
                  Ngày nay, chúng tôi kết hợp giữa chuyên môn ô tô truyền thống và công nghệ EV tiên tiến để cung cấp chất lượng dịch vụ vô song. Cơ sở vật chất hiện đại và đội ngũ kỹ thuật viên được chứng nhận của chúng tôi đảm bảo xe điện của bạn nhận được sự chăm sóc chuyên biệt.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700 font-medium">Kỹ thuật viên EV được chứng nhận ASE</span>
                </div>
                <div className="flex items-center space-x-4">
                  <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700 font-medium">Thiết bị chẩn đoán tiên tiến</span>
                </div>
                <div className="flex items-center space-x-4">
                  <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700 font-medium">Phụ tùng được nhà sản xuất phê duyệt</span>
                </div>
              </div>
            </div>

            <div className="relative group">
              <div className="bg-gradient-to-br from-orange-400 to-blue-400 rounded-2xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105">
                <div className="bg-white rounded-xl p-8">
                  <Award className="h-16 w-16 text-orange-500 mb-6" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Dịch vụ đạt giải thưởng</h3>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    Được công nhận là "Trung tâm dịch vụ EV tốt nhất" trong ba năm liên tiếp bởi Hiệp hội Ô tô Khu vực.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2
              className="text-5xl lg:text-6xl font-bold mb-6"
              style={{ color: '#014091' }}
            >
              Sứ Mệnh & Giá Trị
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Thúc đẩy giao thông bền vững thông qua dịch vụ và đổi mới xuất sắc
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-2 border-t-4" style={{ borderTopColor: '#f6ae2d' }}>
              <div className="bg-gradient-to-br from-orange-100 to-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">Đổi Mới</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Chúng tôi luôn đi đầu trong các xu hướng công nghệ EV, liên tục nâng cấp công cụ và đào tạo để cung cấp các giải pháp bảo trì tiên tiến nhất.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-2 border-t-4" style={{ borderTopColor: '#0991f3' }}>
              <div className="bg-gradient-to-br from-blue-100 to-cyan-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">An Toàn & Tin Cậy</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Mỗi dịch vụ đều được thực hiện với sự chú ý tỉ mỉ đến các quy trình an toàn, đảm bảo EV của bạn đáng tin cậy và sẵn sàng trên đường.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-2 border-t-4" style={{ borderTopColor: '#fd8c40' }}>
              <div className="bg-gradient-to-br from-green-100 to-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">Khách Hàng Là Trung Tâm</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Sự hài lòng của bạn là động lực cho mọi việc chúng tôi làm. Chúng tôi cung cấp thông tin minh bạch và dịch vụ cá nhân hóa.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2
              className="text-5xl lg:text-6xl font-bold mb-6"
              style={{ color: '#014091' }}
            >
              Dịch Vụ EV Toàn Diện
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Từ bảo trì định kỳ đến sửa chữa phức tạp, chúng tôi là giải pháp một cửa cho tất cả các nhu cầu về xe điện
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-2 group"
              >
                <div className="bg-gradient-to-br from-orange-100 to-yellow-100 w-16 h-16 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <service.icon className="h-8 w-8 text-orange-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{service.title}</h3>
                <p className="text-gray-600 leading-relaxed">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2
              className="text-5xl lg:text-6xl font-bold mb-6"
              style={{ color: '#014091' }}
            >
              Gặp Gỡ Đội Ngũ Chuyên Gia
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Các kỹ thuật viên và chuyên gia dịch vụ được chứng nhận của chúng tôi đam mê xe điện
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-2 border-t-4"
                style={{ borderTopColor: '#f6ae2d' }}
              >
                <div className="bg-gradient-to-br from-orange-400 to-blue-400 w-28 h-28 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg">
                  <Users className="h-14 w-14 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{member.name}</h3>
                <p className="text-orange-500 font-semibold mb-4 text-lg">{member.role}</p>
                <p className="text-gray-600 leading-relaxed">{member.experience}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Introduction
