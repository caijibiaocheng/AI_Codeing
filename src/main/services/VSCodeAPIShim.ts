import { BrowserWindow } from 'electron';
import * as monaco from 'monaco-editor';

/**
 * VS Code API Shim - 模拟VS Code扩展API
 * 注意：这是一个简化版本，只实现了核心API
 */
export class VSCodeAPIShim {
  private mainWindow: BrowserWindow | null;
  private commandRegistry: Map<string, Function> = new Map();
  private outputChannels: Map<string, any> = new Map();

  constructor(mainWindow: BrowserWindow | null) {
    this.mainWindow = mainWindow;
  }

  /**
   * vscode.window 命名空间
   */
  window = {
    showInformationMessage: (message: string, ...items: string[]) => {
      console.log(`[VSCode API] Info: ${message}`);
      this.mainWindow?.webContents.send('extension-notification', {
        type: 'info',
        message,
        items
      });
      return Promise.resolve(items[0]);
    },

    showWarningMessage: (message: string, ...items: string[]) => {
      console.log(`[VSCode API] Warning: ${message}`);
      this.mainWindow?.webContents.send('extension-notification', {
        type: 'warning',
        message,
        items
      });
      return Promise.resolve(items[0]);
    },

    showErrorMessage: (message: string, ...items: string[]) => {
      console.error(`[VSCode API] Error: ${message}`);
      this.mainWindow?.webContents.send('extension-notification', {
        type: 'error',
        message,
        items
      });
      return Promise.resolve(items[0]);
    },

    createOutputChannel: (name: string) => {
      if (!this.outputChannels.has(name)) {
        const channel = {
          name,
          append: (value: string) => {
            console.log(`[OutputChannel: ${name}]`, value);
            this.mainWindow?.webContents.send('extension-output', { channel: name, text: value });
          },
          appendLine: (value: string) => {
            console.log(`[OutputChannel: ${name}]`, value);
            this.mainWindow?.webContents.send('extension-output', { channel: name, text: value + '\n' });
          },
          clear: () => {
            this.mainWindow?.webContents.send('extension-output-clear', { channel: name });
          },
          show: () => {
            this.mainWindow?.webContents.send('extension-output-show', { channel: name });
          },
          hide: () => {},
          dispose: () => {
            this.outputChannels.delete(name);
          }
        };
        this.outputChannels.set(name, channel);
      }
      return this.outputChannels.get(name);
    },

    showQuickPick: (items: string[], options?: any) => {
      console.log(`[VSCode API] QuickPick:`, items);
      this.mainWindow?.webContents.send('extension-quickpick', { items, options });
      return Promise.resolve(items[0]);
    },

    showInputBox: (options?: any) => {
      console.log(`[VSCode API] InputBox:`, options);
      this.mainWindow?.webContents.send('extension-inputbox', { options });
      return Promise.resolve('');
    }
  };

  /**
   * vscode.commands 命名空间
   */
  commands = {
    registerCommand: (command: string, callback: (...args: any[]) => any) => {
      console.log(`[VSCode API] Registering command: ${command}`);
      this.commandRegistry.set(command, callback);
      
      // 通知渲染进程命令已注册
      this.mainWindow?.webContents.send('extension-command-registered', { command });
      
      return {
        dispose: () => {
          this.commandRegistry.delete(command);
        }
      };
    },

    executeCommand: (command: string, ...rest: any[]) => {
      console.log(`[VSCode API] Executing command: ${command}`);
      const handler = this.commandRegistry.get(command);
      if (handler) {
        return Promise.resolve(handler(...rest));
      }
      return Promise.reject(new Error(`Command '${command}' not found`));
    },

    getCommands: (filterInternal?: boolean) => {
      return Promise.resolve(Array.from(this.commandRegistry.keys()));
    }
  };

  /**
   * vscode.workspace 命名空间
   */
  workspace = {
    getConfiguration: (section?: string) => {
      return {
        get: (key: string, defaultValue?: any) => {
          // 从electron-store读取配置
          return defaultValue;
        },
        has: (key: string) => false,
        inspect: (key: string) => undefined,
        update: (key: string, value: any) => Promise.resolve()
      };
    },

    workspaceFolders: [],
    name: undefined,
    
    onDidChangeConfiguration: (listener: Function) => {
      return { dispose: () => {} };
    },

    onDidChangeWorkspaceFolders: (listener: Function) => {
      return { dispose: () => {} };
    },

    onDidOpenTextDocument: (listener: Function) => {
      return { dispose: () => {} };
    },

    onDidCloseTextDocument: (listener: Function) => {
      return { dispose: () => {} };
    }
  };

  /**
   * vscode.languages 命名空间
   * 这里需要与Monaco编辑器集成
   */
  languages = {
    registerCompletionItemProvider: (
      selector: any,
      provider: any,
      ...triggerCharacters: string[]
    ) => {
      console.log(`[VSCode API] Registering completion provider for:`, selector);
      // 需要在渲染进程中通过Monaco注册
      this.mainWindow?.webContents.send('extension-register-completion', {
        selector,
        triggerCharacters
      });
      return { dispose: () => {} };
    },

    registerHoverProvider: (selector: any, provider: any) => {
      console.log(`[VSCode API] Registering hover provider for:`, selector);
      return { dispose: () => {} };
    },

    registerDefinitionProvider: (selector: any, provider: any) => {
      console.log(`[VSCode API] Registering definition provider for:`, selector);
      return { dispose: () => {} };
    },

    registerDocumentFormattingEditProvider: (selector: any, provider: any) => {
      console.log(`[VSCode API] Registering formatting provider for:`, selector);
      return { dispose: () => {} };
    }
  };

  /**
   * vscode.Uri
   */
  Uri = {
    file: (path: string) => ({ scheme: 'file', path, fsPath: path }),
    parse: (value: string) => ({ scheme: '', path: value }),
    joinPath: (...paths: any[]) => ({ path: paths.join('/') })
  };

  /**
   * vscode.Range
   */
  Range = class {
    start: any;
    end: any;
    constructor(startLine: number, startChar: number, endLine: number, endChar: number) {
      this.start = { line: startLine, character: startChar };
      this.end = { line: endLine, character: endChar };
    }
  };

  /**
   * vscode.Position
   */
  Position = class {
    line: number;
    character: number;
    constructor(line: number, character: number) {
      this.line = line;
      this.character = character;
    }
  };

  /**
   * vscode.DiagnosticSeverity
   */
  DiagnosticSeverity = {
    Error: 0,
    Warning: 1,
    Information: 2,
    Hint: 3
  };

  /**
   * vscode.CompletionItemKind
   */
  CompletionItemKind = {
    Text: 0,
    Method: 1,
    Function: 2,
    Constructor: 3,
    Field: 4,
    Variable: 5,
    Class: 6,
    Interface: 7,
    Module: 8,
    Property: 9,
    Unit: 10,
    Value: 11,
    Enum: 12,
    Keyword: 13,
    Snippet: 14,
    Color: 15,
    File: 16,
    Reference: 17,
    Folder: 18
  };

  /**
   * 获取完整的API对象
   */
  getAPI() {
    return {
      window: this.window,
      commands: this.commands,
      workspace: this.workspace,
      languages: this.languages,
      Uri: this.Uri,
      Range: this.Range,
      Position: this.Position,
      DiagnosticSeverity: this.DiagnosticSeverity,
      CompletionItemKind: this.CompletionItemKind,
      version: '1.80.0' // 模拟VS Code版本
    };
  }

  /**
   * 执行已注册的命令
   */
  async executeCommand(command: string, ...args: any[]) {
    return this.commands.executeCommand(command, ...args);
  }

  /**
   * 更新主窗口引用
   */
  setMainWindow(window: BrowserWindow | null) {
    this.mainWindow = window;
  }
}
