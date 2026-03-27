import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, History } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { ScrollArea } from '../components/ui/scroll-area'
import { Badge } from '../components/ui/badge'
import { useProject } from '../hooks/useProjects'

export default function ProjectHistory() {
  const { id } = useParams()
  const { data: project, isLoading } = useProject(id)

  // Mock version history data
  const versions = [
    { id: '1', episode: 1, version: 3, created_at: new Date().toISOString(), content: '第三版 - 优化了对白' },
    { id: '2', episode: 1, version: 2, created_at: new Date(Date.now() - 86400000).toISOString(), content: '第二版 - 调整了节奏' },
    { id: '3', episode: 1, version: 1, created_at: new Date(Date.now() - 172800000).toISOString(), content: '初版 - AI 生成' },
  ]

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-muted-foreground text-xl">加载中...</div>
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
      <div className="flex items-center gap-4">
        <Link to={`/project/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">历史记录</h1>
          <p className="text-muted-foreground">{project.name} - 剧本版本历史</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-secondary" />
            <CardTitle className="text-white">版本列表</CardTitle>
          </div>
          <CardDescription>
            查看和管理此项目的所有剧本版本
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-4">
              {versions.map((version) => (
                <Card key={version.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="default">
                            第{version.episode}集
                          </Badge>
                          <Badge variant="secondary">
                            v{version.version}
                          </Badge>
                        </div>
                        <p className="text-sm text-white">{version.content}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(version.created_at).toLocaleString('zh-CN')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          查看
                        </Button>
                        <Button variant="outline" size="sm">
                          恢复
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
