import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { authApi } from '../utils/api'

export default function Layout() {
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    authApi.logout()
    navigate('/login')
  }

  const isActive = (path) => {
    return location.pathname === path ? 'text-secondary font-semibold' : 'text-gray-300 hover:text-white'
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-primary border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-white">🎬 AI Drama Studio</h1>
              <nav className="ml-10 flex space-x-6">
                <Link to="/projects" className={`${isActive('/projects')} transition`}>
                  我的项目
                </Link>
                <Link to="/new" className={`${isActive('/new')} transition`}>
                  新建项目
                </Link>
                <Link to="/settings" className={`${isActive('/settings')} transition`}>
                  设置
                </Link>
              </nav>
            </div>
            <button
              onClick={handleLogout}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
            >
              退出
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center text-gray-400">
          <p>AI Drama Studio © 2026 - AI 短剧生成器</p>
        </div>
      </footer>
    </div>
  )
}
