import React, { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { COLOR } from '../../constants/color/Color';

interface TechnicianLayoutProps {
  children: ReactNode;
}

export const TechnicianLayout: React.FC<TechnicianLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const technicianMenuItems = [
    { name: 'Dashboard', path: '/technician/dashboard', icon: '📊' },
    { name: 'Công việc của tôi', path: '/technician/tasks', icon: '🔧' },
    { name: 'Lịch hẹn', path: '/technician/appointments', icon: '📅' },
    { name: 'Dịch vụ', path: '/technician/services', icon: '⚙️' },
    { name: 'Hồ sơ cá nhân', path: '/technician/profile', icon: '👤' },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Technician Dashboard
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Xin chào, {user?.fullName || user?.userName}
              </span>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm font-medium text-white rounded-md hover:bg-red-600 transition-colors"
                style={{ backgroundColor: COLOR.red[0] }}
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm min-h-screen">
          <nav className="mt-5 px-2">
            <div className="space-y-1">
              {technicianMenuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive(item.path)
                      ? 'text-white'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  style={{
                    backgroundColor: isActive(item.path) ? COLOR.blue[0] : 'transparent'
                  }}
                >
                  <span className="mr-3 text-lg">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </div>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
