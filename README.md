# AI Code Editor

<div align="center">

![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)
![Electron](https://img.shields.io/badge/Electron-28.x-47848F.svg?logo=electron)
![React](https://img.shields.io/badge/React-18.x-61DAFB.svg?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6.svg?logo=typescript)

**🚀 AI 驱动的智能代码编辑器**

*类似 Cursor 的开源代码编辑器，集成 AI 聊天、代码补全、MCP 协议支持*

[English](#english) | [中文](#中文)

</div>

---

## 中文

### 📖 项目简介

AI Code Editor 是一款基于 Electron 构建的现代化智能代码编辑器，灵感来源于 Cursor IDE。它将强大的 Monaco Editor 与 AI 能力深度整合，为开发者提供智能代码补全、AI 对话辅助、代码分析等功能，显著提升编程效率。

### ✨ 核心特性

#### 🤖 AI 智能助手
- **多模型支持**：集成 OpenAI、Anthropic Claude、Azure OpenAI 等主流 AI 服务
- **智能对话**：内置 AI 聊天面板，支持代码问答、Bug 分析、代码解释
- **代码补全**：基于上下文的智能代码补全建议
- **AI Composer**：多文件批量代码生成与重构

#### 📝 专业代码编辑
- **Monaco Editor**：VS Code 同款编辑器内核，支持语法高亮、智能提示
- **多语言支持**：JavaScript、TypeScript、Python、Java、C/C++、Go 等
- **代码格式化**：集成 Prettier，一键美化代码
- **Markdown 预览**：实时渲染 Markdown 文档
- **Diff 视图**：直观对比代码差异

#### 🔧 开发工具集
- **HTTP 客户端**：测试 REST API，支持自定义请求头和请求体
- **正则测试器**：实时匹配和分组显示
- **颜色选择器**：HEX、RGB、HSL 格式转换
- **JSON 查看器**：格式化、验证和分析 JSON 数据
- **代码分析**：检测代码问题、复杂度分析

#### 📚 项目管理
- **代码片段管理**：保存和管理常用代码片段，支持标签和搜索
- **书签功能**：在代码中标记重要位置，快速导航
- **代码度量**：分析项目统计信息（文件数、代码行数、语言分布等）
- **TODO 跟踪**：管理项目待办事项，支持文件扫描

#### 🔗 Git 深度集成
- **版本控制**：查看更改、暂存、提交
- **分支管理**：切换分支、查看分支列表
- **Stash 管理**：保存、应用、弹出暂存
- **Diff 查看**：可视化文件差异

#### 🔌 MCP 协议支持
- **Model Context Protocol**：支持 MCP 服务器连接
- **工具调用**：通过 MCP 扩展 AI 能力
- **服务器管理**：添加、移除、配置 MCP 服务器

#### 🌍 国际化
- **多语言界面**：支持简体中文、English
- **动态切换**：无需重启即可切换语言

#### 💻 集成终端
- **内置终端**：基于 xterm.js 的完整终端体验
- **命令执行**：直接在编辑器中运行命令
- **多终端支持**：可同时打开多个终端实例

### 🛠️ 技术栈

| 类别 | 技术 |
|------|------|
| **框架** | Electron 28 |
| **前端** | React 18 + TypeScript 5 |
| **编辑器** | Monaco Editor |
| **构建工具** | Webpack 5 |
| **AI SDK** | OpenAI SDK, Anthropic SDK |
| **协议** | Model Context Protocol (MCP) |
| **终端** | xterm.js |
| **Markdown** | react-markdown + remark-gfm |
| **代码格式化** | Prettier |
| **打包** | electron-builder |

### 📦 安装

#### 环境要求
- Node.js >= 18.x
- npm >= 9.x 或 yarn >= 1.22
- Git

#### 从源码安装

```bash
# 克隆仓库
git clone https://github.com/yourusername/ai-code-editor.git
cd ai-code-editor

# 安装依赖
npm install

# 开发模式运行
npm run dev

# 在另一个终端启动 Electron
npm start
```

#### 下载预构建版本

前往 [Releases](https://github.com/yourusername/ai-code-editor/releases) 页面下载适合您系统的安装包：

- **Windows**: `.exe` 安装包 或 `.exe` 便携版
- **macOS**: `.dmg` 安装包 或 `.zip` 压缩包
- **Linux**: `.AppImage` 或 `.deb` 包

### 🚀 快速开始

#### 1. 配置 AI 服务

首次启动后，点击侧边栏的 ⚙️ 设置按钮，配置您的 AI 服务：

```
设置 → API 配置 → 选择 AI 提供商 → 输入 API Key
```

支持的 AI 提供商：
- **OpenAI**: GPT-4, GPT-3.5-turbo 等
- **Anthropic**: Claude 3 Opus, Sonnet, Haiku
- **Azure OpenAI**: 企业级 Azure 部署

#### 2. 打开项目

```
文件 → 打开文件夹 → 选择您的项目目录
```

或使用快捷键 `Ctrl+Shift+O` (Windows/Linux) / `Cmd+Shift+O` (macOS)

#### 3. 开始编码

- **AI 对话**: 点击侧边栏 💬 图标或按 `Ctrl+Shift+I`
- **快速打开**: `Ctrl+P` 快速搜索并打开文件
- **全局搜索**: `Ctrl+Shift+F` 在项目中搜索内容
- **Git 面板**: `Ctrl+Shift+G` 打开版本控制

### ⌨️ 快捷键

| 功能 | Windows/Linux | macOS |
|------|---------------|-------|
| 打开文件 | `Ctrl+O` | `Cmd+O` |
| 打开文件夹 | `Ctrl+Shift+O` | `Cmd+Shift+O` |
| 保存文件 | `Ctrl+S` | `Cmd+S` |
| 快速打开 | `Ctrl+P` | `Cmd+P` |
| 全局搜索 | `Ctrl+Shift+F` | `Cmd+Shift+F` |
| Git 面板 | `Ctrl+Shift+G` | `Cmd+Shift+G` |
| AI Composer | `Ctrl+Shift+C` | `Cmd+Shift+C` |
| 切换终端 | `Ctrl+`` | `Cmd+`` |
| 代码片段 | `Ctrl+Shift+P` | `Cmd+Shift+P` |
| 书签面板 | `Ctrl+Shift+B` | `Cmd+Shift+B` |
| 代码度量 | `Ctrl+Shift+M` | `Cmd+Shift+M` |

### 📁 项目结构

```
ai-code-editor/
├── src/
│   ├── main/                    # Electron 主进程
│   │   ├── main.ts              # 主进程入口
│   │   ├── preload.ts           # 预加载脚本
│   │   ├── handlers/            # IPC 处理器
│   │   │   ├── fileHandlers.ts      # 文件操作
│   │   │   ├── gitHandlers.ts       # Git 操作
│   │   │   ├── aiHandlers.ts        # AI 功能
│   │   │   ├── workspaceHandlers.ts # 工作区管理
│   │   │   └── extensionHandlers.ts # 扩展管理
│   │   └── services/            # 服务层
│   │       ├── AIService.ts         # AI 服务
│   │       ├── AICompletionService.ts # 代码补全
│   │       ├── GitService.ts        # Git 服务
│   │       ├── MCPService.ts        # MCP 协议
│   │       ├── MemoryService.ts     # 记忆服务
│   │       └── FormatterService.ts  # 代码格式化
│   │
│   ├── renderer/                # 渲染进程 (React)
│   │   ├── App.tsx              # 根组件
│   │   ├── components/          # UI 组件
│   │   │   ├── Editor.tsx           # 代码编辑器
│   │   │   ├── ChatPanel.tsx        # AI 聊天面板
│   │   │   ├── FileExplorer.tsx     # 文件浏览器
│   │   │   ├── Terminal.tsx         # 终端
│   │   │   ├── GitPanel.tsx         # Git 面板
│   │   │   ├── AIComposer.tsx       # AI Composer
│   │   │   └── ...                  # 更多组件
│   │   ├── contexts/            # React Context
│   │   ├── hooks/               # 自定义 Hooks
│   │   ├── i18n/                # 国际化
│   │   └── utils/               # 工具函数
│   │
│   ├── shared/                  # 共享模块
│   │   ├── constants.ts         # 常量定义
│   │   └── types.ts             # 类型定义
│   │
│   └── types/                   # TypeScript 类型
│       └── electron.d.ts        # Electron API 类型
│
├── assets/                      # 静态资源
├── scripts/                     # 构建脚本
├── docs/                        # 文档
├── webpack.main.config.js       # 主进程 Webpack 配置
├── webpack.renderer.config.js   # 渲染进程 Webpack 配置
├── tsconfig.json                # TypeScript 配置
└── package.json                 # 项目配置
```

### 🔧 配置说明

#### AI 配置

在设置中配置 AI 服务：

| 配置项 | 说明 | 示例 |
|--------|------|------|
| AI Provider | AI 服务提供商 | `openai`, `anthropic`, `azure` |
| API Key | API 密钥 | `sk-xxx...` |
| Model | 使用的模型 | `gpt-4`, `claude-3-opus-20240229` |
| Temperature | 生成温度 (0-2) | `0.7` |
| Max Tokens | 最大令牌数 | `4096` |

#### MCP 服务器配置

添加 MCP 服务器以扩展 AI 能力：

```json
{
  "name": "my-mcp-server",
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-xxx"]
}
```

#### 外观配置

| 配置项 | 说明 | 可选值 |
|--------|------|--------|
| UI Theme | 界面主题 | `dark`, `light` |
| Editor Theme | 编辑器主题 | `vs-dark`, `vs`, `hc-black` 等 |
| Font Family | 字体 | `Consolas`, `Fira Code` 等 |
| Font Size | 字号 | `12` - `24` |

### 🏗️ 开发指南

#### 开发模式

```bash
# 启动开发服务器（热重载）
npm run dev

# 在另一个终端启动 Electron
npm start
```

#### 构建

```bash
# 构建所有
npm run build

# 仅构建主进程
npm run build:main

# 仅构建渲染进程
npm run build:renderer
```

#### 打包

```bash
# Windows
npm run package:win

# macOS
npm run package:mac

# Linux
npm run package:linux
```

#### 添加新功能

**添加新的 IPC Handler：**

1. 在 `src/main/handlers/` 创建新文件
2. 导出 `register*Handlers` 函数
3. 在 `handlers/index.ts` 导出
4. 在 `main.ts` 中调用注册函数
5. 在 `preload.ts` 暴露 API
6. 在 `types/electron.d.ts` 添加类型

**添加新的 React 组件：**

1. 在 `src/renderer/components/` 创建组件文件
2. 如需样式，创建对应的 `.css` 文件
3. 使用 `useTranslation` 支持国际化
4. 在需要的地方导入使用

### 🤝 贡献指南

我们欢迎所有形式的贡献！

#### 如何贡献

1. **Fork** 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 **Pull Request**

#### 代码规范

- 使用 TypeScript 严格模式
- 组件使用函数式组件 + Hooks
- 使用 `useCallback` 和 `useMemo` 优化性能
- IPC 通信统一使用 `ApiResponse<T>` 格式
- 错误处理使用 try-catch 并返回友好信息

#### 提交规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
feat: 添加新功能
fix: 修复 Bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
test: 测试相关
chore: 构建/工具相关
```

### 📋 路线图

- [ ] 插件系统
- [ ] 远程开发支持
- [ ] 协作编辑
- [ ] 更多 AI 模型支持
- [x] 代码片段管理 ✅
- [x] 书签功能 ✅
- [x] 代码度量分析 ✅
- [ ] 主题市场
- [ ] 性能优化
- [ ] 代码重构工具
- [ ] 项目模板系统

### ❓ 常见问题

<details>
<summary><b>Q: 如何配置代理？</b></summary>

在系统环境变量中设置 `HTTP_PROXY` 和 `HTTPS_PROXY`，或在 AI 配置中设置自定义 API 端点。
</details>

<details>
<summary><b>Q: AI 响应很慢怎么办？</b></summary>

1. 检查网络连接
2. 尝试使用更快的模型（如 gpt-3.5-turbo）
3. 减少 Max Tokens 设置
4. 考虑使用 Azure OpenAI 获得更稳定的连接
</details>

<details>
<summary><b>Q: 如何添加自定义主题？</b></summary>

目前支持 Monaco Editor 内置主题，自定义主题功能正在开发中。
</details>

### 📄 许可证

本项目采用 [MIT License](LICENSE) 开源许可证。

### 🙏 致谢

- [Electron](https://www.electronjs.org/) - 跨平台桌面应用框架
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - VS Code 编辑器内核
- [React](https://reactjs.org/) - 用户界面库
- [OpenAI](https://openai.com/) - AI 服务
- [Anthropic](https://www.anthropic.com/) - Claude AI
- [xterm.js](https://xtermjs.org/) - 终端模拟器

---

## English

### 📖 Introduction

AI Code Editor is a modern intelligent code editor built on Electron, inspired by Cursor IDE. It deeply integrates the powerful Monaco Editor with AI capabilities, providing developers with intelligent code completion, AI-assisted conversations, code analysis, and more to significantly improve programming efficiency.

### ✨ Key Features

#### 🤖 AI Assistant
- **Multi-model Support**: Integration with OpenAI, Anthropic Claude, Azure OpenAI
- **Intelligent Chat**: Built-in AI chat panel for code Q&A, bug analysis, code explanation
- **Code Completion**: Context-aware intelligent code suggestions
- **AI Composer**: Multi-file batch code generation and refactoring

#### 📝 Professional Code Editing
- **Monaco Editor**: Same editor core as VS Code with syntax highlighting and IntelliSense
- **Multi-language Support**: JavaScript, TypeScript, Python, Java, C/C++, Go, etc.
- **Code Formatting**: Integrated Prettier for one-click code beautification
- **Markdown Preview**: Real-time Markdown rendering
- **Diff View**: Visual code comparison

#### 🔧 Developer Tools
- **HTTP Client**: Test REST APIs with custom headers and body
- **Regex Tester**: Real-time matching and group display
- **Color Picker**: HEX, RGB, HSL format conversion
- **JSON Viewer**: Format, validate, and analyze JSON data
- **Code Analysis**: Detect code issues and complexity analysis

#### 🔗 Git Integration
- **Version Control**: View changes, stage, commit
- **Branch Management**: Switch branches, view branch list
- **Stash Management**: Save, apply, pop stashes
- **Diff Viewer**: Visual file differences

#### 🔌 MCP Protocol Support
- **Model Context Protocol**: Support for MCP server connections
- **Tool Invocation**: Extend AI capabilities through MCP
- **Server Management**: Add, remove, configure MCP servers

#### 🌍 Internationalization
- **Multi-language UI**: Simplified Chinese, English
- **Dynamic Switching**: Switch languages without restart

### 🚀 Quick Start

```bash
# Clone repository
git clone https://github.com/yourusername/ai-code-editor.git
cd ai-code-editor

# Install dependencies
npm install

# Run in development mode
npm run dev

# Start Electron in another terminal
npm start
```

### 📦 Build & Package

```bash
# Build all
npm run build

# Package for Windows
npm run package:win

# Package for macOS
npm run package:mac

# Package for Linux
npm run package:linux
```

### 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">

**如果这个项目对你有帮助，请给一个 ⭐ Star！**

**If this project helps you, please give it a ⭐ Star!**

Made with ❤️ by AI Code Editor Team

</div>
