import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Filter, Trash2, FileText } from 'lucide-react'
import { useProjects, useDeleteProject } from '../hooks/useProjects'
import { useProjectStore } from '../store/projectStore'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
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
  CardFooter,
  CardHeader,
  CardTitle,
} from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog'
import type { Project } from '../types/project'

const STYLE_OPTIONS = [
  { value: 'all', label: '全部风格' },
  { value: 'romance_ceo', label: '霸总甜宠' },
  { value: 'romance_ancient', label: '古风虐恋' },
  { value: 'suspense_mystery', label: '悬疑推理' },
  { value: 'fantasy_cultivation', label: '玄幻修仙' },
  { value: 'comedy', label: '都市喜剧' },
  { value: 'romance', label: '都市言情' },
  { value: 'suspense', label: '悬疑' },
  { value: 'other', label: '其他' },
]

export default function ProjectList() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStyle, setFilterStyle] = useState('all')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)

  const { projects: storeProjects, setProjects, deleteProject } = useProjectStore()
  const { data: apiProjects, isLoading } = useProjects()
  const deleteMutation = useDeleteProject()

  // Sync API data with store
  if (apiProjects && apiProjects.length !== storeProjects.length) {
    setProjects(apiProjects)
  }

  const handleDeleteClick = (project: Project) => {
    setProjectToDelete(project)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (projectToDelete) {
      deleteMutation.mutate(projectToDelete.id, {
        onSuccess: () => {
          deleteProject(projectToDelete.id)
          setDeleteDialogOpen(false)
          setProjectToDelete(null)
        },
      })
    }
  }

  const filteredProjects = storeProjects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.setting.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStyle = filterStyle === 'all' || project.style === filterStyle
    return matchesSearch && matchesStyle
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-muted-foreground text-xl">加载项目中...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">我的项目</h1>
          <p className="text-muted-foreground">管理和创作你的 AI 短剧项目</p>
        </div>
        <Link to="/new">
          <Button size="lg">
            <Plus className="mr-2 h-5 w-5" />
            新建项目
          </Button>
        </Link>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索项目名称或内容..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStyle} onValueChange={setFilterStyle}>
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="选择风格" />
          </SelectTrigger>
          <SelectContent>
            {STYLE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredProjects.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="text-6xl mb-4">🎬</div>
          <h3 className="text-xl font-semibold text-white mb-2">
            {searchQuery || filterStyle !== 'all' ? '没有匹配的项目' : '还没有项目'}
          </h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery || filterStyle !== 'all'
              ? '尝试调整搜索条件或筛选器'
              : '开始创作你的第一部短剧吧！'}
          </p>
          {!searchQuery && filterStyle === 'all' && (
            <Link to="/new">
              <Button>
                <Plus className="mr-2 h-5 w-5" />
                新建项目
              </Button>
            </Link>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="hover:shadow-xl transition-shadow border-border">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl text-white mb-2">
                      {project.name}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 text-sm">
                      {project.setting}
                    </CardDescription>
                  </div>
                  <Badge
                    variant={
                      project.latest_version ? 'default' : 'secondary'
                    }
                  >
                    {project.latest_version ? '已生成' : '草稿'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    {project.episodes} 集
                  </span>
                  <span>{STYLE_OPTIONS.find((s) => s.value === project.style)?.label || project.style}</span>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Link to={`/project/${project.id}`} className="flex-1">
                  <Button variant="default" size="sm" className="w-full">
                    查看
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDeleteClick(project)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              确定要删除项目"{projectToDelete?.name}"吗？此操作不可恢复，所有相关的剧本和历史记录都将被删除。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
