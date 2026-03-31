# AI Drama Studio

🎬 AI 短剧生成器 - 输入故事要素，AI 生成完整剧本

## 项目简介

AI Drama Studio 是一个 AI 驱动的 Web 应用，用户只需输入故事设定、主角特征、剧情脉络和最终结局，AI 即可生成完整短剧剧本。

### 核心功能

- ✅ **故事输入** - 表单式输入故事要素
- ✅ **AI 生成** - 调用大模型 API 生成剧本（支持阿里云百炼、OpenAI 等）
- ✅ **项目管理** - 每个剧本作为项目管理
- ✅ **版本控制** - 保存修改历史，支持恢复
- ✅ **在线编辑** - 内置剧本编辑器
- ✅ **导出功能** - 支持 TXT/PDF/Word 格式
- ✅ **用户管理** - JWT 认证，支持用户注册登录
- ✅ **自定义服务商** - 支持配置任意 OpenAI 兼容接口

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 18 + TypeScript + Tailwind CSS 3 + shadcn/ui |
| 后端 | Flask 3.0 + SQLAlchemy 2.0 |
| 数据库 | SQLite |
| AI API | 阿里云百炼 (Qwen3.5-plus) / OpenAI / 自定义 |
| 部署 | Docker + Docker Compose + Nginx |

## 快速开始

### 方式一：Docker Compose（推荐）

```bash
# 克隆仓库
git clone https://github.com/TheMrxk/ai-drama-studio.git
cd ai-drama-studio

# 启动服务
docker compose up -d

# 访问应用
# 前端：http://localhost:8081
```

### 方式二：本地开发

#### 后端

```bash
cd backend

# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt

# 配置环境变量
cp .env.example .env
# 编辑 .env 设置 API Keys

# 启动服务
python run.py
```

#### 前端

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## 项目结构

```
ai-drama-studio/
├── backend/
│   ├── app/
│   │   ├── api/          # API 路由
│   │   ├── models/       # 数据模型
│   │   └── services/     # 业务服务
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/   # 可复用组件
│   │   ├── pages/        # 页面组件
│   │   ├── hooks/        # 自定义 Hooks
│   │   ├── lib/          # 工具函数
│   │   └── store/        # Zustand 状态管理
│   ├── package.json
│   └── Dockerfile
├── CHANGELOG.md
├── docker-compose.yml
├── LICENSE
└── README.md
```

## API 文档

### 认证
- `POST /api/register` - 用户注册
- `POST /api/login` - 用户登录
- `GET /api/me` - 获取当前用户
- `PUT /api/me` - 更新用户信息

### 项目管理
- `POST /api/projects` - 创建项目
- `GET /api/projects` - 获取项目列表
- `GET /api/projects/:id` - 获取项目详情
- `PUT /api/projects/:id` - 更新项目
- `DELETE /api/projects/:id` - 删除项目

### 剧本生成
- `POST /api/generate` - 生成剧本
- `GET /api/projects/:id/versions` - 获取版本历史
- `POST /api/projects/:id/versions/:version_id/restore` - 恢复历史版本

### 导出
- `GET /api/export/:project_id/:format` - 导出剧本（TXT/PDF/Word）

## 功能更新日志

查看 [CHANGELOG.md](CHANGELOG.md) 获取完整的更新历史

## 开源协议

MIT License - 详见 [LICENSE](LICENSE)

## 项目链接

- GitHub: https://github.com/TheMrxk/ai-drama-studio
