import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import logo from '../../assets/images/logo.png'

interface AdminLayoutProps {
  children: React.ReactNode
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [collapsed, setCollapsed] = React.useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('evms_admin_sidebar_collapsed')
      return saved ? JSON.parse(saved) : false
    } catch {
      return false
    }
  })

  const toggleSidebar = () => {
    setCollapsed(prev => {
      const next = !prev
      try { localStorage.setItem('evms_admin_sidebar_collapsed', JSON.stringify(next)) } catch {}
      return next
    })
  }

  const isActive = (path: string) => {
    return location.pathname === path
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="h-screen bg-white flex overflow-hidden">
      {/* Sidebar */}
      <aside className={`${collapsed ? 'w-20' : 'w-72'} bg-blue-0 text-white flex flex-col shadow-2xl transition-all duration-300 relative`}>
        {/* Logo */}
        <div className="p-6 border-b border-yellow-0 relative">
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-4'}`}>
            <img src={logo} alt="EVRepair Logo" className="w-12 h-12 rounded-lg bg-white shrink-0" style={{ minWidth: 48, minHeight: 48 }} />
            {!collapsed && (
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
            )}
            {/* toggle button positioned on the edge to avoid clipping */}
            <button onClick={toggleSidebar} className="absolute top-1/2 -translate-y-1/2 right-0 translate-x-1/2 inline-flex items-center justify-center w-10 h-10 rounded-full border border-yellow-0 bg-yellow-0 text-blue-0 hover:opacity-90 shadow-lg z-20" title={collapsed ? 'Mở rộng' : 'Thu gọn'} aria-label={collapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'} style={{ right: '-12px' }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                {collapsed ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                )}
              </svg>
            </button>
          </div>
            </div>
            
        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <li>
              <Link 
                to="/admin" 
                className={`flex items-center ${collapsed ? 'justify-center px-0' : 'gap-4 px-4'} h-12 rounded-2xl transition-all duration-300 ${
                  isActive('/admin') ? 'bg-yellow-0 text-blue-0 shadow-lg' : 'hover:bg-blue-7 text-white/80'
                }`}
              >
                <svg className="w-6 h-6 flex-none" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
                {!collapsed && <span className="font-medium">Dashboard</span>}
              </Link>
            </li>
            <li>
              {/* Sự kiện đã bị loại bỏ */}
            </li>
            <li>
              <Link 
                to="/admin/users" 
                className={`flex items-center ${collapsed ? 'justify-center px-0' : 'gap-4 px-4'} h-12 rounded-2xl transition-all duration-300 ${
                  isActive('/admin/users') ? 'bg-yellow-0 text-blue-0 shadow-lg' : 'hover:bg-blue-7 text-white/80'
                }`}
              >
                <svg className="w-6 h-6 flex-none" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
                {!collapsed && <span className="font-medium">Người dùng</span>}
              </Link>
            </li>
            <li>
              <Link 
                to="/admin/technicians" 
                className={`flex items-center ${collapsed ? 'justify-center px-0' : 'gap-4 px-4'} h-12 rounded-2xl transition-all duration-300 ${
                  isActive('/admin/technicians') ? 'bg-yellow-0 text-blue-0 shadow-lg' : 'hover:bg-blue-7 text-white/80'
                }`}
              >
                <svg className="w-6 h-6 flex-none" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
                {!collapsed && <span className="font-medium">Kỹ thuật viên</span>}
              </Link>
            </li>
            {/* Báo cáo đã bị loại bỏ */}
          </ul>
        </nav>

        {/* User Profile */}
        <div className="p-6 border-t border-blue-400">
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-4'} mb-4`}>
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt="Avatar"
                className="w-10 h-10 rounded-full border-2 border-white/30 flex-none"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-none">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
            )}
            {!collapsed && (
              <div className="flex-1">
                <div className="text-sm font-semibold">{user?.fullName || user?.userName || 'Admin User'}</div>
                <div className="text-xs text-white/70">{user?.email || 'admin@evms.com'}</div>
              </div>
            )}
          </div>
          
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center justify-center ${collapsed ? 'min-w-[40px]' : 'gap-2'} px-4 py-2 border border-yellow-0 text-yellow-0 hover:bg-yellow-0 hover:text-blue-0 rounded-lg transition-all duration-200 group`}
            title="Đăng xuất"
            aria-label="Đăng xuất"
          >
            <svg className="w-5 h-5 flex-none group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {!collapsed && <span className="text-sm font-medium">Đăng xuất</span>}
          </button>
        </div>
        </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
      </div>
  )
}
