# AI Drama Studio - 阶段 3 开发需求文档

**版本**: v1.0  
**创建时间**: 2026-03-27  
**阶段**: 前端界面开发  
**预计工时**: 26 小时

---

## 📋 目录

1. [阶段回顾](#1-阶段回顾)
2. [核心目标](#2-核心目标)
3. [功能需求](#3-功能需求)
4. [UI 设计要求](#4-ui 设计要求)
5. [技术栈](#5-技术栈)
6. [目录结构](#6-目录结构)
7. [API 对接](#7-api 对接)
8. [交付物清单](#8-交付物清单)
9. [开发计划](#9-开发计划)
10. [验收标准](#10-验收标准)

---

## 1. 阶段回顾

### ✅ 阶段 1 完成
- 前后端项目初始化 (React + Tailwind CSS, Flask)
- 数据库设计 (SQLite + SQLAlchemy)
- 用户认证系统 (注册/登录/JWT)
- 项目 CRUD API

### ✅ 阶段 2 完成
- 提示词模板库 (24+ 漫剧创作模板)
- AI API 服务 (Qwen/Claude 支持)
- 单元测试 (完整测试套件)
- 扩展功能预留 (反馈/偏好/参考剧本)

### 🎯 阶段 3 目标
**构建用户友好的前端界面**

---

## 2. 核心目标

让用户可以：
1. ✅ 输入故事要素
2. ✅ 查看生成的剧本
3. ✅ 管理项目和版本
4. ✅ 导出剧本

---

## 3. 功能需求

### 3.1 项目列表页（首页）

**路由**: `/`

**功能**:
| 功能 | 说明 | 优先级 |
|------|------|--------|
| 项目卡片展示 | 显示所有项目卡片 | P0 |
| 搜索功能 | 按项目名称搜索 | P1 |
| 筛选功能 | 按类型筛选 | P1 |
| 新建项目按钮 | 跳转到新建项目页 | P0 |
| 删除项目 | 二次确认 | P1 |

**项目卡片设计**:
```
┌─────────────────────────┐
│ 《项目名称》             │
│ 类型：霸总 | 30 集        │
│ 更新于：2 小时前         │
│ [编辑] [查看] [删除]     │
└─────────────────────────┘
```

---

### 3.2 故事输入表单页

**路由**: `/new-project`

**表单字段**:
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| 项目名称 | 文本输入 | ✅ | 剧本名称 |
| 故事类型 | 下拉选择 | ✅ | 霸总/古风/现代/悬疑/玄幻 |
| 故事设定 | 多行文本 | ✅ | 时代背景、地点、环境 |
| 主角特征 | 多行文本 | ✅ | 姓名、性格、外貌、职业 |
| 剧情脉络 | 多行文本 | ✅ | 主要情节发展 |
| 最终结局 | 多行文本 | ✅ | 故事如何结束 |
| 期望画风 | 下拉选择 | ❌ | 韩漫/日漫/国风/写实 |
| 目标平台 | 下拉选择 | ❌ | 抖音/快手/视频号 |
| 预计集数 | 数字输入 | ❌ | 默认 30 集 |

**功能要求**:
- ✅ 表单验证（必填项检查）
- ✅ 保存草稿（LocalStorage）
- ✅ 表单重置
- ✅ 提交后跳转到项目详情页

---

### 3.3 项目详情页（剧本编辑器）

**路由**: `/project/:id`

**功能分区**:

#### 左侧：项目信息 (25% 宽度)
- 项目基本信息
- 故事设定、主角、剧情、结局
- 编辑按钮

#### 中间：剧本编辑器 (50% 宽度)
- 分集选择器（第 1 集 - 第 30 集）
- 剧本内容显示（只读/编辑模式切换）
- 保存按钮

#### 右侧：版本历史 (25% 宽度)
- 版本列表（时间倒序）
- 每个版本显示：版本号、时间、修改说明
- 点击版本可预览
- 支持版本对比
- 支持恢复到旧版本

---

### 3.4 生成进度页

**路由**: `/project/:id/generating`

**功能**:
- ✅ 显示生成进度条
- ✅ 实时日志输出（流式显示）
- ✅ 预计剩余时间
- ✅ 取消生成按钮
- ✅ 生成完成后自动跳转

**进度步骤**:
```
1. 故事分析中... ████████░░ 80%
2. 角色设计中... ████░░░░░░ 40%
3. 分镜生成中... ██░░░░░░░░ 20%
4. 剧本撰写中... ░░░░░░░░░░ 0%
```

---

### 3.5 导出功能

**支持格式**:
- ✅ TXT（纯文本）
- ✅ PDF（格式美观）
- ✅ Word（.docx，可编辑）

**导出入口**:
- 项目详情页 → 导出按钮
- 项目列表页 → 批量导出

---

## 4. UI 设计要求

### 4.1 配色方案

```css
/* 主色调 - 电影感深色主题 */
--primary-color: #1a365d;      /* 深蓝 */
--accent-color: #d69e2e;       /* 金色 */
--background: #1a202c;         /* 深色背景 */
--surface: #2d3748;            /* 卡片背景 */
--text-primary: #f7fafc;       /* 主文字 */
--text-secondary: #a0aec0;     /* 次要文字 */
--success: #48bb78;            /* 成功 */
--warning: #ecc94b;            /* 警告 */
--error: #f56565;              /* 错误 */
```

### 4.2 组件库

**推荐使用 shadcn/ui**（基于 Radix UI + Tailwind）

必需组件:
- Button
- Input
- Textarea
- Select
- Card
- Dialog
- Progress
- Toast
- Tabs
- DropdownMenu

### 4.3 响应式设计

| 设备 | 分辨率 | 要求 |
|------|--------|------|
| 桌面端 | 1920x1080 | 完整功能 |
| 平板 | 1024x768 | 完整功能 |
| 移动端 | 375x667 | 基础功能 |

---

## 5. 技术栈

### 前端

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 18.x | UI 框架 |
| TypeScript | 5.x | 类型系统 |
| Tailwind CSS | 3.x | 样式 |
| shadcn/ui | latest | 组件库 |
| React Query | 5.x | 数据获取 |
| Zustand | 4.x | 状态管理 |
| React Router | 6.x | 路由 |
| Axios | 1.x | HTTP 请求 |

### 开发工具

```json
{
  "devDependencies": {
    "vite": "^5.0.0",
    "@types/react": "^18.0.0",
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.0.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0",
    "vitest": "^1.0.0"
  }
}
```

---

## 6. 目录结构

```
src/frontend/
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui 组件
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   └── ...
│   │   ├── ProjectCard.tsx  # 项目卡片
│   │   ├── StoryForm.tsx    # 故事输入表单
│   │   ├── ScriptEditor.tsx # 剧本编辑器
│   │   ├── VersionList.tsx  # 版本列表
│   │   └── ProgressBar.tsx  # 进度条
│   ├── pages/
│   │   ├── Home.tsx         # 项目列表页
│   │   ├── NewProject.tsx   # 新建项目页
│   │   ├── ProjectDetail.tsx# 项目详情页
│   │   └── Generating.tsx   # 生成进度页
│   ├── hooks/
│   │   ├── useProjects.ts   # 项目数据钩子
│   │   ├── useGenerate.ts   # 生成进度钩子
│   │   └── useVersions.ts   # 版本管理钩子
│   ├── services/
│   │   └── api.ts           # API 调用封装
│   ├── stores/
│   │   └── projectStore.ts  # 状态管理
│   ├── utils/
│   │   └── cn.ts            # 工具函数
│   ├── types/
│   │   └── index.ts         # TypeScript 类型定义
│   ├── App.tsx
│   └── main.tsx
├── public/
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 7. API 对接

### 7.1 API 列表

| 功能 | 端点 | 方法 | 说明 |
|------|------|------|------|
| 获取项目列表 | `/api/projects` | GET | 获取所有项目 |
| 创建项目 | `/api/projects` | POST | 创建新项目 |
| 获取项目详情 | `/api/projects/:id` | GET | 获取项目详情 |
| 更新项目 | `/api/projects/:id` | PUT | 更新项目 |
| 删除项目 | `/api/projects/:id` | DELETE | 删除项目 |
| 生成剧本 | `/api/generate` | POST | 触发生成 |
| 获取版本列表 | `/api/projects/:id/versions` | GET | 版本列表 |
| 获取版本详情 | `/api/projects/:id/versions/:versionId` | GET | 版本详情 |
| 恢复版本 | `/api/projects/:id/versions/:versionId/restore` | POST | 恢复版本 |
| 导出剧本 | `/api/export` | POST | 导出文件 |

### 7.2 API 服务封装

```typescript
// src/services/api.ts
const API_BASE = 'http://localhost:5000/api';

export interface Project {
  id: string;
  name: string;
  type: string;
  setting: string;
  characters: string;
  plot: string;
  ending: string;
  style?: string;
  platform?: string;
  episodes?: number;
  createdAt: string;
  updatedAt: string;
}

export interface GenerateRequest {
  projectId: string;
  templateId?: string;
  episode?: number;
}

export interface Version {
  id: string;
  projectId: string;
  version: string;
  content: string;
  changes?: string;
  createdAt: string;
}

export const projectAPI = {
  async getAll(): Promise<Project[]> {
    const res = await fetch(`${API_BASE}/projects`);
    return res.json();
  },
  
  async create(data: Partial<Project>): Promise<Project> {
    const res = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  
  async getById(id: string): Promise<Project> {
    const res = await fetch(`${API_BASE}/projects/${id}`);
    return res.json();
  },
  
  async update(id: string, data: Partial<Project>): Promise<Project> {
    const res = await fetch(`${API_BASE}/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  
  async delete(id: string): Promise<void> {
    await fetch(`${API_BASE}/projects/${id}`, {
      method: 'DELETE',
    });
  },
};

export const generateAPI = {
  async generate(data: GenerateRequest): Promise<{ taskId: string }> {
    const res = await fetch(`${API_BASE}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  
  async getProgress(taskId: string): Promise<{ 
    progress: number; 
    status: string;
    logs: string[];
  }> {
    const res = await fetch(`${API_BASE}/generate/${taskId}/progress`);
    return res.json();
  },
};

export const versionAPI = {
  async getVersions(projectId: string): Promise<Version[]> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/versions`);
    return res.json();
  },
  
  async getVersion(projectId: string, versionId: string): Promise<Version> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/versions/${versionId}`);
    return res.json();
  },
  
  async restore(projectId: string, versionId: string): Promise<void> {
    await fetch(`${API_BASE}/projects/${projectId}/versions/${versionId}/restore`, {
      method: 'POST',
    });
  },
};

export const exportAPI = {
  async export(projectId: string, format: 'txt' | 'pdf' | 'docx'): Promise<Blob> {
    const res = await fetch(`${API_BASE}/export`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, format }),
    });
    return res.blob();
  },
};
```

---

## 8. 交付物清单

### 8.1 代码文件

- [ ] `src/pages/Home.tsx` - 项目列表页
- [ ] `src/pages/NewProject.tsx` - 新建项目页
- [ ] `src/pages/ProjectDetail.tsx` - 项目详情页
- [ ] `src/pages/Generating.tsx` - 生成进度页
- [ ] `src/components/ProjectCard.tsx` - 项目卡片
- [ ] `src/components/StoryForm.tsx` - 故事表单
- [ ] `src/components/ScriptEditor.tsx` - 剧本编辑器
- [ ] `src/components/VersionList.tsx` - 版本列表
- [ ] `src/components/ProgressBar.tsx` - 进度条
- [ ] `src/components/ui/*` - shadcn/ui 组件
- [ ] `src/services/api.ts` - API 服务封装
- [ ] `src/hooks/*.ts` - 自定义钩子
- [ ] `src/stores/projectStore.ts` - 状态管理
- [ ] `src/types/index.ts` - TypeScript 类型定义

### 8.2 文档

- [ ] `README.md` 更新（包含前端启动说明）
- [ ] `docs/PHASE3_REPORT.md` - 阶段 3 开发报告

### 8.3 测试

- [ ] 组件单元测试（Vitest）
- [ ] 页面 E2E 测试（可选，Playwright）

---

## 9. 开发计划

| 任务 | 预计时间 | 优先级 | 交付物 |
|------|---------|--------|--------|
| **1. 项目列表页** | 4 小时 | P0 | Home.tsx + ProjectCard.tsx |
| **2. 故事输入表单** | 4 小时 | P0 | NewProject.tsx + StoryForm.tsx |
| **3. 项目详情页** | 6 小时 | P0 | ProjectDetail.tsx + ScriptEditor.tsx |
| **4. 生成进度页** | 3 小时 | P1 | Generating.tsx + ProgressBar.tsx |
| **5. 版本管理 UI** | 3 小时 | P1 | VersionList.tsx |
| **6. 导出功能 UI** | 2 小时 | P2 | Export 按钮 + 对话框 |
| **7. UI 美化优化** | 4 小时 | P2 | 全局样式优化 |
| **总计** | **26 小时** | | |

---

## 10. 验收标准

### 10.1 功能验收

- [ ] 可以创建新项目
- [ ] 可以查看项目列表
- [ ] 可以查看项目详情
- [ ] 可以触发生成剧本
- [ ] 可以查看生成进度
- [ ] 可以查看版本历史
- [ ] 可以恢复旧版本
- [ ] 可以导出剧本

### 10.2 UI 验收

- [ ] 界面美观，符合电影感主题
- [ ] 响应式布局正常
- [ ] 交互流畅，无卡顿
- [ ] 错误提示友好
- [ ] 加载状态显示

### 10.3 代码验收

- [ ] 代码结构清晰
- [ ] 组件可复用
- [ ] 注释完整
- [ ] 无 TypeScript 错误
- [ ] ESLint 检查通过
- [ ] 单元测试通过

---

## 11. 开发建议

1. **先完成核心功能**（P0 任务），再优化 UI
2. **组件化开发**，提高复用性
3. **及时测试**，每完成一个组件就测试
4. **保持与后端 API 对齐**，有问题及时沟通
5. **使用 TypeScript**，确保类型安全

---

## 12. 快速开始

```bash
# 克隆仓库
git clone https://github.com/TheMrxk/ai-drama-studio.git
cd ai-drama-studio

# 进入前端目录
cd src/frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问应用
# http://localhost:5173
```

---

## 13. 下一步

1. 确认理解需求
2. 开始开发（按优先级顺序）
3. 每完成一个页面就提交一次
4. 完成后创建 PR #2

---

**文档结束**

*最后更新：2026-03-27*  
*维护者：何老师*  
*审核者：开哥*
