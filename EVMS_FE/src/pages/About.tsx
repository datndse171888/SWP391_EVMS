import React, { useState } from 'react';
import {
  Zap,
  Shield,
  Users,
  Award,
  Battery,
  Settings,
  CheckCircle,
  ArrowRight,
  Mail,
  Phone,
  MapPin,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
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

const TEAM = [
  { id: 1, name: 'Nguyễn Văn A', role: 'Quản lý cơ sở', phone: '0123 456 789', email: 'a@example.com' },
  { id: 2, name: 'Trần Thị B', role: 'Trợ lý kỹ thuật', phone: '0987 654 321', email: 'b@example.com' },
  { id: 3, name: 'Lê Văn C', role: 'Nhân viên bảo trì', phone: '0912 345 678', email: 'c@example.com' },
];

const FAQ = [
  { q: 'Làm sao để đặt lịch?', a: 'Bạn có thể đặt lịch qua trang Lịch hẹn hoặc gọi số hotline.' },
  { q: 'Có dịch vụ tại nhà không?', a: 'Hiện tại chúng tôi cung cấp dịch vụ tại cơ sở; dịch vụ tại nhà theo thỏa thuận.' },
  { q: 'Chính sách bảo hành như thế nào?', a: 'Mỗi dịch vụ hiển thị thông tin bảo hành cụ thể; liên hệ nhân viên để biết chi tiết.' },
];

const AVATAR_BG = ['from-green-400 to-blue-500', 'from-pink-400 to-yellow-400', 'from-indigo-400 to-purple-500'];

const About: React.FC = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

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

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !message) {
      setStatus('error');
      return;
    }
    setStatus('sending');
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email, message }),
      });
      setStatus('success');
      setName(''); setPhone(''); setEmail(''); setMessage('');
      setTimeout(() => setStatus('idle'), 2500);
    } catch {
      window.location.href = `mailto:contact@facility.com?subject=${encodeURIComponent('Yêu cầu từ ' + (name || 'Khách'))}&body=${encodeURIComponent(message)}`;
      setStatus('idle');
    }
  };

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

      {/* Contact Section */}
      <section id="contact" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <header className="bg-gradient-to-r from-[#0f172a] to-[#1e293b] text-white rounded-2xl p-6 shadow-lg flex items-center gap-6 mb-8">
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-2">Liên hệ & Thông tin cơ sở</h2>
              <p className="text-sm mt-1 text-slate-200/80">Mọi thắc mắc về dịch vụ, linh kiện hoặc lịch hẹn — liên hệ với chúng tôi.</p>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <a href="tel:0123456789" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-md shadow-sm">
                <Phone className="w-4 h-4" /> Hotline: (012) 345-6789
              </a>
              <Link to="/" className="text-sm text-white/80">Trở về</Link>
            </div>
          </header>

          {/* Main grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left - info */}
            <aside className="lg:col-span-1 space-y-4">
              <div className="bg-white rounded-2xl p-5 shadow-md border-l-4 border-green-400">
                <div className="flex items-start gap-3">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-green-100 to-green-200">
                    <MapPin className="w-5 h-5 text-green-700" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">Địa chỉ</h3>
                    <p className="text-xs text-slate-500 mt-1">123 Đường ABC, Phường 1, Thành phố XYZ, Việt Nam</p>
                  </div>
                </div>

                <div className="mt-4 flex items-start gap-3">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200">
                    <Phone className="w-5 h-5 text-blue-700" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">Điện thoại</h3>
                    <p className="text-xs text-slate-500 mt-1">(012) 345-6789</p>
                  </div>
                </div>

                <div className="mt-4 flex items-start gap-3">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-pink-100 to-pink-200">
                    <Mail className="w-5 h-5 text-pink-700" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">Email</h3>
                    <p className="text-xs text-slate-500 mt-1">contact@facility.com</p>
                  </div>
                </div>

                <div className="mt-4 flex items-start gap-3">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-yellow-100 to-yellow-200">
                    <Clock className="w-5 h-5 text-yellow-700" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">Giờ làm việc</h3>
                    <p className="text-xs text-slate-500 mt-1">T2–T6: 8:00–17:00 · T7: 9:00–12:00 · CN: Đóng</p>
                  </div>
                </div>

                <div className="mt-5 border-t pt-4">
                  <h4 className="text-sm font-semibold mb-2">Mạng xã hội</h4>
                  <div className="flex gap-3">
                    <a href="#" className="text-white bg-[#1877F2] px-3 py-2 rounded-md text-sm shadow-sm">Facebook</a>
                    <a href="#" className="text-white bg-[#FF0000] px-3 py-2 rounded-md text-sm shadow-sm">YouTube</a>
                    <a href="#" className="text-white bg-gradient-to-tr from-[#F00075] via-[#FF6A00] to-[#FFC800] px-3 py-2 rounded-md text-sm shadow-sm">Instagram</a>
                  </div>
                </div>
              </div>

              {/* Team */}
              <div className="bg-white rounded-2xl p-4 shadow-md border">
                <h4 className="text-sm font-semibold mb-3">Đội ngũ liên hệ</h4>
                <ul className="space-y-3">
                  {TEAM.map((member, i) => (
                    <li key={member.id} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${AVATAR_BG[i % AVATAR_BG.length]} flex items-center justify-center text-white font-semibold`}>
                          {member.name.split(' ').map(n => n[0]).slice(-2).join('')}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-800">{member.name}</div>
                          <div className="text-xs text-slate-500">{member.role}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <a className="text-xs text-slate-500 block" href={`tel:${member.phone}`}>{member.phone}</a>
                        <a className="text-xs text-slate-500 block" href={`mailto:${member.email}`}>{member.email}</a>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Quick map small */}
              <div className="bg-white rounded-2xl p-3 shadow-md border">
                <h4 className="text-sm font-semibold mb-2">Bản đồ (nhanh)</h4>
                <div className="w-full h-40 rounded-md overflow-hidden ring-1 ring-slate-100">
                  <iframe
                    title="facility-map"
                    src="https://maps.google.com/maps?q=Hanoi&t=&z=13&ie=UTF8&iwloc=&output=embed"
                    className="w-full h-full border-0"
                  />
                </div>
              </div>
            </aside>

            {/* Right - form and FAQ */}
            <main className="lg:col-span-2 space-y-6">
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-6 shadow-md border border-indigo-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-500">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Thông tin liên hệ nhanh</h2>
                    <p className="text-sm text-slate-600">Nhiều cách để kết nối với chúng tôi</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-2">
                      <Phone className="w-5 h-5 text-green-600" />
                      <h3 className="font-semibold text-slate-800">Gọi điện trực tiếp</h3>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">Hotline hỗ trợ 24/7</p>
                    <a href="tel:0123456789" className="text-lg font-bold text-green-600 hover:text-green-700">(012) 345-6789</a>
                  </div>

                  <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-2">
                      <Mail className="w-5 h-5 text-blue-600" />
                      <h3 className="font-semibold text-slate-800">Gửi Email</h3>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">Phản hồi trong 24h</p>
                    <a href="mailto:contact@facility.com" className="text-lg font-bold text-blue-600 hover:text-blue-700">contact@facility.com</a>
                  </div>

                  <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-2">
                      <MapPin className="w-5 h-5 text-orange-600" />
                      <h3 className="font-semibold text-slate-800">Ghé thăm cơ sở</h3>
                    </div>
                    <p className="text-sm text-slate-600">123 Đường ABC, Phường 1<br />Thành phố XYZ, Việt Nam</p>
                  </div>

                  <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-2">
                      <Clock className="w-5 h-5 text-purple-600" />
                      <h3 className="font-semibold text-slate-800">Giờ làm việc</h3>
                    </div>
                    <p className="text-sm text-slate-600">T2-T6: 8:00 - 17:00<br />T7: 9:00 - 12:00 · CN: Đóng cửa</p>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-white/60 rounded-lg border border-indigo-200">
                  <p className="text-sm text-slate-700 text-center">
                    💡 <strong>Mẹo:</strong> Để được hỗ trợ nhanh nhất, vui lòng chuẩn bị thông tin xe và mô tả vấn đề chi tiết khi liên hệ.
                  </p>
                </div>
              </div>

              {/* FAQ and services */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl p-5 shadow-md border">
                  <h3 className="text-sm font-semibold mb-3">Câu hỏi thường gặp</h3>
                  <dl className="space-y-3 text-sm text-slate-600">
                    {FAQ.map((f, i) => (
                      <div key={i} className="p-3 rounded-md hover:bg-slate-50">
                        <dt className="font-medium text-slate-800">{f.q}</dt>
                        <dd className="mt-1 text-slate-600">{f.a}</dd>
                      </div>
                    ))}
                  </dl>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow-md border">
                  <h3 className="text-sm font-semibold mb-3">Dịch vụ nổi bật</h3>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-3">
                      <div className="w-3 h-3 bg-[#10b981] rounded-full mt-2" />
                      <div>
                        <div className="font-medium text-slate-800">Bảo trì hệ thống pin <span className="ml-2 text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded">HOT</span></div>
                        <div className="text-xs text-slate-500">Chẩn đoán, thay cell, cân bằng</div>
                      </div>
                    </li>

                    <li className="flex items-start gap-3">
                      <div className="w-3 h-3 bg-[#3b82f6] rounded-full mt-2" />
                      <div>
                        <div className="font-medium text-slate-800">Cập nhật phần mềm <span className="ml-2 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">NEW</span></div>
                        <div className="text-xs text-slate-500">Firmware, cấu hình an toàn</div>
                      </div>
                    </li>

                    <li className="flex items-start gap-3">
                      <div className="w-3 h-3 bg-[#f97316] rounded-full mt-2" />
                      <div>
                        <div className="font-medium text-slate-800">Thay thế linh kiện <span className="ml-2 text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded">Ưu đãi</span></div>
                        <div className="text-xs text-slate-500">Pin, bộ điều khiển, cảm biến</div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </main>
          </div>
        </div>
      </section>
    </div>
  )
}

export default About

