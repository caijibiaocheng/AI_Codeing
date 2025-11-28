/**
 * Electron API 类型定义
 * 定义 window.electronAPI 的接口
 */

// 从共享类型导入（如果需要在 renderer 中使用）
// import type { ... } from '../shared/types';

declare global {
  // ==================== 通知系统 ====================
  interface NotificationSystem {
    info: (title: string, message?: string, options?: Partial<Notification>) => string;
    success: (title: string, message?: string, options?: Partial<Notification>) => string;
    warning: (title: string, message?: string, options?: Partial<Notification>) => string;
    error: (title: string, message?: string, options?: Partial<Notification>) => string;
    clear: () => void;
  }

  interface Notification {
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message?: string;
    duration?: number;
    actions?: Array<{
      label: string;
      action: () => void;
      primary?: boolean;
    }>;
  }

  // ==================== 文件系统 ====================
  interface FileSystemItem {
    name: string;
    path: string;
    isDirectory: boolean;
  }

  interface SearchResult {
    name: string;
    path: string;
  }

  interface SearchInFilesResult {
    file: string;
    line: number;
    content: string;
    matchStart: number;
    matchEnd: number;
  }

  interface SearchOptions {
    useRegex?: boolean;
    caseSensitive?: boolean;
    fileFilter?: string;
  }

  // ==================== MCP ====================
  interface MCPServer {
    id: string;
    name: string;
    command: string;
    args: string[];
    env?: Record<string, string>;
    enabled?: boolean;
  }

  // ==================== AI ====================
  interface AIContext {
    code?: string;
    language?: string;
    memory?: string;
    systemPrompt?: string;
    temperature?: number;
    files?: Array<{ path: string; content: string }>;
    [key: string]: unknown;
  }

  interface CompletionContext {
    code: string;
    cursorPosition: number;
    language: string;
    filename?: string;
    prefix?: string;
    suffix?: string;
  }

  interface CodeReviewResult {
    severity: 'error' | 'warning' | 'info' | 'suggestion';
    line?: number;
    message: string;
    suggestion?: string;
  }

  interface TestGenerationResult {
    testCode: string;
    framework: string;
    coverage: string[];
  }

  interface DocumentationResult {
    documentation: string;
    format: 'jsdoc' | 'python-docstring' | 'xml-doc' | 'markdown';
  }

  interface CodeExplanationResult {
    explanation: string;
    complexity: 'low' | 'medium' | 'high';
    keyPoints: string[];
  }

  interface RefactoringSuggestion {
    type: 'extract-method' | 'rename' | 'simplify' | 'optimize' | 'pattern';
    title: string;
    description: string;
    before: string;
    after: string;
    impact: 'low' | 'medium' | 'high';
  }

  // ==================== Git ====================
  type GitFileStatusType = 'modified' | 'added' | 'deleted' | 'renamed' | 'untracked';

  interface GitFileStatus {
    path: string;
    status: GitFileStatusType;
    oldPath?: string;
  }

  interface GitStatus {
    branch: string;
    ahead: number;
    behind: number;
    staged: GitFileStatus[];
    unstaged: GitFileStatus[];
    untracked: string[];
  }

  interface GitCommit {
    hash: string;
    author: string;
    date: string;
    message: string;
  }

  interface GitBranch {
    name: string;
    current: boolean;
    remote?: boolean;
  }

  interface GitBlame {
    line: number;
    hash: string;
    author: string;
    date: string;
    content: string;
  }

  interface GitStash {
    index: number;
    name: string;
    branch: string;
    message: string;
  }

  // ==================== Project Management ====================
  interface TodoItem {
    id: string;
    text: string;
    completed: boolean;
    priority: 'low' | 'medium' | 'high';
    filePath?: string;
    line?: number;
    createdAt: number;
    updatedAt: number;
  }

  interface CodeSnippet {
    id: string;
    name: string;
    description?: string;
    language: string;
    code: string;
    tags: string[];
    createdAt: number;
    updatedAt: number;
  }

  interface Bookmark {
    id: string;
    filePath: string;
    line: number;
    label?: string;
    createdAt: number;
  }

  interface Window {
    electronAPI: {
      getConfig: (key: string) => Promise<string | number | boolean | undefined>;
      setConfig: (key: string, value: unknown) => Promise<boolean>;
      aiChat: (message: string, context?: AIContext) => Promise<{ success: boolean; data?: string; error?: string }>;
      aiStreamChat: (message: string, context?: AIContext) => Promise<{ success: boolean; error?: string }>;
      aiGetCompletion: (context: CompletionContext) => Promise<{ success: boolean; completion?: string | null; error?: string }>;
      onStreamChunk: (callback: (chunk: string) => void) => () => void;
      aiReviewCode: (code: string, language: string, filePath?: string) => Promise<{ success: boolean; data?: CodeReviewResult[]; error?: string }>;
      aiGenerateTests: (code: string, language: string, filePath?: string) => Promise<{ success: boolean; data?: TestGenerationResult; error?: string }>;
      aiGenerateDocs: (code: string, language: string) => Promise<{ success: boolean; data?: DocumentationResult; error?: string }>;
      aiExplainCode: (code: string, language: string) => Promise<{ success: boolean; data?: CodeExplanationResult; error?: string }>;
      aiSuggestRefactoring: (code: string, language: string) => Promise<{ success: boolean; data?: RefactoringSuggestion[]; error?: string }>;
      formatCode: (code: string, filePath: string) => Promise<{ success: boolean; formatted?: string; error?: string }>;
      isFormatSupported: (filePath: string) => Promise<boolean>;
      mcpListServers: () => Promise<MCPServer[]>;
      mcpAddServer: (config: Partial<MCPServer>) => Promise<string>;
      mcpRemoveServer: (serverId: string) => Promise<boolean>;
      mcpCallTool: (serverId: string, toolName: string, params: Record<string, unknown>) => Promise<unknown>;
      readFile: (filePath: string) => Promise<{ success: boolean; data?: string; error?: string }>;
      writeFile: (filePath: string, content: string) => Promise<{ success: boolean; error?: string }>;
      onFileOpened: (callback: (filePath: string) => void) => () => void;
      onFolderOpened: (callback: (folderPath: string) => void) => () => void;
      onSaveFile: (callback: () => void) => () => void;
      executeCommand: (command: string, cwd?: string) => Promise<{ success: boolean; output?: string; error?: string }>;
      readDirectory: (dirPath: string) => Promise<{ success: boolean; data?: FileSystemItem[]; error?: string }>;
      searchFiles: (rootPath: string, query: string) => Promise<{ success: boolean; data?: SearchResult[]; error?: string }>;
      searchInFiles: (rootPath: string, query: string, options?: { useRegex?: boolean; caseSensitive?: boolean; fileFilter?: string }) => Promise<{ success: boolean; data?: SearchInFilesResult[]; error?: string }>;
      getRecentFiles: () => Promise<string[]>;
      addRecentFile: (filePath: string) => Promise<boolean>;
      createFile: (parentPath: string, fileName: string) => Promise<{ success: boolean; error?: string }>;
      createFolder: (parentPath: string, folderName: string) => Promise<{ success: boolean; error?: string }>;
      renameItem: (oldPath: string, newName: string) => Promise<{ success: boolean; error?: string }>;
      deleteItem: (itemPath: string) => Promise<{ success: boolean; error?: string }>;
      copyToClipboard: (text: string) => void;
      updateAppLanguage: (locale: string) => void;
      getGitDiff: (rootPath: string, filePath: string) => Promise<{ success: boolean; diff?: string; error?: string }>;
      // Git 操作
      gitStatus: (rootPath: string) => Promise<{ success: boolean; data?: GitStatus; error?: string }>;
      gitStageFile: (rootPath: string, filePath: string) => Promise<{ success: boolean; error?: string }>;
      gitUnstageFile: (rootPath: string, filePath: string) => Promise<{ success: boolean; error?: string }>;
      gitStageAll: (rootPath: string) => Promise<{ success: boolean; error?: string }>;
      gitCommit: (rootPath: string, message: string) => Promise<{ success: boolean; error?: string }>;
      gitPush: (rootPath: string, remote?: string, branch?: string) => Promise<{ success: boolean; error?: string }>;
      gitPull: (rootPath: string, remote?: string, branch?: string) => Promise<{ success: boolean; error?: string }>;
      gitBranches: (rootPath: string) => Promise<{ success: boolean; data?: GitBranch[]; error?: string }>;
      gitCreateBranch: (rootPath: string, branchName: string) => Promise<{ success: boolean; error?: string }>;
      gitCheckoutBranch: (rootPath: string, branchName: string) => Promise<{ success: boolean; error?: string }>;
      gitDeleteBranch: (rootPath: string, branchName: string, force: boolean) => Promise<{ success: boolean; error?: string }>;
      gitLog: (rootPath: string, limit?: number) => Promise<{ success: boolean; data?: GitCommit[]; error?: string }>;
      gitDiff: (rootPath: string, filePath?: string) => Promise<{ success: boolean; data?: string; error?: string }>;
      // Git 增强功能
      gitBlame: (rootPath: string, filePath: string) => Promise<{ success: boolean; data?: GitBlame[]; error?: string }>;
      gitStashSave: (rootPath: string, message?: string) => Promise<{ success: boolean; error?: string }>;
      gitStashList: (rootPath: string) => Promise<{ success: boolean; data?: GitStash[]; error?: string }>;
      gitStashApply: (rootPath: string, index: number) => Promise<{ success: boolean; error?: string }>;
      gitStashPop: (rootPath: string, index?: number) => Promise<{ success: boolean; error?: string }>;
      gitStashDrop: (rootPath: string, index: number) => Promise<{ success: boolean; error?: string }>;
      gitStashClear: (rootPath: string) => Promise<{ success: boolean; error?: string }>;
      gitShowStash: (rootPath: string, index: number) => Promise<{ success: boolean; data?: string; error?: string }>;
      gitShowCommit: (rootPath: string, hash: string) => Promise<{ success: boolean; data?: string; error?: string }>;
      // Project Management - TODO
      pmGetTodos: () => Promise<{ success: boolean; data?: TodoItem[]; error?: string }>;
      pmAddTodo: (text: string, priority?: 'low' | 'medium' | 'high', filePath?: string, line?: number) => Promise<{ success: boolean; data?: TodoItem; error?: string }>;
      pmUpdateTodo: (id: string, updates: Partial<TodoItem>) => Promise<{ success: boolean; error?: string }>;
      pmDeleteTodo: (id: string) => Promise<{ success: boolean; error?: string }>;
      pmScanTodos: (rootPath: string) => Promise<{ success: boolean; data?: TodoItem[]; error?: string }>;
      // Project Management - Snippets
      pmGetSnippets: () => Promise<{ success: boolean; data?: CodeSnippet[]; error?: string }>;
      pmAddSnippet: (name: string, code: string, language: string, description?: string, tags?: string[]) => Promise<{ success: boolean; data?: CodeSnippet; error?: string }>;
      pmUpdateSnippet: (id: string, updates: Partial<CodeSnippet>) => Promise<{ success: boolean; error?: string }>;
      pmDeleteSnippet: (id: string) => Promise<{ success: boolean; error?: string }>;
      pmSearchSnippets: (query: string) => Promise<{ success: boolean; data?: CodeSnippet[]; error?: string }>;
      // Project Management - Bookmarks
      pmGetBookmarks: () => Promise<{ success: boolean; data?: Bookmark[]; error?: string }>;
      pmAddBookmark: (filePath: string, line: number, label?: string) => Promise<{ success: boolean; data?: Bookmark; error?: string }>;
      pmDeleteBookmark: (id: string) => Promise<{ success: boolean; error?: string }>;
      pmGetBookmarksForFile: (filePath: string) => Promise<{ success: boolean; data?: Bookmark[]; error?: string }>;
      // Extension 操作
      extensionSelectVSIX: () => Promise<{ success: boolean; filePath?: string; error?: string }>;
      extensionInstall: (vsixPath: string) => Promise<{ success: boolean; data?: any; error?: string }>;
      extensionUninstall: (extensionId: string) => Promise<{ success: boolean; error?: string }>;
      extensionEnable: (extensionId: string) => Promise<{ success: boolean; error?: string }>;
      extensionDisable: (extensionId: string) => Promise<{ success: boolean; error?: string }>;
      extensionList: () => Promise<{ success: boolean; data?: any[]; error?: string }>;
      extensionGetThemes: (extensionId: string) => Promise<{ success: boolean; data?: any[]; error?: string }>;
      extensionGetLanguages: (extensionId: string) => Promise<{ success: boolean; data?: any[]; error?: string }>;
      extensionGetGrammars: (extensionId: string) => Promise<{ success: boolean; data?: any[]; error?: string }>;
      onExtensionNotification: (callback: (data: any) => void) => () => void;
    };
    notificationSystem: NotificationSystem;
  }
}

export {};
