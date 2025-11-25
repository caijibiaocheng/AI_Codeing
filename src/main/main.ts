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
  registerExtensionHandlers
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
function createMenu() {
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
}

// ==================== 窗口 ====================
function createWindow() {
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
  
  if (vscodeAPI) {
    vscodeAPI.setMainWindow(mainWindow);
  }

  // 调试日志
  mainWindow.webContents.on('console-message', (_event, level, message, line, sourceId) => {
    try {
      console.log(`[Renderer][${level}] ${message} (${sourceId}:${line})`);
    } catch {
      // Ignore EPIPE errors
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

// ==================== 初始化 ====================
function initializeServices() {
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
}

function registerCoreHandlers() {
  // 配置
  ipcMain.handle('get-config', (_, key: string) => store.get(key));
  
  ipcMain.handle('set-config', (_, key: string, value: unknown) => {
    store.set(key, value);
    if (aiService && key.startsWith('ai.')) {
      aiService.updateConfig();
    }
    return true;
  });

  // MCP
  ipcMain.handle('mcp-list-servers', () => mcpService.listServers());
  ipcMain.handle('mcp-add-server', (_, config) => mcpService.addServer(config));
  ipcMain.handle('mcp-remove-server', (_, serverId: string) => mcpService.removeServer(serverId));
  ipcMain.handle('mcp-call-tool', (_, serverId: string, toolName: string, params) => 
    mcpService.callTool(serverId, toolName, params));

  // 代码格式化
  ipcMain.handle('format-code', async (_, code: string, filePath: string) => {
    try {
      return await formatterService.formatCode(code, filePath);
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('is-format-supported', (_, filePath: string) => 
    formatterService.isSupported(filePath));

  // 命令执行
  ipcMain.handle('execute-command', async (_, command: string, cwd?: string) => {
    if (!command || typeof command !== 'string' || command.length > 1000) {
      return { success: false, error: 'Invalid command' };
    }

    // 安全检查
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
            resolve({ success: false, error: error.message, output: output.trim() });
          } else {
            resolve({ success: true, output: output.trim() });
          }
        } catch (decodeError: any) {
          resolve({ success: false, error: `Encoding error: ${decodeError.message}` });
        }
      });
      
      setTimeout(() => {
        childProcess.kill();
        resolve({ success: false, error: 'Command timeout (5 minutes)' });
      }, COMMAND_TIMEOUT);
    });
  });

  // 剪贴板
  ipcMain.on('copy-to-clipboard', (_, text: string) => clipboard.writeText(text));

  // 语言更新
  ipcMain.on('update-app-language', (_, locale: string) => {
    if (!mainWindow) return;
    mainWindow.setTitle(locale === 'zh-CN' ? 'AI 代码编辑器' : 'AI Code Editor');
    createMenu();
  });
}

function registerAllHandlers() {
  registerCoreHandlers();
  registerFileHandlers(store);
  registerGitHandlers(gitService);
  registerAIHandlers(aiService, completionService, memoryService);
  registerAIAssistantHandlers(aiAssistantService);
  registerProjectManagementHandlers(projectManagementService);
  registerWorkspaceHandlers(workspaceService);
  registerExtensionHandlers(extensionService, () => mainWindow);
}

// ==================== 应用生命周期 ====================
app.whenReady().then(() => {
  initializeServices();
  registerAllHandlers();
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
