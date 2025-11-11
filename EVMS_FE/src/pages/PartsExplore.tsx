import React from 'react';
import { Battery, Cpu, Zap, Shield, Wrench, Settings, Package, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

const PartsExplore: React.FC = () => {
  const navigate = useNavigate();

  const partCategories = [
    {
      icon: Battery,
      title: "Pin & Ắc Quy",
      description: "Pin lithium-ion chính hãng cho xe điện, ắc quy cho xe máy truyền thống",
      items: ["Pin xe điện", "Ắc quy khô", "Ắc quy nước", "Sạc pin"],
      color: "from-green-400 to-emerald-500"
    },
    {
      icon: Cpu,
      title: "Bộ Điều Khiển",
      description: "Controller, ECU và các linh kiện điện tử điều khiển",
      items: ["ECU", "Controller", "Cảm biến", "Mạch điều khiển"],
      color: "from-blue-400 to-cyan-500"
    },
    {
      icon: Zap,
      title: "Hệ Thống Điện",
      description: "Dây điện, cầu chì, công tắc và phụ kiện điện",
      items: ["Dây điện", "Cầu chì", "Công tắc", "Đèn LED"],
      color: "from-yellow-400 to-orange-500"
    },
    {
      icon: Wrench,
      title: "Phụ Tùng Động Cơ",
      description: "Linh kiện động cơ điện và động cơ xăng",
      items: ["Motor điện", "Piston", "Xupap", "Bạc đạn"],
      color: "from-red-400 to-pink-500"
    },
    {
      icon: Settings,
      title: "Hệ Thống Phanh",
      description: "Má phanh, dầu phanh, dây phanh chính hãng",
      items: ["Má phanh", "Dầu phanh", "Dây phanh", "Piston phanh"],
      color: "from-purple-400 to-indigo-500"
    },
    {
      icon: Package,
      title: "Phụ Kiện Khác",
      description: "Lốp xe, nhớt, lọc gió và các phụ kiện khác",
      items: ["Lốp xe", "Nhớt", "Lọc gió", "Bugi"],
      color: "from-teal-400 to-green-500"
    }
  ];

  const features = [
    {
      icon: Shield,
      title: "Chính Hãng 100%",
      description: "Tất cả linh kiện đều có nguồn gốc rõ ràng, tem chống hàng giả"
    },
    {
      icon: CheckCircle,
      title: "Bảo Hành Dài Hạn",
      description: "Chế độ bảo hành từ 6-12 tháng tùy theo loại linh kiện"
    },
    {
      icon: Package,
      title: "Kho Hàng Đa Dạng",
      description: "Hơn 1000+ loại linh kiện cho mọi dòng xe"
    },
    {
      icon: Zap,
      title: "Giao Hàng Nhanh",
      description: "Giao hàng trong ngày tại nội thành, 1-2 ngày toàn quốc"
    }
  ];

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
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-32 px-0 overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1
              className="text-6xl lg:text-7xl font-bold mb-8 leading-tight animate-fade-in-up"
              style={{
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                color: 'white',
                textShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                animationDelay: '0.2s'
              }}
            >
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400">
                Kho Linh Kiện
              </span>
              <span className="block">Chính Hãng</span>
            </h1>

            <p
              className="text-2xl mb-12 leading-relaxed max-w-3xl mx-auto animate-fade-in-up font-light"
              style={{
                color: 'rgba(255, 255, 255, 0.95)',
                textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
                animationDelay: '0.4s'
              }}
            >
              Hơn 1000+ loại phụ tùng chính hãng cho mọi dòng xe
            </p>

            <button
              onClick={() => navigate('/parts')}
              className="px-10 py-4 rounded-lg text-white font-bold text-lg uppercase tracking-wider transition-all duration-300 hover:shadow-2xl hover:scale-105 animate-fade-in-up"
              style={{
                backgroundColor: '#f6ae2d',
                color: '#014091',
                animationDelay: '0.6s'
              }}
            >
              Xem Tất Cả Linh Kiện
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2
              className="text-4xl lg:text-5xl font-bold mb-6"
              style={{ color: '#014091' }}
            >
              Tại Sao Chọn Chúng Tôi?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-2"
              >
                <div className="bg-gradient-to-br from-orange-100 to-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="h-8 w-8 text-orange-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">{feature.title}</h3>
                <p className="text-gray-600 text-center leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2
              className="text-4xl lg:text-5xl font-bold mb-6"
              style={{ color: '#014091' }}
            >
              Danh Mục Linh Kiện
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Đa dạng các loại phụ tùng cho mọi nhu cầu bảo trì và sửa chữa
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {partCategories.map((category, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border-t-4"
                style={{ borderTopColor: '#f6ae2d' }}
              >
                <div className={`bg-gradient-to-br ${category.color} w-16 h-16 rounded-lg flex items-center justify-center mb-6`}>
                  <category.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{category.title}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{category.description}</p>
                <ul className="space-y-2">
                  {category.items.map((item, idx) => (
                    <li key={idx} className="flex items-center text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2
              className="text-4xl lg:text-5xl font-bold mb-6"
              style={{ color: '#014091' }}
            >
              Kho Linh Kiện Của Chúng Tôi
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Hệ thống kho hàng hiện đại, đầy đủ và đa dạng
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {factoryImages.map((img, index) => (
              <div
                key={index}
                className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                <div
                  className="aspect-square bg-cover bg-center"
                  style={{
                    backgroundImage: `url("${img.url}")`
                  }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-white">
            Cần Tư Vấn Về Linh Kiện?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Đội ngũ chuyên gia của chúng tôi sẵn sàng tư vấn miễn phí về linh kiện phù hợp cho xe của bạn
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/parts')}
              className="px-10 py-4 rounded-lg font-bold text-lg uppercase tracking-wider transition-all duration-300 hover:shadow-2xl hover:scale-105"
              style={{
                backgroundColor: '#f6ae2d',
                color: '#014091'
              }}
            >
              Xem Linh Kiện
            </button>
            <button
              onClick={() => navigate('/contact')}
              className="px-10 py-4 rounded-lg font-bold text-lg uppercase tracking-wider transition-all duration-300 hover:shadow-2xl hover:scale-105 border-2 border-white text-white hover:bg-white/10"
            >
              Liên Hệ Tư Vấn
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PartsExplore;

