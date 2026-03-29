# 更新日志 (Changelog)

## [v1.1.0] - 2026-03-29 🎉

### 🚀 正式发布

**AI Drama Studio v1.1.0 正式上线 - 首个稳定生产版本**

---

## v1.0.x 问题复盘与修复总结 (2026-03-29)

### 问题时间线

| 时间 | 版本 | 问题 | 严重程度 | 状态 |
|------|------|------|----------|------|
| 14:00 | v1.0.6 | AI API Key 无法正确传递到后端 | P0 | ✅ 已修复 |
| 14:30 | v1.0.6 | Nginx 代理超时 (30s) | P0 | ✅ 已修复 |
| 15:00 | v1.0.7 | 设置页面加载时不读取已保存设置 | P0 | ✅ 已修复 |
| 15:30 | v1.0.7 | generationStore 中 `state` 未定义 | P0 | ✅ 已修复 |
| 16:00 | v1.0.8 | 前端 API 请求 URL 配置问题 | P1 | ✅ 已修复 |
| 22:00 | v1.0.9 | 项目详情页生成按钮不传递 API Key | P0 | ✅ 已修复 |
| 23:00 | v1.0.9 | 浏览器缓存导致代码不更新 | P1 | ✅ 已修复 |

---

### 详细问题分析

#### 1. AI API Key 传递问题 (v1.0.6 → v1.0.9)

**问题描述**：前端设置的 API Key 无法正确传递到后端，导致 AI 调用失败，返回 Mock 数据。

**根本原因**：
1. 后端 `call_ai_api` 函数尝试从环境变量读取 API Key，而不是从请求参数
2. 前端 `ProjectDetail.tsx` 中 `handleGenerate` 函数没有读取 localStorage 中的 settings
3. 多个文件调用 `api.generate.script` 时参数不一致

**解决方案**：
1. 修改 `backend/app/api/generate.py`，直接从请求参数获取 `api_key`
2. 修改 `backend/app/services/ai_api.py`，将 `api_key` 传递给 AI 服务
3. 修改 `frontend/src/pages/ProjectDetail.tsx`，添加读取 localStorage 的逻辑
4. 统一所有调用点的参数格式

**涉及文件**：
- `backend/app/api/generate.py`
- `backend/app/services/ai_api.py`
- `frontend/src/pages/ProjectDetail.tsx`
- `frontend/src/pages/GenerationProgress.tsx`
- `frontend/src/lib/api.ts`

---

#### 2. Nginx 代理超时问题 (v1.0.6)

**问题描述**：AI API 调用超过 30 秒后返回 504 Gateway Timeout。

**根本原因**：Nginx 默认代理超时时间设置为 30 秒，但 AI 模型生成需要 60-120 秒。

**解决方案**：
```nginx
proxy_connect_timeout 180s;
proxy_send_timeout 180s;
proxy_read_timeout 180s;
```

**涉及文件**：
- `frontend/nginx.conf`

---

#### 3. 前端状态管理 Bug (v1.0.7-v1.0.8)

**问题描述**：
1. `generationStore` 中 `completeGeneration` 和 `failGeneration` 函数引用未定义的 `state`
2. 设置页面刷新后设置丢失

**根本原因**：
1. Zustand store 中使用了错误的语法：`set({...state.logs...})` 应该是 `set((state) => ({...state.logs...}))`
2. Settings 组件没有在初始化时从 localStorage 加载数据

**解决方案**：
1. 修复 Zustand store 中的状态更新语法
2. 在 Settings.tsx 中添加 lazy initialization 读取 localStorage

**涉及文件**：
- `frontend/src/store/generationStore.ts`
- `frontend/src/pages/Settings.tsx`

---

#### 4. 前端构建缓存问题 (v1.0.8-v1.0.9)

**问题描述**：代码更新后，浏览器仍加载旧的 JS 文件。

**根本原因**：Nginx 配置没有禁用静态资源缓存，浏览器缓存了旧版本的 JS 文件。

**解决方案**：
```nginx
add_header Cache-Control "no-store, no-cache, must-revalidate";
add_header Pragma "no-cache";
add_header Expires "0";
```

**涉及文件**：
- `frontend/nginx.conf`

---

### 经验总结

1. **多调用点代码同步**：当多个组件调用同一 API 时，确保所有调用点的参数一致
2. **localStorage 使用注意**：不同端口/协议的 localStorage 是隔离的
3. **调试日志重要性**：添加详细的调试日志可以快速定位问题
4. **浏览器缓存**：开发环境应该禁用缓存，避免代码更新不生效
5. **端到端测试**：UI 按钮点击后应该完整测试整个数据流

---

## v1.1.0 功能清单

### ✅ 核心功能

- [x] 用户注册/登录（JWT 认证）
- [x] 项目 CRUD 操作
- [x] AI 剧本生成（支持阿里云百炼 Qwen3.5-plus）
- [x] 版本管理（每次生成自动保存）
- [x] 剧本导出（TXT/PDF/Word）
- [x] 设置页面（API Key 配置）

### ✅ 技术特性

- [x] Docker Compose 一键部署
- [x] Nginx 反向代理
- [x] 健康检查端点
- [x] 数据持久化
- [x] 跨域支持（CORS）

### ✅ 用户体验

- [x] 响应式 UI 设计
- [x] 生成进度展示
- [x] 错误提示友好
- [x] 设置自动保存

---

## 快速开始

### 1. Docker 部署（推荐）

```bash
# 克隆项目
git clone https://github.com/TheMrxk/ai-drama-studio.git
cd ai-drama-studio

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，设置 API Key

# 启动服务
docker compose up -d

# 访问应用
# http://localhost:8081
```

### 2. 配置 AI API Key

在设置页面配置：
- **API 提供商**：阿里云百炼 (bailian)
- **API Key**：`sk-sp-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- **默认模型**：`qwen3.5-plus`

或使用 Console 手动设置：
```javascript
localStorage.setItem('settings', JSON.stringify({
  apiKey: 'sk-sp-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  provider: 'bailian',
  defaultStyle: 'romance_ceo',
  defaultEpisodes: '5'
}))
```

---

## 技术栈

**后端**
- Python 3.11
- Flask 3.0
- SQLAlchemy 2.0
- Flask-JWT-Extended 4.6
- python-docx 1.1
- reportlab 4.0

**前端**
- React 18
- TypeScript 5
- Vite 5
- Tailwind CSS 3
- shadcn/ui
- Zustand 4
- React Query 5

**部署**
- Docker
- Docker Compose
- Nginx

---

## 已知问题

- [ ] 生成进度条为模拟动画，非真实进度
- [ ] 不支持断点续传
- [ ] 不支持批量生成

---

## 版本规范

- **MAJOR.MINOR.PATCH** (主版本号。次版本号。修订号)
- **MAJOR**: 不兼容的 API 变更
- **MINOR**: 向后兼容的新功能
- **PATCH**: 向后兼容的问题修复

---

**项目地址**: https://github.com/TheMrxk/ai-drama-studio

**Docker 镜像**: `docker pull themrkx/ai-drama-studio:latest`

---

<details>
<summary>历史版本</summary>

## [v1.0.9] - 2026-03-29

### 修复

- **P0**: 修复项目详情页"开始生成"按钮不传递 API Key 的 bug
  - 在 `ProjectDetail.tsx` 中添加从 localStorage 读取 settings 的逻辑
  - 正确传递 `provider` 和 `api_key` 参数到后端 API
- **P1**: 添加调试日志，方便排查问题

## [v1.0.8] - 2026-03-29

### 修复

- **P0**: 修复前端 generationStore 中 `state` 未定义的 bug
- **P0**: 修复设置页面加载时不读取已保存设置的问题
- **P1**: 默认提供商改为 `bailian` (阿里云百炼)
- **P1**: 添加 `.env.production` 配置生产环境 API 路径为 `/api`

## [v1.0.6] - 2026-03-29

### 修复

- **P0**: 修复 AI API Key 无法正确传递的问题
- **P0**: 修复 Nginx 代理超时问题

## [v1.0.1] - 2026-03-28

### 修复

- **P0**: 完善 `.env.example` 配置文件
- **P0**: Dockerfile 中自动创建数据目录
- **P0**: 完善部署文档
- **P1**: `docker-compose.yml` 卷挂载配置优化
- **P1**: 添加健康检查

## [v1.0.0] - 2026-03-27

### 新增

- Flask 后端 API
- SQLite 数据库
- JWT 用户认证
- AI 剧本生成
- 前端 UI

</details>
