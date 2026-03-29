import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Play, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { useGenerationStore } from '../store/generationStore'
import { Button } from '../components/ui/button'
import { Progress } from '../components/ui/progress'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { ScrollArea } from '../components/ui/scroll-area'
import { Badge } from '../components/ui/badge'
import { api } from '../lib/api'

export default function GenerationProgress() {
  const { id } = useParams()
  const navigate = useNavigate()

  // v1.0.9 调试：页面加载时立即检查 settings
  useEffect(() => {
    const settingsRaw = localStorage.getItem('settings')
    console.log('🔍 [v1.0.9-DEBUG] 页面加载时 settings:', settingsRaw)
    if (settingsRaw) {
      const s = JSON.parse(settingsRaw)
      console.log('🔍 [v1.0.9-DEBUG] API Key:', s.apiKey ? '有 (' + s.apiKey.substring(0, 10) + '...)' : '无')
      console.log('🔍 [v1.0.9-DEBUG] Provider:', s.provider)
    } else {
      console.warn('⚠️ [v1.0.9-DEBUG] localStorage 中没有 settings!')
      console.log('🔍 [v1.0.9-DEBUG] 所有 localStorage keys:', Object.keys(localStorage))
    }
  }, [])

  const {
    isGenerating,
    progress,
    currentStep,
    logs,
    result,
    error,
    startGeneration,
    updateProgress,
    addLog,
    completeGeneration,
    failGeneration,
    reset,
  } = useGenerationStore()

  useEffect(() => {
    return () => {
      reset()
    }
  }, [])

  const handleGenerate = async () => {
    if (!id) return

    // v1.0.9 调试标识 - 确保加载的是最新代码
    console.log('🔧 [v1.0.9-DEBUG] handleGenerate called with id:', id)

    startGeneration()

    try {
      // Simulate generation process
      const steps = [
        '分析故事设定...',
        '生成角色卡片...',
        '创建分镜脚本...',
        '编写剧本内容...',
        '优化对白...',
        '最终检查...',
      ]

      for (let i = 0; i < steps.length; i++) {
        updateProgress(((i + 1) / steps.length) * 100, steps[i])
        addLog(steps[i])
        await new Promise((resolve) => setTimeout(resolve, 800))
      }

      // 获取设置的 API 配置
      const settingsRaw = localStorage.getItem('settings')
      console.log('🔧 [v1.0.9-DEBUG] settings 原始值:', settingsRaw)

      const settings = settingsRaw ? JSON.parse(settingsRaw) : {}
      const provider = settings.provider || 'bailian'
      const apiKey = settings.apiKey || ''

      console.log('🔧 [v1.0.9-DEBUG] 解析后的 settings:', settings)
      console.log('🔧 [v1.0.9-DEBUG] 提取的 provider:', provider)
      console.log('🔧 [v1.0.9-DEBUG] 提取的 apiKey:', apiKey)
      console.log('🔧 [v1.0.9-DEBUG] apiKey 长度:', apiKey ? apiKey.length : 0)

      addLog(`使用 AI 提供商：${provider}`)
      if (!apiKey) {
        addLog('警告：未检测到 API Key，请在设置页面配置')
      }

      // 构造请求数据
      const requestData = {
        project_id: id,
        episode: 1,
        provider: provider,
        api_key: apiKey,
      }

      console.log('🔧 [v1.0.9-DEBUG] requestData:', requestData)
      console.log('🔧 [v1.0.9-DEBUG] requestData.api_key:', requestData.api_key)
      console.log('🔧 [v1.0.9-DEBUG] requestData.provider:', requestData.provider)

      // Call API
      const response = await api.generate.script(requestData)

      completeGeneration(response.script || '生成完成！')
    } catch (err: any) {
      console.error('Generation error:', err)
      failGeneration(err?.message || '生成失败，请重试')
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-white">AI 剧本生成</h1>
        <p className="text-muted-foreground">
          AI 正在为你创作精彩的短剧剧本
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-white">生成进度</CardTitle>
          <CardDescription>
            {isGenerating
              ? '正在生成中，请稍候...'
              : result
              ? '生成完成！'
              : error
              ? '生成失败'
              : '准备开始'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{currentStep || '等待开始'}</span>
              <span className="text-muted-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>

          {/* Status Icon */}
          <div className="flex justify-center py-8">
            {isGenerating ? (
              <div className="text-center">
                <Loader2 className="h-16 w-16 text-primary animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">AI 正在思考中...</p>
              </div>
            ) : result ? (
              <div className="text-center">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <p className="text-green-500 font-semibold">生成成功！</p>
              </div>
            ) : error ? (
              <div className="text-center">
                <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
                <p className="text-destructive font-semibold">{error}</p>
              </div>
            ) : (
              <div className="text-center">
                <Play className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">点击开始生成</p>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="flex justify-center gap-4">
            {!isGenerating && !result && (
              <Button onClick={handleGenerate} size="lg">
                <Play className="mr-2 h-5 w-5" />
                开始生成
              </Button>
            )}
            {result && (
              <>
                <Button onClick={() => navigate(`/project/${id}`)} variant="default">
                  查看剧本
                </Button>
                <Button onClick={handleGenerate} variant="outline">
                  重新生成
                </Button>
              </>
            )}
            {error && (
              <Button onClick={handleGenerate} variant="destructive">
                重试
              </Button>
            )}
          </div>

          {/* Logs */}
          {logs.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">生成日志</h4>
              <ScrollArea className="h-48 rounded-md border bg-muted p-3">
                <div className="space-y-1">
                  {logs.map((log, index) => (
                    <div
                      key={index}
                      className="text-sm text-muted-foreground flex items-center gap-2"
                    >
                      <Badge variant="secondary" className="text-xs">
                        {index + 1}
                      </Badge>
                      {log}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
