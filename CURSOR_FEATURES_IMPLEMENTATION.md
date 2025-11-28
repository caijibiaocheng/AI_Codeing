# Cursor 特色功能实现文档

## 概述

本文档详细介绍了从 Cursor IDE 借鉴并实现的三项强大功能。这些功能显著提升了代码编辑和重构的生产力。

---

## 📍 1. 符号导航面板 (Symbol Navigation Panel)

### 功能描述

符号导航面板提供了快速查找和导航代码中的符号（函数、变量、类等）的能力。类似于 Cursor 的 Ctrl+Click 跳转到定义功能。

### 主要特性

- **快速搜索符号**：实时搜索文件中的符号，支持部分匹配
- **定义和引用分离**：清晰地区分符号的定义和引用位置
- **浏览历史**：保留最近访问的符号，方便快速回到之前的位置
- **智能重命名**：选中符号后支持批量重命名
- **键盘导航**：支持箭头键导航和 Enter 快速跳转

### 快捷键

```
Ctrl+Shift+H          - 打开/关闭符号导航面板
↑↓                    - 在结果中导航
Enter                 - 跳转到选中位置
Esc                   - 关闭面板
```

### 使用场景

1. **快速理解代码结构**：搜索函数名来查看所有调用位置
2. **重构代码**：查找所有对某个变量的引用
3. **代码阅读**：跟踪函数调用关系和数据流
4. **团队协作**：快速定位其他开发者写的代码

### 文件位置

- 组件：`src/renderer/components/SymbolNavigationPanel.tsx`
- 样式：`src/renderer/components/SymbolNavigationPanel.css`

### API 示例

```typescript
import SymbolNavigationPanel from './components/SymbolNavigationPanel';

<SymbolNavigationPanel
  onClose={() => setSymbolNavigationOpen(false)}
  currentFile="src/main.tsx"
  editorContent={fileContent}
/>
```

---

## 🔧 2. 代码重构工具 (Refactoring Tools)

### 功能描述

强大的代码重构工具集，支持常见的重构操作，如重命名、提取函数、提取常量等。类似于 VS Code 的重构菜单。

### 支持的重构操作

| 操作 | 快捷键 | 描述 |
|------|--------|------|
| **重命名** | Ctrl+Shift+R | 重命名符号、变量或函数 |
| **提取函数** | Ctrl+Alt+E | 将选中代码提取为新函数 |
| **提取常量** | Ctrl+Alt+C | 将表达式提取为常量 |
| **提取变量** | Ctrl+Alt+V | 将表达式提取为变量 |
| **整理 Imports** | Ctrl+Shift+I | 自动排序和去重 imports |
| **移除未使用** | Ctrl+Shift+U | 移除未使用的导入和变量 |
| **转换箭头函数** | Ctrl+Alt+A | 在普通函数和箭头函数间转换 |
| **添加类型注解** | Ctrl+Alt+T | 自动添加 TypeScript 类型注解 |

### 主要特性

- **实时反馈**：每个操作都显示修改的项数
- **预览确认**：对话框确认操作前进行预览
- **批量操作**：一次操作修改所有相关位置
- **智能检测**：自动检测代码类型和支持的重构操作
- **撤销支持**：所有操作都可撤销（使用 Ctrl+Z）

### 快捷键

```
Ctrl+Alt+R            - 打开/关闭重构工具面板
Ctrl+Shift+R          - 快速重命名
Ctrl+Alt+E            - 提取函数
Ctrl+Alt+C            - 提取常量
```

### 使用场景

1. **大规模重构**：项目范围内重命名变量或函数
2. **代码优化**：提取公共代码为函数或常量
3. **代码清理**：移除未使用的导入
4. **类型安全**：添加 TypeScript 类型注解提高代码质量

### 文件位置

- 组件：`src/renderer/components/RefactoringTools.tsx`
- 样式：`src/renderer/components/RefactoringTools.css`

### API 示例

```typescript
import RefactoringTools from './components/RefactoringTools';

<RefactoringTools
  onClose={() => setRefactoringOpen(false)}
  editorContent={fileContent}
  selectedText={selectedCode}
/>
```

### 实现细节

- 使用正则表达式匹配符号
- 支持 TypeScript 和 JavaScript 语法
- 提供使用提示和快捷键参考
- 实时显示操作结果和统计信息

---

## 🔎 3. 高级搜索和替换 (Advanced Search & Replace)

### 功能描述

功能强大的搜索和替换工具，支持正则表达式、全局替换、搜索历史等高级功能。远超编辑器的基础搜索功能。

### 主要特性

- **正则表达式支持**：使用 `.* ` 启用正则表达式模式
- **区分大小写**：使用 `Aa` 选项控制大小写敏感性
- **全词匹配**：使用 `ab` 选项进行全词匹配
- **搜索历史**：自动保存最近的 20 次搜索
- **批量替换**：一次替换所有匹配项
- **单个替换**：逐个替换，精确控制
- **替换预览**：显示替换前后的对比
- **实时统计**：显示匹配数、已替换数等信息

### 快捷键和选项

```
Ctrl+Shift+\          - 打开/关闭高级搜索面板
↑↓                    - 在结果中导航
Ctrl+Enter            - 全部替换
Esc                   - 关闭面板

.*                    - 启用正则表达式
Aa                    - 区分大小写
ab                    - 全词匹配
🕐                    - 显示搜索历史
```

### 支持的正则表达式

```javascript
// 示例 1：匹配所有函数声明
^function\s+\w+\s*\(

// 示例 2：匹配 TODO 注释
//\s*TODO:?(.+)

// 示例 3：匹配驼峰命名变量
\b[a-z]+(?:[A-Z][a-z]+)*\b

// 示例 4：替换多个空格为一个
\s+
(替换为：单个空格)

// 示例 5：提取日期
(\d{4})-(\d{2})-(\d{2})
```

### 使用场景

1. **大规模文本替换**：使用正则表达式进行复杂替换
2. **代码标准化**：统一命名规范、注释格式等
3. **批量编辑**：一次修改多个相关位置
4. **日志分析**：搜索特定模式的日志行
5. **数据处理**：提取和转换文本数据

### 文件位置

- 组件：`src/renderer/components/AdvancedSearchReplace.tsx`
- 样式：`src/renderer/components/AdvancedSearchReplace.css`

### API 示例

```typescript
import AdvancedSearchReplace from './components/AdvancedSearchReplace';

<AdvancedSearchReplace
  onClose={() => setSearchReplaceOpen(false)}
  editorContent={fileContent}
/>
```

### 正则表达式模式示例

#### 模式 1：函数声明搜索
```
搜索：^(async\s+)?function\s+(\w+)
替换保留组：使用 $1 $2 来保留捕获组
```

#### 模式 2：变量重命名
```
搜索：const\s+oldName\s*=
替换为：const newName =
```

#### 模式 3：导入语句重组织
```
搜索：import\s+\{([^}]+)\}\s+from\s+['"](.+)['"];?
替换为：import { $1 } from '$2';
```

---

## 🎨 集成方式

这三个新功能已经完全集成到应用中：

### 1. 在 Context 中注册状态

```typescript
// src/renderer/contexts/AppContext.tsx
export interface PanelState {
  // ... 其他面板
  isSymbolNavigationOpen: boolean;
  isRefactoringToolsOpen: boolean;
  isAdvancedSearchReplaceOpen: boolean;
}
```

### 2. 添加全局快捷键

```typescript
// src/renderer/App.tsx
if (e.ctrlKey && e.shiftKey && e.key === 'H') {
  e.preventDefault();
  togglePanel('isSymbolNavigationOpen');
}
if (e.ctrlKey && e.altKey && e.key === 'r') {
  e.preventDefault();
  togglePanel('isRefactoringToolsOpen');
}
if (e.ctrlKey && e.shiftKey && e.key === '\\') {
  e.preventDefault();
  togglePanel('isAdvancedSearchReplaceOpen');
}
```

### 3. 渲染面板

```typescript
{panels.isSymbolNavigationOpen && (
  <SymbolNavigationPanel
    onClose={() => setPanel('isSymbolNavigationOpen', false)}
    currentFile={activeTab?.filePath}
    editorContent={fileContent}
  />
)}
```

---

## ⌨️ 完整快捷键参考

### 新增功能入口

| 快捷键 | 功能 | 说明 |
|--------|------|------|
| `Ctrl+Shift+H` | 符号导航面板 | 搜索符号、查看定义与引用 |
| `Ctrl+Alt+R` | 代码重构工具 | 打开 8 项重构操作面板 |
| `Ctrl+Shift+\\` | 高级搜索与替换 | 启用正则、历史与批量替换 |
| `Ctrl+Shift+C` | AI Composer | 批量生成或修改多文件 |
| `Ctrl+Shift+Q` | 任务队列面板 | 跟踪 AI 指令执行情况 |
| `Ctrl+Shift+E` | 环境变量管理器 | 管理 Dev/Test/Prod 等环境 |
| `Ctrl+Shift+K` | 快捷键管理器 | 自定义、导入或导出键位 |
| `Ctrl+Shift+N` | 项目模板面板 | 新建项目模板或自定义模板 |

### 常用辅助快捷键

| 快捷键 | 功能 | 说明 |
|--------|------|------|
| `Ctrl+Shift+F` | 全局搜索 | 项目范围文本搜索 |
| `Ctrl+Shift+G` | Git 面板 | 查看变更、提交、刷新 |
| `Ctrl+Shift+O` | 文件大纲 | 展示当前文件结构 |
| `Ctrl+Shift+V` | Markdown 预览 | Markdown 双栏预览 |
| `Ctrl+Shift+B` | 书签面板 | 管理快速跳转书签 |
| ``Ctrl+` `` | 内置终端 | 打开/关闭内置终端 |
| `Shift+Alt+F` | 格式化代码 | 调用内置 Formatter |

> 更完整的键位列表及 macOS 对照表请参考 [docs/SHORTCUT_REFERENCE.md](docs/SHORTCUT_REFERENCE.md)。


---

## 🚀 性能优化建议

1. **虚拟滚动**：对于大型文件的符号导航结果，使用虚拟滚动提高性能
2. **增量搜索**：在用户输入时延迟搜索以避免频繁更新
3. **缓存**：缓存已解析的符号信息
4. **后台处理**：将重型操作移到 Web Worker 中

---

## 🔮 未来扩展

1. **基于 AST 的符号提取**：使用语法树获得更准确的符号信息
2. **跨文件搜索**：支持在整个项目范围内搜索和替换
3. **搜索过滤器**：按文件类型、目录等过滤搜索结果
4. **替换预览**：显示替换前后的代码差异
5. **重构预览**：在应用前预览重构操作的影响
6. **快捷键自定义**：允许用户自定义快捷键

---

## 📋 类型定义

### SymbolReference
```typescript
interface SymbolReference {
  line: number;           // 符号所在行号
  column: number;         // 符号所在列号
  preview: string;        // 该行代码预览
  type: 'definition' | 'reference'; // 符号类型
}
```

### RefactoringOperation
```typescript
interface RefactoringOperation {
  id: string;             // 操作 ID
  name: string;           // 操作名称
  icon: string;           // 操作图标
  description: string;    // 操作描述
  shortcut: string;       // 快捷键
}
```

### SearchResult
```typescript
interface SearchResult {
  line: number;           // 结果所在行号
  column: number;         // 结果所在列号
  preview: string;        // 该行代码预览
  matchLength: number;    // 匹配长度
}
```

---

## 🐛 已知限制

1. **符号导航**：目前基于简单的文本匹配，不支持跨文件导航
2. **重构工具**：预览功能需要集成真实的代码解析器
3. **搜索替换**：正则表达式捕获组替换需要完整的实现
4. **性能**：大型文件的处理可能会有延迟

---

## 📞 反馈和贡献

这些功能是基于 Cursor IDE 的优秀设计实现的。如果您有改进建议或遇到问题，欢迎提交 Issue 或 Pull Request。

---

**版本**: 1.0.0  
**发布日期**: 2024-11-28  
**作者**: AI Code Editor 开发团队
