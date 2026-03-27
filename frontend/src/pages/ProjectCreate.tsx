import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { useCreateProject } from '../hooks/useProjects'
import { useProjectStore } from '../store/projectStore'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { Label } from '../components/ui/label'
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

const STYLE_OPTIONS = [
  { value: 'romance_ceo', label: '霸总甜宠' },
  { value: 'romance_ancient', label: '古风虐恋' },
  { value: 'suspense_mystery', label: '悬疑推理' },
  { value: 'fantasy_cultivation', label: '玄幻修仙' },
  { value: 'comedy', label: '都市喜剧' },
  { value: 'romance', label: '都市言情' },
  { value: 'suspense', label: '悬疑' },
  { value: 'other', label: '其他' },
]

export default function ProjectCreate() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    setting: '',
    characters: '',
    plot: '',
    ending: '',
    episodes: 5,
    style: 'romance_ceo',
  })

  const createProject = useCreateProject()
  const addProject = useProjectStore((state) => state.addProject)

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const newProject = await createProject.mutateAsync(formData)
      addProject(newProject)
      navigate(`/project/${newProject.id}`)
    } catch (error) {
      console.error('创建项目失败:', error)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">新建项目</h1>
          <p className="text-muted-foreground">填写故事信息，AI 将为你生成短剧剧本</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-white">基本信息</CardTitle>
          <CardDescription>
            请详细描述你的故事设定，这将帮助 AI 更好地理解你的创作意图
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white">
                项目名称 *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="例如：咖啡厅的爱情"
                className="bg-background"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="setting" className="text-white">
                故事设定 *
              </Label>
              <Textarea
                id="setting"
                value={formData.setting}
                onChange={(e) => handleChange('setting', e.target.value)}
                placeholder="时代背景、地点、环境描述。例如：现代都市，一家温馨的咖啡厅..."
                rows={3}
                className="bg-background resize-none"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="characters" className="text-white">
                主角特征 *
              </Label>
              <Textarea
                id="characters"
                value={formData.characters}
                onChange={(e) => handleChange('characters', e.target.value)}
                placeholder="姓名、性格、外貌、职业等。例如：林小满（女主，25 岁，咖啡师，温柔善良）；陈默（男主，28 岁，程序员，内向害羞）"
                rows={3}
                className="bg-background resize-none"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="plot" className="text-white">
                剧情脉络 *
              </Label>
              <Textarea
                id="plot"
                value={formData.plot}
                onChange={(e) => handleChange('plot', e.target.value)}
                placeholder="主要情节发展。例如：陈默每天来买咖啡，逐渐对林小满产生好感。一次偶然的机会，两人开始聊天，发现彼此有很多共同爱好..."
                rows={4}
                className="bg-background resize-none"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ending" className="text-white">
                最终结局 *
              </Label>
              <Textarea
                id="ending"
                value={formData.ending}
                onChange={(e) => handleChange('ending', e.target.value)}
                placeholder="故事如何结束。例如：陈默在咖啡厅向林小满表白，两人在一起"
                rows={2}
                className="bg-background resize-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="episodes" className="text-white">
                  剧集数量
                </Label>
                <Input
                  id="episodes"
                  type="number"
                  value={formData.episodes}
                  onChange={(e) => handleChange('episodes', parseInt(e.target.value) || 5)}
                  min="1"
                  max="20"
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="style" className="text-white">
                  剧本风格
                </Label>
                <Select value={formData.style} onValueChange={(value) => handleChange('style', value)}>
                  <SelectTrigger className="bg-background">
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
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={createProject.isPending}
                className="flex-1"
              >
                <Save className="mr-2 h-5 w-5" />
                {createProject.isPending ? '保存中...' : '保存项目'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/')}
              >
                取消
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
