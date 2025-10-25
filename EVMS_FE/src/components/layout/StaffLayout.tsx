import React, { type ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface StaffLayoutProps {
  children: ReactNode;
}

export const StaffLayout: React.FC<StaffLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  const staffMenuItems = [
    { 
      name: 'Dashboard', 
      path: '/staff/dashboard', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
        </svg>
      )
    },
    { 
      name: 'Trò chuyện với khách hàng', 
      path: '/staff/customers', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      )
    },
    { 
      name: 'Quản lý lịch hẹn', 
      path: '/staff/appointments', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      )
    },
    { 
      name: 'Quản lý linh kiện', 
      path: '/staff/parts', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      )
    },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Make chat and dashboard pages full width
  const isFullWidth = location.pathname.startsWith('/staff/customers') || location.pathname.startsWith('/staff/dashboard');

  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  return (
    <div className="h-screen flex overflow-hidden" style={{ backgroundColor: '#93bde7' }}>
      {/* Sidebar */}
      <aside className={`bg-white shadow-lg h-full flex flex-col transition-all duration-300 ease-in-out ${
        sidebarExpanded ? 'w-64' : 'w-16'
      }`}>
        {/* Hamburger Button */}
        <div className="flex justify-center py-3">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-5 h-5 flex flex-col justify-center space-y-1">
              <div className="w-4 h-0.5 bg-gray-600 rounded"></div>
              <div className="w-4 h-0.5 bg-gray-600 rounded"></div>
              <div className="w-4 h-0.5 bg-gray-600 rounded"></div>
            </div>
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-2 flex flex-col justify-center">
          <div className="space-y-2">
            {staffMenuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center ${
                  sidebarExpanded ? 'px-3 py-2.5' : 'justify-center px-2 py-2.5'
                } text-sm font-medium rounded-full transition-all duration-200 ${
                  isActive(item.path)
                    ? 'text-white shadow-md'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                }`}
                style={{
                  backgroundColor: isActive(item.path) ? '#014091' : 'transparent'
                }}
                title={sidebarExpanded ? '' : item.name}
              >
                <span className={`${sidebarExpanded ? 'mr-3' : ''}`} style={{
                  filter: isActive(item.path) ? 'none' : 'grayscale(100%) brightness(0.7)'
                }}>
                  {item.icon}
                </span>
                {sidebarExpanded && (
                  <span className="truncate">{item.name}</span>
                )}
              </Link>
            ))}
          </div>
        </nav>

        {/* Bottom Section - Avatar and Logout */}
        <div className="pb-4">
          <div className="flex flex-col items-center space-y-3">
            {/* Avatar */}
            <Link
              to="/staff/profile"
              className="w-11 h-11 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-semibold text-sm hover:from-blue-600 hover:to-blue-800 transition-all duration-200 cursor-pointer"
              title={sidebarExpanded ? '' : 'Hồ sơ cá nhân'}
            >
              {user?.fullName?.charAt(0) || user?.userName?.charAt(0) || 'S'}
            </Link>
            
            {/* Logout Button */}
            <button
              onClick={logout}
              className={`flex items-center ${
                sidebarExpanded ? 'px-3 py-2' : 'justify-center p-2'
              } rounded-full hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors`}
              title={sidebarExpanded ? '' : 'Đăng xuất'}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {sidebarExpanded && (
                <span className="ml-2 text-sm">Đăng xuất</span>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 h-screen" style={{ backgroundColor: '#f8fafc' }}>
        <div className={`${isFullWidth ? 'p-0' : 'p-6'}`}>
          <div className={`${isFullWidth ? 'w-full' : 'max-w-7xl mx-auto'}`}>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};
