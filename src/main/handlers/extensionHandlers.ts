/**
 * 扩展管理相关的 IPC handlers
 */
import { ipcMain, dialog, BrowserWindow } from 'electron';
import { ExtensionService } from '../services/ExtensionService';

export function registerExtensionHandlers(
  extensionService: ExtensionService,
  getMainWindow: () => BrowserWindow | null
) {
  // 选择 VSIX 文件
  ipcMain.handle('extension-select-vsix', async () => {
    try {
      const mainWindow = getMainWindow();
      if (!mainWindow) {
        return { success: false, error: 'Main window not available' };
      }
      
      const result = await dialog.showOpenDialog(mainWindow, {
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

  // 安装扩展
  ipcMain.handle('extension-install', async (_, vsixPath: string) => {
    try {
      const extension = await extensionService.installVSIX(vsixPath);
      return { success: true, data: extension };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // 卸载扩展
  ipcMain.handle('extension-uninstall', async (_, extensionId: string) => {
    try {
      await extensionService.uninstallExtension(extensionId);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // 启用扩展
  ipcMain.handle('extension-enable', async (_, extensionId: string) => {
    try {
      extensionService.enableExtension(extensionId);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // 禁用扩展
  ipcMain.handle('extension-disable', async (_, extensionId: string) => {
    try {
      extensionService.disableExtension(extensionId);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // 获取已安装扩展列表
  ipcMain.handle('extension-list', async () => {
    try {
      const extensions = extensionService.getInstalledExtensions();
      return { success: true, data: extensions };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // 获取扩展主题
  ipcMain.handle('extension-get-themes', async (_, extensionId: string) => {
    try {
      const themes = await extensionService.getExtensionThemes(extensionId);
      return { success: true, data: themes };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // 获取扩展语言
  ipcMain.handle('extension-get-languages', async (_, extensionId: string) => {
    try {
      const languages = await extensionService.getExtensionLanguages(extensionId);
      return { success: true, data: languages };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // 获取扩展语法
  ipcMain.handle('extension-get-grammars', async (_, extensionId: string) => {
    try {
      const grammars = await extensionService.getExtensionGrammars(extensionId);
      return { success: true, data: grammars };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });
}
