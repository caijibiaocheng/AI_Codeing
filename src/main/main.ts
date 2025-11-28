/**
 * AI Code Editor - 主进程入口
 * 重构版本：使用模块化的 IPC handlers
 */
import { app, BrowserWindow, ipcMain, Menu, dialog, clipboard } from 'electron';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import Store from 'electron-store';
import * as iconv from 'iconv-lite';

// Services
import { AIService } from './services/AIService';
import { MCPService } from './services/MCPService';
import { MemoryService } from './services/MemoryService';
import { AICompletionService } from './services/AICompletionService';
import { AIAssistantService } from './services/AIAssistantService';
import { FormatterService } from './services/FormatterService';
import { GitService } from './services/GitService';
import { WorkspaceService } from './services/WorkspaceService';
import { ExtensionService } from './services/ExtensionService';
import { VSCodeAPIShim } from './services/VSCodeAPIShim';
import { ProjectManagementService } from './services/ProjectManagementService';

// Handlers
import {
  registerFileHandlers,
  registerGitHandlers,
  registerAIHandlers,
  registerWorkspaceHandlers,
  registerExtensionHandlers,
  setupProjectTemplatesHandlers,
  setupKeyBindingsHandlers,
  setupEnvironmentHandlers
} from './handlers';
import { registerAIAssistantHandlers } from './handlers/aiAssistantHandlers';
import { registerProjectManagementHandlers } from './handlers/projectManagementHandlers';

// Constants
import { COMMAND_TIMEOUT, DANGEROUS_COMMAND_PATTERNS } from '../shared/constants';

const execAsync = promisify(exec);
const store = new Store();

// 全局状态
let mainWindow: BrowserWindow | null = null;
let aiService: AIService;
let mcpService: MCPService;
let memoryService: MemoryService;
let completionService: AICompletionService;
let aiAssistantService: AIAssistantService;
let formatterService: FormatterService;
let gitService: GitService;
let workspaceService: WorkspaceService;
let extensionService: ExtensionService;
let vscodeAPI: VSCodeAPIShim;
let projectManagementService: ProjectManagementService;

// ==================== 菜单 ====================

/**
 * 创建应用菜单
 * 根据应用的语言设置动态生成菜单项
 */
function createMenu() {
  try {
    const locale = store.get('app.locale', 'zh-CN') as string;
    const isZhCN = locale === 'zh-CN';
  
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: isZhCN ? '文件' : 'File',
      submenu: [
        {
          label: isZhCN ? '打开文件' : 'Open File',
          accelerator: 'CmdOrCtrl+O',
          click: async () => {
            const result = await dialog.showOpenDialog(mainWindow!, {
              properties: ['openFile'],
              filters: [
                { name: isZhCN ? '所有文件' : 'All Files', extensions: ['*'] },
                { name: 'JavaScript', extensions: ['js', 'jsx'] },
                { name: 'TypeScript', extensions: ['ts', 'tsx'] },
                { name: 'Python', extensions: ['py'] },
                { name: 'Java', extensions: ['java'] },
                { name: 'C/C++', extensions: ['c', 'cpp', 'h', 'hpp'] }
              ]
            });
            if (!result.canceled && result.filePaths.length > 0) {
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
              mainWindow?.webContents.send('folder-opened', result.filePaths[0]);
            }
          }
        },
        { type: 'separator' },
        {
          label: isZhCN ? '保存' : 'Save',
          accelerator: 'CmdOrCtrl+S',
          click: () => mainWindow?.webContents.send('save-file')
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

    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
  } catch (error: any) {
    console.error('[Main] Error creating menu:', error);
  }
}

// ==================== 窗口 ====================

/**
 * 创建应用主窗口
 */
function createWindow() {
  try {
    const locale = store.get('app.locale', 'zh-CN') as string;
    const windowTitle = locale === 'zh-CN' ? 'AI 代码编辑器' : 'AI Code Editor';
    
    mainWindow = new BrowserWindow({
      width: 1400,
      height: 900,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js'),
        sandbox: true
      },
      title: windowTitle,
      icon: path.join(__dirname, '../../assets/icon.png')
    });

    console.log('[Main] BrowserWindow created');
    
    createMenu();
    
    if (vscodeAPI) {
      vscodeAPI.setMainWindow(mainWindow);
    }

    // 监听渲染进程的控制台消息
    mainWindow.webContents.on('console-message', (_event, level, message, line, sourceId) => {
      try {
        console.log(`[Renderer][Level: ${level}] ${message} (${sourceId}:${line})`);
      } catch (error: any) {
        console.error('[Main] Error logging renderer message:', error);
      }
    });

    // 加载应用内容
    if (process.env.NODE_ENV === 'development') {
      console.log('[Main] Loading development server at http://localhost:3000');
      mainWindow.loadURL('http://localhost:3000');
      mainWindow.webContents.openDevTools();
    } else {
      const indexPath = path.join(__dirname, '../renderer/index.html');
      console.log('[Main] Loading production file:', indexPath);
      mainWindow.loadFile(indexPath);
    }

    // 监听窗口关闭
    mainWindow.on('closed', () => {
      console.log('[Main] Main window closed');
      mainWindow = null;
    });

    // 监听加载完成
    mainWindow.webContents.on('did-finish-load', () => {
      console.log('[Main] Window content loaded successfully');
    });

    // 监听加载失败
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      console.error(`[Main] Failed to load window: ${errorDescription} (${errorCode})`);
    });
  } catch (error: any) {
    console.error('[Main] Error creating window:', error);
    throw error;
  }
}

/**
 * 初始化所有业务服务
 * 在应用准备就绪时调用
 */
function initializeServices() {
  try {
    aiService = new AIService(store);
    mcpService = new MCPService(store);
    memoryService = new MemoryService(store);
    completionService = new AICompletionService(store);
    aiAssistantService = new AIAssistantService(aiService, store);
    formatterService = new FormatterService();
    gitService = new GitService();
    workspaceService = new WorkspaceService(store);
    extensionService = new ExtensionService(store);
    vscodeAPI = new VSCodeAPIShim(null);
    
    // Project Management Service - 使用app.getPath('userData')作为数据目录
    const dataDir = path.join(app.getPath('userData'), 'project-data');
    projectManagementService = new ProjectManagementService(dataDir);
    
    console.log('[Main] All services initialized successfully');
  } catch (error: any) {
    console.error('[Main] Failed to initialize services:', error);
    throw error;
  }
}

/**
 * 注册核心 IPC 处理器
 * 包括配置、MCP、代码格式化、命令执行等
 */
function registerCoreHandlers() {
  // ========== 配置管理 ==========
  ipcMain.handle('get-config', (_, key: string) => {
    try {
      return store.get(key);
    } catch (error: any) {
      console.error(`[IPC] Error getting config for key: ${key}`, error);
      throw error;
    }
  });
  
  ipcMain.handle('set-config', (_, key: string, value: unknown) => {
    try {
      store.set(key, value);
      if (aiService && key.startsWith('ai.')) {
        aiService.updateConfig();
      }
      return true;
    } catch (error: any) {
      console.error(`[IPC] Error setting config for key: ${key}`, error);
      throw error;
    }
  });

  // ========== MCP 服务器管理 ==========
  ipcMain.handle('mcp-list-servers', async () => {
    try {
      return await mcpService.listServers();
    } catch (error: any) {
      console.error('[IPC] Error listing MCP servers', error);
      throw error;
    }
  });

  ipcMain.handle('mcp-add-server', async (_, config) => {
    try {
      return await mcpService.addServer(config);
    } catch (error: any) {
      console.error('[IPC] Error adding MCP server', error);
      throw error;
    }
  });

  ipcMain.handle('mcp-remove-server', async (_, serverId: string) => {
    try {
      return await mcpService.removeServer(serverId);
    } catch (error: any) {
      console.error(`[IPC] Error removing MCP server: ${serverId}`, error);
      throw error;
    }
  });

  ipcMain.handle('mcp-call-tool', async (_, serverId: string, toolName: string, params) => {
    try {
      return await mcpService.callTool(serverId, toolName, params);
    } catch (error: any) {
      console.error(`[IPC] Error calling MCP tool: ${toolName}`, error);
      throw error;
    }
  });

  // ========== 代码格式化 ==========
  ipcMain.handle('format-code', async (_, code: string, filePath: string) => {
    try {
      if (!code || typeof code !== 'string') {
        return { success: false, error: 'Invalid code input' };
      }
      return await formatterService.formatCode(code, filePath);
    } catch (error: any) {
      console.error('[IPC] Error formatting code', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('is-format-supported', (_, filePath: string) => {
    try {
      return formatterService.isSupported(filePath);
    } catch (error: any) {
      console.error(`[IPC] Error checking format support for: ${filePath}`, error);
      return false;
    }
  });

  // ========== 命令执行 ==========
  ipcMain.handle('execute-command', async (_, command: string, cwd?: string) => {
    if (!command || typeof command !== 'string' || command.length > 1000) {
      return { success: false, error: 'Invalid command' };
    }

    // 安全检查：防止危险命令执行
    for (const pattern of DANGEROUS_COMMAND_PATTERNS) {
      if (pattern.test(command)) {
        console.warn(`[Security] Blocked dangerous command: ${command}`);
        return { success: false, error: 'Command blocked for security reasons' };
      }
    }

    return new Promise((resolve) => {
      const isWindows = process.platform === 'win32';
      
      const childProcess = exec(command, { 
        cwd: cwd || process.cwd(),
        maxBuffer: 10 * 1024 * 1024,
        encoding: 'buffer'
      }, (error, stdout, stderr) => {
        try {
          const output = isWindows 
            ? iconv.decode(Buffer.concat([stdout || Buffer.from(''), stderr || Buffer.from('')]), 'gbk')
            : Buffer.concat([stdout || Buffer.from(''), stderr || Buffer.from('')]).toString('utf8');
          
          if (error) {
            console.warn(`[Command] Execution failed: ${command}`, error.message);
            resolve({ success: false, error: error.message, output: output.trim() });
          } else {
            resolve({ success: true, output: output.trim() });
          }
        } catch (decodeError: any) {
          console.error('[Command] Encoding error', decodeError);
          resolve({ success: false, error: `Encoding error: ${decodeError.message}` });
        }
      });
      
      setTimeout(() => {
        childProcess.kill();
        console.warn(`[Command] Timeout for command: ${command}`);
        resolve({ success: false, error: 'Command timeout (5 minutes)' });
      }, COMMAND_TIMEOUT);
    });
  });

  // ========== 剪贴板 ==========
  ipcMain.on('copy-to-clipboard', (_, text: string) => {
    try {
      clipboard.writeText(text);
    } catch (error: any) {
      console.error('[IPC] Error copying to clipboard', error);
    }
  });

  // ========== 对话框操作 ==========
  ipcMain.handle('show-open-dialog', async (_, options) => {
    try {
      return await dialog.showOpenDialog(options);
    } catch (error: any) {
      console.error('[IPC] Error showing open dialog', error);
      return { canceled: true };
    }
  });

  ipcMain.handle('show-save-dialog', async (_, options) => {
    try {
      return await dialog.showSaveDialog(options);
    } catch (error: any) {
      console.error('[IPC] Error showing save dialog', error);
      return { canceled: true };
    }
  });

  // ========== 应用语言更新 ==========
  ipcMain.on('update-app-language', (_, locale: string) => {
    try {
      if (!mainWindow) return;
      mainWindow.setTitle(locale === 'zh-CN' ? 'AI 代码编辑器' : 'AI Code Editor');
      createMenu();
    } catch (error: any) {
      console.error('[IPC] Error updating app language', error);
    }
  });
}

/**
 * 注册所有 IPC 处理器
 * 包括核心处理器和各个功能模块的处理器
 */
function registerAllHandlers() {
  try {
    registerCoreHandlers();
    registerFileHandlers(store);
    registerGitHandlers(gitService);
    registerAIHandlers(aiService, completionService, memoryService);
    registerAIAssistantHandlers(aiAssistantService);
    registerProjectManagementHandlers(projectManagementService);
    registerWorkspaceHandlers(workspaceService);
    registerExtensionHandlers(extensionService, () => mainWindow);
    
    // 新增的功能处理器
    setupProjectTemplatesHandlers();
    setupKeyBindingsHandlers();
    setupEnvironmentHandlers();
    
    console.log('[Main] All IPC handlers registered successfully');
  } catch (error: any) {
    console.error('[Main] Failed to register IPC handlers:', error);
    throw error;
  }
}

// ==================== 应用生命周期 ====================

/**
 * 应用准备就绪时的初始化
 */
app.whenReady().then(() => {
  console.log('[Main] App is ready, initializing...');
  try {
    initializeServices();
    registerAllHandlers();
    createWindow();
    console.log('[Main] Application started successfully');
  } catch (error: any) {
    console.error('[Main] Failed to start application:', error);
    app.quit();
  }

  /**
   * macOS 特定：当点击 dock 图标且没有窗口打开时，重新创建窗口
   */
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
}).catch((error: any) => {
  console.error('[Main] App ready error:', error);
  process.exit(1);
});

/**
 * 当所有窗口关闭时
 * 在 macOS 上，应用通常保持活跃直到用户明确退出
 */
app.on('window-all-closed', () => {
  console.log('[Main] All windows closed');
  try {
    mcpService?.shutdown();
  } catch (error: any) {
    console.error('[Main] Error shutting down MCP service:', error);
  }
  
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

/**
 * 应用即将退出
 */
app.on('before-quit', () => {
  console.log('[Main] Application quitting');
  try {
    mcpService?.shutdown();
  } catch (error: any) {
    console.error('[Main] Error during shutdown:', error);
  }
});
