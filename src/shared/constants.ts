/**
 * 共享常量定义
 * 用于 main 和 renderer 进程
 */

// 文件大小限制
export const FILE_SIZE_LIMIT = 10 * 1024 * 1024; // 10MB

// 最大最近文件数
export const MAX_RECENT_FILES = 20;

// 搜索结果限制
export const MAX_SEARCH_RESULTS = 1000;

// 命令超时
export const COMMAND_TIMEOUT = 5 * 60 * 1000; // 5 minutes

// 排除的目录
export const EXCLUDED_DIRECTORIES = [
  'node_modules',
  '.git',
  'dist',
  'build',
  '.vscode',
  '.idea',
  '__pycache__',
  '.cache',
  'coverage',
  '.next',
  '.nuxt',
];

// 支持的文件扩展名 (用于过滤器)
export const CODE_FILE_EXTENSIONS = [
  'js', 'jsx', 'ts', 'tsx', 'py', 'java', 'c', 'cpp', 'h', 'hpp',
  'cs', 'go', 'rs', 'php', 'rb', 'swift', 'kt', 'html', 'css',
  'scss', 'json', 'xml', 'md', 'sql', 'sh', 'yaml', 'yml'
];

// 危险命令模式
export const DANGEROUS_COMMAND_PATTERNS = [
  /rm\s+-rf\s+\/[^\/\s]*/i,
  /format\s+[A-Za-z]:/i,
  /del\s+\/[FSQ]\s+[A-Za-z]:/i,
  /shutdown/i,
  /reboot/i,
  />[\s]*\/dev\//i,
  /mkfs/i,
];

// AI 默认配置
export const AI_DEFAULTS = {
  provider: 'openai',
  model: 'gpt-4',
  temperature: 0.7,
  maxTokens: 2048,
};

// 编辑器默认配置
export const EDITOR_DEFAULTS = {
  theme: 'vs-dark',
  fontSize: 14,
  fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
  lineHeight: 1.5,
};

// UI 主题
export type UITheme = 'light' | 'dark';

// 支持的语言环境
export type Locale = 'zh-CN' | 'en-US';

// IPC 通道名称
export const IPC_CHANNELS = {
  // Config
  GET_CONFIG: 'get-config',
  SET_CONFIG: 'set-config',
  
  // AI
  AI_CHAT: 'ai-chat',
  AI_STREAM_CHAT: 'ai-stream-chat',
  AI_GET_COMPLETION: 'ai-get-completion',
  AI_STREAM_CHUNK: 'ai-stream-chunk',
  
  // File operations
  READ_FILE: 'read-file',
  WRITE_FILE: 'write-file',
  READ_DIRECTORY: 'read-directory',
  CREATE_FILE: 'create-file',
  CREATE_FOLDER: 'create-folder',
  RENAME_ITEM: 'rename-item',
  DELETE_ITEM: 'delete-item',
  
  // Search
  SEARCH_FILES: 'search-files',
  SEARCH_IN_FILES: 'search-in-files',
  
  // Recent files
  GET_RECENT_FILES: 'get-recent-files',
  ADD_RECENT_FILE: 'add-recent-file',
  
  // Events
  FILE_OPENED: 'file-opened',
  FOLDER_OPENED: 'folder-opened',
  SAVE_FILE: 'save-file',
  
  // Code
  FORMAT_CODE: 'format-code',
  IS_FORMAT_SUPPORTED: 'is-format-supported',
  EXECUTE_COMMAND: 'execute-command',
  
  // Git
  GIT_STATUS: 'git-status',
  GIT_STAGE_FILE: 'git-stage-file',
  GIT_UNSTAGE_FILE: 'git-unstage-file',
  GIT_STAGE_ALL: 'git-stage-all',
  GIT_COMMIT: 'git-commit',
  GIT_PUSH: 'git-push',
  GIT_PULL: 'git-pull',
  GIT_BRANCHES: 'git-branches',
  GIT_CREATE_BRANCH: 'git-create-branch',
  GIT_CHECKOUT_BRANCH: 'git-checkout-branch',
  GIT_DELETE_BRANCH: 'git-delete-branch',
  GIT_LOG: 'git-log',
  GIT_DIFF: 'git-diff',
  GET_GIT_DIFF: 'get-git-diff',
  
  // MCP
  MCP_LIST_SERVERS: 'mcp-list-servers',
  MCP_ADD_SERVER: 'mcp-add-server',
  MCP_REMOVE_SERVER: 'mcp-remove-server',
  MCP_CALL_TOOL: 'mcp-call-tool',
  
  // Workspace
  WORKSPACE_GET_ALL: 'workspace-get-all',
  WORKSPACE_GET: 'workspace-get',
  WORKSPACE_SAVE: 'workspace-save',
  WORKSPACE_UPDATE: 'workspace-update',
  WORKSPACE_DELETE: 'workspace-delete',
  WORKSPACE_GET_RECENT: 'workspace-get-recent',
  
  // Extensions
  EXTENSION_SELECT_VSIX: 'extension-select-vsix',
  EXTENSION_INSTALL: 'extension-install',
  EXTENSION_UNINSTALL: 'extension-uninstall',
  EXTENSION_ENABLE: 'extension-enable',
  EXTENSION_DISABLE: 'extension-disable',
  EXTENSION_LIST: 'extension-list',
  EXTENSION_GET_THEMES: 'extension-get-themes',
  EXTENSION_GET_LANGUAGES: 'extension-get-languages',
  EXTENSION_GET_GRAMMARS: 'extension-get-grammars',
  EXTENSION_NOTIFICATION: 'extension-notification',
  
  // App
  COPY_TO_CLIPBOARD: 'copy-to-clipboard',
  UPDATE_APP_LANGUAGE: 'update-app-language',
} as const;
