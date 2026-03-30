import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Settings, Plus, Edit, Trash2, Save, X } from 'lucide-react'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog'
import { Textarea } from '../components/ui/textarea'
import { useToast } from '../hooks/useToast'
import { Badge } from '../components/ui/badge'

interface Provider {
  id: string
  name: string
  base_url: string
  api_key: string
  model: string
  type: 'openai_compat'
  enabled: boolean
  note?: string
}

const PRESET_PROVIDERS: Omit<Provider, 'api_key' | 'enabled'>[] = [
  {
    id: 'bailian',
    name: '阿里云百炼',
    base_url: 'https://coding.dashscope.aliyuncs.com/v1',
    model: 'qwen3.5-plus',
    type: 'openai_compat',
    note: '兼容 OpenAI 接口，推荐使用',
  },
  {
    id: 'openai',
    name: 'OpenAI',
    base_url: 'https://api.openai.com/v1',
    model: 'gpt-4o',
    type: 'openai_compat',
    note: '需要国际网络环境',
  },
]

export default function ProviderConfig() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [providers, setProviders] = useState<Provider[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Omit<Provider, 'enabled'>>({
    id: '',
    name: '',
    base_url: '',
    api_key: '',
    model: '',
    type: 'openai_compat',
    note: '',
  })

  // 页面加载时读取配置
  useEffect(() => {
    loadProviders()
  }, [])

  const loadProviders = () => {
    const saved = localStorage.getItem('custom_providers')
    if (saved) {
      try {
        const list = JSON.parse(saved)
        setProviders(list)
      } catch (e) {
        console.error('Failed to load providers:', e)
      }
    } else {
      // 初始化预置服务商
      const defaultProviders: Provider[] = PRESET_PROVIDERS.map(p => ({
        ...p,
        api_key: '',
        enabled: true,
      }))
      setProviders(defaultProviders)
      saveProviders(defaultProviders)
    }
  }

  const saveProviders = (list: Provider[]) => {
    localStorage.setItem('custom_providers', JSON.stringify(list))
  }

  const handleOpenDialog = (provider?: Provider) => {
    if (provider) {
      setEditingId(provider.id)
      setFormData({
        id: provider.id,
        name: provider.name,
        base_url: provider.base_url,
        api_key: provider.api_key,
        model: provider.model,
        type: provider.type,
        note: provider.note || '',
      })
    } else {
      setEditingId(null)
      setFormData({
        id: '',
        name: '',
        base_url: '',
        api_key: '',
        model: '',
        type: 'openai_compat',
        note: '',
      })
    }
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    // 验证必填字段
    if (!formData.id || !formData.name || !formData.base_url || !formData.api_key || !formData.model) {
      toast({
        title: '验证失败',
        description: '请填写所有必填字段',
        variant: 'destructive',
      })
      return
    }

    // 验证 ID 格式（只能包含字母、数字、下划线）
    if (!/^[a-zA-Z0-9_]+$/.test(formData.id)) {
      toast({
        title: '验证失败',
        description: '服务商 ID 只能包含字母、数字和下划线',
        variant: 'destructive',
      })
      return
    }

    const newProviders = providers.filter(p => p.id !== formData.id)
    const existingProvider = providers.find(p => p.id === formData.id)

    const newProvider: Provider = {
      ...formData,
      enabled: existingProvider?.enabled ?? true,
    }

    newProviders.push(newProvider)
    saveProviders(newProviders)
    setProviders(newProviders)

    toast({
      title: '保存成功',
      description: `服务商"${formData.name}"已保存`,
    })

    setIsDialogOpen(false)
  }

  const handleDelete = (id: string) => {
    const provider = providers.find(p => p.id === id)
    if (!provider) return

    // 不能删除预置服务商（如果没有配置 API Key）
    const isPreset = PRESET_PROVIDERS.some(p => p.id === id)
    if (isPreset && !provider.api_key) {
      toast({
        title: '无法删除',
        description: '预置服务商不允许删除',
        variant: 'destructive',
      })
      return
    }

    const newProviders = providers.filter(p => p.id !== id)
    saveProviders(newProviders)
    setProviders(newProviders)

    toast({
      title: '删除成功',
      description: `服务商"${provider.name}"已删除`,
    })
  }

  const handleToggleEnabled = (id: string) => {
    const newProviders = providers.map(p =>
      p.id === id ? { ...p, enabled: !p.enabled } : p
    )
    saveProviders(newProviders)
    setProviders(newProviders)
  }

  const handleUsePreset = (preset: typeof PRESET_PROVIDERS[0]) => {
    const exists = providers.some(p => p.id === preset.id)
    if (exists) {
      toast({
        title: '已存在',
        description: `服务商"${preset.name}"已存在`,
        variant: 'destructive',
      })
      return
    }

    const newProvider: Provider = {
      ...preset,
      api_key: '',
      enabled: true,
    }
    const newProviders = [...providers, newProvider]
    saveProviders(newProviders)
    setProviders(newProviders)

    toast({
      title: '添加成功',
      description: `已添加"${preset.name}"，请在列表中配置 API Key`,
    })
  }

  const maskApiKey = (key: string) => {
    if (!key) return '未配置'
    if (key.length <= 8) return '***'
    return `${key.substring(0, 4)}...${key.substring(key.length - 4)}`
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Settings className="h-8 w-8 text-secondary" />
          <div>
            <h1 className="text-3xl font-bold text-white">服务商配置</h1>
            <p className="text-muted-foreground">管理 AI 服务提供商配置</p>
          </div>
        </div>
        <Button onClick={() => navigate('/settings')} variant="outline">
          返回设置
        </Button>
      </div>

      {/* 预置服务商快捷添加 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-white">预置服务商</CardTitle>
          <CardDescription>
            点击添加常用的 AI 服务提供商
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {PRESET_PROVIDERS.map(preset => {
              const exists = providers.some(p => p.id === preset.id)
              return (
                <Badge
                  key={preset.id}
                  variant={exists ? 'secondary' : 'default'}
                  className="cursor-pointer px-4 py-2 text-sm"
                  onClick={() => !exists && handleUsePreset(preset)}
                >
                  {preset.name} {exists ? '(已添加)' : '+ 添加'}
                </Badge>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* 服务商列表 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">服务商列表</CardTitle>
              <CardDescription>
                已配置 {providers.filter(p => p.enabled).length} 个启用的服务商
              </CardDescription>
            </div>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              添加服务商
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {providers.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              暂无服务商配置，请添加
            </p>
          ) : (
            <div className="space-y-3">
              {providers.map(provider => (
                <div
                  key={provider.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-white">{provider.name}</span>
                      <Badge variant={provider.enabled ? 'default' : 'secondary'} className="text-xs">
                        {provider.enabled ? '已启用' : '已禁用'}
                      </Badge>
                      {PRESET_PROVIDERS.some(p => p.id === provider.id) && (
                        <Badge variant="outline" className="text-xs">预置</Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>ID: <code className="text-xs bg-muted px-1">{provider.id}</code></div>
                      <div>API: {provider.base_url}</div>
                      <div>模型：{provider.model}</div>
                      <div>Key: {maskApiKey(provider.api_key)}</div>
                      {provider.note && <div>备注：{provider.note}</div>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant={provider.enabled ? 'outline' : 'default'}
                      onClick={() => handleToggleEnabled(provider.id)}
                    >
                      {provider.enabled ? '禁用' : '启用'}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleOpenDialog(provider)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(provider.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 添加/编辑弹窗 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingId ? '编辑服务商' : '添加服务商'}
            </DialogTitle>
            <DialogDescription>
              配置 AI 服务提供商信息（仅支持兼容 OpenAI 接口的服务）
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="provider_id" className="text-white">
                服务商 ID <span className="text-red-500">*</span>
              </Label>
              <Input
                id="provider_id"
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                placeholder="例如：openai, bailian"
                disabled={!!editingId}
                className="bg-background"
              />
              <p className="text-xs text-muted-foreground">
                唯一标识，只能包含字母、数字和下划线
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="provider_name" className="text-white">
                显示名称 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="provider_name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="例如：OpenAI, 阿里云百炼"
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="base_url" className="text-white">
                API 地址 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="base_url"
                value={formData.base_url}
                onChange={(e) => setFormData({ ...formData, base_url: e.target.value })}
                placeholder="https://api.example.com/v1"
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="api_key" className="text-white">
                API Key <span className="text-red-500">*</span>
              </Label>
              <Input
                id="api_key"
                type="password"
                value={formData.api_key}
                onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                placeholder="sk-xxxxxxxx"
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="model" className="text-white">
                默认模型 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                placeholder="例如：gpt-4o, qwen3.5-plus"
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="note" className="text-white">
                备注
              </Label>
              <Textarea
                id="note"
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                placeholder="可选说明"
                className="bg-background"
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              <X className="mr-2 h-4 w-4" />
              取消
            </Button>
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
