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
      <section className={`bg-cover bg-center bg-no-repeat py-20`}
             style={{ backgroundImage: `url(${schedule})` }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-blue-900 mb-6 mt-5">
              Giới thiệu 
            </h1>
            <p className="text-xl text-blue-400 max-w-3xl mx-auto mb-8">
              Chúng tôi cam kết cung cấp dịch vụ bảo trì và sửa chữa xe điện chất lượng cao,
              giúp bạn yên tâm trên mọi hành trình xanh.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-orange-300 text-xl text-blue-900 px-8 py-3 rounded-lg font-semibold  transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2">
                <span>Đặt lịch hẹn</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <button className="border-2 border-orange-200 text-orange-500 px-8 py-3 rounded-lg font-semibold  hover: transition-all duration-300">
                Tìm hiểu thêm
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-blue-800 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-blue-900 mb-6">
                Cách mạng hóa dịch vụ bảo trì xe điện từ 2009
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Được thành lập với tầm nhìn hỗ trợ cuộc cách mạng xe điện, EV Repair đã phát triển từ một
                hoạt động gara nhỏ thành cơ sở bảo trì xe điện đáng tin cậy nhất trong khu vực. Hành trình của chúng tôi bắt đầu
                khi xe điện vẫn còn là một điều mới mẻ, và chúng tôi đã phát triển song song với công nghệ.
              </p>
              <p className="text-lg text-gray-600 mb-8">
                Ngày nay, chúng tôi kết hợp giữa chuyên môn ô tô truyền thống và công nghệ EV tiên tiến để cung cấp
                chất lượng dịch vụ vô song. Cơ sở vật chất hiện đại và đội ngũ kỹ thuật viên được chứng nhận của chúng tôi đảm bảo
                xe điện của bạn nhận được sự chăm sóc chuyên biệt mà nó xứng đáng.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-blue-500" />
                  <span className="text-gray-700">Kỹ thuật viên EV được chứng nhận ASE</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-blue-500" />
                  <span className="text-gray-700">Thiết bị chẩn đoán tiên tiến</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-blue-500" />
                  <span className="text-gray-700">Phụ tùng được nhà sản xuất phê duyệt</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-orange-400 to-blue-400 rounded-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="bg-white rounded-xl p-6">
                  <Award className="h-12 w-12 text-orange-500 mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Dịch vụ đạt giải thưởng</h3>
                  <p className="text-gray-600">
                    Được công nhận là "Trung tâm dịch vụ EV tốt nhất" trong ba năm liên tiếp bởi Hiệp hội Ô tô Khu vực.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-blue-900 mb-4">Sứ mệnh & Giá trị của chúng tôi</h2>
            <p className="text-xl text-blue-500 max-w-3xl mx-auto">
              Thúc đẩy giao thông bền vững thông qua dịch vụ và đổi mới xuất sắc
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-orange-50 to-blue-50 rounded-xl p-8 text-center hover:shadow-lg transition-shadow duration-300">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Đổi mới là trên hết</h3>
              <p className="text-gray-600">
                Chúng tôi luôn đi đầu trong các xu hướng công nghệ EV, liên tục nâng cấp công cụ và đào tạo của mình để cung cấp
                các giải pháp bảo trì tiên tiến nhất.
              </p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-blue-50 rounded-xl p-8 text-center hover:shadow-lg transition-shadow duration-300">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">An toàn & Độ tin cậy</h3>
              <p className="text-gray-600">
                Mỗi dịch vụ đều được thực hiện với sự chú ý tỉ mỉ đến các quy trình an toàn, đảm bảo EV của bạn
                đáng tin cậy và sẵn sàng trên đường.
              </p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-blue-50 rounded-xl p-8 text-center hover:shadow-lg transition-shadow duration-300">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Khách hàng là trung tâm</h3>
              <p className="text-gray-600">
                Sự hài lòng của bạn là động lực cho mọi việc chúng tôi làm. Chúng tôi cung cấp thông tin minh bạch và
                dịch vụ cá nhân hóa cho từng khách hàng.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-blue-900 mb-4">Dịch vụ EV toàn diện</h2>
            <p className="text-xl text-blue-500 max-w-3xl mx-auto">
              Từ bảo trì định kỳ đến sửa chữa phức tạp, chúng tôi là giải pháp một cửa cho tất cả các nhu cầu về xe điện
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <div key={index} className="bg-gradient-to-br from-orange-50 to-white-50 rounded-xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                  <service.icon className="h-6 w-6 text-orange-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
                <p className="text-gray-600">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-blue-900 mb-4">Gặp gỡ Đội ngũ Chuyên gia của Chúng tôi</h2>
            <p className="text-xl text-blue-500 max-w-3xl mx-auto">
              Các kỹ thuật viên và chuyên gia dịch vụ được chứng nhận của chúng tôi đam mê xe điện
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-gradient-to-br from-orange-50 to-blue rounded-xl p-8 text-center hover:shadow-lg transition-shadow duration-300">
                <div className="bg-gradient-to-br from-orange-400 to-blue-400 w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <Users className="h-12 w-12 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                <p className="text-orange-500 font-semibold mb-3">{member.role}</p>
                <p className="text-gray-600">{member.experience}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Introduction
