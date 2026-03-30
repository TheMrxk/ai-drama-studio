# v1.2.0 需求计划

## 📋 更新概述

**目标**: 提升应用可配置性和用户体验

**预计发布时间**: 2026-03-31

---

## 🎯 需求一：自定义服务商配置页面

### 问题背景

当前只有 3 个预置的服务商选项（Qwen、Claude、阿里云百炼），用户无法使用其他兼容 OpenAI 接口的服务商。

### 需求描述

提供一个可配置的服务商管理界面，用户可以：
1. 查看当前已配置的服务商列表
2. 添加新的自定义服务商
3. 编辑现有服务商配置
4. 删除不需要的服务商配置

### 功能详情

#### 1. 服务商配置页面

**页面元素**:
- 服务商列表（表格形式）
- 添加新服务商按钮
- 编辑/删除操作按钮

**服务商列表字段**:
| 字段 | 说明 | 示例 |
|------|------|------|
| 服务商名称 | 唯一标识符 | `bailian`, `openai`, `deepseek` |
| 显示名称 | 用户友好名称 | `阿里云百炼`, `OpenAI`, `深度求索` |
| API 地址 | Base URL | `https://coding.dashscope.aliyuncs.com/v1` |
| API Key | 当前配置的 Key（脱敏显示） | `sk-sp*************c11` |
| 模型名称 | 默认使用的模型 | `qwen3.5-plus` |
| 状态 | 是否启用 | ✅/❌ |

#### 2. 添加/编辑服务商弹窗

**表单字段**:
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| 服务商 ID | text | ✅ | 唯一标识，只能用字母数字下划线 |
| 显示名称 | text | ✅ | 展示在下拉列表中的名称 |
| API 地址 | url | ✅ | 完整的 API Base URL |
| API Key | password | ✅ | 明文输入，保存时加密 |
| 模型名称 | text | ✅ | 默认使用的模型 |
| 接口类型 | select | ✅ | `openai_compat` (兼容 OpenAI) / `anthropic` / `dashscope` |
| 备注 | textarea | ❌ | 可选说明 |

#### 3. 数据存储

**前端存储**:
- 使用 `localStorage` 存储服务商配置
- Key: `custom_providers`
- 数据结构:
```json
[
  {
    "id": "bailian",
    "name": "阿里云百炼",
    "base_url": "https://coding.dashscope.aliyuncs.com/v1",
    "api_key": "sk-sp-459d2f7d81e7418c863fd26ce1b93c11",
    "model": "qwen3.5-plus",
    "type": "openai_compat",
    "enabled": true,
    "note": "Coding Plan 专属"
  },
  {
    "id": "openai",
    "name": "OpenAI",
    "base_url": "https://api.openai.com/v1",
    "api_key": "sk-xxxxxxxxxxxx",
    "model": "gpt-4o",
    "type": "openai_compat",
    "enabled": true,
    "note": ""
  }
]
```

**后端存储** (可选，二期实现):
- 添加到 `.env` 文件
- 或存储到数据库 `provider_config` 表

#### 4. 后端适配

**需要修改的文件**:
- `backend/app/services/ai_api.py` - 添加动态服务商支持

**新增类**:
```python
class CustomProviderService(BaseAIService):
    """自定义服务商（兼容 OpenAI 接口）"""

    def __init__(self, config: dict):
        self.config = config
        self.api_key = config.get('api_key')
        self.base_url = config.get('base_url')
        self.model = config.get('model', 'gpt-3.5-turbo')

    def _get_default_api_key(self) -> Optional[str]:
        return self.api_key

    def _get_default_base_url(self) -> str:
        return self.base_url

    def generate(self, prompt: str, **kwargs) -> Dict[str, Any]:
        url = f"{self.base_url}/chat/completions"
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": "你是一位专业的剧本创作助手。"},
                {"role": "user", "content": prompt}
            ],
            "temperature": kwargs.get('temperature', 0.7),
            "max_tokens": kwargs.get('max_tokens', 4096),
        }
        # ... 发送请求
```

#### 5. 设置页面集成

在设置页面的"AI 服务配置"区域：
- 下拉列表动态加载所有已配置的服务商
- 添加"管理服务商"链接，跳转到配置页面

---

### 需要确认的问题

**Q1**: 后端是否需要支持从前端动态读取服务商配置？
- **方案 A**: 前端每次请求时传递完整的 API 配置（api_key, base_url, model）
- **方案 B**: 后端也从配置文件/数据库读取服务商配置
- **推荐**: 方案 A（实现简单，用户数据只在本地）

**Q2**: 接口类型需要支持哪些？
- `openai_compat` - 兼容 OpenAI 格式（最常用）
- `anthropic` - Anthropic 格式
- `dashscope` - 阿里云 DashScope 格式
- 其他？

**Q3**: 预置服务商有哪些？
- 阿里云百炼（已有）
- 通义千问（已有）
- Claude（已有）
- OpenAI（新增）
- 深度求索/智谱 AI/月之暗面（可选）

---

## 🎨 需求二：修复下拉选项框透明问题

### 问题描述

当前所有下拉选择框（Select 组件）的内容是透明的，导致选项文字看不清。

### 问题分析

查看 `frontend/src/components/ui/select.tsx`:
- `SelectContent` 使用了 `bg-popover` 和 `text-popover-foreground`
- 但 `index.css` 中定义的 `--popover` 颜色与背景色相同或相近

```css
--popover: 217 33% 17%;      /* 深色背景 */
--popover-foreground: 210 40% 98%;  /* 浅色文字 */
```

问题是 `SelectContent` 的 `bg-popover` 可能没有正确应用，或者被其他样式覆盖。

### 解决方案

**方案 A**: 修改 CSS 变量（推荐）
```css
/* frontend/src/index.css */
:root {
  /* ... 现有变量 ... */
  --popover: 217 33% 22%;    /* 稍微亮一些的背景 */
  --popover-foreground: 210 40% 98%;

  /* 新增变量确保下拉菜单可见 */
  --dropdown-bg: 217 33% 20%;
  --dropdown-text: 210 40% 98%;
}
```

**方案 B**: 直接修改 Select 组件样式
```tsx
// frontend/src/components/ui/select.tsx
const SelectContent = React.forwardRef<...>(({ className, ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        // ... 现有类名 ...
        "bg-card text-foreground",  // 强制使用 card 颜色
        className
      )}
      {...props}
    />
  </SelectPrimitive.Portal>
))
```

**方案 C**: 添加专用 CSS
```css
/* frontend/src/index.css 新增 */
[data-radix-popper-content-wrapper] {
  background-color: hsl(var(--card)) !important;
  color: hsl(var(--foreground)) !important;
  border: 1px solid hsl(var(--border)) !important;
}
```

### 推荐方案

**方案 B** - 直接修改组件，确保使用 `bg-card` 和 `text-foreground` 变量。

---

## 📦 涉及文件清单

### 需求一：自定义服务商配置

| 文件 | 操作 | 说明 |
|------|------|------|
| `frontend/src/pages/ProviderConfig.tsx` | 新建 | 服务商配置页面 |
| `frontend/src/components/ProviderForm.tsx` | 新建 | 添加/编辑表单组件 |
| `frontend/src/pages/Settings.tsx` | 修改 | 集成动态服务商列表 |
| `frontend/src/lib/api.ts` | 修改 | 添加服务商 CRUD API |
| `backend/app/services/ai_api.py` | 修改 | 添加 CustomProviderService |
| `backend/app/api/generate.py` | 修改 | 支持动态配置传入 |

### 需求二：下拉框样式修复

| 文件 | 操作 | 说明 |
|------|------|------|
| `frontend/src/components/ui/select.tsx` | 修改 | 修改 SelectContent 样式 |
| `frontend/src/index.css` | 修改 | 可选：调整 CSS 变量 |

---

## 🚧 开发优先级

### P0 - 高优先级（必须实现）

1. **下拉框样式修复** - 影响用户体验
2. **自定义服务商配置页面** - 核心功能
3. **前端动态服务商管理** - 增删改查

### P1 - 中优先级（推荐实现）

1. **后端适配自定义服务商** - 支持更多 API
2. **服务商配置导入/导出** - 方便迁移

### P2 - 低优先级（可选）

1. **后端持久化存储** - 存数据库
2. **API 连通性测试** - 测试按钮

---

## ✅ 验收标准

### 需求一验收

- [ ] 用户可以添加新的服务商配置
- [ ] 用户可以编辑现有服务商配置
- [ ] 用户可以删除服务商配置
- [ ] 设置页面的服务商下拉列表显示所有已配置服务商
- [ ] 选择自定义服务商后，API 调用成功

### 需求二验收

- [ ] 所有下拉框的选项清晰可见
- [ ] 下拉框背景色与页面整体风格一致
- [ ] 选项文字颜色与背景有足够对比度

---

## ✅ 已确认问题（2026-03-30）

| 编号 | 问题 | 确认方案 |
|------|------|----------|
| Q1 | 后端是否需要从配置文件读取服务商？ | **A. 前端传完整配置** |
| Q2 | 需要支持哪些接口类型？ | **仅 `openai_compat`（兼容 OpenAI）** |
| Q3 | 预置哪些服务商？ | **阿里云百炼 + OpenAI** |
| Q4 | API Key 是否需要加密存储？ | **A. localStorage 明文（一期）** |
| Q5 | 是否需要服务商导入导出功能？ | **否（一期不做）** |

---

## 📝 开发计划

### 第一阶段：CSS 修复（预计 30 分钟）

1. 修复 Select 组件样式
2. 测试所有下拉框显示正常

### 第二阶段：服务商配置基础（预计 2 小时）

1. 创建 ProviderConfig 页面框架
2. 实现服务商列表展示
3. 实现添加/编辑/删除功能

### 第三阶段：后端适配（预计 2 小时）

1. 添加 CustomProviderService 类
2. 修改 generate 接口支持动态配置

### 第四阶段：集成测试（预计 1 小时）

1. 测试添加新服务商
2. 测试 API 调用成功
3. 测试设置保存

**预计总工时**: 约 5-6 小时

---

## 📌 备注

- 本文档为 v1.2.0 需求计划，不包含代码实现
- 开发前请先确认"待确认问题列表"
- 完成后更新 CHANGELOG.md 并发布 v1.2.0 标签
