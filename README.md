# AI Drama Studio

🎬 AI 短剧生成器 - 输入故事要素，AI 生成完整剧本

## 项目简介

AI Drama Studio 是一个 AI 驱动的 Web 应用，用户只需输入故事设定、主角特征、剧情脉络和最终结局，AI 即可生成完整短剧剧本。

### 核心功能

- ✅ **故事输入** - 表单式输入故事要素
- ✅ **AI 生成** - 调用大模型 API 生成剧本
- ✅ **项目管理** - 每个剧本作为项目管理
- ✅ **版本控制** - 保存修改历史，支持恢复
- ✅ **在线编辑** - 内置剧本编辑器
- ✅ **导出功能** - 支持 TXT/PDF/Word 格式

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React + Tailwind CSS |
| 后端 | Flask |
| 数据库 | SQLite |
| AI API | Qwen/Claude |
| 部署 | Docker |

## 快速开始

### 方式一：Docker Compose（推荐）

```bash
# 克隆仓库
git clone https://github.com/TheMrxk/ai-drama-studio.git
cd ai-drama-studio

# 启动服务
docker-compose up -d

# 访问应用
# 前端：http://localhost:3000
# 后端：http://localhost:5000
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
python -m app.main
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
│   │   └── main.py       # 入口文件
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/   # 可复用组件
│   │   ├── pages/        # 页面组件
│   │   └── utils/        # 工具函数
│   ├── package.json
│   └── Dockerfile
├── docs/
├── docker-compose.yml
└── README.md
```

## API 文档

### 认证
- `POST /api/register` - 用户注册
- `POST /api/login` - 用户登录
- `GET /api/me` - 获取当前用户

### 项目管理
- `POST /api/projects` - 创建项目
- `GET /api/projects` - 获取项目列表
- `GET /api/projects/:id` - 获取项目详情
- `PUT /api/projects/:id` - 更新项目
- `DELETE /api/projects/:id` - 删除项目

### 剧本生成
- `POST /api/generate` - 生成剧本
- `GET /api/projects/:id/versions` - 获取版本历史

### 导出
- `POST /api/export` - 导出剧本（TXT/PDF/Word）

## 开发计划

### 阶段 1: 基础框架（1 周）
- [x] 项目初始化
- [x] 数据库设计
- [x] 用户认证
- [x] 项目 CRUD API

### 阶段 2: 核心功能（2 周）
- [ ] 故事输入界面
- [ ] AI 剧本生成
- [ ] 剧本编辑器
- [ ] 版本管理
- [ ] 导出功能

### 阶段 3: 优化完善（1 周）
- [ ] UI 美化
- [ ] 性能优化
- [ ] 测试修复
- [ ] 文档完善

## 截图

待更新...

## License

MIT

## 联系方式

- GitHub: https://github.com/TheMrxk/ai-drama-studio
- 作者：何老师
- 审核：开哥
