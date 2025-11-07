import React, { type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// CSS to hide scrollbar but keep scrolling functionality
const hideScrollbarStyles = `
  /* Chrome, Safari, Edge */
  .hide-scrollbar-main::-webkit-scrollbar {
    display: none;
  }
  /* Firefox */
  .hide-scrollbar-main {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
`;

interface TechnicianLayoutProps {
  children: ReactNode;
}

export const TechnicianLayout: React.FC<TechnicianLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Inject CSS for hiding scrollbar
  if (typeof document !== 'undefined' && !document.getElementById('hide-scrollbar-main-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'hide-scrollbar-main-styles';
    styleSheet.textContent = hideScrollbarStyles;
    document.head.appendChild(styleSheet);
  }

  const technicianMenuItems = [
    { name: 'Dashboard', path: '/technician/dashboard' },
    { name: 'Schedule', path: '/technician/schedule' },
    { name: 'Appointment', path: '/technician/appointments' },
  ];

  const isActive = (path: string) => {
    // Mark Appointment tab active on any appointment workspace route
    if (path === '/technician/appointments') {
      return location.pathname.startsWith('/technician/appointments');
    }
    return location.pathname === path;
  };

  const isProfilePage = location.pathname === '/technician/profile';

  // If profile page, render without header
  if (isProfilePage) {
    return (
      <div className="min-h-screen bg-[#f6f8fb]">
        {children}
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50">
      {/* Header */}
      <header className="bg-gray-50 py-3 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-100 rounded-full shadow-sm">
            <div className="flex justify-between items-center h-20 px-6">
              {/* Logo */}
              <div className="flex items-center space-x-2 flex-shrink-0">
                <img src="/logo.png" alt="Logo" className="h-12 w-auto" />
              </div>

              {/* Navigation Links - Centered */}
              <nav className="flex items-center space-x-2 flex-1 justify-center">
                <div className="flex items-center space-x-2 bg-gray-200 rounded-full px-2 py-1">
                  {technicianMenuItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        isActive(item.path)
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </nav>

              {/* Right Section - User Profile and Logout */}
              <div className="flex items-center space-x-2">
                {/* User Profile */}
                <button
                  onClick={() => navigate('/technician/profile')}
                  className="flex items-center space-x-2 hover:opacity-80 transition-opacity cursor-pointer"
                >
                  {user?.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="Avatar"
                      className="w-8 h-8 rounded-full border-2 border-white object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {user?.fullName?.charAt(0) || user?.userName?.charAt(0) || 'T'}
                    </div>
                  )}
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-medium text-gray-900">
                      {user?.fullName || user?.userName || 'Technician'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {user?.email || 'technician@evms.com'}
                    </span>
                  </div>
                </button>

                {/* Logout Button */}
                <button
                  onClick={logout}
                  className="p-2 hover:bg-red-100 transition-colors"
                  title="Đăng xuất"
                >
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-auto hide-scrollbar-main">
        <div className="max-w-7xl mx-auto h-full">
          {children}
        </div>
      </main>
    </div>
  );
};
