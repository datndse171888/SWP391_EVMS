import React from 'react'
import { Link } from 'react-router-dom'
import logo from '../../../assets/images/logo.png'

const Footer: React.FC = () => {
  return (
    <footer className="py-16 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#1f2227' }}>
      <div className="max-w-7xl mx-auto">
        {/* Top Section - 4 Columns */}
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className="text-lg font-bold mb-4 text-white">
              Dịch vụ
              <div className="w-8 h-0.5 mt-2" style={{ backgroundColor: '#f6ae2d' }}></div>
            </h3>
            <ul className="space-y-3 text-white">
              <li className="hover:text-gray-300 transition-colors"><Link to="/services#ac">Dịch vụ sạc AC</Link></li>
              <li className="hover:text-gray-300 transition-colors"><Link to="/services#dc">Dịch vụ sạc DC</Link></li>
              <li className="hover:text-gray-300 transition-colors"><Link to="/services#home">Sạc tại nhà</Link></li>
              <li className="hover:text-gray-300 transition-colors"><Link to="/services#drivers">Dịch vụ cho tài xế xe điện</Link></li>
              <li className="hover:text-gray-300 transition-colors"><Link to="/services#points">Dịch vụ trạm sạc</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4 text-white">
              Hỗ trợ
              <div className="w-8 h-0.5 mt-2" style={{ backgroundColor: '#f6ae2d' }}></div>
            </h3>
            <ul className="space-y-3 text-white">
              <li className="hover:text-gray-300 transition-colors"><Link to="/support#help">Trung tâm trợ giúp</Link></li>
              <li className="hover:text-gray-300 transition-colors"><Link to="/support#ticket">Hỗ trợ yêu cầu</Link></li>
              <li className="hover:text-gray-300 transition-colors"><Link to="/support#faq">Câu hỏi thường gặp</Link></li>
              <li className="hover:text-gray-300 transition-colors"><Link to="/contact">Liên hệ</Link></li>
              <li className="hover:text-gray-300 transition-colors"><Link to="/community">Cộng đồng</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4 text-white">
              Công ty
              <div className="w-8 h-0.5 mt-2" style={{ backgroundColor: '#f6ae2d' }}></div>
            </h3>
            <ul className="space-y-3 text-white">
              <li className="hover:text-gray-300 transition-colors"><Link to="/about">Về chúng tôi</Link></li>
              <li className="hover:text-gray-300 transition-colors"><Link to="/leadership">Ban lãnh đạo</Link></li>
              <li className="hover:text-gray-300 transition-colors"><Link to="/careers">Tuyển dụng</Link></li>
              <li className="hover:text-gray-300 transition-colors"><Link to="/news">Tin tức & Bài viết</Link></li>
              <li className="hover:text-gray-300 transition-colors"><Link to="/legal">Thông báo pháp lý</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4 text-white">
              Kết nối với chúng tôi
              <div className="w-8 h-0.5 mt-2" style={{ backgroundColor: '#f6ae2d' }}></div>
            </h3>
            <ul className="space-y-3 text-white">
              <li>FPT University</li>
              <li><a href="mailto:support@yourdomain.tld" className="hover:text-gray-300 transition-colors">annthaijob@gmail.com</a></li>
              <li><a href="tel:+622120022012" className="hover:text-gray-300 transition-colors">+98843399</a></li>
            </ul>
          </div>
        </div>

        {/* Middle Section - Logo & Newsletter */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <img src={logo} alt="EVRepair Logo" className="w-12 h-12" />
              <span className="text-2xl font-bold text-white">EVRepair</span>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4 text-white">
              Đăng ký nhận bản tin để cập nhật thông tin, tin tức, góc nhìn và khuyến mãi.
            </h3>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Email"
                className="flex-1 px-4 py-3 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              <button
                className="px-6 py-3 rounded-lg font-bold text-white uppercase tracking-wider transition-all duration-200 hover:shadow-lg"
                style={{ backgroundColor: '#f6ae2d' }}
              >
                ĐĂNG KÝ
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Section - Copyright & Legal */}
        <div className="border-t pt-8" style={{ borderColor: '#3f444f' }}>
          <div className="flex flex-col md:flex-row justify-between items-center text-white text-sm">
            <div>
              Bản quyền © 2022 EVRepair. 
            </div>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <Link to="/terms" className="hover:text-gray-300 transition-colors">Điều khoản sử dụng</Link>
              <span>■</span>
              <Link to="/privacy" className="hover:text-gray-300 transition-colors">Chính sách bảo mật</Link>
              <span>■</span>
              <Link to="/cookies" className="hover:text-gray-300 transition-colors">Chính sách Cookie</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer


