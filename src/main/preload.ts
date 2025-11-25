import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  getConfig: (key: string) => ipcRenderer.invoke('get-config', key),
  setConfig: (key: string, value: any) => ipcRenderer.invoke('set-config', key, value),
  
  aiChat: (message: string, context?: any) => ipcRenderer.invoke('ai-chat', message, context),
  aiStreamChat: (message: string, context?: any) => ipcRenderer.invoke('ai-stream-chat', message, context),
  aiGetCompletion: (context: any) => ipcRenderer.invoke('ai-get-completion', context),
  onStreamChunk: (callback: (chunk: string) => void) => {
    const listener = (_: unknown, chunk: string) => callback(chunk);
    ipcRenderer.on('ai-stream-chunk', listener);
    return () => ipcRenderer.removeListener('ai-stream-chunk', listener);
  },
  
  // AI Assistant 功能
  aiReviewCode: (code: string, language: string, filePath?: string) => 
    ipcRenderer.invoke('ai:review-code', code, language, filePath),
  aiGenerateTests: (code: string, language: string, filePath?: string) => 
    ipcRenderer.invoke('ai:generate-tests', code, language, filePath),
  aiGenerateDocs: (code: string, language: string) => 
    ipcRenderer.invoke('ai:generate-docs', code, language),
  aiExplainCode: (code: string, language: string) => 
    ipcRenderer.invoke('ai:explain-code', code, language),
  aiSuggestRefactoring: (code: string, language: string) => 
    ipcRenderer.invoke('ai:suggest-refactoring', code, language),
  
  formatCode: (code: string, filePath: string) => ipcRenderer.invoke('format-code', code, filePath),
  isFormatSupported: (filePath: string) => ipcRenderer.invoke('is-format-supported', filePath),
  
  mcpListServers: () => ipcRenderer.invoke('mcp-list-servers'),
  mcpAddServer: (config: any) => ipcRenderer.invoke('mcp-add-server', config),
  mcpRemoveServer: (serverId: string) => ipcRenderer.invoke('mcp-remove-server', serverId),
  mcpCallTool: (serverId: string, toolName: string, params: any) => 
    ipcRenderer.invoke('mcp-call-tool', serverId, toolName, params),
  
  readFile: (filePath: string) => ipcRenderer.invoke('read-file', filePath),
  writeFile: (filePath: string, content: string) => ipcRenderer.invoke('write-file', filePath, content),
  
  onFileOpened: (callback: (filePath: string) => void) => {
    const listener = (_: unknown, filePath: string) => callback(filePath);
    ipcRenderer.on('file-opened', listener);
    return () => ipcRenderer.removeListener('file-opened', listener);
  },
  onFolderOpened: (callback: (folderPath: string) => void) => {
    const listener = (_: unknown, folderPath: string) => callback(folderPath);
    ipcRenderer.on('folder-opened', listener);
    return () => ipcRenderer.removeListener('folder-opened', listener);
  },
  onSaveFile: (callback: () => void) => {
    const listener = () => callback();
    ipcRenderer.on('save-file', listener);
    return () => ipcRenderer.removeListener('save-file', listener);
  },
  executeCommand: (command: string, cwd?: string) => ipcRenderer.invoke('execute-command', command, cwd),
  readDirectory: (dirPath: string) => ipcRenderer.invoke('read-directory', dirPath),
  searchFiles: (rootPath: string, query: string) => ipcRenderer.invoke('search-files', rootPath, query),
  searchInFiles: (rootPath: string, query: string, options?: any) => ipcRenderer.invoke('search-in-files', rootPath, query, options),
  getRecentFiles: () => ipcRenderer.invoke('get-recent-files'),
  addRecentFile: (filePath: string) => ipcRenderer.invoke('add-recent-file', filePath),
  createFile: (parentPath: string, fileName: string) => ipcRenderer.invoke('create-file', parentPath, fileName),
  createFolder: (parentPath: string, folderName: string) => ipcRenderer.invoke('create-folder', parentPath, folderName),
  renameItem: (oldPath: string, newName: string) => ipcRenderer.invoke('rename-item', oldPath, newName),
  deleteItem: (itemPath: string) => ipcRenderer.invoke('delete-item', itemPath),
  copyToClipboard: (text: string) => ipcRenderer.send('copy-to-clipboard', text),
  updateAppLanguage: (locale: string) => ipcRenderer.send('update-app-language', locale),
  getGitDiff: (rootPath: string, filePath: string) => ipcRenderer.invoke('get-git-diff', rootPath, filePath),
  
  // Git 操作
  gitStatus: (rootPath: string) => ipcRenderer.invoke('git-status', rootPath),
  gitStageFile: (rootPath: string, filePath: string) => ipcRenderer.invoke('git-stage-file', rootPath, filePath),
  gitUnstageFile: (rootPath: string, filePath: string) => ipcRenderer.invoke('git-unstage-file', rootPath, filePath),
  gitStageAll: (rootPath: string) => ipcRenderer.invoke('git-stage-all', rootPath),
  gitCommit: (rootPath: string, message: string) => ipcRenderer.invoke('git-commit', rootPath, message),
  gitPush: (rootPath: string, remote?: string, branch?: string) => ipcRenderer.invoke('git-push', rootPath, remote, branch),
  gitPull: (rootPath: string, remote?: string, branch?: string) => ipcRenderer.invoke('git-pull', rootPath, remote, branch),
  gitBranches: (rootPath: string) => ipcRenderer.invoke('git-branches', rootPath),
  gitCreateBranch: (rootPath: string, branchName: string) => ipcRenderer.invoke('git-create-branch', rootPath, branchName),
  gitCheckoutBranch: (rootPath: string, branchName: string) => ipcRenderer.invoke('git-checkout-branch', rootPath, branchName),
  gitDeleteBranch: (rootPath: string, branchName: string, force: boolean) => ipcRenderer.invoke('git-delete-branch', rootPath, branchName, force),
  gitLog: (rootPath: string, limit?: number) => ipcRenderer.invoke('git-log', rootPath, limit),
  gitDiff: (rootPath: string, filePath?: string) => ipcRenderer.invoke('git-diff', rootPath, filePath),
  
  // Git 增强功能
  gitBlame: (rootPath: string, filePath: string) => ipcRenderer.invoke('git-blame', rootPath, filePath),
  gitStashSave: (rootPath: string, message?: string) => ipcRenderer.invoke('git-stash-save', rootPath, message),
  gitStashList: (rootPath: string) => ipcRenderer.invoke('git-stash-list', rootPath),
  gitStashApply: (rootPath: string, index: number) => ipcRenderer.invoke('git-stash-apply', rootPath, index),
  gitStashPop: (rootPath: string, index?: number) => ipcRenderer.invoke('git-stash-pop', rootPath, index),
  gitStashDrop: (rootPath: string, index: number) => ipcRenderer.invoke('git-stash-drop', rootPath, index),
  gitStashClear: (rootPath: string) => ipcRenderer.invoke('git-stash-clear', rootPath),
  gitShowStash: (rootPath: string, index: number) => ipcRenderer.invoke('git-show-stash', rootPath, index),
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
  }
});
