/**
 * Electron IPC Preload 脚本
 * 在主进程和渲染进程之间创建安全的通信桥梁
 * 
 * 所有 API 都通过 window.electronAPI 暴露到渲染进程
 */
import { contextBridge, ipcRenderer } from 'electron';

/**
 * 创建安全的 IPC API 桥梁
 * 使用 contextIsolation 隔离上下文，确保安全性
 */
contextBridge.exposeInMainWorld('electronAPI', {
  // ==================== 配置管理 ====================
  /**
   * 获取应用配置值
   * @param key 配置键
   * @returns 配置值
   */
  getConfig: (key: string) => ipcRenderer.invoke('get-config', key),
  
  /**
   * 设置应用配置值
   * @param key 配置键
   * @param value 配置值
   * @returns 设置结果
   */
  setConfig: (key: string, value: any) => ipcRenderer.invoke('set-config', key, value),
  
  // ==================== AI 聊天 ====================
  /**
   * 进行一次 AI 聊天
   * @param message 用户消息
   * @param context 可选的上下文信息（代码、文件等）
   * @returns 聊天响应
   */
  aiChat: (message: string, context?: any) => ipcRenderer.invoke('ai-chat', message, context),
  
  /**
   * 流式 AI 聊天（实时输出）
   * @param message 用户消息
   * @param context 可选的上下文信息
   * @returns 聊天开始的响应
   */
  aiStreamChat: (message: string, context?: any) => ipcRenderer.invoke('ai-stream-chat', message, context),
  
  /**
   * 获取代码补全建议
   * @param context 补全上下文（包含代码、光标位置等）
   * @returns 补全建议
   */
  aiGetCompletion: (context: any) => ipcRenderer.invoke('ai-get-completion', context),
  
  /**
   * 监听流式聊天的数据块
   * @param callback 接收每个流数据块的回调函数
   * @returns 取消监听的函数
   */
  onStreamChunk: (callback: (chunk: string) => void) => {
    const listener = (_: unknown, chunk: string) => callback(chunk);
    ipcRenderer.on('ai-stream-chunk', listener);
    return () => ipcRenderer.removeListener('ai-stream-chunk', listener);
  },
  
  // ==================== AI 助手功能 ====================
  /**
   * 审查代码质量
   * @param code 源代码
   * @param language 编程语言
   * @param filePath 可选的文件路径
   * @returns 审查结果
   */
  aiReviewCode: (code: string, language: string, filePath?: string) => 
    ipcRenderer.invoke('ai:review-code', code, language, filePath),
  
  /**
   * 生成单元测试
   * @param code 源代码
   * @param language 编程语言
   * @param filePath 可选的文件路径
   * @returns 生成的测试代码
   */
  aiGenerateTests: (code: string, language: string, filePath?: string) => 
    ipcRenderer.invoke('ai:generate-tests', code, language, filePath),
  
  /**
   * 生成代码文档
   * @param code 源代码
   * @param language 编程语言
   * @returns 生成的文档
   */
  aiGenerateDocs: (code: string, language: string) => 
    ipcRenderer.invoke('ai:generate-docs', code, language),
  
  /**
   * 解释代码含义
   * @param code 源代码
   * @param language 编程语言
   * @returns 代码解释
   */
  aiExplainCode: (code: string, language: string) => 
    ipcRenderer.invoke('ai:explain-code', code, language),
  
  /**
   * 建议代码重构方式
   * @param code 源代码
   * @param language 编程语言
   * @returns 重构建议
   */
  aiSuggestRefactoring: (code: string, language: string) => 
    ipcRenderer.invoke('ai:suggest-refactoring', code, language),
  
  // ==================== 代码格式化 ====================
  /**
   * 格式化代码
   * @param code 源代码
   * @param filePath 文件路径（用于确定格式化类型）
   * @returns 格式化的代码
   */
  formatCode: (code: string, filePath: string) => ipcRenderer.invoke('format-code', code, filePath),
  
  /**
   * 检查文件格式是否被支持
   * @param filePath 文件路径
   * @returns 是否支持格式化
   */
  isFormatSupported: (filePath: string) => ipcRenderer.invoke('is-format-supported', filePath),
  
  // ==================== MCP 服务器 ====================
  /**
   * 列出所有 MCP 服务器
   * @returns MCP 服务器列表
   */
  mcpListServers: () => ipcRenderer.invoke('mcp-list-servers'),
  
  /**
   * 添加新的 MCP 服务器
   * @param config 服务器配置
   * @returns 服务器 ID
   */
  mcpAddServer: (config: any) => ipcRenderer.invoke('mcp-add-server', config),
  
  /**
   * 移除 MCP 服务器
   * @param serverId 服务器 ID
   * @returns 操作结果
   */
  mcpRemoveServer: (serverId: string) => ipcRenderer.invoke('mcp-remove-server', serverId),
  
  /**
   * 调用 MCP 工具
   * @param serverId 服务器 ID
   * @param toolName 工具名称
   * @param params 工具参数
   * @returns 工具执行结果
   */
  mcpCallTool: (serverId: string, toolName: string, params: any) => 
    ipcRenderer.invoke('mcp-call-tool', serverId, toolName, params),
  
  // ==================== 文件操作 ====================
  /**
   * 读取文件内容
   * @param filePath 文件路径
   * @returns 文件内容或错误信息
   */
  readFile: (filePath: string) => ipcRenderer.invoke('read-file', filePath),
  
  /**
   * 写入文件内容
   * @param filePath 文件路径
   * @param content 文件内容
   * @returns 操作结果
   */
  writeFile: (filePath: string, content: string) => ipcRenderer.invoke('write-file', filePath, content),
  
  // ==================== 文件事件 ====================
  /**
   * 监听文件打开事件
   * @param callback 回调函数
   * @returns 取消监听的函数
   */
  onFileOpened: (callback: (filePath: string) => void) => {
    const listener = (_: unknown, filePath: string) => callback(filePath);
    ipcRenderer.on('file-opened', listener);
    return () => ipcRenderer.removeListener('file-opened', listener);
  },
  
  /**
   * 监听文件夹打开事件
   * @param callback 回调函数
   * @returns 取消监听的函数
   */
  onFolderOpened: (callback: (folderPath: string) => void) => {
    const listener = (_: unknown, folderPath: string) => callback(folderPath);
    ipcRenderer.on('folder-opened', listener);
    return () => ipcRenderer.removeListener('folder-opened', listener);
  },
  
  /**
   * 监听文件保存事件
   * @param callback 回调函数
   * @returns 取消监听的函数
   */
  onSaveFile: (callback: () => void) => {
    const listener = () => callback();
    ipcRenderer.on('save-file', listener);
    return () => ipcRenderer.removeListener('save-file', listener);
  },
  
  // ==================== 系统命令 ====================
  /**
   * 执行系统命令
   * @param command 命令
   * @param cwd 工作目录
   * @returns 命令执行结果
   */
  executeCommand: (command: string, cwd?: string) => ipcRenderer.invoke('execute-command', command, cwd),
  
  // ==================== 目录操作 ====================
  /**
   * 读取目录内容
   * @param dirPath 目录路径
   * @returns 目录项列表
   */
  readDirectory: (dirPath: string) => ipcRenderer.invoke('read-directory', dirPath),
  
  // ==================== 搜索 ====================
  /**
   * 按文件名搜索
   * @param rootPath 根路径
   * @param query 搜索查询
   * @returns 搜索结果
   */
  searchFiles: (rootPath: string, query: string) => ipcRenderer.invoke('search-files', rootPath, query),
  
  /**
   * 在文件内容中搜索
   * @param rootPath 根路径
   * @param query 搜索查询
   * @param options 搜索选项
   * @returns 搜索结果
   */
  searchInFiles: (rootPath: string, query: string, options?: any) => ipcRenderer.invoke('search-in-files', rootPath, query, options),
  
  /**
   * 获取最近打开的文件列表
   * @returns 最近文件路径数组
   */
  getRecentFiles: () => ipcRenderer.invoke('get-recent-files'),
  
  /**
   * 添加文件到最近打开列表
   * @param filePath 文件路径
   * @returns 操作结果
   */
  addRecentFile: (filePath: string) => ipcRenderer.invoke('add-recent-file', filePath),
  
  /**
   * 创建新文件
   * @param parentPath 父目录路径
   * @param fileName 文件名
   * @returns 操作结果
   */
  createFile: (parentPath: string, fileName: string) => ipcRenderer.invoke('create-file', parentPath, fileName),
  
  /**
   * 创建新文件夹
   * @param parentPath 父目录路径
   * @param folderName 文件夹名
   * @returns 操作结果
   */
  createFolder: (parentPath: string, folderName: string) => ipcRenderer.invoke('create-folder', parentPath, folderName),
  
  /**
   * 重命名文件或文件夹
   * @param oldPath 原路径
   * @param newName 新名称
   * @returns 操作结果
   */
  renameItem: (oldPath: string, newName: string) => ipcRenderer.invoke('rename-item', oldPath, newName),
  
  /**
   * 删除文件或文件夹
   * @param itemPath 项目路径
   * @returns 操作结果
   */
  deleteItem: (itemPath: string) => ipcRenderer.invoke('delete-item', itemPath),
  
  /**
   * 复制文本到剪贴板
   * @param text 要复制的文本
   */
  copyToClipboard: (text: string) => ipcRenderer.send('copy-to-clipboard', text),
  
  /**
   * 更新应用语言
   * @param locale 语言代码（zh-CN 或 en-US）
   */
  updateAppLanguage: (locale: string) => ipcRenderer.send('update-app-language', locale),
  
  /**
   * 获取 Git Diff
   * @param rootPath Git 仓库根路径
   * @param filePath 文件路径
   * @returns Diff 内容
   */
  getGitDiff: (rootPath: string, filePath: string) => ipcRenderer.invoke('get-git-diff', rootPath, filePath),
  
  // ==================== Git 操作 ====================
  /**
   * 获取 Git 状态
   * @param rootPath Git 仓库根路径
   * @returns Git 状态信息
   */
  gitStatus: (rootPath: string) => ipcRenderer.invoke('git-status', rootPath),
  
  /**
   * 暂存单个文件
   * @param rootPath Git 仓库根路径
   * @param filePath 文件路径
   * @returns 操作结果
   */
  gitStageFile: (rootPath: string, filePath: string) => ipcRenderer.invoke('git-stage-file', rootPath, filePath),
  
  /**
   * 取消暂存单个文件
   * @param rootPath Git 仓库根路径
   * @param filePath 文件路径
   * @returns 操作结果
   */
  gitUnstageFile: (rootPath: string, filePath: string) => ipcRenderer.invoke('git-unstage-file', rootPath, filePath),
  
  /**
   * 暂存所有文件
   * @param rootPath Git 仓库根路径
   * @returns 操作结果
   */
  gitStageAll: (rootPath: string) => ipcRenderer.invoke('git-stage-all', rootPath),
  
  /**
   * 提交更改
   * @param rootPath Git 仓库根路径
   * @param message 提交信息
   * @returns 操作结果
   */
  gitCommit: (rootPath: string, message: string) => ipcRenderer.invoke('git-commit', rootPath, message),
  
  /**
   * 推送到远程仓库
   * @param rootPath Git 仓库根路径
   * @param remote 远程仓库名称
   * @param branch 分支名称
   * @returns 操作结果
   */
  gitPush: (rootPath: string, remote?: string, branch?: string) => ipcRenderer.invoke('git-push', rootPath, remote, branch),
  
  /**
   * 从远程仓库拉取
   * @param rootPath Git 仓库根路径
   * @param remote 远程仓库名称
   * @param branch 分支名称
   * @returns 操作结果
   */
  gitPull: (rootPath: string, remote?: string, branch?: string) => ipcRenderer.invoke('git-pull', rootPath, remote, branch),
  
  /**
   * 获取分支列表
   * @param rootPath Git 仓库根路径
   * @returns 分支列表
   */
  gitBranches: (rootPath: string) => ipcRenderer.invoke('git-branches', rootPath),
  
  /**
   * 创建新分支
   * @param rootPath Git 仓库根路径
   * @param branchName 分支名称
   * @returns 操作结果
   */
  gitCreateBranch: (rootPath: string, branchName: string) => ipcRenderer.invoke('git-create-branch', rootPath, branchName),
  
  /**
   * 切换分支
   * @param rootPath Git 仓库根路径
   * @param branchName 分支名称
   * @returns 操作结果
   */
  gitCheckoutBranch: (rootPath: string, branchName: string) => ipcRenderer.invoke('git-checkout-branch', rootPath, branchName),
  
  /**
   * 删除分支
   * @param rootPath Git 仓库根路径
   * @param branchName 分支名称
   * @param force 是否强制删除
   * @returns 操作结果
   */
  gitDeleteBranch: (rootPath: string, branchName: string, force: boolean) => ipcRenderer.invoke('git-delete-branch', rootPath, branchName, force),
  
  /**
   * 获取 Git 日志
   * @param rootPath Git 仓库根路径
   * @param limit 日志条数限制
   * @returns 提交日志
   */
  gitLog: (rootPath: string, limit?: number) => ipcRenderer.invoke('git-log', rootPath, limit),
  
  /**
   * 获取 Diff
   * @param rootPath Git 仓库根路径
   * @param filePath 文件路径
   * @returns Diff 内容
   */
  gitDiff: (rootPath: string, filePath?: string) => ipcRenderer.invoke('git-diff', rootPath, filePath),
  
  // ==================== Git 增强功能 ====================
  /**
   * 显示文件的 Git Blame 信息
   * @param rootPath Git 仓库根路径
   * @param filePath 文件路径
   * @returns Blame 信息
   */
  gitBlame: (rootPath: string, filePath: string) => ipcRenderer.invoke('git-blame', rootPath, filePath),
  
  /**
   * 保存 Git Stash
   * @param rootPath Git 仓库根路径
   * @param message Stash 消息
   * @returns 操作结果
   */
  gitStashSave: (rootPath: string, message?: string) => ipcRenderer.invoke('git-stash-save', rootPath, message),
  
  /**
   * 获取 Stash 列表
   * @param rootPath Git 仓库根路径
   * @returns Stash 列表
   */
  gitStashList: (rootPath: string) => ipcRenderer.invoke('git-stash-list', rootPath),
  
  /**
   * 应用 Stash
   * @param rootPath Git 仓库根路径
   * @param index Stash 索引
   * @returns 操作结果
   */
  gitStashApply: (rootPath: string, index: number) => ipcRenderer.invoke('git-stash-apply', rootPath, index),
  
  /**
   * 弹出 Stash
   * @param rootPath Git 仓库根路径
   * @param index Stash 索引
   * @returns 操作结果
   */
  gitStashPop: (rootPath: string, index?: number) => ipcRenderer.invoke('git-stash-pop', rootPath, index),
  
  /**
   * 删除 Stash
   * @param rootPath Git 仓库根路径
   * @param index Stash 索引
   * @returns 操作结果
   */
  gitStashDrop: (rootPath: string, index: number) => ipcRenderer.invoke('git-stash-drop', rootPath, index),
  
  /**
   * 清空所有 Stash
   * @param rootPath Git 仓库根路径
   * @returns 操作结果
   */
  gitStashClear: (rootPath: string) => ipcRenderer.invoke('git-stash-clear', rootPath),
  
  /**
   * 显示 Stash 内容
   * @param rootPath Git 仓库根路径
   * @param index Stash 索引
   * @returns Stash 内容
   */
  gitShowStash: (rootPath: string, index: number) => ipcRenderer.invoke('git-show-stash', rootPath, index),
  
  /**
   * 显示提交内容
   * @param rootPath Git 仓库根路径
   * @param hash 提交 Hash
   * @returns 提交内容
   */
  gitShowCommit: (rootPath: string, hash: string) => ipcRenderer.invoke('git-show-commit', rootPath, hash),
  
  // Project Management - TODO
  pmGetTodos: () => ipcRenderer.invoke('pm:get-todos'),
  pmAddTodo: (text: string, priority?: 'low' | 'medium' | 'high', filePath?: string, line?: number) =>
    ipcRenderer.invoke('pm:add-todo', text, priority, filePath, line),
  pmUpdateTodo: (id: string, updates: any) => ipcRenderer.invoke('pm:update-todo', id, updates),
  pmDeleteTodo: (id: string) => ipcRenderer.invoke('pm:delete-todo', id),
  pmScanTodos: (rootPath: string) => ipcRenderer.invoke('pm:scan-todos', rootPath),
  
  // Project Management - Snippets
  pmGetSnippets: () => ipcRenderer.invoke('pm:get-snippets'),
  pmAddSnippet: (name: string, code: string, language: string, description?: string, tags?: string[]) =>
    ipcRenderer.invoke('pm:add-snippet', name, code, language, description, tags),
  pmUpdateSnippet: (id: string, updates: any) => ipcRenderer.invoke('pm:update-snippet', id, updates),
  pmDeleteSnippet: (id: string) => ipcRenderer.invoke('pm:delete-snippet', id),
  pmSearchSnippets: (query: string) => ipcRenderer.invoke('pm:search-snippets', query),
  
  // Project Management - Bookmarks
  pmGetBookmarks: () => ipcRenderer.invoke('pm:get-bookmarks'),
  pmAddBookmark: (filePath: string, line: number, label?: string) =>
    ipcRenderer.invoke('pm:add-bookmark', filePath, line, label),
  pmDeleteBookmark: (id: string) => ipcRenderer.invoke('pm:delete-bookmark', id),
  pmGetBookmarksForFile: (filePath: string) => ipcRenderer.invoke('pm:get-bookmarks-for-file', filePath),
  
  // Extension 操作
  extensionSelectVSIX: () => ipcRenderer.invoke('extension-select-vsix'),
  extensionInstall: (vsixPath: string) => ipcRenderer.invoke('extension-install', vsixPath),
  extensionUninstall: (extensionId: string) => ipcRenderer.invoke('extension-uninstall', extensionId),
  extensionEnable: (extensionId: string) => ipcRenderer.invoke('extension-enable', extensionId),
  extensionDisable: (extensionId: string) => ipcRenderer.invoke('extension-disable', extensionId),
  extensionList: () => ipcRenderer.invoke('extension-list'),
  extensionGetThemes: (extensionId: string) => ipcRenderer.invoke('extension-get-themes', extensionId),
  extensionGetLanguages: (extensionId: string) => ipcRenderer.invoke('extension-get-languages', extensionId),
  extensionGetGrammars: (extensionId: string) => ipcRenderer.invoke('extension-get-grammars', extensionId),
  
  // Extension 事件监听
  onExtensionNotification: (callback: (data: any) => void) => {
    const listener = (_: unknown, data: any) => callback(data);
    ipcRenderer.on('extension-notification', listener);
    return () => ipcRenderer.removeListener('extension-notification', listener);
  },

  // ==================== 项目模板管理 ====================
  /**
   * 获取项目模板列表
   */
  getProjectTemplates: () => ipcRenderer.invoke('getProjectTemplates'),

  /**
   * 从模板创建项目
   */
  createProjectFromTemplate: (projectPath: string, projectName: string, files: any[], dependencies?: Record<string, string>, scripts?: Record<string, string>) =>
    ipcRenderer.invoke('createProjectFromTemplate', projectPath, projectName, files, dependencies, scripts),

  /**
   * 保存自定义模板
   */
  saveProjectTemplate: (template: any) => ipcRenderer.invoke('saveProjectTemplate', template),

  // ==================== 快捷键管理 ====================
  /**
   * 获取用户自定义快捷键
   */
  getKeyBindings: () => ipcRenderer.invoke('getKeyBindings'),

  /**
   * 保存快捷键
   */
  saveKeyBinding: (bindingId: string, keybinding: string) => ipcRenderer.invoke('saveKeyBinding', bindingId, keybinding),

  /**
   * 重置快捷键到默认
   */
  resetKeyBinding: (bindingId: string) => ipcRenderer.invoke('resetKeyBinding', bindingId),

  /**
   * 导出快捷键配置
   */
  exportKeyBindings: (keybindings: any[]) => ipcRenderer.invoke('exportKeyBindings', keybindings),

  /**
   * 导入快捷键配置
   */
  importKeyBindings: () => ipcRenderer.invoke('importKeyBindings'),

  // ==================== 环境变量管理 ====================
  /**
   * 获取环境列表
   */
  getEnvironments: () => ipcRenderer.invoke('getEnvironments'),

  /**
   * 保存环境
   */
  saveEnvironment: (environment: any) => ipcRenderer.invoke('saveEnvironment', environment),

  /**
   * 添加环境变量
   */
  addEnvironmentVariable: (environmentId: string, variable: any) => ipcRenderer.invoke('addEnvironmentVariable', environmentId, variable),

  /**
   * 更新环境变量
   */
  updateEnvironmentVariable: (environmentId: string, variableId: string, updates: any) =>
    ipcRenderer.invoke('updateEnvironmentVariable', environmentId, variableId, updates),

  /**
   * 删除环境变量
   */
  deleteEnvironmentVariable: (environmentId: string, variableId: string) =>
    ipcRenderer.invoke('deleteEnvironmentVariable', environmentId, variableId),

  /**
   * 切换环境
   */
  switchEnvironment: (environmentId: string) => ipcRenderer.invoke('switchEnvironment', environmentId),

  /**
   * 导出环境
   */
  exportEnvironment: (environmentId: string) => ipcRenderer.invoke('exportEnvironment', environmentId),

  /**
   * 导入环境
   */
  importEnvironment: () => ipcRenderer.invoke('importEnvironment'),

  // ==================== 对话框操作 ====================
  /**
   * 显示打开文件对话框
   */
  showOpenDialog: (options?: any) => ipcRenderer.invoke('show-open-dialog', options),

  /**
   * 显示保存文件对话框
   */
  showSaveDialog: (options?: any) => ipcRenderer.invoke('show-save-dialog', options)
});
