# AI Drama Studio v1.1.0 发布说明

## 🎉 版本信息

- **版本号**: v1.1.0
- **发布日期**: 2026-03-29
- **状态**: ✅ 可上线生产版本
- **Git 标签**: `v1.1.0`

---

## 📋 问题复盘总结 (v1.0.6 → v1.1.0)

### 问题时间线

| 时间 | 版本 | 问题描述 | 严重程度 | 解决方案 |
|------|------|----------|----------|----------|
| 14:00 | v1.0.6 | AI API Key 无法传递到后端 | P0 | 修改后端直接接收 api_key 参数 |
| 14:30 | v1.0.6 | Nginx 代理超时 30 秒 | P0 | 增加超时到 180 秒 |
| 15:00 | v1.0.7 | 设置页面不读取已保存设置 | P0 | Settings.tsx 添加 lazy initialization |
| 15:30 | v1.0.7 | generationStore state 未定义 | P0 | 修复 Zustand store 语法 |
| 16:00 | v1.0.8 | 前端 API URL 配置错误 | P1 | 添加.env.production |
| 22:00 | v1.0.9 | 项目详情页不传递 API Key | P0 | ProjectDetail.tsx 读取 localStorage |
| 23:00 | v1.0.9 | 浏览器缓存旧代码 | P1 | Nginx 添加 no-cache 头部 |

---

### 详细问题分析

#### 1. AI API Key 传递问题

**现象**: 前端设置页面保存了 API Key，但点击生成按钮后返回 Mock 数据。

**原因**:
1. 后端 `call_ai_api` 从环境变量读取，不从请求参数读取
2. 前端 `ProjectDetail.tsx` 没有读取 localStorage 中的 settings
3. 多个文件调用 `api.generate.script` 时参数不一致

**修复**:
```python
# backend/app/api/generate.py
api_key = os.getenv(f'{provider.upper()}_API_KEY') or data.get('api_key')
```

```typescript
// frontend/src/pages/ProjectDetail.tsx
const settingsRaw = localStorage.getItem('settings')
const settings = settingsRaw ? JSON.parse(settingsRaw) : {}
const provider = settings.provider || 'bailian'
const apiKey = settings.apiKey || ''
```

---

#### 2. Nginx 代理超时

**现象**: AI 生成超过 30 秒后返回 504 Gateway Timeout。

**原因**: Nginx 默认代理超时 30 秒，AI 模型生成需要 60-120 秒。

**修复**:
```nginx
# frontend/nginx.conf
proxy_connect_timeout 180s;
proxy_send_timeout 180s;
proxy_read_timeout 180s;
```

---

#### 3. 前端状态管理 Bug

**现象**: Console 报错 `ReferenceError: state is not defined`。

**原因**: Zustand store 中使用了错误语法。

**修复**:
```typescript
// frontend/src/store/generationStore.ts
// 错误写法
completeGeneration: (result) => set({...state.logs...})

// 正确写法
completeGeneration: (result) => set((state) => ({...state.logs...}))
```

---

#### 4. 浏览器缓存问题

**现象**: 代码更新后，浏览器仍加载旧 JS 文件。

**原因**: Nginx 没有禁用静态资源缓存。

**修复**:
```nginx
# frontend/nginx.conf
location / {
    add_header Cache-Control "no-store, no-cache, must-revalidate";
    add_header Pragma "no-cache";
    add_header Expires "0";
}
```

---

## ✅ v1.1.0 功能清单

### 核心功能
- [x] 用户注册/登录（JWT 认证）
- [x] 项目 CRUD 操作
- [x] AI 剧本生成（阿里云百炼 Qwen3.5-plus）
- [x] 版本管理（每次生成自动保存）
- [x] 剧本导出（TXT/PDF/Word）
- [x] 设置页面（API Key 配置）

### 技术特性
- [x] Docker Compose 一键部署
- [x] Nginx 反向代理
- [x] 健康检查端点
- [x] 数据持久化
- [x] 跨域支持（CORS）

### 用户体验
- [x] 响应式 UI 设计
- [x] 生成进度展示
- [x] 错误提示友好
- [x] 设置自动保存

---

## 🚀 部署指南

### Docker 部署（推荐）

```bash
# 1. 克隆项目
git clone https://github.com/TheMrxk/ai-drama-studio.git
cd ai-drama-studio

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，设置 API Key

# 3. 启动服务
docker compose up -d

# 4. 访问应用
http://localhost:8081
```

### 配置 API Key

在设置页面配置：
- **API 提供商**: 阿里云百炼 (bailian)
- **API Key**: `sk-sp-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- **默认模型**: `qwen3.5-plus`

---

## 📊 代码统计

- **代码行数**: ~5500
- **文件数量**: 35+
- **UI 组件**: 11
- **页面**: 8
- **API 端点**: 15+

---

## 🔗 相关链接

- **GitHub**: https://github.com/TheMrxk/ai-drama-studio
- **Release Notes**: https://github.com/TheMrxk/ai-drama-studio/releases/tag/v1.1.0
- **CHANGELOG**: https://github.com/TheMrxk/ai-drama-studio/blob/main/CHANGELOG.md

---

## ⚠️ 已知问题

- [ ] 生成进度条为模拟动画，非真实进度
- [ ] 不支持断点续传
- [ ] 不支持批量生成

---

## 📝 发布检查清单

- [x] 代码已推送到 main 分支
- [x] Git 标签 v1.1.0 已创建
- [x] CHANGELOG.md 已更新
- [x] package.json 版本号已更新
- [ ] GitHub Release 已创建（需手动）
- [x] Docker 镜像已构建
- [x] 功能测试通过

---

**发布人**: AI Assistant
**审核人**: @TheMrxk
**发布日期**: 2026-03-29
