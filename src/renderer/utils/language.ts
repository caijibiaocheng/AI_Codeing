/**
 * 语言检测工具模块
 * 根据文件扩展名检测编程语言
 */

// 文件扩展名到语言的映射表
export const LANGUAGE_EXTENSION_MAP: Record<string, string> = {
  // JavaScript/TypeScript
  js: 'javascript',
  jsx: 'javascript',
  ts: 'typescript',
  tsx: 'typescript',
  mjs: 'javascript',
  cjs: 'javascript',
  
  // Python
  py: 'python',
  pyw: 'python',
  pyc: 'python',
  pyd: 'python',
  pyo: 'python',
  
  // Java/JVM
  java: 'java',
  kt: 'kotlin',
  kts: 'kotlin',
  scala: 'scala',
  groovy: 'groovy',
  
  // C/C++
  c: 'c',
  cpp: 'cpp',
  cc: 'cpp',
  cxx: 'cpp',
  h: 'c',
  hpp: 'cpp',
  hh: 'cpp',
  hxx: 'cpp',
  
  // .NET
  cs: 'csharp',
  fs: 'fsharp',
  vb: 'vb',
  
  // Systems
  go: 'go',
  rs: 'rust',
  swift: 'swift',
  m: 'objective-c',
  mm: 'objective-cpp',
  
  // Web
  html: 'html',
  htm: 'html',
  css: 'css',
  scss: 'scss',
  sass: 'sass',
  less: 'less',
  vue: 'vue',
  svelte: 'svelte',
  
  // Scripting
  php: 'php',
  rb: 'ruby',
  pl: 'perl',
  pm: 'perl',
  lua: 'lua',
  r: 'r',
  dart: 'dart',
  
  // Shell
  sh: 'shell',
  bash: 'shell',
  zsh: 'shell',
  fish: 'shell',
  ps1: 'powershell',
  bat: 'batch',
  cmd: 'batch',
  
  // Data/Config
  json: 'json',
  jsonc: 'jsonc',
  xml: 'xml',
  yaml: 'yaml',
  yml: 'yaml',
  toml: 'toml',
  ini: 'ini',
  cfg: 'ini',
  conf: 'ini',
  
  // Documentation
  md: 'markdown',
  markdown: 'markdown',
  rst: 'restructuredtext',
  
  // Database
  sql: 'sql',
  
  // Functional
  clj: 'clojure',
  cljs: 'clojure',
  ex: 'elixir',
  exs: 'elixir',
  erl: 'erlang',
  hrl: 'erlang',
  hs: 'haskell',
  
  // Other
  vim: 'vim',
  dockerfile: 'dockerfile',
  docker: 'dockerfile',
  makefile: 'makefile',
  gradle: 'gradle',
  asm: 'assembly',
  s: 'assembly',
};

/**
 * 根据文件路径检测编程语言
 * @param filePath 文件路径
 * @returns 语言标识符
 */
export function detectLanguage(filePath: string): string {
  if (!filePath) return 'plaintext';
  
  // 获取文件名（处理不同路径分隔符）
  const fileName = filePath.split(/[\\/]/).pop() || '';
  
  // 特殊文件名检测
  const lowerFileName = fileName.toLowerCase();
  if (lowerFileName === 'dockerfile') return 'dockerfile';
  if (lowerFileName === 'makefile') return 'makefile';
  if (lowerFileName.startsWith('.env')) return 'ini';
  if (lowerFileName === 'cmakelists.txt') return 'cmake';
  
  // 获取扩展名
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  
  return LANGUAGE_EXTENSION_MAP[ext] || 'plaintext';
}

/**
 * 获取语言的显示名称
 * @param languageId 语言标识符
 * @returns 显示名称
 */
export function getLanguageDisplayName(languageId: string): string {
  const displayNames: Record<string, string> = {
    javascript: 'JavaScript',
    typescript: 'TypeScript',
    python: 'Python',
    java: 'Java',
    cpp: 'C++',
    c: 'C',
    csharp: 'C#',
    go: 'Go',
    rust: 'Rust',
    php: 'PHP',
    ruby: 'Ruby',
    swift: 'Swift',
    kotlin: 'Kotlin',
    html: 'HTML',
    css: 'CSS',
    scss: 'SCSS',
    json: 'JSON',
    xml: 'XML',
    markdown: 'Markdown',
    sql: 'SQL',
    shell: 'Shell',
    powershell: 'PowerShell',
    yaml: 'YAML',
    dockerfile: 'Dockerfile',
    plaintext: 'Plain Text',
  };
  
  return displayNames[languageId] || languageId.charAt(0).toUpperCase() + languageId.slice(1);
}

/**
 * 检查语言是否支持代码补全
 * @param languageId 语言标识符
 * @returns 是否支持
 */
export function isCompletionSupported(languageId: string): boolean {
  const supported = [
    'javascript', 'typescript', 'python', 'java', 'cpp', 'c',
    'csharp', 'go', 'rust', 'php', 'ruby', 'kotlin', 'swift',
    'html', 'css', 'scss', 'json', 'sql'
  ];
  return supported.includes(languageId);
}
