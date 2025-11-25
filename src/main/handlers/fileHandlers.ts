/**
 * 文件操作相关的 IPC handlers
 */
import { ipcMain } from 'electron';
import * as path from 'path';
import { promises as fs } from 'fs';
import type Store from 'electron-store';
import { FILE_SIZE_LIMIT, MAX_RECENT_FILES, EXCLUDED_DIRECTORIES, MAX_SEARCH_RESULTS } from '../../shared/constants';

export function registerFileHandlers(store: Store) {
  // 读取文件
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
      
      if (stats.size > FILE_SIZE_LIMIT) {
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

  // 写入文件
  ipcMain.handle('write-file', async (_, filePath: string, content: string) => {
    try {
      if (!filePath || typeof filePath !== 'string') {
        throw new Error('Invalid file path');
      }
      
      if (content === undefined || content === null || typeof content !== 'string') {
        throw new Error('Invalid file content');
      }
      
      if (content.length > FILE_SIZE_LIMIT) {
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

  // 读取目录
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
      
      // 限制数量
      if (recentFiles.length > MAX_RECENT_FILES) {
        recentFiles = recentFiles.slice(0, MAX_RECENT_FILES);
      }
      
      store.set('recentFiles', recentFiles);
      return true;
    } catch (error) {
      return false;
    }
  });

  // 搜索文件名
  ipcMain.handle('search-files', async (_, rootPath: string, query: string) => {
    const results: any[] = [];
    
    async function searchDir(dirPath: string) {
      try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        
        for (const entry of entries) {
          if (EXCLUDED_DIRECTORIES.includes(entry.name)) continue;
          
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
          if (EXCLUDED_DIRECTORIES.includes(entry.name)) continue;
          
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
          
          // 限制结果数量
          if (results.length > MAX_SEARCH_RESULTS) break;
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
}
