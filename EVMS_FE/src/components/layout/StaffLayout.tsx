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
      name: 'Quản lý dịch vụ', 
      path: '/staff/services', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    { 
      name: 'Lịch hẹn', 
      path: '/staff/appointments', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    { 
      name: 'Báo cáo', 
      path: '/staff/reports', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    { 
      name: 'Hồ sơ cá nhân', 
      path: '/staff/profile', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#93bde7' }}>
      {/* Sidebar */}
      <aside className={`bg-white shadow-lg min-h-screen flex flex-col transition-all duration-300 ease-in-out ${
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
            <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {user?.fullName?.charAt(0) || user?.userName?.charAt(0) || 'S'}
            </div>
            
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
      <div className="flex-1 flex flex-col" style={{ backgroundColor: '#f8fafc' }}>
        {/* Main content area */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
