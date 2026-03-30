import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Play,
  Save,
  Download,
  FileText,
  Library,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { useProject } from '../hooks/useProjects'
import { useGenerationStore } from '../store/generationStore'
import { Button } from '../components/ui/button'
import { Textarea } from '../components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Progress } from '../components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog'
import { ScrollArea } from '../components/ui/scroll-area'
import { api } from '../lib/api'

export default function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: project, isLoading } = useProject(id)
  const [currentEpisode, setCurrentEpisode] = useState(1)
  const [script, setScript] = useState('')
  const [error, setError] = useState('')
  const [showLogs, setShowLogs] = useState(false)

  const {
    isGenerating,
    progress,
    currentStep,
    logs,
    startGeneration,
    updateProgress,
    addLog,
    completeGeneration,
    failGeneration,
  } = useGenerationStore()

  const handleGenerate = async () => {
    if (!project) return

    setError('')
    startGeneration()

    try {
      // Simulate progress for demo
      const interval = setInterval(() => {
        updateProgress(Math.min(progress + 10, 90))
      }, 500)

      // 获取设置的 API 配置
      const settingsRaw = localStorage.getItem('settings')
      const settings = settingsRaw ? JSON.parse(settingsRaw) : {}
      const provider = settings.provider || 'bailian'
      const apiKey = settings.apiKey || ''

      // 获取自定义服务商配置
      const customProvidersRaw = localStorage.getItem('custom_providers')
      const customProviders = customProvidersRaw ? JSON.parse(customProvidersRaw) : []
      const currentProvider = customProviders.find((p: any) => p.id === provider)

      console.log('🔧 [ProjectDetail] settings:', settings)
      console.log('🔧 [ProjectDetail] provider:', provider)
      console.log('🔧 [ProjectDetail] apiKey:', apiKey ? '有 (' + apiKey.substring(0, 10) + '...)' : '无')
      console.log('🔧 [ProjectDetail] customProvider:', currentProvider ? currentProvider.name : '预置服务商')

      const requestData: any = {
        project_id: id!,
        episode: currentEpisode,
        provider: provider,
        api_key: apiKey,
      }

      // 如果是自定义服务商，传递完整配置
      if (currentProvider) {
        requestData.custom_config = {
          id: currentProvider.id,
          name: currentProvider.name,
          base_url: currentProvider.base_url,
          api_key: currentProvider.api_key,
          model: currentProvider.model,
          type: currentProvider.type,
        }
      }

      const response = await api.generate.script(requestData)

      clearInterval(interval)
      setScript(response.script || '生成完成！')
      completeGeneration(response.script || '生成完成！')
    } catch (err: any) {
      setError('生成剧本失败，请重试')
      failGeneration(err?.message || '生成失败')
    }
  }

  const handleExport = async (format: string) => {
    try {
      const token = localStorage.getItem('token')
      const url = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/export/${id}/${format}`
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (!response.ok) throw new Error('导出失败')
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `${project?.name}.${format === 'txt' ? 'txt' : format === 'pdf' ? 'pdf' : 'docx'}`
      link.click()
      window.URL.revokeObjectURL(downloadUrl)
    } catch (err) {
      setError('导出失败')
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-muted-foreground text-xl">加载项目中...</div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="text-center text-muted-foreground">
        项目不存在
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-white">{project.name}</h1>
              <Badge variant={project.latest_version ? 'default' : 'secondary'}>
                {project.latest_version ? '已生成' : '草稿'}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {project.style} · 共 {project.episodes} 集
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => handleExport('txt')}>
            <FileText className="mr-2 h-4 w-4" />
            TXT
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('pdf')}>
            <Download className="mr-2 h-4 w-4" />
            PDF
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('docx')}>
            <Download className="mr-2 h-4 w-4" />
            Word
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content - Script Editor */}
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white">剧本编辑器</CardTitle>
                  <CardDescription>
                    选择集数并生成剧本，也可以手动编辑内容
                  </CardDescription>
                </div>
                <div className="flex items-center gap-4">
                  <Select
                    value={String(currentEpisode)}
                    onValueChange={(value) => setCurrentEpisode(parseInt(value))}
                  >
                    <SelectTrigger className="w-[150px] bg-background">
                      <SelectValue placeholder="选择集数" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: project.episodes }, (_, i) => i + 1).map((ep) => (
                        <SelectItem key={ep} value={String(ep)}>
                          第 {ep} 集
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={handleGenerate} disabled={isGenerating}>
                    <Play className="mr-2 h-4 w-4" />
                    {isGenerating ? '生成中...' : '生成剧本'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                value={script}
                onChange={(e) => setScript(e.target.value)}
                className="min-h-[500px] font-mono text-sm bg-background resize-none"
                placeholder="剧本内容将在这里显示..."
              />
              {isGenerating && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{currentStep}</span>
                    <span className="text-muted-foreground">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowLogs(!showLogs)}
                    className="w-full justify-between"
                  >
                    {showLogs ? (
                      <>
                        <ChevronUp className="h-4 w-4" />
                        隐藏日志
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4" />
                        查看日志 ({logs.length} 条)
                      </>
                    )}
                  </Button>
                  {showLogs && (
                    <ScrollArea className="h-32 rounded-md border bg-muted p-3">
                      {logs.map((log, index) => (
                        <div key={index} className="text-sm text-muted-foreground py-1">
                          {log}
                        </div>
                      ))}
                    </ScrollArea>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Project Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-white">项目信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  故事设定
                </h4>
                <p className="text-sm text-white">{project.setting}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  主角特征
                </h4>
                <p className="text-sm text-white">{project.characters}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  剧情脉络
                </h4>
                <p className="text-sm text-white line-clamp-3">{project.plot}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  最终结局
                </h4>
                <p className="text-sm text-white">{project.ending}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Library className="h-5 w-5" />
                版本管理
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Link to={`/project/${id}/history`}>
                <Button variant="outline" className="w-full">
                  查看历史记录
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
