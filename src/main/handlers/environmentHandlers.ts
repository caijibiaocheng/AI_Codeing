/**
 * 环境变量管理 IPC 处理器
 */
import { ipcMain, dialog } from 'electron';
import { promises as fs } from 'fs';
import * as path from 'path';
import { app } from 'electron';
import * as crypto from 'crypto';

interface EnvironmentVariable {
  id: string;
  key: string;
  value: string;
  description?: string;
  isSecret: boolean;
  isEncrypted: boolean;
  type: 'string' | 'number' | 'boolean' | 'json';
}

interface Environment {
  id: string;
  name: string;
  description?: string;
  variables: EnvironmentVariable[];
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

// 简单的加密函数（实际项目中应该使用更安全的方法）
function encrypt(text: string): string {
  const algorithm = 'aes-256-gcm';
  const key = crypto.scryptSync(app.getPath('userData'), 'salt', 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher(algorithm, key);
  cipher.setAAD(Buffer.from('environment-variable', 'utf8'));
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
}

function decrypt(encryptedText: string): string {
  const algorithm = 'aes-256-gcm';
  const key = crypto.scryptSync(app.getPath('userData'), 'salt', 32);
  
  const parts = encryptedText.split(':');
  if (parts.length !== 3) throw new Error('Invalid encrypted format');
  
  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encrypted = parts[2];
  
  const decipher = crypto.createDecipher(algorithm, key);
  decipher.setAAD(Buffer.from('environment-variable', 'utf8'));
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

export function setupEnvironmentHandlers() {
  // 获取环境列表
  ipcMain.handle('getEnvironments', async () => {
    try {
      const userDataPath = app.getPath('userData');
      const environmentsFile = path.join(userDataPath, 'environments.json');
      
      try {
        const data = await fs.readFile(environmentsFile, 'utf-8');
        return JSON.parse(data);
      } catch (error) {
        // 返回默认环境
        const defaultEnvironments: Environment[] = [
          {
            id: 'development',
            name: 'Development',
            description: '开发环境配置',
            isActive: true,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            variables: []
          }
        ];
        await fs.writeFile(environmentsFile, JSON.stringify(defaultEnvironments, null, 2), 'utf-8');
        return defaultEnvironments;
      }
    } catch (error) {
      console.error('[Environment] Failed to get environments:', error);
      return [];
    }
  });

  // 保存环境
  ipcMain.handle('saveEnvironment', async (event, environment: Environment) => {
    try {
      const userDataPath = app.getPath('userData');
      const environmentsFile = path.join(userDataPath, 'environments.json');
      
      let environments = [];
      try {
        const data = await fs.readFile(environmentsFile, 'utf-8');
        environments = JSON.parse(data);
      } catch (error) {
        environments = [];
      }
      
      // 处理加密
      const processedEnvironment = {
        ...environment,
        variables: environment.variables.map(variable => {
          if (variable.isEncrypted && !variable.value.startsWith('encrypted:')) {
            return {
              ...variable,
              value: 'encrypted:' + encrypt(variable.value)
            };
          }
          return variable;
        })
      };
      
      const existingIndex = environments.findIndex((env: any) => env.id === environment.id);
      if (existingIndex >= 0) {
        environments[existingIndex] = processedEnvironment;
      } else {
        environments.push(processedEnvironment);
      }
      
      await fs.writeFile(environmentsFile, JSON.stringify(environments, null, 2), 'utf-8');
      
      return { success: true };
    } catch (error) {
      console.error('[Environment] Failed to save environment:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  });

  // 添加环境变量
  ipcMain.handle('addEnvironmentVariable', async (event, environmentId: string, variable: EnvironmentVariable) => {
    try {
      const userDataPath = app.getPath('userData');
      const environmentsFile = path.join(userDataPath, 'environments.json');
      
      const data = await fs.readFile(environmentsFile, 'utf-8');
      const environments = JSON.parse(data);
      
      const environmentIndex = environments.findIndex((env: any) => env.id === environmentId);
      if (environmentIndex >= 0) {
        // 处理加密
        const processedVariable = variable.isEncrypted ? {
          ...variable,
          value: 'encrypted:' + encrypt(variable.value)
        } : variable;
        
        environments[environmentIndex].variables.push(processedVariable);
        environments[environmentIndex].updatedAt = Date.now();
        
        await fs.writeFile(environmentsFile, JSON.stringify(environments, null, 2), 'utf-8');
        return { success: true };
      }
      
      return { success: false, error: 'Environment not found' };
    } catch (error) {
      console.error('[Environment] Failed to add variable:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  });

  // 更新环境变量
  ipcMain.handle('updateEnvironmentVariable', async (event, environmentId: string, variableId: string, updates: Partial<EnvironmentVariable>) => {
    try {
      const userDataPath = app.getPath('userData');
      const environmentsFile = path.join(userDataPath, 'environments.json');
      
      const data = await fs.readFile(environmentsFile, 'utf-8');
      const environments = JSON.parse(data);
      
      const environmentIndex = environments.findIndex((env: any) => env.id === environmentId);
      if (environmentIndex >= 0) {
        const variableIndex = environments[environmentIndex].variables.findIndex((v: any) => v.id === variableId);
        if (variableIndex >= 0) {
          // 处理加密
          const processedUpdates = { ...updates };
          if (updates.value !== undefined && updates.isEncrypted && !updates.value.startsWith('encrypted:')) {
            processedUpdates.value = 'encrypted:' + encrypt(updates.value);
          }
          
          environments[environmentIndex].variables[variableIndex] = {
            ...environments[environmentIndex].variables[variableIndex],
            ...processedUpdates
          };
          environments[environmentIndex].updatedAt = Date.now();
          
          await fs.writeFile(environmentsFile, JSON.stringify(environments, null, 2), 'utf-8');
          return { success: true };
        }
      }
      
      return { success: false, error: 'Variable not found' };
    } catch (error) {
      console.error('[Environment] Failed to update variable:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  });

  // 删除环境变量
  ipcMain.handle('deleteEnvironmentVariable', async (event, environmentId: string, variableId: string) => {
    try {
      const userDataPath = app.getPath('userData');
      const environmentsFile = path.join(userDataPath, 'environments.json');
      
      const data = await fs.readFile(environmentsFile, 'utf-8');
      const environments = JSON.parse(data);
      
      const environmentIndex = environments.findIndex((env: any) => env.id === environmentId);
      if (environmentIndex >= 0) {
        environments[environmentIndex].variables = environments[environmentIndex].variables.filter((v: any) => v.id !== variableId);
        environments[environmentIndex].updatedAt = Date.now();
        
        await fs.writeFile(environmentsFile, JSON.stringify(environments, null, 2), 'utf-8');
        return { success: true };
      }
      
      return { success: false, error: 'Environment not found' };
    } catch (error) {
      console.error('[Environment] Failed to delete variable:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  });

  // 切换环境
  ipcMain.handle('switchEnvironment', async (event, environmentId: string) => {
    try {
      const userDataPath = app.getPath('userData');
      const environmentsFile = path.join(userDataPath, 'environments.json');
      
      const data = await fs.readFile(environmentsFile, 'utf-8');
      const environments = JSON.parse(data);
      
      // 设置所有环境为非活动状态
      environments.forEach((env: any) => {
        env.isActive = env.id === environmentId;
      });
      
      await fs.writeFile(environmentsFile, JSON.stringify(environments, null, 2), 'utf-8');
      return { success: true };
    } catch (error) {
      console.error('[Environment] Failed to switch environment:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  });

  // 导出环境
  ipcMain.handle('exportEnvironment', async (event, environmentId: string) => {
    try {
      const userDataPath = app.getPath('userData');
      const environmentsFile = path.join(userDataPath, 'environments.json');
      
      const data = await fs.readFile(environmentsFile, 'utf-8');
      const environments = JSON.parse(data);
      
      const environment = environments.find((env: any) => env.id === environmentId);
      if (!environment) {
        throw new Error('Environment not found');
      }
      
      const result = await dialog.showSaveDialog({
        defaultPath: `${environment.name}-environment.json`,
        filters: [
          { name: 'JSON Files', extensions: ['json'] }
        ]
      });
      
      if (!result.canceled && result.filePath) {
        // 移除加密前缀进行导出
        const exportData = {
          ...environment,
          variables: environment.variables.map((v: any) => ({
            ...v,
            value: v.isEncrypted && v.value.startsWith('encrypted:') 
              ? '[ENCRYPTED]' 
              : v.value
          }))
        };
        
        await fs.writeFile(result.filePath, JSON.stringify(exportData, null, 2), 'utf-8');
        return { success: true };
      }
      
      return { success: false, canceled: true };
    } catch (error) {
      console.error('[Environment] Failed to export environment:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  });

  // 导入环境
  ipcMain.handle('importEnvironment', async () => {
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
        
        if (importData.variables && Array.isArray(importData.variables)) {
          const userDataPath = app.getPath('userData');
          const environmentsFile = path.join(userDataPath, 'environments.json');
          
          let environments = [];
          try {
            const existingData = await fs.readFile(environmentsFile, 'utf-8');
            environments = JSON.parse(existingData);
          } catch (error) {
            environments = [];
          }
          
          // 生成新的ID避免冲突
          const newEnvironment = {
            ...importData,
            id: `imported-${Date.now()}`,
            isActive: false
          };
          
          environments.push(newEnvironment);
          await fs.writeFile(environmentsFile, JSON.stringify(environments, null, 2), 'utf-8');
          return true;
        } else {
          throw new Error('Invalid environment file format');
        }
      }
      
      return false;
    } catch (error) {
      console.error('[Environment] Failed to import environment:', error);
      return false;
    }
  });

  console.log('[Environment] Handlers registered');
}