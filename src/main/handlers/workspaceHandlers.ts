/**
 * 工作区管理相关的 IPC handlers
 */
import { ipcMain } from 'electron';
import { WorkspaceService } from '../services/WorkspaceService';

export function registerWorkspaceHandlers(workspaceService: WorkspaceService) {
  // 获取所有工作区
  ipcMain.handle('workspace-get-all', async () => {
    try {
      const workspaces = workspaceService.getWorkspaces();
      return { success: true, data: workspaces };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // 获取单个工作区
  ipcMain.handle('workspace-get', async (_, path: string) => {
    try {
      const workspace = workspaceService.getWorkspace(path);
      return { success: true, data: workspace };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // 保存工作区
  ipcMain.handle('workspace-save', async (_, workspace: any) => {
    try {
      workspaceService.saveWorkspace(workspace);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // 更新工作区
  ipcMain.handle('workspace-update', async (_, path: string, updates: any) => {
    try {
      workspaceService.updateWorkspace(path, updates);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // 删除工作区
  ipcMain.handle('workspace-delete', async (_, path: string) => {
    try {
      workspaceService.deleteWorkspace(path);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // 获取最近工作区
  ipcMain.handle('workspace-get-recent', async (_, limit?: number) => {
    try {
      const workspaces = workspaceService.getRecentWorkspaces(limit);
      return { success: true, data: workspaces };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });
}
