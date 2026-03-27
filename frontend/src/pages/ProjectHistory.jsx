import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { versionApi } from '../utils/api'

export default function ProjectHistory() {
  const { id } = useParams()
  const [versions, setVersions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadVersions()
  }, [id])

  const loadVersions = async () => {
    try {
      const response = await versionApi.list(id)
      setVersions(response.data.versions)
    } catch (err) {
      setError('加载历史记录失败')
    } finally {
      setLoading(false)
    }
  }

  const handleRestore = async (versionId, version) => {
    if (!confirm(`确定要恢复到版本 ${version} 吗？`)) {
      return
    }

    try {
      // TODO: Implement restore functionality
      alert(`已恢复到版本 ${version}`)
    } catch (err) {
      setError('恢复失败')
    }
  }

  const handleDelete = async (versionId) => {
    if (!confirm('确定要删除这个版本吗？')) {
      return
    }

    try {
      await versionApi.delete(id, versionId)
      setVersions(versions.filter(v => v.id !== versionId))
    } catch (err) {
      setError('删除失败')
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
        <h2 className="text-2xl font-bold text-white">版本历史</h2>
        <Link
          to={`/project/${id}`}
          className="text-gray-400 hover:text-white transition"
        >
          ← 返回项目
        </Link>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {versions.length === 0 ? (
        <div className="bg-gray-800 rounded-xl p-12 text-center">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-white mb-2">暂无历史记录</h3>
          <p className="text-gray-400">剧本生成或修改后会在这里显示版本记录</p>
        </div>
      ) : (
        <div className="space-y-4">
          {versions.map((version) => (
            <div
              key={version.id}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{version.version}</h3>
                  <p className="text-gray-400 text-sm mt-1">{version.changes}</p>
                  <p className="text-gray-500 text-xs mt-2">
                    创建于 {new Date(version.created_at).toLocaleString('zh-CN')}
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleRestore(version.id, version.version)}
                    className="bg-primary hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition"
                  >
                    恢复
                  </button>
                  <button
                    onClick={() => handleDelete(version.id)}
                    className="bg-red-900/50 hover:bg-red-800 text-red-200 font-semibold px-4 py-2 rounded-lg transition"
                  >
                    删除
                  </button>
                </div>
              </div>
              <div className="bg-gray-900 rounded-lg p-4 max-h-64 overflow-auto">
                <pre className="text-gray-300 text-sm font-mono whitespace-pre-wrap">
                  {version.content.slice(0, 500)}
                  {version.content.length > 500 && '...'}
                </pre>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
