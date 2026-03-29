import { useState } from 'react'
import { Settings as SettingsIcon, Save } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select'
import { useToast } from '../hooks/useToast'

export default function Settings() {
  const { toast } = useToast()
  const [settings, setSettings] = useState({
    apiKey: '',
    provider: 'qwen',
    defaultStyle: 'romance_ceo',
    defaultEpisodes: '5',
  })

  const handleChange = (field: string, value: string) => {
    setSettings((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    localStorage.setItem('settings', JSON.stringify(settings))
    toast({
      title: '设置已保存',
      description: '你的偏好设置已更新',
    })
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <SettingsIcon className="h-8 w-8 text-secondary" />
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">设置</h1>
          <p className="text-muted-foreground">管理你的账户和 AI 服务配置</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-white">AI 服务配置</CardTitle>
          <CardDescription>
            配置 AI 服务提供商和 API 密钥
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="provider" className="text-white">
              AI 提供商
            </Label>
            <Select
              value={settings.provider}
              onValueChange={(value) => handleChange('provider', value)}
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="选择提供商" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="qwen">通义千问 (Qwen)</SelectItem>
                <SelectItem value="claude">Claude</SelectItem>
                <SelectItem value="bailian">阿里云百炼 (兼容 OpenAI)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiKey" className="text-white">
              API 密钥
            </Label>
            <Input
              id="apiKey"
              type="password"
              value={settings.apiKey}
              onChange={(e) => handleChange('apiKey', e.target.value)}
              placeholder="输入你的 API 密钥"
              className="bg-background"
            />
            <p className="text-xs text-muted-foreground">
              API 密钥将存储在你的本地设备中
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-white">默认设置</CardTitle>
          <CardDescription>
            配置新建项目的默认值
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="defaultStyle" className="text-white">
              默认风格
            </Label>
            <Select
              value={settings.defaultStyle}
              onValueChange={(value) => handleChange('defaultStyle', value)}
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="选择风格" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="romance_ceo">霸总甜宠</SelectItem>
                <SelectItem value="romance_ancient">古风虐恋</SelectItem>
                <SelectItem value="suspense_mystery">悬疑推理</SelectItem>
                <SelectItem value="fantasy_cultivation">玄幻修仙</SelectItem>
                <SelectItem value="comedy">都市喜剧</SelectItem>
                <SelectItem value="romance">都市言情</SelectItem>
                <SelectItem value="suspense">悬疑</SelectItem>
                <SelectItem value="other">其他</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="defaultEpisodes" className="text-white">
              默认集数
            </Label>
            <Input
              id="defaultEpisodes"
              type="number"
              value={settings.defaultEpisodes}
              onChange={(e) => handleChange('defaultEpisodes', e.target.value)}
              min="1"
              max="20"
              className="bg-background"
            />
          </div>

          <Button onClick={handleSave} className="w-full">
            <Save className="mr-2 h-4 w-4" />
            保存设置
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
