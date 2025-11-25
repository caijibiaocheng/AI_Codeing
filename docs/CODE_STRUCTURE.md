# AI Code Editor - 代码结构说明

## 目录结构

```
src/
├── shared/                       # 共享模块 (main & renderer)
│   ├── index.ts                  # 模块索引
│   ├── constants.ts              # 常量定义
│   └── types.ts                  # 类型定义
│
├── main/                         # 主进程
│   ├── main.ts                   # 入口文件
│   ├── preload.ts                # 预加载脚本
│   ├── handlers/                 # IPC Handlers (模块化)
│   │   ├── index.ts              # Handler 索引
│   │   ├── fileHandlers.ts       # 文件操作
│   │   ├── gitHandlers.ts        # Git 操作
│   │   ├── aiHandlers.ts         # AI 功能
│   │   ├── workspaceHandlers.ts  # 工作区管理
│   │   └── extensionHandlers.ts  # 扩展管理
│   └── services/                 # 服务层
│       ├── AIService.ts          # AI 服务
│       ├── AICompletionService.ts# 代码补全
│       ├── ExtensionService.ts   # 扩展服务
│       ├── FormatterService.ts   # 代码格式化
│       ├── GitService.ts         # Git 服务
│       ├── MCPService.ts         # MCP 协议
│       ├── MemoryService.ts      # 记忆服务
│       ├── VSCodeAPIShim.ts      # VS Code API 兼容层
│       └── WorkspaceService.ts   # 工作区服务
│
├── renderer/                     # 渲染进程
│   ├── App.tsx                   # 根组件
│   ├── App.css                   # 全局样式
│   ├── index.tsx                 # 入口文件
│   ├── index.html                # HTML 模板
│   ├── contexts/                 # React Context
│   │   ├── index.ts              # Context 索引
│   │   └── AppContext.tsx        # 应用状态 Context
│   ├── hooks/                    # 自定义 Hooks
│   │   ├── index.ts              # Hooks 索引
│   │   ├── useTranslation.ts     # 国际化 Hook
│   │   └── useTabs.ts            # 标签页管理 Hook
│   ├── utils/                    # 工具函数
│   │   ├── index.ts              # 工具索引
│   │   └── language.ts           # 语言检测
│   ├── components/               # UI 组件
│   │   ├── Editor.tsx            # 代码编辑器
│   │   ├── ChatPanel.tsx         # AI 聊天面板
│   │   ├── FileExplorer.tsx      # 文件浏览器
│   │   ├── Terminal.tsx          # 终端
│   │   ├── GitPanel.tsx          # Git 面板
│   │   └── ...                   # 其他组件
│   └── i18n/                     # 国际化
│       ├── index.ts              # i18n 入口
│       ├── zh-CN.ts              # 中文翻译
│       └── en-US.ts              # 英文翻译
│
└── types/                        # 类型定义
    └── electron.d.ts             # Electron API 类型
```

## 架构说明

### 主进程 (Main Process)

主进程负责：
- 窗口管理
- 文件系统访问
- 命令执行
- IPC 通信

**IPC Handlers 模块化**：
- 每个功能域一个独立的 handler 文件
- 统一的错误处理和响应格式
- 便于测试和维护

### 渲染进程 (Renderer Process)

渲染进程采用 React 架构：

**状态管理**：
- `AppContext`: 全局 UI 状态
- `useTabs`: 标签页状态
- `useTranslation`: 国际化

**组件结构**：
- 容器组件：管理状态和业务逻辑
- 展示组件：纯 UI 渲染

## 常用命令

```bash
# 开发模式
npm run dev

# 构建
npm run build

# 打包
npm run package:win    # Windows
npm run package:mac    # macOS
npm run package:linux  # Linux

# 迁移到重构版本
node scripts/migrate-to-refactored.js

# 回滚到原始版本
node scripts/migrate-to-refactored.js --rollback
```

## 添加新功能指南

### 添加新的 IPC Handler

1. 在 `src/main/handlers/` 创建新文件
2. 导出 `register*Handlers` 函数
3. 在 `handlers/index.ts` 导出
4. 在 `main.ts` 中调用注册函数
5. 在 `preload.ts` 暴露 API
6. 在 `types/electron.d.ts` 添加类型

### 添加新的 React Context

1. 在 `src/renderer/contexts/` 创建新文件
2. 定义 Context 和 Provider
3. 导出自定义 Hook
4. 在 `contexts/index.ts` 导出

### 添加新的组件

1. 在 `src/renderer/components/` 创建组件文件
2. 如需样式，创建对应的 `.css` 文件
3. 使用 `useTranslation` 支持国际化
4. 在需要的地方导入使用

## 代码规范

- 使用 TypeScript 严格模式
- 组件使用函数式组件 + Hooks
- 使用 `useCallback` 和 `useMemo` 优化性能
- IPC 通信统一使用 `ApiResponse<T>` 格式
- 错误处理使用 try-catch 并返回友好信息
