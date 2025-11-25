import { ipcMain } from 'electron';
import type { ProjectManagementService } from '../services/ProjectManagementService';

export function registerProjectManagementHandlers(projectService: ProjectManagementService) {
  // TODO 管理
  ipcMain.handle('pm:get-todos', async () => {
    try {
      const todos = await projectService.getTodos();
      return { success: true, data: todos };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('pm:add-todo', async (_, text: string, priority?: 'low' | 'medium' | 'high', filePath?: string, line?: number) => {
    try {
      const todo = await projectService.addTodo(text, priority, filePath, line);
      return { success: true, data: todo };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('pm:update-todo', async (_, id: string, updates: any) => {
    try {
      await projectService.updateTodo(id, updates);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('pm:delete-todo', async (_, id: string) => {
    try {
      await projectService.deleteTodo(id);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('pm:scan-todos', async (_, rootPath: string) => {
    try {
      const todos = await projectService.scanFileTodos(rootPath);
      return { success: true, data: todos };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // 代码片段管理
  ipcMain.handle('pm:get-snippets', async () => {
    try {
      const snippets = await projectService.getSnippets();
      return { success: true, data: snippets };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('pm:add-snippet', async (_, name: string, code: string, language: string, description?: string, tags?: string[]) => {
    try {
      const snippet = await projectService.addSnippet(name, code, language, description, tags);
      return { success: true, data: snippet };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('pm:update-snippet', async (_, id: string, updates: any) => {
    try {
      await projectService.updateSnippet(id, updates);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('pm:delete-snippet', async (_, id: string) => {
    try {
      await projectService.deleteSnippet(id);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('pm:search-snippets', async (_, query: string) => {
    try {
      const snippets = await projectService.searchSnippets(query);
      return { success: true, data: snippets };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // 书签管理
  ipcMain.handle('pm:get-bookmarks', async () => {
    try {
      const bookmarks = await projectService.getBookmarks();
      return { success: true, data: bookmarks };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('pm:add-bookmark', async (_, filePath: string, line: number, label?: string) => {
    try {
      const bookmark = await projectService.addBookmark(filePath, line, label);
      return { success: true, data: bookmark };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('pm:delete-bookmark', async (_, id: string) => {
    try {
      await projectService.deleteBookmark(id);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('pm:get-bookmarks-for-file', async (_, filePath: string) => {
    try {
      const bookmarks = await projectService.getBookmarksForFile(filePath);
      return { success: true, data: bookmarks };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });
}
