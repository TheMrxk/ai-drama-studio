import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, History } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { ScrollArea } from '../components/ui/scroll-area'
import { Badge } from '../components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog'
import { useProject } from '../hooks/useProjects'
import { api } from '../lib/api'
import { useToast } from '../hooks/useToast'

interface Version {
  id: string
  version: string
  content: string
  changes: string
  created_at: string
}

export default function ProjectHistory() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: project, isLoading } = useProject(id)
  const { toast } = useToast()
  const [versions, setVersions] = useState<Version[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null)
  const [showDialog, setShowDialog] = useState(false)

  const loadVersions = async () => {
    if (!id) return
    try {
      const data = await api.projects.getVersions(id)
      setVersions(data.versions || [])
    } catch (err) {
      console.error('Failed to load versions:', err)
      toast({
        title: '加载失败',
        description: '无法加载版本历史',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadVersions()
  }, [])

  const handleView = async (version: Version) => {
    setSelectedVersion(version)
    setShowDialog(true)
  }

  const handleRestore = async (version: Version) => {
    if (!id) return
    try {
      await api.projects.restoreVersion(id, version.id)
      toast({
        title: '恢复成功',
        description: `已恢复到版本 ${version.version}`,
      })
      navigate(`/project/${id}`)
    } catch (err: any) {
      toast({
        title: '恢复失败',
        description: err.message || '无法恢复版本',
        variant: 'destructive',
      })
    }
  }

  if (isLoading || loading) {
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
              {versions.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  暂无版本历史
                </div>
              ) : (
                versions.map((version) => (
                  <Card key={version.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="default">
                              {version.version}
                            </Badge>
                          </div>
                          <p className="text-sm text-white">{version.changes}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(version.created_at).toLocaleString('zh-CN')}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleView(version)}
                          >
                            查看
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRestore(version)}
                          >
                            恢复
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Version Content Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              版本 {selectedVersion?.version} - {new Date(selectedVersion?.created_at || '').toLocaleString('zh-CN')}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <pre className="whitespace-pre-wrap text-sm font-mono bg-muted p-4 rounded">
              {selectedVersion?.content}
            </pre>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}
