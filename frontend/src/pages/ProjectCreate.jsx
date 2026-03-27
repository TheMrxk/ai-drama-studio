import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { projectApi } from '../utils/api'

export default function ProjectCreate() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    setting: '',
    characters: '',
    plot: '',
    ending: '',
    episodes: 5,
    style: '温馨喜剧',
  })

  const styleOptions = [
    '温馨喜剧',
    '悬疑推理',
    '都市爱情',
    '古装历史',
    '科幻奇幻',
    '青春校园',
    '家庭伦理',
    '动作冒险',
  ]

  const handleChange = (e) => {
    const { name, value, type } = e.target
    setFormData({
      ...formData,
      [name]: type === 'number' ? parseInt(value) || 0 : value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await projectApi.create(formData)
      navigate(`/project/${response.data.id}`)
    } catch (err) {
      setError(err.response?.data?.error || '创建项目失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-8">新建项目</h2>

      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl p-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            项目名称 *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
            placeholder="例如：咖啡厅的爱情"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            故事设定 *
          </label>
          <textarea
            name="setting"
            value={formData.setting}
            onChange={handleChange}
            required
            rows={3}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition resize-none"
            placeholder="时代背景、地点、环境描述。例如：现代都市，一家温馨的咖啡厅..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            主角特征 *
          </label>
          <textarea
            name="characters"
            value={formData.characters}
            onChange={handleChange}
            required
            rows={3}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition resize-none"
            placeholder="姓名、性格、外貌、职业等。例如：林小满（女主，25 岁，咖啡师，温柔善良）；陈默（男主，28 岁，程序员，内向害羞）"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            剧情脉络 *
          </label>
          <textarea
            name="plot"
            value={formData.plot}
            onChange={handleChange}
            required
            rows={4}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition resize-none"
            placeholder="主要情节发展。例如：陈默每天来买咖啡，逐渐对林小满产生好感。一次偶然的机会，两人开始聊天，发现彼此有很多共同爱好..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            最终结局 *
          </label>
          <textarea
            name="ending"
            value={formData.ending}
            onChange={handleChange}
            required
            rows={2}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition resize-none"
            placeholder="故事如何结束。例如：陈默在咖啡厅向林小满表白，两人在一起"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              剧集数量
            </label>
            <input
              type="number"
              name="episodes"
              value={formData.episodes}
              onChange={handleChange}
              min="1"
              max="20"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              剧本风格
            </label>
            <select
              name="style"
              value={formData.style}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
            >
              {styleOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex space-x-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-primary hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '保存中...' : '保存项目'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/projects')}
            className="px-6 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg transition"
          >
            取消
          </button>
        </div>
      </form>
    </div>
  )
}
