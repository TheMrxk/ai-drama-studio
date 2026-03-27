import { useState, useEffect } from 'react'
import { authApi } from '../utils/api'

export default function Settings() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [apiKeys, setApiKeys] = useState({
    qwen: '',
    claude: '',
  })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    loadUser()
    loadApiKeys()
  }, [])

  const loadUser = async () => {
    try {
      const response = await authApi.getCurrentUser()
      setUser(response.data)
    } catch (err) {
      console.error('Failed to load user')
    } finally {
      setLoading(false)
    }
  }

  const loadApiKeys = () => {
    const keys = {
      qwen: localStorage.getItem('qwen_api_key') || '',
      claude: localStorage.getItem('claude_api_key') || '',
    }
    setApiKeys(keys)
  }

  const handleSave = () => {
    localStorage.setItem('qwen_api_key', apiKeys.qwen)
    localStorage.setItem('claude_api_key', apiKeys.claude)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-400 text-xl">加载中...</div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-8">设置</h2>

      {/* User Info */}
      <div className="bg-gray-800 rounded-xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">账户信息</h3>
        <div className="space-y-3">
          <div>
            <span className="text-gray-400">用户名:</span>
            <span className="text-white ml-4">{user?.username}</span>
          </div>
          <div>
            <span className="text-gray-400">邮箱:</span>
            <span className="text-white ml-4">{user?.email}</span>
          </div>
          <div>
            <span className="text-gray-400">注册时间:</span>
            <span className="text-white ml-4">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString('zh-CN') : '-'}
            </span>
          </div>
        </div>
      </div>

      {/* API Keys */}
      <div className="bg-gray-800 rounded-xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">AI API 配置</h3>
        <p className="text-gray-400 text-sm mb-4">
          配置大模型 API Key 用于剧本生成。Keys 存储在本地浏览器中。
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Qwen API Key
            </label>
            <input
              type="password"
              value={apiKeys.qwen}
              onChange={(e) => setApiKeys({ ...apiKeys, qwen: e.target.value })}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
              placeholder="sk-xxx"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Claude API Key
            </label>
            <input
              type="password"
              value={apiKeys.claude}
              onChange={(e) => setApiKeys({ ...apiKeys, claude: e.target.value })}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
              placeholder="sk-ant-xxx"
            />
          </div>

          {saved && (
            <div className="bg-green-900/50 border border-green-500 text-green-200 px-4 py-3 rounded-lg">
              设置已保存！
            </div>
          )}

          <button
            onClick={handleSave}
            className="w-full bg-primary hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
          >
            保存设置
          </button>
        </div>
      </div>

      {/* About */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">关于</h3>
        <div className="text-gray-400 text-sm space-y-2">
          <p>AI Drama Studio v0.1.0</p>
          <p>一个 AI 驱动的短剧生成器</p>
          <p className="mt-4">
            <a
              href="https://github.com/TheMrxk/ai-drama-studio"
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary hover:underline"
            >
              GitHub 仓库
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
