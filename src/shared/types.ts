/**
 * 共享类型定义
 * 用于 main 和 renderer 进程之间的通信
 */

// 通用 API 响应类型
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// 文件系统项
export interface FileSystemItem {
  name: string;
  path: string;
  isDirectory: boolean;
}

// 搜索结果
export interface SearchResult {
  name: string;
  path: string;
}

// 文件内容搜索结果
export interface SearchInFilesResult {
  file: string;
  line: number;
  content: string;
  matchStart: number;
  matchEnd: number;
}

// Git 文件状态
export type GitFileStatusType = 'modified' | 'added' | 'deleted' | 'renamed' | 'untracked';

export interface GitFileStatus {
  path: string;
  status: GitFileStatusType;
  oldPath?: string;
}

// Git 仓库状态
export interface GitStatus {
  branch: string;
  ahead: number;
  behind: number;
  staged: GitFileStatus[];
  unstaged: GitFileStatus[];
  untracked: string[];
}

// Git 提交
export interface GitCommit {
  hash: string;
  author: string;
  date: string;
  message: string;
}

// Git 分支
export interface GitBranch {
  name: string;
  current: boolean;
  remote?: boolean;
}

// MCP 服务器配置
export interface MCPServerConfig {
  id: string;
  name: string;
  command: string;
  args: string[];
  env?: Record<string, string>;
  enabled?: boolean;
}

// AI 上下文
export interface AIContext {
  code?: string;
  language?: string;
  memory?: string;
  systemPrompt?: string;
  temperature?: number;
}

// 代码补全上下文
export interface CompletionContext {
  code: string;
  cursorPosition: number;
  language: string;
  filename?: string;
  prefix?: string;
  suffix?: string;
}

// 编辑器标签页
export interface EditorTab {
  id: string;
  title: string;
  filePath: string;
  isDirty: boolean;
  language: string;
}

// 工作区
export interface Workspace {
  path: string;
  name: string;
  lastOpened?: number;
  openFiles?: string[];
}

// 扩展清单
export interface ExtensionManifest {
  name: string;
  displayName?: string;
  version: string;
  publisher: string;
  description?: string;
  main?: string;
  icon?: string;
  engines: {
    vscode: string;
  };
  categories?: string[];
  activationEvents?: string[];
  contributes?: ExtensionContributes;
}

// 扩展贡献
export interface ExtensionContributes {
  commands?: ExtensionCommand[];
  languages?: ExtensionLanguage[];
  themes?: ExtensionTheme[];
  grammars?: ExtensionGrammar[];
  snippets?: ExtensionSnippet[];
}

export interface ExtensionCommand {
  command: string;
  title: string;
  category?: string;
}

export interface ExtensionLanguage {
  id: string;
  extensions?: string[];
  aliases?: string[];
  configuration?: string;
}

export interface ExtensionTheme {
  label: string;
  uiTheme: 'vs' | 'vs-dark' | 'hc-black';
  path: string;
}

export interface ExtensionGrammar {
  language?: string;
  scopeName: string;
  path: string;
}

export interface ExtensionSnippet {
  language: string;
  path: string;
}

// 已安装的扩展
export interface InstalledExtension {
  id: string;
  manifest: ExtensionManifest;
  extensionPath: string;
  enabled: boolean;
  installedAt: number;
}

// 编辑器设置
export interface EditorSettings {
  theme: string;
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  minimap: boolean;
  wordWrap: 'on' | 'off' | 'wordWrapColumn' | 'bounded';
  tabSize: number;
  insertSpaces: boolean;
}

// AI 配置
export interface AIConfig {
  provider: 'openai' | 'azure' | 'anthropic';
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  azureEndpoint?: string;
  azureApiVersion?: string;
}

// 应用配置
export interface AppConfig {
  locale: 'zh-CN' | 'en-US';
  theme: 'light' | 'dark';
  editor: EditorSettings;
  ai: AIConfig;
}
