import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { projectApi } from '../utils/api'

export default function ProjectList() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      const response = await projectApi.list()
      setProjects(response.data)
    } catch (err) {
      setError('加载项目列表失败')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`确定要删除项目"${name}"吗？此操作不可恢复。`)) {
      return
    }

    try {
      await projectApi.delete(id)
      setProjects(projects.filter(p => p.id !== id))
    } catch (err) {
      setError('删除项目失败')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-400 text-xl">加载中...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-white">我的项目</h2>
        <Link
          to="/new"
          className="bg-primary hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition"
        >
          + 新建项目
        </Link>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {projects.length === 0 ? (
        <div className="bg-gray-800 rounded-xl p-12 text-center">
          <div className="text-6xl mb-4">🎬</div>
          <h3 className="text-xl font-semibold text-white mb-2">还没有项目</h3>
          <p className="text-gray-400 mb-6">开始创作你的第一部短剧吧！</p>
          <Link
            to="/new"
            className="inline-block bg-primary hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition"
          >
            新建项目
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-gray-800 rounded-xl p-6 hover:shadow-xl transition border border-gray-700"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">{project.name}</h3>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    project.status === 'completed'
                      ? 'bg-green-900 text-green-200'
                      : project.status === 'generating'
                      ? 'bg-yellow-900 text-yellow-200'
                      : 'bg-gray-700 text-gray-200'
                  }`}
                >
                  {project.status === 'completed' ? '已完成' : project.status === 'generating' ? '生成中' : '草稿'}
                </span>
              </div>

              <p className="text-gray-400 text-sm mb-4 line-clamp-2">{project.setting}</p>

              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>{project.episodes} 集</span>
                <span>{project.style}</span>
                <span>{new Date(project.updated_at).toLocaleDateString('zh-CN')}</span>
              </div>

              <div className="flex space-x-3">
                <Link
                  to={`/project/${project.id}`}
                  className="flex-1 bg-primary hover:bg-blue-700 text-white text-center font-semibold py-2 rounded-lg transition"
                >
                  查看
                </Link>
                <Link
                  to={`/project/${project.id}/history`}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-center font-semibold py-2 rounded-lg transition"
                >
                  历史
                </Link>
                <button
                  onClick={() => handleDelete(project.id, project.name)}
                  className="px-4 bg-red-900/50 hover:bg-red-800 text-red-200 font-semibold py-2 rounded-lg transition"
                >
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
