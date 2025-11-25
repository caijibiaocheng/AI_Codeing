import { app, BrowserWindow, ipcMain, Menu, dialog, clipboard } from 'electron';
import * as path from 'path';
import { promises as fs } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import Store from 'electron-store';
import * as iconv from 'iconv-lite';
import { AIService } from './services/AIService';
import { MCPService } from './services/MCPService';
import { MemoryService } from './services/MemoryService';
import { AICompletionService } from './services/AICompletionService';
import { FormatterService } from './services/FormatterService';
import { GitService } from './services/GitService';
import { WorkspaceService } from './services/WorkspaceService';
import { ExtensionService } from './services/ExtensionService';
import { VSCodeAPIShim } from './services/VSCodeAPIShim';

const execAsync = promisify(exec);

const store = new Store();
let mainWindow: BrowserWindow | null = null;
let aiService: AIService;
let mcpService: MCPService;
let memoryService: MemoryService;
let completionService: AICompletionService;
let formatterService: FormatterService;
let gitService: GitService;
let workspaceService: WorkspaceService;
let extensionService: ExtensionService;
let vscodeAPI: VSCodeAPIShim;

function createMenu() {
  // 读取语言设置，默认简体中文
  const locale = store.get('app.locale', 'zh-CN') as string;
  const isZhCN = locale === 'zh-CN';
  
  const template: any = [
    {
      label: isZhCN ? '文件' : 'File',
      submenu: [
        {
          label: isZhCN ? '打开文件' : 'Open File',
          accelerator: 'CmdOrCtrl+O',
          click: async () => {
            const result = await dialog.showOpenDialog(mainWindow!, {
              properties: ['openFile'],
              filters: isZhCN ? [
                { name: '所有文件', extensions: ['*'] },
                { name: 'JavaScript', extensions: ['js', 'jsx'] },
                { name: 'TypeScript', extensions: ['ts', 'tsx'] },
                { name: 'Python', extensions: ['py'] },
                { name: 'Java', extensions: ['java'] },
                { name: 'C/C++', extensions: ['c', 'cpp', 'h', 'hpp'] }
              ] : [
                { name: 'All Files', extensions: ['*'] },
                { name: 'JavaScript', extensions: ['js', 'jsx'] },
                { name: 'TypeScript', extensions: ['ts', 'tsx'] },
                { name: 'Python', extensions: ['py'] },
                { name: 'Java', extensions: ['java'] },
                { name: 'C/C++', extensions: ['c', 'cpp', 'h', 'hpp'] }
              ]
            });
            if (!result.canceled && result.filePaths.length > 0) {
              console.log('[Menu] file-opened', result.filePaths[0]);
              mainWindow?.webContents.send('file-opened', result.filePaths[0]);
            }
          }
        },
        {
          label: isZhCN ? '打开文件夹' : 'Open Folder',
          accelerator: 'CmdOrCtrl+Shift+O',
          click: async () => {
            const result = await dialog.showOpenDialog(mainWindow!, {
              properties: ['openDirectory']
            });
            if (!result.canceled && result.filePaths.length > 0) {
              console.log('[Menu] folder-opened', result.filePaths[0]);
              mainWindow?.webContents.send('folder-opened', result.filePaths[0]);
            }
          }
        },
        { type: 'separator' },
        {
          label: isZhCN ? '保存' : 'Save',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            mainWindow?.webContents.send('save-file');
          }
        },
        { type: 'separator' },
        { role: 'quit', label: isZhCN ? '退出' : 'Quit' }
      ]
    },
    {
      label: isZhCN ? '编辑' : 'Edit',
      submenu: [
        { role: 'undo', label: isZhCN ? '撤销' : 'Undo' },
        { role: 'redo', label: isZhCN ? '重做' : 'Redo' },
        { type: 'separator' },
        { role: 'cut', label: isZhCN ? '剪切' : 'Cut' },
        { role: 'copy', label: isZhCN ? '复制' : 'Copy' },
        { role: 'paste', label: isZhCN ? '粘贴' : 'Paste' },
        { role: 'selectAll', label: isZhCN ? '全选' : 'Select All' }
      ]
    },
    {
      label: isZhCN ? '查看' : 'View',
      submenu: [
        { role: 'reload', label: isZhCN ? '重新加载' : 'Reload' },
        { role: 'toggleDevTools', label: isZhCN ? '开发者工具' : 'Toggle DevTools' },
        { type: 'separator' },
        { role: 'resetZoom', label: isZhCN ? '重置缩放' : 'Reset Zoom' },
        { role: 'zoomIn', label: isZhCN ? '放大' : 'Zoom In' },
        { role: 'zoomOut', label: isZhCN ? '缩小' : 'Zoom Out' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: isZhCN ? '切换全屏' : 'Toggle Fullscreen' }
      ]
    },
    {
      label: isZhCN ? '窗口' : 'Window',
      submenu: [
        { role: 'minimize', label: isZhCN ? '最小化' : 'Minimize' },
        { role: 'close', label: isZhCN ? '关闭' : 'Close' }
      ]
    },
    {
      label: isZhCN ? '帮助' : 'Help',
      submenu: [
        {
          label: isZhCN ? '关于' : 'About',
          click: () => {
            dialog.showMessageBox(mainWindow!, {
              type: 'info',
              title: isZhCN ? '关于 AI 代码编辑器' : 'About AI Code Editor',
              message: isZhCN ? 'AI 代码编辑器 v0.1.0' : 'AI Code Editor v0.1.0',
              detail: isZhCN 
                ? 'AI 驱动的代码编辑器，集成聊天、API 和 MCP 支持' 
                : 'AI-powered code editor with chat, API integration, and MCP support'
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function createWindow() {
  // 读取语言设置以确定窗口标题
  const locale = store.get('app.locale', 'zh-CN') as string;
  const windowTitle = locale === 'zh-CN' ? 'AI 代码编辑器' : 'AI Code Editor';
  
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    title: windowTitle,
    icon: path.join(__dirname, '../../assets/icon.png')
  });

  createMenu();
  
  // 更新VSCode API Shim的窗口引用
  if (vscodeAPI) {
    vscodeAPI.setMainWindow(mainWindow);
  }

  // Mirror renderer console messages to main process console for debugging
  mainWindow.webContents.on('console-message', (_event, level, message, line, sourceId) => {
    try {
      console.log(`[Renderer console][level=${level}] ${message} (at ${sourceId}:${line})`);
    } catch (e) {
      // Ignore EPIPE errors when pipe is broken
    }
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  aiService = new AIService(store);
  mcpService = new MCPService(store);
  memoryService = new MemoryService(store);
  completionService = new AICompletionService(store);
  formatterService = new FormatterService();
  gitService = new GitService();
  workspaceService = new WorkspaceService(store);
  extensionService = new ExtensionService(store);
  vscodeAPI = new VSCodeAPIShim(null); // 窗口创建后更新
  
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  mcpService?.shutdown();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  mcpService?.shutdown();
});

ipcMain.handle('get-config', async (_, key: string) => {
  return store.get(key);
});

ipcMain.handle('set-config', async (_, key: string, value: any) => {
  store.set(key, value);
  if (aiService && key.startsWith('ai.')) {
    aiService.updateConfig();
  }
  return true;
});

ipcMain.handle('ai-chat', async (_, message: string, context?: any) => {
  try {
    // 学习代码风格
    if (context?.code && context?.language) {
      memoryService.learnFromCode(context.code, context.language);
    }
    
    // 获取记忆上下文
    const language = context?.language || 'javascript';
    const memoryContext = memoryService.exportForAI(language);
    
    // 合并上下文
    const enhancedContext = {
      ...context,
      memory: memoryContext
    };
    
    const response = await aiService.chat(message, enhancedContext);
    return { success: true, data: response };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('ai-stream-chat', async (event, message: string, context?: any) => {
  try {
    // 学习代码风格
    if (context?.code && context?.language) {
      memoryService.learnFromCode(context.code, context.language);
    }
    
    // 获取记忆上下文
    const language = context?.language || 'javascript';
    const memoryContext = memoryService.exportForAI(language);
    
    // 合并上下文
    const enhancedContext = {
      ...context,
      memory: memoryContext
    };
    
    await aiService.streamChat(message, enhancedContext, (chunk) => {
      event.sender.send('ai-stream-chunk', chunk);
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('mcp-list-servers', async () => {
  return mcpService.listServers();
});

ipcMain.handle('mcp-add-server', async (_, config: any) => {
  return mcpService.addServer(config);
});

ipcMain.handle('mcp-remove-server', async (_, serverId: string) => {
  return mcpService.removeServer(serverId);
});

ipcMain.handle('mcp-call-tool', async (_, serverId: string, toolName: string, params: any) => {
  return mcpService.callTool(serverId, toolName, params);
});

ipcMain.handle('read-file', async (_, filePath: string) => {
  try {
    if (!filePath || typeof filePath !== 'string') {
      throw new Error('Invalid file path');
    }
    
    const normalizedPath = path.normalize(filePath);
    const stats = await fs.stat(normalizedPath);
    
    if (!stats.isFile()) {
      throw new Error('Path is not a file');
    }
    
    if (stats.size > 10 * 1024 * 1024) {
      throw new Error('File too large (max 10MB)');
    }
    
    const content = await fs.readFile(normalizedPath, 'utf-8');
    console.log(`[FileOp] Read file: ${normalizedPath} (${stats.size} bytes)`);
    return { success: true, data: content };
  } catch (error: any) {
    console.error(`[FileOp] Failed to read file ${filePath}:`, error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('write-file', async (_, filePath: string, content: string) => {
  try {
    if (!filePath || typeof filePath !== 'string') {
      throw new Error('Invalid file path');
    }
    
    if (!content || typeof content !== 'string') {
      throw new Error('Invalid file content');
    }
    
    if (content.length > 10 * 1024 * 1024) {
      throw new Error('Content too large (max 10MB)');
    }
    
    const normalizedPath = path.normalize(filePath);
    const dir = path.dirname(normalizedPath);
    
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(normalizedPath, content, 'utf-8');
    
    console.log(`[FileOp] Wrote file: ${normalizedPath} (${content.length} bytes)`);
    return { success: true };
  } catch (error: any) {
    console.error(`[FileOp] Failed to write file ${filePath}:`, error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('execute-command', async (_, command: string, cwd?: string) => {
  if (!command || typeof command !== 'string') {
    return { success: false, error: 'Invalid command' };
  }

  if (command.length > 1000) {
    return { success: false, error: 'Command too long' };
  }

  const dangerousPatterns = [
    /rm\s+-rf\s+\/[^\/\s]*/i,
    /format\s+[A-Za-z]:/i,
    /del\s+\/[FSQ]\s+[A-Za-z]:/i,
    /shutdown/i,
    /reboot/i,
    />[\s]*\/dev\//i,
    /mkfs/i
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(command)) {
      console.warn(`[Security] Blocked potentially dangerous command: ${command}`);
      return { 
        success: false, 
        error: 'This command is potentially dangerous and has been blocked for security reasons' 
      };
    }
  }

  console.log(`[Execute] Running command: ${command.substring(0, 100)}${command.length > 100 ? '...' : ''}`);
  
  return new Promise((resolve) => {
    const isWindows = process.platform === 'win32';
    
    const childProcess = exec(command, { 
      cwd: cwd || process.cwd(),
      maxBuffer: 1024 * 1024 * 10,
      encoding: 'buffer'
    }, (error, stdout, stderr) => {
      try {
        let output = '';
        let errorMessage = '';
        
        if (isWindows) {
          // Windows 系统使用 GBK 编码
          output = iconv.decode(Buffer.concat([stdout || Buffer.from(''), stderr || Buffer.from('')]), 'gbk');
          if (error && error.message) {
            // 尝试解码错误信息（如果是 Buffer）
            try {
              errorMessage = iconv.decode(Buffer.from(error.message, 'binary'), 'gbk');
            } catch {
              // 如果解码失败，使用原始信息
              errorMessage = error.message;
            }
          }
        } else {
          // Linux/Mac 使用 UTF-8
          output = Buffer.concat([stdout || Buffer.from(''), stderr || Buffer.from('')]).toString('utf8');
          errorMessage = error?.message || '';
        }
        
        if (error) {
          console.error(`[Execute] Command failed:`, errorMessage || error.message);
          resolve({ 
            success: false, 
            error: errorMessage || error.message || 'Command execution failed', 
            output: output.trim() 
          });
        } else {
          console.log(`[Execute] Command completed successfully`);
          resolve({ success: true, output: output.trim() });
        }
      } catch (decodeError: any) {
        console.error(`[Execute] Decode error:`, decodeError);
        resolve({ 
          success: false, 
          error: `Encoding error: ${decodeError.message}` 
        });
      }
    });
    
    setTimeout(() => {
      childProcess.kill();
      console.warn(`[Execute] Command timeout`);
      resolve({ 
        success: false, 
        error: 'Command timeout (5 minutes)' 
      });
    }, 5 * 60 * 1000);
  });
});

ipcMain.handle('read-directory', async (_, dirPath: string) => {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    const items = entries.map((entry: any) => ({
      name: entry.name,
      path: path.join(dirPath, entry.name),
      isDirectory: entry.isDirectory()
    }));
    // 排序：文件夹在前，然后按名称排序
    items.sort((a: any, b: any) => {
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return a.name.localeCompare(b.name);
    });
    return { success: true, data: items };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

// 搜索文件名
ipcMain.handle('search-files', async (_, rootPath: string, query: string) => {
  const results: any[] = [];
  const excludeDirs = ['node_modules', '.git', 'dist', 'build', '.vscode', '.idea'];
  
  async function searchDir(dirPath: string) {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        if (excludeDirs.includes(entry.name)) continue;
        
        const fullPath = path.join(dirPath, entry.name);
        
        if (entry.isDirectory()) {
          await searchDir(fullPath);
        } else {
          results.push({
            name: entry.name,
            path: fullPath
          });
        }
      }
    } catch (error) {
      // 忽略权限错误
    }
  }
  
  try {
    await searchDir(rootPath);
    return { success: true, data: results };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

// 在文件内容中搜索
ipcMain.handle('search-in-files', async (_, rootPath: string, query: string, options: any = {}) => {
  const results: any[] = [];
  const excludeDirs = ['node_modules', '.git', 'dist', 'build', '.vscode', '.idea'];
  const { useRegex = false, caseSensitive = false, fileFilter } = options;
  
  // 编译搜索模式
  let searchPattern: RegExp;
  try {
    if (useRegex) {
      searchPattern = new RegExp(query, caseSensitive ? 'g' : 'gi');
    } else {
      const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      searchPattern = new RegExp(escapedQuery, caseSensitive ? 'g' : 'gi');
    }
  } catch (error) {
    return { success: false, error: 'Invalid regex pattern' };
  }
  
  // 文件扩展名过滤
  const matchesFilter = (filename: string): boolean => {
    if (!fileFilter) return true;
    const patterns = fileFilter.split(',').map((p: string) => p.trim());
    return patterns.some((pattern: string) => {
      if (pattern.startsWith('*.')) {
        const ext = pattern.substring(1);
        return filename.endsWith(ext);
      }
      return filename.includes(pattern);
    });
  };
  
  async function searchInDir(dirPath: string) {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        if (excludeDirs.includes(entry.name)) continue;
        
        const fullPath = path.join(dirPath, entry.name);
        
        if (entry.isDirectory()) {
          await searchInDir(fullPath);
        } else if (matchesFilter(entry.name)) {
          try {
            const content = await fs.readFile(fullPath, 'utf-8');
            const lines = content.split('\n');
            
            lines.forEach((line: string, index: number) => {
              searchPattern.lastIndex = 0;
              const match = searchPattern.exec(line);
              if (match) {
                results.push({
                  file: fullPath,
                  line: index + 1,
                  content: line.trim(),
                  matchStart: match.index,
                  matchEnd: match.index + match[0].length
                });
              }
            });
          } catch (error) {
            // 忽略二进制文件和读取错误
          }
        }
        
        // 限制结果数量，避免过多
        if (results.length > 1000) break;
      }
    } catch (error) {
      // 忽略权限错误
    }
  }
  
  try {
    await searchInDir(rootPath);
    return { success: true, data: results };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

// 获取最近打开的文件
ipcMain.handle('get-recent-files', async () => {
  const recentFiles = store.get('recentFiles', []) as string[];
  return recentFiles;
});

// 添加最近打开的文件
ipcMain.handle('add-recent-file', async (_, filePath: string) => {
  try {
    let recentFiles = store.get('recentFiles', []) as string[];
    
    // 移除重复项
    recentFiles = recentFiles.filter((f: string) => f !== filePath);
    
    // 添加到开头
    recentFiles.unshift(filePath);
    
    // 限制数量为20个
    if (recentFiles.length > 20) {
      recentFiles = recentFiles.slice(0, 20);
    }
    
    store.set('recentFiles', recentFiles);
    return true;
  } catch (error) {
    return false;
  }
});

// 创建文件
ipcMain.handle('create-file', async (_, parentPath: string, fileName: string) => {
  try {
    const filePath = path.join(parentPath, fileName);
    await fs.writeFile(filePath, '', 'utf-8');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

// 创建文件夹
ipcMain.handle('create-folder', async (_, parentPath: string, folderName: string) => {
  try {
    const folderPath = path.join(parentPath, folderName);
    await fs.mkdir(folderPath, { recursive: true });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

// 重命名文件或文件夹
ipcMain.handle('rename-item', async (_, oldPath: string, newName: string) => {
  try {
    const dir = path.dirname(oldPath);
    const newPath = path.join(dir, newName);
    await fs.rename(oldPath, newPath);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

// 删除文件或文件夹
ipcMain.handle('delete-item', async (_, itemPath: string) => {
  try {
    const stats = await fs.stat(itemPath);
    if (stats.isDirectory()) {
      await fs.rm(itemPath, { recursive: true, force: true });
    } else {
      await fs.unlink(itemPath);
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

// 复制到剪贴板
ipcMain.on('copy-to-clipboard', (_, text: string) => {
  clipboard.writeText(text);
});

// 更新应用语言（窗口标题和菜单）
ipcMain.on('update-app-language', (_, locale: string) => {
  if (!mainWindow) return;
  
  // 更新窗口标题
  const windowTitle = locale === 'zh-CN' ? 'AI 代码编辑器' : 'AI Code Editor';
  mainWindow.setTitle(windowTitle);
  
  // 重新创建菜单以应用新语言
  createMenu();
});

// 获取 Git Diff
ipcMain.handle('get-git-diff', async (_, rootPath: string, filePath: string) => {
  try {
    // 获取文件的 diff (filePath 是相对于 rootPath 的相对路径)
    const { stdout } = await execAsync(`git diff HEAD "${filePath}"`, { cwd: rootPath });
    return { success: true, diff: stdout };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

// AI 代码补全
ipcMain.handle('ai-get-completion', async (_, context: any) => {
  try {
    const completion = await completionService.getCompletion(context);
    return { success: true, completion };
  } catch (error: any) {
    console.error('[AI Completion] Error:', error);
    return { success: false, error: error.message };
  }
});

// 代码格式化
ipcMain.handle('format-code', async (_, code: string, filePath: string) => {
  try {
    const result = await formatterService.formatCode(code, filePath);
    return result;
  } catch (error: any) {
    console.error('[Formatter] Error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('is-format-supported', async (_, filePath: string) => {
  return formatterService.isSupported(filePath);
});

// Git 操作
ipcMain.handle('git-status', async (_, rootPath: string) => {
  try {
    const status = await gitService.getStatus(rootPath);
    return { success: true, data: status };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('git-stage-file', async (_, rootPath: string, filePath: string) => {
  try {
    await gitService.stageFile(rootPath, filePath);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('git-unstage-file', async (_, rootPath: string, filePath: string) => {
  try {
    await gitService.unstageFile(rootPath, filePath);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('git-stage-all', async (_, rootPath: string) => {
  try {
    await gitService.stageAll(rootPath);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('git-commit', async (_, rootPath: string, message: string) => {
  try {
    await gitService.commit(rootPath, message);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('git-push', async (_, rootPath: string, remote?: string, branch?: string) => {
  try {
    await gitService.push(rootPath, remote, branch);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('git-pull', async (_, rootPath: string, remote?: string, branch?: string) => {
  try {
    await gitService.pull(rootPath, remote, branch);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('git-branches', async (_, rootPath: string) => {
  try {
    const branches = await gitService.getBranches(rootPath);
    return { success: true, data: branches };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('git-create-branch', async (_, rootPath: string, branchName: string) => {
  try {
    await gitService.createBranch(rootPath, branchName);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('git-checkout-branch', async (_, rootPath: string, branchName: string) => {
  try {
    await gitService.checkoutBranch(rootPath, branchName);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('git-delete-branch', async (_, rootPath: string, branchName: string, force: boolean) => {
  try {
    await gitService.deleteBranch(rootPath, branchName, force);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('git-log', async (_, rootPath: string, limit?: number) => {
  try {
    const log = await gitService.getLog(rootPath, limit);
    return { success: true, data: log };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('git-diff', async (_, rootPath: string, filePath?: string) => {
  try {
    const diff = await gitService.getDiff(rootPath, filePath);
    return { success: true, data: diff };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

// 工作区管理
ipcMain.handle('workspace-get-all', async () => {
  try {
    const workspaces = workspaceService.getWorkspaces();
    return { success: true, data: workspaces };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('workspace-get', async (_, path: string) => {
  try {
    const workspace = workspaceService.getWorkspace(path);
    return { success: true, data: workspace };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('workspace-save', async (_, workspace: any) => {
  try {
    workspaceService.saveWorkspace(workspace);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('workspace-update', async (_, path: string, updates: any) => {
  try {
    workspaceService.updateWorkspace(path, updates);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('workspace-delete', async (_, path: string) => {
  try {
    workspaceService.deleteWorkspace(path);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('workspace-get-recent', async (_, limit?: number) => {
  try {
    const workspaces = workspaceService.getRecentWorkspaces(limit);
    return { success: true, data: workspaces };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

// Extension 操作
ipcMain.handle('extension-select-vsix', async () => {
  try {
    const result = await dialog.showOpenDialog(mainWindow!, {
      properties: ['openFile'],
      filters: [
        { name: 'VS Code Extensions', extensions: ['vsix'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });
    
    if (!result.canceled && result.filePaths.length > 0) {
      return { success: true, filePath: result.filePaths[0] };
    }
    return { success: false, error: 'No file selected' };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('extension-install', async (_, vsixPath: string) => {
  try {
    const extension = await extensionService.installVSIX(vsixPath);
    return { success: true, data: extension };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('extension-uninstall', async (_, extensionId: string) => {
  try {
    await extensionService.uninstallExtension(extensionId);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('extension-enable', async (_, extensionId: string) => {
  try {
    extensionService.enableExtension(extensionId);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('extension-disable', async (_, extensionId: string) => {
  try {
    extensionService.disableExtension(extensionId);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('extension-list', async () => {
  try {
    const extensions = extensionService.getInstalledExtensions();
    return { success: true, data: extensions };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('extension-get-themes', async (_, extensionId: string) => {
  try {
    const themes = await extensionService.getExtensionThemes(extensionId);
    return { success: true, data: themes };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('extension-get-languages', async (_, extensionId: string) => {
  try {
    const languages = await extensionService.getExtensionLanguages(extensionId);
    return { success: true, data: languages };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('extension-get-grammars', async (_, extensionId: string) => {
  try {
    const grammars = await extensionService.getExtensionGrammars(extensionId);
    return { success: true, data: grammars };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});
