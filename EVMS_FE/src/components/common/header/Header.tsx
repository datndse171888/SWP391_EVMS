import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { COLOR } from '../../../constants/color/Color';
import logo from '../../../assets/images/logo.png';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);
  const location = useLocation();

  const navigationItems = [
    { name: 'TRANG CHỦ', path: '/' },
    { name: 'GIỚI THIỆU', path: '/about' },
    { name: 'DỊCH VỤ', path: '/services', hasDropdown: true },
    { name: 'LINH KIỆN', path: '/pages', hasDropdown: true },
    { name: 'LIÊN HỆ', path: '/contact' },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Show header only when at top of the page
  useEffect(() => {
    const handleScroll = () => {
      const atTop = window.scrollY <= 8;
      setIsAtTop(atTop);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className="fixed top-0 left-0 right-0 z-50 transform transition-transform duration-300"
      style={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderBottom: `1px solid ${COLOR.gray[2]}`,
        transform: isAtTop ? 'translateY(0)' : 'translateY(-100%)'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center space-x-3">
              <img 
                src={logo} 
                alt="EVMS Logo" 
                className="w-20 h-20"
              />
              <span 
                className="text-2xl text-white"
                style={{ 
                  fontFamily: '"Alan Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  fontWeight: 800,
                  textShadow: '1px 1px 0px #666, -1px -1px 0px #666, 1px -1px 0px #666, -1px 1px 0px #666, 0 0 5px rgba(0, 0, 0, 0.5)',
                  WebkitTextStroke: '0.5px #666',
                  letterSpacing: '0.8px',
                  textTransform: 'none'
                }}
              >
                EVRepair
              </span>
            </Link>
          </div>

          {/* Desktop Navigation - Shifted to the right, closer to search */}
          <nav className="hidden lg:flex items-center space-x-8 ml-auto mr-8">
            {navigationItems.map((item) => (
              <div key={item.name} className="relative group">
                <Link
                  to={item.path}
                  className={`text-sm font-semibold uppercase tracking-wider transition-all duration-200 flex items-center space-x-1 ${
                    isActive(item.path)
                      ? 'text-white'
                      : 'text-white hover:text-gray-300'
                  }`}
                  style={{
                    color: isActive(item.path) ? COLOR.yellow[0] : COLOR.blue[0],
                    fontFamily: '"Open Sans", sans-serif',
                    fontSize: '14px',
                    textShadow: '0 0 8px rgba(255, 255, 255, 0.8)',
                    fontWeight: isActive(item.path) ? 700 : 600
                  }}
                >
                  <span>{item.name}</span>
                  {item.hasDropdown && (
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  )}
                </Link>
                {item.hasDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="py-2">
                      <Link to="/services/car" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Bảo dưỡng ô tô điện
                      </Link>
                      <Link to="/services/motorcycle" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Bảo dưỡng xe máy điện
                      </Link>
                      <Link to="/services/bicycle" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Bảo dưỡng xe đạp điện
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right side - Search and Login */}
          <div className="hidden lg:flex items-center space-x-4">

            {/* Login Button */}
            <button
              className="px-6 py-3 rounded-lg font-semibold text-sm uppercase tracking-wider transition-all duration-200 hover:shadow-lg"
              style={{
                backgroundColor: COLOR.yellow[0],
                color: COLOR.blue[0],
                fontFamily: 'Arial, sans-serif'
              }}
            >
              ĐĂNG NHẬP
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-white hover:text-gray-300 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-white border-opacity-20">
            <div className="px-2 pt-4 pb-6 space-y-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`block px-4 py-3 text-base font-semibold uppercase tracking-wider transition-all duration-200 ${
                    isActive(item.path)
                      ? 'text-white'
                      : 'text-white hover:text-gray-300'
                  }`}
                  style={{
                    color: isActive(item.path) ? COLOR.yellow[0] : COLOR.blue[0],
                    fontFamily: '"Open Sans", sans-serif',
                    fontSize: '14px',
                    textShadow: '0 0 8px rgba(255, 255, 255, 0.8)',
                    fontWeight: isActive(item.path) ? 700 : 600
                  }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-4">
                <button
                  className="w-full px-6 py-3 rounded-lg text-white font-semibold text-sm uppercase tracking-wider transition-all duration-200"
                  style={{
                    backgroundColor: COLOR.yellow[0],
                    color: COLOR.blue[0],
                    fontFamily: 'Arial, sans-serif'
                  }}
                >
                  Đăng nhập
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
