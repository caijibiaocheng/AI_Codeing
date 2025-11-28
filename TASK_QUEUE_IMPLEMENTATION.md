# 任务队列实现文档

## 概述

本实现为 AI Code Editor 提供了完整的任务队列管理系统，包括以下功能：

### 1. 自动开关管理

- **新聊天会话自动关闭**：当用户开启新的聊天会话时，任务队列会自动关闭，防止任务混淆
- **JoyCode 问题确认自动关闭**：当 JoyCode 有问题需要确认时，系统会自动关闭任务队列

### 2. 任务执行机制

- **顺序执行**：队列中的任务按照添加顺序逐个执行
- **自动开始**：仅当前一个任务完成后，下一个任务会自动开始
- **完成标志**：任务完成时显示"新建任务"按钮；如果显示"恢复任务"按钮，说明前一个任务未完成

### 3. 编辑任务队列

- **任务编辑**：支持直接编辑队列中的任务
- **@ 符号支持**：编辑时可通过 @符号 引入上下文
- **/ 符号支持**：通过 /符号 快速调用指令

### 4. 任务管理

- **置顶操作**：用户可以将任务置顶，调整优先级
- **删除操作**：支持删除队列中的任务

## 文件结构

```
src/renderer/
├── components/
│   ├── TaskQueuePanel.tsx          # 任务队列 UI 组件
│   └── TaskQueuePanel.css          # 样式文件
├── contexts/
│   ├── TaskQueueContext.tsx        # 任务队列状态管理
│   └── index.ts                    # Context 导出
├── hooks/
│   ├── useTaskQueueAutoToggle.ts   # 自动开关管理 Hook
│   └── index.ts                    # Hook 导出
├── App.tsx                          # 集成 TaskQueueProvider
└── ...
```

## 核心类型定义

### Task 接口

```typescript
interface Task {
  id: string;                    // 唯一标识
  title: string;                 // 任务标题
  description?: string;          // 任务描述
  status: 'pending' | 'executing' | 'completed' | 'failed'; // 任务状态
  createdAt: number;             // 创建时间
  updatedAt: number;             // 更新时间
}
```

### TaskQueueContextValue 接口

```typescript
interface TaskQueueContextValue {
  // 任务管理
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => void;
  removeTask: (taskId: string) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  editTask: (taskId: string, title: string, description?: string) => void;
  pinTask: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
  clearCompletedTasks: () => void;

  // 队列状态
  isQueueEnabled: boolean;
  setQueueEnabled: (enabled: boolean) => void;
  currentExecutingTaskId: string | null;
  
  // 执行控制
  startNextTask: () => void;
  completeCurrentTask: () => void;
  failCurrentTask: (error: string) => void;
  
  // 自动开关
  autoDisableQueue: (reason: string) => void;
}
```

## 使用方法

### 1. 基本使用

```typescript
import { useTaskQueue } from '../contexts/TaskQueueContext';

function MyComponent() {
  const { tasks, addTask, isQueueEnabled, setQueueEnabled } = useTaskQueue();
  
  // 添加任务
  const handleAddTask = () => {
    addTask({
      title: '完成功能 X',
      description: '实现新功能 X 的核心逻辑'
    });
  };
  
  return (
    <div>
      <button onClick={handleAddTask}>添加任务</button>
      <p>队列状态：{isQueueEnabled ? '启用' : '禁用'}</p>
    </div>
  );
}
```

### 2. 任务编辑

```typescript
const { editTask } = useTaskQueue();

// 编辑任务
editTask(taskId, '新标题', '新描述');
```

### 3. 任务管理

```typescript
const { pinTask, deleteTask, clearCompletedTasks } = useTaskQueue();

// 置顶任务
pinTask(taskId);

// 删除任务
deleteTask(taskId);

// 清除已完成任务
clearCompletedTasks();
```

### 4. 任务执行控制

```typescript
const { startNextTask, completeCurrentTask, failCurrentTask } = useTaskQueue();

// 开始下一个任务
startNextTask();

// 完成当前任务（自动开始下一个）
completeCurrentTask();

// 标记当前任务失败
failCurrentTask('执行出错');
```

### 5. 自动开关管理

```typescript
const { autoDisableQueue } = useTaskQueue();

// JoyCode 需要确认时自动关闭队列
autoDisableQueue('JoyCode需要确认问题');
```

## 快捷键

- **Ctrl+Shift+Q**: 打开/关闭任务队列面板

## UI 组件功能

### TaskQueuePanel 组件

提供了完整的任务队列 UI 界面，包括：

1. **队列控制区**
   - 启用/禁用队列的切换开关
   - 显示待执行、执行中、已完成、失败的任务数量

2. **任务列表区**
   - 显示所有任务的列表
   - 每个任务显示状态指示器
   - 支持任务编辑、置顶、删除

3. **编辑界面**
   - 按下编辑按钮后显示编辑表单
   - 支持编辑任务标题和描述
   - 按 Ctrl+Enter 保存，Esc 取消

4. **任务统计**
   - 实时显示各种状态的任务数量
   - 直观的统计面板

5. **操作按钮**
   - ✏️ 编辑：编辑任务内容
   - 📌 置顶：将任务移到列表顶部
   - 🗑️ 删除：删除任务

## 样式定制

### CSS 变量

组件支持以下 CSS 变量的自定义：

```css
--background-primary        /* 主背景色 */
--background-secondary      /* 次背景色 */
--background-tertiary       /* 三级背景色 */
--text-primary             /* 主文本色 */
--text-secondary           /* 次文本色 */
--text-tertiary            /* 三级文本色 */
--border-color             /* 边框色 */
--accent-color             /* 强调色 */
--editor-background        /* 编辑器背景 */
```

## 自动化行为

### 1. 顺序执行

```
待执行 → 执行中 → 已完成 → (自动开始下一个待执行任务)
```

### 2. 自动关闭队列

队列会在以下情况自动关闭：
- 新开启聊天会话时
- JoyCode 需要确认问题时

### 3. 自动恢复

当队列被重新启用时，会自动开始执行下一个待执行的任务。

## 集成指南

### 1. 在应用中使用

```typescript
// App.tsx
import { TaskQueueProvider } from './contexts';

function App() {
  return (
    <AppProvider>
      <TaskQueueProvider>
        <AppContent />
      </TaskQueueProvider>
    </AppProvider>
  );
}
```

### 2. 在聊天面板中触发自动关闭

```typescript
import { useTaskQueue } from '../contexts/TaskQueueContext';

function ChatPanel() {
  const { autoDisableQueue } = useTaskQueue();
  
  const handleNewSession = () => {
    autoDisableQueue('新开启聊天会话');
  };
  
  return <div>...</div>;
}
```

### 3. 监听队列状态变化

```typescript
import { useTaskQueue } from '../contexts/TaskQueueContext';

function MyComponent() {
  const { tasks, currentExecutingTaskId } = useTaskQueue();
  
  useEffect(() => {
    console.log('当前执行任务:', currentExecutingTaskId);
    console.log('所有任务:', tasks);
  }, [tasks, currentExecutingTaskId]);
}
```

## 扩展建议

1. **持久化存储**：实现任务队列的本地存储
2. **任务重试机制**：失败任务的自动重试
3. **任务优先级**：为任务添加优先级概念
4. **任务进度**：显示任务的执行进度
5. **通知系统集成**：任务完成时显示通知
6. **后台执行**：支持后台运行任务
7. **任务历史**：记录已完成的任务历史

## 已知限制

1. 任务队列状态不会持久化（刷新后丢失）
2. 任务不支持子任务或任务依赖关系
3. 没有实现任务超时机制
4. 队列不支持暂停（只支持启用/禁用）

## 性能考虑

- 组件使用 useCallback 优化回调函数
- 任务列表使用虚拟化滚动可进一步优化（对于大量任务）
- 状态更新使用 React 的批量更新机制

## 常见问题

### Q: 如何清空所有任务？
A: 可以循环删除所有任务，或使用 clearCompletedTasks 清除已完成的任务。

### Q: 任务执行失败后会发生什么？
A: 任务状态会变为 'failed'，但不会自动开始下一个任务。需要手动处理或由用户操作。

### Q: 如何在多个地方同步任务队列状态？
A: 使用 useTaskQueue Hook 即可自动获得最新的状态，所有改变都会通过 Context 自动同步。

## 版本历史

- v1.0.0 (2024-11-28)：初始实现
  - 完整的任务队列管理系统
  - 顺序执行机制
  - 自动开关管理
  - 编辑、置顶、删除功能
  - UI 组件和样式
