import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import logo from '../../assets/images/logo.png';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);
  const [isAvatarDropdownOpen, setIsAvatarDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const navigationItems = [
    { name: 'TRANG CHỦ', path: '/' },
    { name: 'GIỚI THIỆU', path: '/introduction' },
    { name: 'DỊCH VỤ', path: '/service', hasDropdown: true },
    { name: 'LINH KIỆN', path: '/pages', hasDropdown: true },
    { name: 'LIÊN HỆ', path: '/contact' },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsAvatarDropdownOpen(false);
  };

  const getProfilePath = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'admin': return '/admin/profile';
      case 'staff': return '/staff/profile';
      case 'technician': return '/technician/profile';
      case 'customer': return '/profile';
      default: return '/profile';
    }
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'admin': return '/admin';
      case 'staff': return '/staff/dashboard';
      case 'technician': return '/technician/dashboard';
      case 'customer': return '/customer/dashboard';
      default: return '/login';
    }
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

  // Close avatar dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isAvatarDropdownOpen) {
        const target = event.target as Element;
        if (!target.closest('.avatar-dropdown')) {
          setIsAvatarDropdownOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isAvatarDropdownOpen]);

  return (
    <header 
      className="fixed top-0 left-0 right-0 z-50 transform transition-transform duration-300"
      style={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderBottom: `1px solid #aaafbb`,
        transform: isAtTop ? 'translateY(0)' : 'translateY(-100%)'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center space-x-1">
              <img 
                src={logo} 
                alt="EVMS Logo" 
                className="w-23 h-23"
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
                Car Care
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
                    color: isActive(item.path) ? '#f6ae2d' : '#014091',
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
                      <Link to="/carService" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Bảo dưỡng ô tô điện
                      </Link>
                      <Link to="/motoService" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Bảo dưỡng xe máy điện
                      </Link>
                      <Link to="/bikeService" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Bảo dưỡng xe đạp điện
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right side - User Menu */}
          <div className="hidden lg:flex items-center space-x-4">
            {isAuthenticated && user ? (
              <div className="relative avatar-dropdown">
                {/* Avatar with Dropdown */}
                <button
                  onClick={() => setIsAvatarDropdownOpen(!isAvatarDropdownOpen)}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="Avatar"
                      className="w-10 h-10 rounded-full border-2 border-white hover:border-gray-300 transition-colors cursor-pointer"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center border-2 border-white hover:border-gray-300 transition-colors cursor-pointer">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </button>

                {/* Dropdown Menu */}
                {isAvatarDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="py-2">
                      {/* Dashboard - Only for admin, staff, technician */}
                      {user.role !== 'customer' && (
                        <Link
                          to={getDashboardPath()}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={() => setIsAvatarDropdownOpen(false)}
                        >
                          Dashboard
                        </Link>
                      )}
                      <Link
                        to={getProfilePath()}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsAvatarDropdownOpen(false)}
                      >
                        View Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        Log out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login">
                <button
                  className="px-6 py-3 rounded-lg font-semibold text-sm uppercase tracking-wider transition-all duration-200 hover:shadow-lg"
                  style={{
                    backgroundColor: '#f6ae2d',
                    color: '#014091',
                    fontFamily: 'Arial, sans-serif'
                  }}
                >
                  ĐĂNG NHẬP
                </button>
              </Link>
            )}
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
                    color: isActive(item.path) ? '#f6ae2d' : '#014091',
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
                {isAuthenticated && user ? (
                  <div className="space-y-2">
                    {/* Mobile Avatar */}
                    <div className="flex items-center justify-center space-x-3">
                      {user.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt="Avatar"
                          className="w-12 h-12 rounded-full border-2 border-white"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-400 flex items-center justify-center border-2 border-white">
                          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                      <span className="text-white text-sm font-medium">
                        {user.fullName || user.userName}
                      </span>
                    </div>
                    
                    {/* Mobile Menu Options */}
                    <div className="space-y-2">
                      {/* Dashboard - Only for admin, staff, technician */}
                      {user.role !== 'customer' && (
                        <Link
                          to={getDashboardPath()}
                          className="block w-full px-6 py-3 rounded-lg text-white font-semibold text-sm uppercase tracking-wider transition-all duration-200 text-center"
                          style={{
                            backgroundColor: '#014091',
                            fontFamily: 'Arial, sans-serif'
                          }}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Dashboard
                        </Link>
                      )}
                      <Link
                        to={getProfilePath()}
                        className="block w-full px-6 py-3 rounded-lg text-white font-semibold text-sm uppercase tracking-wider transition-all duration-200 text-center"
                        style={{
                          backgroundColor: '#014091',
                          fontFamily: 'Arial, sans-serif'
                        }}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        View Profile
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsMenuOpen(false);
                        }}
                        className="w-full px-6 py-3 rounded-lg text-white font-semibold text-sm uppercase tracking-wider transition-all duration-200"
                        style={{
                          backgroundColor: '#ef4444',
                          fontFamily: 'Arial, sans-serif'
                        }}
                      >
                        Log out
                      </button>
                    </div>
                  </div>
                ) : (
                  <Link to="/login">
                    <button
                      className="w-full px-6 py-3 rounded-lg text-white font-semibold text-sm uppercase tracking-wider transition-all duration-200"
                      style={{
                        backgroundColor: '#f6ae2d',
                        color: '#014091',
                        fontFamily: 'Arial, sans-serif'
                      }}
                    >
                      Đăng nhập
                    </button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
