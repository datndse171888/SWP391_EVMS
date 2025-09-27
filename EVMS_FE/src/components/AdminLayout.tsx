import React from 'react'
import { Link, useLocation } from 'react-router-dom'

interface AdminLayoutProps {
  children: React.ReactNode
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation()

  const isActive = (path: string) => {
    return location.pathname === path
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-72 bg-gradient-to-b from-blue-500 to-blue-600 text-white flex flex-col shadow-2xl">
        {/* Logo */}
        <div className="p-8 border-b border-blue-400">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">E</span>
            </div>
            <h1 className="text-2xl font-bold">EVMS</h1>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-6">
          <ul className="space-y-3">
            <li>
              <Link 
                to="/admin" 
                className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 ${
                  isActive('/admin') 
                    ? 'bg-white/20 text-white shadow-md backdrop-blur-sm' 
                    : 'hover:bg-white/10 text-white/80'
                }`}
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
                <span className="font-semibold">Dashboard</span>
              </Link>
            </li>
            <li>
              <Link 
                to="#" 
                className="flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-white/10 text-white/80 transition-all duration-300"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a2 2 0 114 0 2 2 0 01-4 0zm8 0a2 2 0 114 0 2 2 0 01-4 0z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Sự kiện</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/admin/users" 
                className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 ${
                  isActive('/admin/users') 
                    ? 'bg-white/20 text-white shadow-md backdrop-blur-sm' 
                    : 'hover:bg-white/10 text-white/80'
                }`}
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
                <span className="font-medium">Người dùng</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/admin/technicians" 
                className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 ${
                  isActive('/admin/technicians') 
                    ? 'bg-white/20 text-white shadow-md backdrop-blur-sm' 
                    : 'hover:bg-white/10 text-white/80'
                }`}
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                  <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                </svg>
                <span className="font-medium">Kỹ thuật viên</span>
              </Link>
            </li>
            <li>
              <Link 
                to="#" 
                className="flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-white/10 text-white/80 transition-all duration-300"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Báo cáo</span>
              </Link>
            </li>
          </ul>
        </nav>

        {/* Upgrade Banner */}
        <div className="p-6 m-6 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20">
          <div className="flex items-center gap-3 mb-3">
            <svg className="w-6 h-6 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-bold">Nâng cấp ngay</span>
          </div>
          <p className="text-xs text-white/80 mb-4">Tận dụng tối đa các tính năng</p>
          <button className="w-full bg-gradient-to-r from-orange-400 to-orange-500 text-white text-sm py-3 rounded-xl hover:from-orange-500 hover:to-orange-600 transition-all duration-300 shadow-md hover:shadow-lg">
            Nâng cấp
          </button>
        </div>

        {/* User Profile */}
        <div className="p-6 border-t border-blue-400">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-semibold">Admin User</div>
              <div className="text-xs text-white/70">admin@evms.com</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}

export default AdminLayout
