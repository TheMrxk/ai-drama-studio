import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Film, LogOut, Settings, Home, PlusCircle, User } from 'lucide-react'
import { Button } from './ui/button'
import { api } from '../lib/api'

export default function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState<{ username: string } | null>(null)

  useEffect(() => {
    // 从后端 API 获取用户信息
    api.auth.getProfile().then((data) => {
      setUser({
        username: data.username,
      })
    }).catch((err) => {
      console.error('Failed to load user profile:', err)
    })
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  const isActive = (path: string) => {
    return location.pathname === path
  }

  const navItems = [
    { path: '/projects', label: '我的项目', icon: Home },
    { path: '/new', label: '新建项目', icon: PlusCircle },
    { path: '/settings', label: '设置', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <Link to="/projects" className="flex items-center gap-2">
                <Film className="h-8 w-8 text-secondary" />
                <h1 className="text-2xl font-bold text-white">AI Drama Studio</h1>
              </Link>
              <nav className="flex items-center space-x-2">
                {navItems.map((item) => (
                  <Link key={item.path} to={item.path}>
                    <Button
                      variant={isActive(item.path) ? 'secondary' : 'ghost'}
                      size="sm"
                      className="gap-2"
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex items-center gap-4">
              {user && (
                <Link to="/profile">
                  <div className="flex items-center gap-2 cursor-pointer hover:opacity-80">
                    <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                      <User className="h-4 w-4 text-secondary-foreground" />
                    </div>
                    <div className="text-sm text-white">欢迎：{user.username}</div>
                  </div>
                </Link>
              )}
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                退出
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center text-muted-foreground">
          <p>AI Drama Studio © 2026 - AI 短剧生成器</p>
        </div>
      </footer>
    </div>
  )
}
