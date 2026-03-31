import { useState, useEffect } from 'react'
import { User, Save, Lock, Mail, AtSign } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { useToast } from '../hooks/useToast'
import { api } from '../lib/api'

interface UserInfo {
  id: string
  username: string
  email: string
  created_at: string
}

export default function Profile() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    loadUserInfo()
  }, [])

  const loadUserInfo = async () => {
    try {
      const data = await api.auth.getProfile()
      setUserInfo(data)
      setFormData({
        username: data.username,
        email: data.email,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (err: any) {
      toast({
        title: '加载失败',
        description: err.message || '无法加载用户信息',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const updateData: any = {}

      if (userInfo) {
        if (formData.username !== userInfo.username) {
          updateData.username = formData.username
        }
        if (formData.email !== userInfo.email) {
          updateData.email = formData.email
        }
      }

      // 如果修改了密码
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          toast({
            title: '密码不匹配',
            description: '两次输入的新密码不一致',
            variant: 'destructive',
          })
          setSaving(false)
          return
        }
        if (!formData.currentPassword) {
          toast({
            title: '需要当前密码',
            description: '修改密码需要输入当前密码',
            variant: 'destructive',
          })
          setSaving(false)
          return
        }
        // 先验证当前密码
        try {
          await api.auth.login({
            username: userInfo?.username || '',
            password: formData.currentPassword,
          })
          // 登录成功说明当前密码正确
          updateData.password = formData.newPassword
        } catch (err) {
          toast({
            title: '当前密码错误',
            description: '请输入正确的当前密码',
            variant: 'destructive',
          })
          setSaving(false)
          return
        }
      }

      // 如果没有需要更新的内容
      if (Object.keys(updateData).length === 0) {
        toast({
          title: '无需修改',
          description: '请先修改要更新的内容',
        })
        setSaving(false)
        return
      }

      await api.auth.updateProfile(updateData)

      toast({
        title: '保存成功',
        description: '个人信息已更新',
      })

      // 清空密码字段
      setFormData((prev) => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }))

      loadUserInfo()
    } catch (err: any) {
      toast({
        title: '保存失败',
        description: err.message || '无法更新个人信息',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-muted-foreground text-xl">加载用户信息...</div>
      </div>
    )
  }

  if (!userInfo) {
    return (
      <div className="text-center text-muted-foreground">
        无法加载用户信息
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center">
          <User className="h-6 w-6 text-secondary-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">个人信息</h1>
          <p className="text-muted-foreground">管理你的账户信息和密码</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-white">基本信息</CardTitle>
          <CardDescription>
            更新你的用户名和邮箱
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-white flex items-center gap-2">
              <AtSign className="h-4 w-4" />
              用户名
            </Label>
            <Input
              id="username"
              type="text"
              value={formData.username}
              onChange={(e) => handleChange('username', e.target.value)}
              className="bg-background"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-white flex items-center gap-2">
              <Mail className="h-4 w-4" />
              邮箱
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="bg-background"
            />
          </div>

          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
              <Lock className="h-4 w-4" />
              修改密码
            </h4>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-white">
                  当前密码
                </Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={formData.currentPassword}
                  onChange={(e) => handleChange('currentPassword', e.target.value)}
                  placeholder="不修改密码请留空"
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-white">
                  新密码
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => handleChange('newPassword', e.target.value)}
                  placeholder="至少 6 个字符"
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white">
                  确认新密码
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  placeholder="再次输入新密码"
                  className="bg-background"
                />
              </div>
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            <Save className="mr-2 h-4 w-4" />
            {saving ? '保存中...' : '保存修改'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-white">账户信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between py-2 border-b">
            <span className="text-muted-foreground">用户 ID</span>
            <span className="text-white font-mono text-sm">{userInfo.id}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-muted-foreground">注册时间</span>
            <span className="text-white">
              {new Date(userInfo.created_at).toLocaleString('zh-CN')}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
