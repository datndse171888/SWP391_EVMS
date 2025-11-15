import React from 'react';
import { CheckCircle, Award, Users, Target, Heart, Zap } from 'lucide-react';
import schedule from '../assets/images/schedule.png';

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

  .animate-fade-in-up {
    animation: fadeInUp 0.8s ease-out forwards;
    opacity: 0;
  }
`;

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = customStyles;
  document.head.appendChild(styleSheet);
}

const AboutUs: React.FC = () => {
  const values = [
    {
      icon: Target,
      title: "Tầm Nhìn",
      description: "Trở thành đơn vị hàng đầu trong lĩnh vực bảo trì xe điện tại Việt Nam, góp phần xây dựng tương lai xanh và bền vững."
    },
    {
      icon: Heart,
      title: "Sứ Mệnh",
      description: "Cung cấp dịch vụ bảo trì xe điện chất lượng cao với giá cả hợp lý, mang đến sự yên tâm cho mọi khách hàng."
    },
    {
      icon: Zap,
      title: "Giá Trị Cốt Lõi",
      description: "Chuyên nghiệp - Nhanh chóng - Tin cậy - Bền lâu. Đó là cam kết của chúng tôi với mỗi khách hàng."
    }
  ];

  const milestones = [
    { year: "2018", event: "Thành lập cơ sở đầu tiên" },
    { year: "2019", event: "Mở rộng đội ngũ kỹ thuật viên" },
    { year: "2020", event: "Đạt 1000+ xe được bảo dưỡng" },
    { year: "2021", event: "Nhận chứng nhận ISO 9001" },
    { year: "2022", event: "Mở rộng dịch vụ xe điện" },
    { year: "2023", event: "Đạt 5000+ khách hàng tin tưởng" }
  ];

  const achievements = [
    "Đội ngũ kỹ thuật viên được đào tạo chuyên nghiệp",
    "Trang thiết bị hiện đại, công nghệ tiên tiến",
    "Linh kiện chính hãng, có nguồn gốc rõ ràng",
    "Quy trình làm việc chuẩn hóa, minh bạch",
    "Chế độ bảo hành rõ ràng, hậu mãi tốt",
    "Giá cả cạnh tranh, nhiều ưu đãi hấp dẫn"
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section
        className="relative pt-32 pb-32 px-0 overflow-hidden min-h-[70vh] flex items-center"
        style={{
          backgroundImage: `url(${schedule})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          zIndex: 1
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30"></div>

        <div className="relative max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
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
                Về Chúng Tôi
              </span>
            </h1>

            <p
              className="text-2xl mb-12 leading-relaxed max-w-2xl text-left animate-fade-in-up font-light"
              style={{
                color: 'rgba(255, 255, 255, 0.95)',
                textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
                animationDelay: '0.4s'
              }}
            >
              Hơn 5 năm đồng hành cùng hàng ngàn khách hàng trên khắp cả nước
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div
                className="text-sm font-bold uppercase tracking-widest px-4 py-2 bg-blue-100 rounded-full inline-block"
                style={{ color: '#0991f3' }}
              >
                ✨ CÂU CHUYỆN CỦA CHÚNG TÔI
              </div>

              <h2
                className="text-5xl lg:text-6xl font-bold leading-tight"
                style={{ color: '#014091' }}
              >
                Hành trình phát triển
              </h2>

              <div className="space-y-6">
                <p className="text-gray-700 text-lg leading-relaxed">
                  EVMS được thành lập vào năm 2018 với mục tiêu mang đến dịch vụ bảo trì xe chất lượng cao cho người dân Việt Nam. Từ một cơ sở nhỏ với vài kỹ thuật viên, chúng tôi đã không ngừng phát triển và mở rộng.
                </p>

                <p className="text-gray-700 leading-relaxed">
                  Ngày nay, với đội ngũ hơn 50 kỹ thuật viên được đào tạo bài bản, trang thiết bị hiện đại và quy trình làm việc chuyên nghiệp, chúng tôi tự hào là đối tác tin cậy của hàng ngàn khách hàng. Đặc biệt, chúng tôi tiên phong trong lĩnh vực bảo trì xe điện - xu hướng tất yếu của tương lai.
                </p>
              </div>

              <div className="space-y-4">
                {achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 font-medium">{achievement}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative group">
              <div className="bg-gradient-to-br from-orange-400 to-blue-400 rounded-2xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105">
                <div className="bg-white rounded-xl p-8">
                  <Award className="h-16 w-16 text-orange-500 mb-6" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Chứng nhận & Giải thưởng</h3>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    Được công nhận là "Đơn vị bảo trì xe uy tín" và đạt chứng nhận ISO 9001:2015 về hệ thống quản lý chất lượng.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2
              className="text-5xl lg:text-6xl font-bold mb-6"
              style={{ color: '#014091' }}
            >
              Tầm Nhìn & Sứ Mệnh
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Những giá trị cốt lõi định hướng mọi hoạt động của chúng tôi
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-2 border-t-4"
                style={{ borderTopColor: '#f6ae2d' }}
              >
                <div className="bg-gradient-to-br from-orange-100 to-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <value.icon className="h-8 w-8 text-orange-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">{value.title}</h3>
                <p className="text-gray-600 text-center leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2
              className="text-5xl lg:text-6xl font-bold mb-6"
              style={{ color: '#014091' }}
            >
              Các Mốc Quan Trọng
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Hành trình phát triển của EVMS qua các năm
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {milestones.map((milestone, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-blue-50 to-orange-50 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                <div
                  className="text-4xl font-bold mb-4"
                  style={{ color: '#f6ae2d' }}
                >
                  {milestone.year}
                </div>
                <p className="text-gray-700 text-lg font-medium">{milestone.event}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2
              className="text-5xl lg:text-6xl font-bold mb-6"
              style={{ color: '#014091' }}
            >
              Đội Ngũ Của Chúng Tôi
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Hơn 50 kỹ thuật viên giàu kinh nghiệm, tận tâm với nghề
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { number: "50+", label: "Kỹ thuật viên" },
              { number: "5000+", label: "Khách hàng" },
              { number: "95%", label: "Hài lòng" },
              { number: "24/7", label: "Hỗ trợ" }
            ].map((stat, index) => (
              <div
                key={index}
                className="text-center p-8 rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
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
    </div>
  );
};

export default AboutUs;

