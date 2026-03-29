# 更新日志 (Changelog)

## [v1.0.8] - 2026-03-29

### 修复

- **P0**: 修复前端 generationStore 中 `state` 未定义的 bug
- **P0**: 修复设置页面加载时不读取已保存设置的问题
- **P1**: 默认提供商改为 `bailian` (阿里云百炼)
- **P1**: 添加 `.env.production` 配置生产环境 API 路径为 `/api`

### 验证

- 后端 API Key 传递功能正常
- 阿里云百炼 API (qwen3.5-plus) 调用成功
- 生成完整真实剧本内容（非 Mock 数据）

### 使用说明

- 在设置页面配置 API Key 后点击"保存设置"
- 或在浏览器 Console 手动设置：
  ```javascript
  localStorage.setItem('settings', JSON.stringify({
    apiKey: 'sk-sp-459d2f7d81e7418c863fd26ce1b93c11',
    provider: 'bailian'
  }))
  ```

---

## [v1.0.7] - 2026-03-29

### 修复

- **P0**: 修复前端 generationStore 中 `state` 未定义的 bug
- **P0**: 修复设置页面加载时不读取已保存设置的问题
- **P1**: 默认提供商改为 `bailian` (阿里云百炼)

---

## [v1.0.6] - 2026-03-29

### 修复

- **P0**: 修复 AI API Key 无法正确传递的问题
  - `call_ai_api` 函数改为直接传递 `api_key` 参数给 `ai_generate`
  - `generate` 函数接收并传递 `api_key` 参数到 `AIServiceFactory`
- **P0**: 修复 Nginx 代理超时问题
  - 增加 API 代理超时时间从 30 秒到 180 秒
  - 适配 AI API 慢响应场景

### 验证

- Docker 容器内 API 调用测试成功
- 阿里云百炼 API (qwen3.5-plus) 正常工作
- 生成完整剧本内容

---

## [v1.0.1] - 2026-03-28

### 修复

- **P0**: 完善 `.env.example` 配置文件，添加详细注释和说明
- **P0**: Dockerfile 中自动创建数据目录 `/app/data`
- **P0**: 完善部署文档 `DEPLOY.md`，包含完整步骤和常见问题
- **P1**: `docker-compose.yml` 卷挂载配置优化，使用命名卷
- **P1**: 添加健康检查（backend + frontend）
- **P1**: 改进错误提示和日志输出

### 改进

- 后端 Dockerfile 添加 `wget` 依赖用于健康检查
- `docker-compose.yml` 添加服务依赖条件
- `.env.example` 添加密钥生成说明

### 文档

- 新增 `DEPLOY.md` 部署指南
- 更新 `DOCKER.md` Docker 部署说明

---

## [v1.0.0] - 2026-03-27

### 新增

#### 阶段 1: 基础框架

- Flask 后端 API
- SQLite 数据库 + SQLAlchemy ORM
- JWT 用户认证（注册/登录）
- 项目 CRUD 操作
- 数据库模型设计（User, Project, Version 等）

#### 阶段 2: AI 剧本生成

- AI API 集成（Qwen/Claude）
- Prompt 模板服务
- 24+ 专业提示词模板
- 剧本生成接口
- 版本管理

#### 阶段 3: 前端 UI 开发

- React 18 + TypeScript
- Vite 5 构建工具
- Tailwind CSS 3 + shadcn/ui
- Zustand + React Query 状态管理
- 11 个 UI 组件
- 8 个完整页面：
  - 登录/注册
  - 项目列表（搜索/筛选）
  - 项目创建
  - 项目详情
  - 版本历史
  - 生成进度
  - 设置

#### 导出功能

- TXT 导出
- PDF 导出（reportlab）
- Word 导出（python-docx）

#### 部署

- Docker Compose 一键部署
- 健康检查
- 数据持久化

### 技术栈

**后端**
- Python 3.11
- Flask 3.0
- SQLAlchemy
- Flask-JWT-Extended
- python-docx
- reportlab

**前端**
- React 18
- TypeScript 5
- Vite 5
- Tailwind CSS 3
- shadcn/ui
- Zustand 4
- React Query 5
- Lucide React

### 统计

- 代码行数：~5500
- 文件数量：35+
- UI 组件：11
- 页面：8

---

## 版本规范

- **MAJOR.MINOR.PATCH** (主版本号。次版本号。修订号)
- **MAJOR**: 不兼容的 API 变更
- **MINOR**: 向后兼容的新功能
- **PATCH**: 向后兼容的问题修复

---

**项目地址**: https://github.com/TheMrxk/ai-drama-studio
