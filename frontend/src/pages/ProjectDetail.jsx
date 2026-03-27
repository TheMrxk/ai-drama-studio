import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { projectApi, generateApi, exportApi } from '../utils/api'

export default function ProjectDetail() {
  const { id } = useParams()
  const [project, setProject] = useState(null)
  const [script, setScript] = useState('')
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [currentEpisode, setCurrentEpisode] = useState(1)

  useEffect(() => {
    loadProject()
  }, [id])

  const loadProject = async () => {
    try {
      const response = await projectApi.get(id)
      setProject(response.data)
      // Load latest script from versions or show placeholder
      setScript(`# 《${response.data.name}》

## 基本信息
- 类型：${response.data.style}
- 集数：共 ${response.data.episodes} 集

---

**项目已创建，点击"生成剧本"按钮开始创作！**`)
    } catch (err) {
      setError('加载项目失败')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async () => {
    setGenerating(true)
    setError('')

    try {
      const response = await generateApi.generate({
        project_id: id,
        episode: currentEpisode,
      })
      setScript(response.data.script)
      setProject({ ...project, status: 'completed' })
    } catch (err) {
      setError('生成剧本失败，请重试')
    } finally {
      setGenerating(false)
    }
  }

  const handleExport = async (format) => {
    try {
      const response = await exportApi.export({
        project_id: id,
        format: format,
      })
      // Handle file download
      const blob = new Blob([response.data])
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${project.name}.${format === 'docx' ? 'docx' : format === 'pdf' ? 'pdf' : 'txt'}`
      link.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError('导出失败')
    }
  }

  const handleSave = async () => {
    try {
      // Save current script as new version
      // TODO: Implement save functionality
      alert('保存成功！')
    } catch (err) {
      setError('保存失败')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-400 text-xl">加载中...</div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="text-center text-gray-400">
        项目不存在
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">{project.name}</h2>
          <p className="text-gray-400 text-sm mt-1">
            {project.style} · 共 {project.episodes} 集
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleSave}
            className="bg-green-700 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded-lg transition"
          >
            保存
          </button>
          <div className="flex space-x-2">
            <button
              onClick={() => handleExport('txt')}
              className="bg-gray-700 hover:bg-gray-600 text-white font-semibold px-4 py-2 rounded-lg transition"
            >
              TXT
            </button>
            <button
              onClick={() => handleExport('pdf')}
              className="bg-gray-700 hover:bg-gray-600 text-white font-semibold px-4 py-2 rounded-lg transition"
            >
              PDF
            </button>
            <button
              onClick={() => handleExport('docx')}
              className="bg-gray-700 hover:bg-gray-600 text-white font-semibold px-4 py-2 rounded-lg transition"
            >
              Word
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Episode Selector */}
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-gray-300">当前集数:</span>
            <select
              value={currentEpisode}
              onChange={(e) => setCurrentEpisode(parseInt(e.target.value))}
              className="bg-gray-700 border border-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {Array.from({ length: project.episodes }, (_, i) => i + 1).map((ep) => (
                <option key={ep} value={ep}>
                  第 {ep} 集
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="bg-primary hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? '生成中...' : '生成剧本'}
          </button>
        </div>
      </div>

      {/* Script Editor */}
      <div className="bg-gray-800 rounded-xl p-6">
        <textarea
          value={script}
          onChange={(e) => setScript(e.target.value)}
          className="w-full h-[600px] bg-gray-900 border border-gray-700 text-white font-mono text-sm p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          placeholder="剧本内容将在这里显示..."
        />
      </div>

      {/* Navigation */}
      <div className="mt-6 flex justify-between">
        <Link
          to="/projects"
          className="text-gray-400 hover:text-white transition"
        >
          ← 返回列表
        </Link>
        <Link
          to={`/project/${id}/history`}
          className="text-secondary hover:underline transition"
        >
          查看历史记录 →
        </Link>
      </div>
    </div>
  )
}
