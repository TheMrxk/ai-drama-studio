import { Navigate } from 'react-router-dom'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

  if (!token) {
    // 未登录，重定向到登录页，并记录想要访问的路径
    const currentPath = window.location.pathname
    return <Navigate to={`/login?redirect=${encodeURIComponent(currentPath)}`} replace />
  }

  return children
}
