/**
 * 快捷键管理 IPC 处理器
 */
import { ipcMain, dialog } from 'electron';
import { promises as fs } from 'fs';
import * as path from 'path';
import { app } from 'electron';

interface KeyBinding {
  id: string;
  command: string;
  keybinding: string;
  description: string;
  category: string;
  isDefault: boolean;
  isUserDefined: boolean;
}

export function setupKeyBindingsHandlers() {
  // 获取用户自定义的快捷键
  ipcMain.handle('getKeyBindings', async () => {
    try {
      const userDataPath = app.getPath('userData');
      const keybindingsFile = path.join(userDataPath, 'keybindings.json');
      
      try {
        const data = await fs.readFile(keybindingsFile, 'utf-8');
        return JSON.parse(data);
      } catch (error) {
        return [];
      }
    } catch (error) {
      console.error('[KeyBindings] Failed to get key bindings:', error);
      return [];
    }
  });

  // 保存快捷键
  ipcMain.handle('saveKeyBinding', async (event, bindingId: string, keybinding: string) => {
    try {
      const userDataPath = app.getPath('userData');
      const keybindingsFile = path.join(userDataPath, 'keybindings.json');
      
      let keybindings = [];
      try {
        const data = await fs.readFile(keybindingsFile, 'utf-8');
        keybindings = JSON.parse(data);
      } catch (error) {
        keybindings = [];
      }
      
      // 查找并更新或添加快捷键
      const existingIndex = keybindings.findIndex((kb: any) => kb.id === bindingId);
      if (existingIndex >= 0) {
        keybindings[existingIndex].keybinding = keybinding;
        keybindings[existingIndex].isUserDefined = true;
      } else {
        keybindings.push({
          id: bindingId,
          keybinding,
          isUserDefined: true
        });
      }
      
      await fs.writeFile(keybindingsFile, JSON.stringify(keybindings, null, 2), 'utf-8');
      
      return { success: true };
    } catch (error) {
      console.error('[KeyBindings] Failed to save key binding:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  });

  // 重置快捷键到默认
  ipcMain.handle('resetKeyBinding', async (event, bindingId: string) => {
    try {
      const userDataPath = app.getPath('userData');
      const keybindingsFile = path.join(userDataPath, 'keybindings.json');
      
      let keybindings = [];
      try {
        const data = await fs.readFile(keybindingsFile, 'utf-8');
        keybindings = JSON.parse(data);
      } catch (error) {
        return { success: true }; // 文件不存在，相当于已重置
      }
      
      // 移除用户自定义的快捷键
      keybindings = keybindings.filter((kb: any) => kb.id !== bindingId);
      
      await fs.writeFile(keybindingsFile, JSON.stringify(keybindings, null, 2), 'utf-8');
      
      return { success: true };
    } catch (error) {
      console.error('[KeyBindings] Failed to reset key binding:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  });

  // 导出快捷键配置
  ipcMain.handle('exportKeyBindings', async (event, keybindings: KeyBinding[]) => {
    try {
      const result = await dialog.showSaveDialog({
        defaultPath: 'keybindings.json',
        filters: [
          { name: 'JSON Files', extensions: ['json'] }
        ]
      });
      
      if (!result.canceled && result.filePath) {
        const exportData = {
          version: '1.0.0',
          exportedAt: new Date().toISOString(),
          keybindings
        };
        
        await fs.writeFile(result.filePath, JSON.stringify(exportData, null, 2), 'utf-8');
        return { success: true };
      }
      
      return { success: false, canceled: true };
    } catch (error) {
      console.error('[KeyBindings] Failed to export key bindings:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  });

  // 导入快捷键配置
  ipcMain.handle('importKeyBindings', async () => {
    try {
      const result = await dialog.showOpenDialog({
        filters: [
          { name: 'JSON Files', extensions: ['json'] }
        ],
        properties: ['openFile']
      });
      
      if (!result.canceled && result.filePaths.length > 0) {
        const data = await fs.readFile(result.filePaths[0], 'utf-8');
        const importData = JSON.parse(data);
        
        if (importData.keybindings && Array.isArray(importData.keybindings)) {
          const userDataPath = app.getPath('userData');
          const keybindingsFile = path.join(userDataPath, 'keybindings.json');
          
          await fs.writeFile(keybindingsFile, JSON.stringify(importData.keybindings, null, 2), 'utf-8');
          return true;
        } else {
          throw new Error('Invalid key bindings file format');
        }
      }
      
      return false;
    } catch (error) {
      console.error('[KeyBindings] Failed to import key bindings:', error);
      return false;
    }
  });

  console.log('[KeyBindings] Handlers registered');
}