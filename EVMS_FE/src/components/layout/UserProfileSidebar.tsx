// src/components/layout/UserSidebar.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const UserProfileSidebar: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="w-64 py-10 px-6 bg-[#f7fafd] min-h-full">
      {/* Back to home button */}
      <Link
        to="/"
        className="inline-flex items-center font-medium hover:underline bg-white rounded-lg px-3 py-1.5 shadow-sm mb-4 transition-colors"
        style={{ color: '#014091', border: '1px solid #e3f2fd' }}
      >
        <svg
          className="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Trang chủ
      </Link>
      
      {/* Navigation menu */}
      <nav className="flex flex-col gap-2">
        <Link
          to="/profile"
          className={`text-left px-4 py-3 rounded-lg font-medium transition-colors ${
            isActive('/profile')
              ? 'bg-white shadow-sm'
              : 'text-gray-600 hover:bg-opacity-10'
          }`}
          style={{ 
            color: isActive('/profile') ? '#014091' : '#5f6777'
          }}
          onMouseEnter={(e) => {
            if (!isActive('/profile')) {
              e.currentTarget.style.backgroundColor = 'rgba(9, 145, 243, 0.1)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isActive('/profile')) {
              e.currentTarget.style.backgroundColor = '';
            }
          }}
        >
          Hồ sơ người dùng
        </Link>
        
        <Link
          to="/maintenance"
          className={`text-left px-4 py-3 rounded-lg font-medium transition-colors ${
            isActive('/maintenance')
              ? 'bg-white shadow-sm'
              : 'text-gray-600 hover:bg-opacity-10'
          }`}
          style={{ 
            color: isActive('/maintenance') ? '#014091' : '#5f6777'
          }}
          onMouseEnter={(e) => {
            if (!isActive('/maintenance')) {
              e.currentTarget.style.backgroundColor = 'rgba(9, 145, 243, 0.1)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isActive('/maintenance')) {
              e.currentTarget.style.backgroundColor = '';
            }
          }}
        >
          Bảo dưỡng định kỳ
        </Link>

        <Link
          to="/appointment-history"
          className={`text-left px-4 py-3 rounded-lg font-medium transition-colors ${
            isActive('/appointment-history')
              ? 'bg-white shadow-sm'
              : 'text-gray-600 hover:bg-opacity-10'
          }`}
          style={{ 
            color: isActive('/appointment-history') ? '#014091' : '#5f6777'
          }}
          onMouseEnter={(e) => {
            if (!isActive('/appointment-history')) {
              e.currentTarget.style.backgroundColor = 'rgba(9, 145, 243, 0.1)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isActive('/appointment-history')) {
              e.currentTarget.style.backgroundColor = '';
            }
          }}
        >
          Lịch hẹn
        </Link>

        <Link
          to="/my-vehicles"
          className={`text-left px-4 py-3 rounded-lg font-medium transition-colors ${
            isActive('/my-vehicles')
              ? 'bg-white shadow-sm'
              : 'text-gray-600 hover:bg-opacity-10'
          }`}
          style={{ 
            color: isActive('/my-vehicles') ? '#014091' : '#5f6777'
          }}
          onMouseEnter={(e) => {
            if (!isActive('/my-vehicles')) {
              e.currentTarget.style.backgroundColor = 'rgba(9, 145, 243, 0.1)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isActive('/my-vehicles')) {
              e.currentTarget.style.backgroundColor = '';
            }
          }}
        >
          Phương tiện của tôi
        </Link>
      </nav>
    </div>
  );
};