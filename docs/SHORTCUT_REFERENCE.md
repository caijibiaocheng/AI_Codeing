# 快捷键参考（Keyboard Shortcut Reference）

> 默认键位以 Windows/Linux 为例。macOS 请将 `Ctrl` 换成 `Cmd`，`Alt` 换成 `Option`，其余组合保持不变。

## 1. 核心编辑操作

| 功能 | Windows/Linux | macOS | 说明 |
|------|---------------|-------|------|
| 打开文件 | `Ctrl+O` | `Cmd+O` | 打开单个文件到新的编辑标签页 |
| 打开文件夹 | `Ctrl+Shift+O` | `Cmd+Shift+O` | 通过系统对话框打开整个工作区 |
| 保存文件 | `Ctrl+S` | `Cmd+S` | 保存当前活动标签页 |
| 快速打开 | `Ctrl+P` | `Cmd+P` | 通过文件名模糊搜索快速打开 |
| 命令面板 | `Ctrl+Shift+P` | `Cmd+Shift+P` | 触发命令面板执行内置命令 |
| 全局搜索 | `Ctrl+Shift+F` | `Cmd+Shift+F` | 在整个工作区搜索文本 |
| 最近文件（弹窗） | `Ctrl+R` | `Cmd+R` | 弹出最近文件对话框 |
| 打开终端 | ``Ctrl+` `` | ``Cmd+` `` | 切换内置终端显示状态 |
| 格式化代码 | `Shift+Alt+F` | `Shift+Option+F` | 调用格式化服务美化当前文件 |

## 2. 面板与工具

| 功能 | Windows/Linux | macOS | 说明 |
|------|---------------|-------|------|
| AI Composer | `Ctrl+Shift+C` | `Cmd+Shift+C` | 多文件批量 AI 编辑入口 |
| Git 面板 | `Ctrl+Shift+G` | `Cmd+Shift+G` | 查看变更、提交、刷新状态 |
| 扩展管理 | `Ctrl+Shift+X` | `Cmd+Shift+X` | 管理插件与扩展功能 |
| AI 助手面板 | `Ctrl+Shift+A` | `Cmd+Shift+A` | 打开智能聊天/助手 |
| Markdown 预览 | `Ctrl+Shift+V` | `Cmd+Shift+V` | 开启 Markdown 双栏预览 |
| TODO 面板 | `Ctrl+Shift+T` | `Cmd+Shift+T` | 管理扫描到的 TODO 项 |
| Git Stash 面板 | `Ctrl+Shift+S` | `Cmd+Shift+S` | 保存、应用或弹出 stash |
| 开发者工具集 | `Ctrl+Shift+U` | `Cmd+Shift+U` | HTTP 客户端、正则测试等工具 |
| 代码片段面板 | `Ctrl+Shift+I` | `Cmd+Shift+I` | 管理和插入代码片段 |
| 书签面板 | `Ctrl+Shift+B` | `Cmd+Shift+B` | 查看、跳转和整理书签 |
| 代码度量 | `Ctrl+Shift+M` | `Cmd+Shift+M` | 查看项目统计与复杂度 |
| 最近文件面板 | `Ctrl+Shift+R` | `Cmd+Shift+R` | 固定在侧边的最近文件列表 |
| 文件大纲（Outline） | `Ctrl+Shift+O` | `Cmd+Shift+O` | 显示当前文件结构树 |
| 问题 (Problems) | `Ctrl+Shift+D` | `Cmd+Shift+D` | 代码诊断、警告与错误列表 |
| 项目模板面板 | `Ctrl+Shift+N` | `Cmd+Shift+N` | 打开项目模板中心 |
| 快捷键管理器 | `Ctrl+Shift+K` | `Cmd+Shift+K` | 自定义、导入或导出键位 |
| 环境变量管理器 | `Ctrl+Shift+E` | `Cmd+Shift+E` | 管理多环境变量及加密数据 |
| 任务队列面板 | `Ctrl+Shift+Q` | `Cmd+Shift+Q` | 查看 AI/任务执行队列 |
| 符号导航面板 | `Ctrl+Shift+H` | `Cmd+Shift+H` | 快速跳转定义与引用 |
| 重构工具面板 | `Ctrl+Alt+R` | `Cmd+Option+R` | 进入 8 大重构操作集合 |
| 高级搜索与替换 | `Ctrl+Shift+\\` | `Cmd+Shift+\\` | 启用正则搜索和批量替换 |

> `Ctrl+Shift+O` 既可以通过菜单打开文件夹，也可以在编辑器中切换大纲面板；两者互不干扰。

## 3. Cursor 特色功能快捷键

### 3.1 符号导航（Symbol Navigation）
- 打开/关闭面板：`Ctrl+Shift+H`
- 在搜索结果中移动：`↑` / `↓`
- 跳转到选中项：`Enter`
- 关闭面板：`Esc`
- 批量重命名：点击 ✏️ 按钮后按照提示完成

### 3.2 重构工具（Refactoring Tools）

| 操作 | 默认快捷键 | 说明 |
|------|-------------|------|
| 重命名 | `Ctrl+Shift+R` | 重命名符号、变量或函数 |
| 提取函数 | `Ctrl+Alt+E` | 将选中代码块提取为新函数 |
| 提取常量 | `Ctrl+Alt+C` | 将表达式提取为常量 |
| 提取变量 | `Ctrl+Alt+V` | 将表达式提取为局部变量 |
| 整理 Imports | `Ctrl+Shift+I` | 自动排序、去重 import 语句 |
| 移除未使用 | `Ctrl+Shift+U` | 清理未使用的导入或变量 |
| 转换箭头函数 | `Ctrl+Alt+A` | 在箭头函数与常规函数间互换 |
| 添加类型注解 | `Ctrl+Alt+T` | 自动生成 TypeScript 类型注解 |

> 在 macOS 中使用 `Cmd`/`Option` 替换以上组合中的 `Ctrl`/`Alt`。

### 3.3 高级搜索与替换（Advanced Search & Replace）
- 打开/关闭面板：`Ctrl+Shift+\\`
- 在结果中移动：`↑` / `↓`
- 执行全部替换：`Ctrl+Enter`
- 关闭面板：`Esc`

## 4. 使用建议
- 通过 `Ctrl+Shift+K` 打开快捷键管理器，可自定义任意冲突组合。
- 习惯性触发的系统组合（如 `Ctrl+Shift+O`）在编辑器内也被复用，若与系统行为冲突，可在快捷键管理器中重新绑定。
- 当引入新的面板时，遵循“Ctrl+Shift+<字母>`”的命名习惯，保证与现有布局一致。
