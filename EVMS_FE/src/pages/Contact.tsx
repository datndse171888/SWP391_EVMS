// ...existing code...
import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

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

const Contact: React.FC = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-6 mt-20">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <header className="bg-gradient-to-r from-[#0f172a] to-[#1e293b] text-white rounded-2xl p-6 shadow-lg flex items-center gap-6">
          <div className="flex-1">
            <h1 className="text-2xl font-semibold">Liên hệ & Thông tin cơ sở</h1>
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
    </div>
  );
};

export default Contact;
// ...existing code...