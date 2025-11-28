/**
 * 项目模板管理 IPC 处理器
 */
import { ipcMain, dialog } from 'electron';
import { promises as fs } from 'fs';
import * as path from 'path';
import { app } from 'electron';

interface TemplateFile {
  path: string;
  content: string;
  isTemplate?: boolean;
}

export function setupProjectTemplatesHandlers() {
  // 获取项目模板列表
  ipcMain.handle('getProjectTemplates', async () => {
    try {
      const userDataPath = app.getPath('userData');
      const templatesDir = path.join(userDataPath, 'templates');
      const templatesFile = path.join(templatesDir, 'custom-templates.json');
      
      try {
        const data = await fs.readFile(templatesFile, 'utf-8');
        return JSON.parse(data);
      } catch (error) {
        return [];
      }
    } catch (error) {
      console.error('[ProjectTemplates] Failed to get templates:', error);
      return [];
    }
  });

  // 从模板创建项目
  ipcMain.handle('createProjectFromTemplate', async (event, projectPath: string, projectName: string, files: TemplateFile[], dependencies?: Record<string, string>, scripts?: Record<string, string>) => {
    try {
      const fullProjectPath = path.join(projectPath, projectName);
      
      // 创建项目目录
      await fs.mkdir(fullProjectPath, { recursive: true });
      
      // 创建文件
      for (const file of files) {
        const filePath = path.join(fullProjectPath, file.path);
        const fileDir = path.dirname(filePath);
        
        // 确保目录存在
        await fs.mkdir(fileDir, { recursive: true });
        
        // 写入文件
        await fs.writeFile(filePath, file.content, 'utf-8');
      }
      
      // 创建 package.json（如果提供了依赖或脚本）
      if (dependencies || scripts) {
        const packageJsonPath = path.join(fullProjectPath, 'package.json');
        let packageJson = {};
        
        try {
          const existingContent = await fs.readFile(packageJsonPath, 'utf-8');
          packageJson = JSON.parse(existingContent);
        } catch (error) {
          // 文件不存在，创建新的
        }
        
        if (dependencies) {
          packageJson = { ...packageJson, dependencies };
        }
        
        if (scripts) {
          packageJson = { ...packageJson, scripts };
        }
        
        await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf-8');
      }
      
      // 安装依赖（如果有）
      if (dependencies && Object.keys(dependencies).length > 0) {
        const { spawn } = require('child_process');
        await new Promise<void>((resolve, reject) => {
          const npm = spawn('npm', ['install'], { cwd: fullProjectPath, shell: true });
          npm.on('close', (code: number) => {
            if (code === 0) {
              resolve();
            } else {
              reject(new Error(`npm install failed with code ${code}`));
            }
          });
        });
      }
      
      return { success: true, projectPath: fullProjectPath };
    } catch (error) {
      console.error('[ProjectTemplates] Failed to create project:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  });

  // 保存自定义模板
  ipcMain.handle('saveProjectTemplate', async (event, template: any) => {
    try {
      const userDataPath = app.getPath('userData');
      const templatesDir = path.join(userDataPath, 'templates');
      const templatesFile = path.join(templatesDir, 'custom-templates.json');
      
      await fs.mkdir(templatesDir, { recursive: true });
      
      let templates = [];
      try {
        const data = await fs.readFile(templatesFile, 'utf-8');
        templates = JSON.parse(data);
      } catch (error) {
        templates = [];
      }
      
      templates.push({ ...template, id: `custom-${Date.now()}` });
      await fs.writeFile(templatesFile, JSON.stringify(templates, null, 2), 'utf-8');
      
      return { success: true };
    } catch (error) {
      console.error('[ProjectTemplates] Failed to save template:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  });

  console.log('[ProjectTemplates] Handlers registered');
}