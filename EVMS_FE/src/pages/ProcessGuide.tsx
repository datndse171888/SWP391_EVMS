import React from 'react';
import { Calendar, ClipboardCheck, Wrench, CheckCircle, CreditCard, FileText, Phone, MapPin } from 'lucide-react';
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

  .animate-fade-in-up {
    animation: fadeInUp 0.8s ease-out forwards;
    opacity: 0;
  }

  .animate-slide-in-left {
    animation: slideInLeft 0.8s ease-out forwards;
    opacity: 0;
  }
`;

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = customStyles;
  document.head.appendChild(styleSheet);
}

const ProcessGuide: React.FC = () => {
  const navigate = useNavigate();

  const steps = [
    {
      number: "01",
      icon: Calendar,
      title: "Đặt Lịch Hẹn",
      description: "Đặt lịch online hoặc gọi hotline. Chọn thời gian phù hợp với bạn.",
      details: [
        "Truy cập website hoặc app",
        "Chọn dịch vụ cần thực hiện",
        "Chọn ngày giờ phù hợp",
        "Nhận xác nhận qua email/SMS"
      ],
      color: "from-blue-400 to-blue-600"
    },
    {
      number: "02",
      icon: ClipboardCheck,
      title: "Tiếp Nhận & Kiểm Tra",
      description: "Kỹ thuật viên tiếp nhận xe và kiểm tra tổng quan tình trạng.",
      details: [
        "Tiếp nhận xe tại cơ sở",
        "Kiểm tra tình trạng ban đầu",
        "Tư vấn dịch vụ cần thiết",
        "Báo giá chi tiết minh bạch"
      ],
      color: "from-orange-400 to-yellow-400"
    },
    {
      number: "03",
      icon: Wrench,
      title: "Thực Hiện Dịch Vụ",
      description: "Kỹ thuật viên chuyên nghiệp thực hiện bảo trì/sửa chữa theo quy trình chuẩn.",
      details: [
        "Thực hiện theo quy trình chuẩn",
        "Sử dụng linh kiện chính hãng",
        "Cập nhật tiến độ cho khách hàng",
        "Kiểm tra chất lượng nghiêm ngặt"
      ],
      color: "from-cyan-400 to-blue-500"
    },
    {
      number: "04",
      icon: CheckCircle,
      title: "Kiểm Tra & Bàn Giao",
      description: "Kiểm tra kỹ lưỡng và bàn giao xe cùng hồ sơ bảo hành.",
      details: [
        "Kiểm tra toàn diện sau sửa chữa",
        "Chạy thử và đánh giá",
        "Vệ sinh xe sạch sẽ",
        "Bàn giao kèm hồ sơ bảo hành"
      ],
      color: "from-yellow-400 to-orange-500"
    },
    {
      number: "05",
      icon: CreditCard,
      title: "Thanh Toán",
      description: "Thanh toán linh hoạt qua nhiều hình thức: tiền mặt, chuyển khoản, thẻ.",
      details: [
        "Nhận hóa đơn chi tiết",
        "Thanh toán tiền mặt/chuyển khoản",
        "Thanh toán qua thẻ/ví điện tử",
        "Nhận phiếu bảo hành"
      ],
      color: "from-blue-500 to-cyan-500"
    },
    {
      number: "06",
      icon: FileText,
      title: "Hậu Mãi & Bảo Hành",
      description: "Hỗ trợ sau bán hàng, bảo hành theo cam kết và chăm sóc khách hàng.",
      details: [
        "Bảo hành theo cam kết",
        "Hỗ trợ 24/7 qua hotline",
        "Nhắc lịch bảo dưỡng định kỳ",
        "Ưu đãi cho khách hàng thân thiết"
      ],
      color: "from-orange-400 to-yellow-500"
    }
  ];

  const faqs = [
    {
      question: "Mất bao lâu để hoàn thành dịch vụ?",
      answer: "Tùy vào loại dịch vụ: Bảo dưỡng cơ bản 1-2 giờ, sửa chữa phức tạp có thể mất 1-2 ngày."
    },
    {
      question: "Có cần đặt lịch trước không?",
      answer: "Nên đặt lịch trước để đảm bảo có slot phù hợp. Tuy nhiên chúng tôi cũng nhận khách vãng lai."
    },
    {
      question: "Có dịch vụ đưa đón xe không?",
      answer: "Có, chúng tôi cung cấp dịch vụ đưa đón xe miễn phí trong bán kính 5km."
    },
    {
      question: "Bảo hành như thế nào?",
      answer: "Bảo hành 6-12 tháng tùy loại dịch vụ và linh kiện. Có phiếu bảo hành chính thức."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-32 px-0 overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800" style={{ background: 'linear-gradient(135deg, #014091 0%, #0991f3 100%)' }}>
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
                Quy Trình
              </span>
              <span className="block">Dịch Vụ</span>
            </h1>

            <p
              className="text-2xl mb-12 leading-relaxed max-w-3xl mx-auto animate-fade-in-up font-light"
              style={{
                color: 'rgba(255, 255, 255, 0.95)',
                textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
                animationDelay: '0.4s'
              }}
            >
              6 bước đơn giản để xe của bạn được chăm sóc tốt nhất
            </p>
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2
              className="text-4xl lg:text-5xl font-bold mb-6"
              style={{ color: '#014091' }}
            >
              Quy Trình Chi Tiết
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Chúng tôi cam kết quy trình làm việc chuyên nghiệp, minh bạch và hiệu quả
            </p>
          </div>

          <div className="space-y-12">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex flex-col lg:flex-row gap-8 items-center ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                  }`}
              >
                {/* Step Number & Icon */}
                <div className="lg:w-1/3 flex flex-col items-center">
                  <div
                    className={`bg-gradient-to-br ${step.color} w-32 h-32 rounded-full flex items-center justify-center shadow-2xl mb-4`}
                  >
                    <step.icon className="h-16 w-16 text-white" />
                  </div>
                  <div
                    className="text-6xl font-bold opacity-20"
                    style={{ color: '#014091' }}
                  >
                    {step.number}
                  </div>
                </div>

                {/* Step Content */}
                <div className="lg:w-2/3 bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300">
                  <h3
                    className="text-3xl font-bold mb-4"
                    style={{ color: '#014091' }}
                  >
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                    {step.description}
                  </p>
                  <ul className="space-y-3">
                    {step.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start">
                        <CheckCircle className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2
              className="text-4xl lg:text-5xl font-bold mb-6"
              style={{ color: '#014091' }}
            >
              Câu Hỏi Thường Gặp
            </h2>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-start">
                  <span
                    className="text-2xl mr-3"
                    style={{ color: '#f6ae2d' }}
                  >
                    Q:
                  </span>
                  {faq.question}
                </h3>
                <p className="text-gray-600 leading-relaxed ml-10">
                  <span
                    className="font-bold mr-2"
                    style={{ color: '#0991f3' }}
                  >
                    A:
                  </span>
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8" style={{ background: 'linear-gradient(135deg, #014091 0%, #0991f3 100%)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-white">
              Sẵn Sàng Bắt Đầu?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Đặt lịch ngay hôm nay để trải nghiệm dịch vụ chuyên nghiệp
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
              <Phone className="h-12 w-12 text-yellow-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Hotline</h3>
              <p className="text-white/90">1900-xxxx</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
              <MapPin className="h-12 w-12 text-yellow-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Địa chỉ</h3>
              <p className="text-white/90">123 Đường ABC, TP.HCM</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
              <Calendar className="h-12 w-12 text-yellow-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Giờ làm việc</h3>
              <p className="text-white/90">T2-T7: 8:00 - 18:00</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/booking')}
              className="px-10 py-4 rounded-lg font-bold text-lg uppercase tracking-wider transition-all duration-300 hover:shadow-2xl hover:scale-105"
              style={{
                backgroundColor: '#f6ae2d',
                color: '#014091'
              }}
            >
              Đặt Lịch Ngay
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

export default ProcessGuide;

