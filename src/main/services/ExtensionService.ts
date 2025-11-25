import { promises as fs } from 'fs';
import * as path from 'path';
import JSZip from 'jszip';
import Store from 'electron-store';
import { app } from 'electron';

export interface ExtensionManifest {
  name: string;
  displayName?: string;
  version: string;
  publisher: string;
  description?: string;
  main?: string;
  icon?: string;
  engines: {
    vscode: string;
  };
  categories?: string[];
  activationEvents?: string[];
  contributes?: {
    commands?: Array<{
      command: string;
      title: string;
      category?: string;
    }>;
    languages?: Array<{
      id: string;
      extensions?: string[];
      aliases?: string[];
      configuration?: string;
    }>;
    themes?: Array<{
      label: string;
      uiTheme: 'vs' | 'vs-dark' | 'hc-black';
      path: string;
    }>;
    grammars?: Array<{
      language?: string;
      scopeName: string;
      path: string;
    }>;
    snippets?: Array<{
      language: string;
      path: string;
    }>;
  };
}

export interface InstalledExtension {
  id: string; // publisher.name
  manifest: ExtensionManifest;
  extensionPath: string;
  enabled: boolean;
  installedAt: number;
}

export class ExtensionService {
  private store: Store;
  private extensionsDir: string;
  private installedExtensions: Map<string, InstalledExtension> = new Map();

  constructor(store: Store) {
    this.store = store;
    this.extensionsDir = path.join(app.getPath('userData'), 'extensions');
    this.ensureExtensionsDir();
    this.loadInstalledExtensions();
  }

  private async ensureExtensionsDir() {
    try {
      await fs.mkdir(this.extensionsDir, { recursive: true });
    } catch (error) {
      console.error('[ExtensionService] Failed to create extensions directory:', error);
    }
  }

  private async loadInstalledExtensions() {
    try {
      const entries = await fs.readdir(this.extensionsDir, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const extPath = path.join(this.extensionsDir, entry.name);
          const manifestPath = path.join(extPath, 'extension', 'package.json');
          
          try {
            const manifestContent = await fs.readFile(manifestPath, 'utf-8');
            const manifest: ExtensionManifest = JSON.parse(manifestContent);
            const id = `${manifest.publisher}.${manifest.name}`;
            
            const savedExtensions = this.store.get('extensions.installed', {}) as Record<string, any>;
            const enabled = savedExtensions[id]?.enabled ?? true;
            
            this.installedExtensions.set(id, {
              id,
              manifest,
              extensionPath: extPath,
              enabled,
              installedAt: savedExtensions[id]?.installedAt || Date.now()
            });
            
            console.log(`[ExtensionService] Loaded extension: ${id}`);
          } catch (error) {
            console.error(`[ExtensionService] Failed to load extension ${entry.name}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('[ExtensionService] Failed to load installed extensions:', error);
    }
  }

  async installVSIX(vsixPath: string): Promise<InstalledExtension> {
    console.log(`[ExtensionService] Installing VSIX: ${vsixPath}`);
    
    try {
      // 读取VSIX文件
      const vsixData = await fs.readFile(vsixPath);
      const zip = await JSZip.loadAsync(vsixData);
      
      // 读取package.json
      const packageJsonFile = zip.file('extension/package.json');
      if (!packageJsonFile) {
        throw new Error('Invalid VSIX: extension/package.json not found');
      }
      
      const packageJsonContent = await packageJsonFile.async('text');
      const manifest: ExtensionManifest = JSON.parse(packageJsonContent);
      
      const extensionId = `${manifest.publisher}.${manifest.name}`;
      const targetDir = path.join(this.extensionsDir, extensionId);
      
      // 检查是否已安装
      if (this.installedExtensions.has(extensionId)) {
        // 卸载旧版本
        await this.uninstallExtension(extensionId);
      }
      
      // 创建目标目录
      await fs.mkdir(targetDir, { recursive: true });
      
      // 解压所有文件
      const extractPromises: Promise<void>[] = [];
      zip.forEach((relativePath, file) => {
        if (!file.dir) {
          const targetPath = path.join(targetDir, relativePath);
          extractPromises.push(
            (async () => {
              await fs.mkdir(path.dirname(targetPath), { recursive: true });
              const content = await file.async('nodebuffer');
              await fs.writeFile(targetPath, content);
            })()
          );
        }
      });
      
      await Promise.all(extractPromises);
      
      // 创建安装记录
      const installedExtension: InstalledExtension = {
        id: extensionId,
        manifest,
        extensionPath: targetDir,
        enabled: true,
        installedAt: Date.now()
      };
      
      this.installedExtensions.set(extensionId, installedExtension);
      
      // 保存到配置
      this.saveExtensionConfig();
      
      console.log(`[ExtensionService] Successfully installed: ${extensionId}`);
      return installedExtension;
      
    } catch (error: any) {
      console.error('[ExtensionService] Failed to install VSIX:', error);
      throw new Error(`Failed to install extension: ${error.message}`);
    }
  }

  async uninstallExtension(extensionId: string): Promise<void> {
    console.log(`[ExtensionService] Uninstalling extension: ${extensionId}`);
    
    const extension = this.installedExtensions.get(extensionId);
    if (!extension) {
      throw new Error(`Extension ${extensionId} is not installed`);
    }
    
    try {
      // 删除扩展目录
      await fs.rm(extension.extensionPath, { recursive: true, force: true });
      
      // 从内存中移除
      this.installedExtensions.delete(extensionId);
      
      // 更新配置
      this.saveExtensionConfig();
      
      console.log(`[ExtensionService] Successfully uninstalled: ${extensionId}`);
    } catch (error: any) {
      console.error('[ExtensionService] Failed to uninstall extension:', error);
      throw new Error(`Failed to uninstall extension: ${error.message}`);
    }
  }

  enableExtension(extensionId: string): void {
    const extension = this.installedExtensions.get(extensionId);
    if (!extension) {
      throw new Error(`Extension ${extensionId} is not installed`);
    }
    
    extension.enabled = true;
    this.saveExtensionConfig();
    console.log(`[ExtensionService] Enabled extension: ${extensionId}`);
  }

  disableExtension(extensionId: string): void {
    const extension = this.installedExtensions.get(extensionId);
    if (!extension) {
      throw new Error(`Extension ${extensionId} is not installed`);
    }
    
    extension.enabled = false;
    this.saveExtensionConfig();
    console.log(`[ExtensionService] Disabled extension: ${extensionId}`);
  }

  getInstalledExtensions(): InstalledExtension[] {
    return Array.from(this.installedExtensions.values());
  }

  getExtension(extensionId: string): InstalledExtension | undefined {
    return this.installedExtensions.get(extensionId);
  }

  getEnabledExtensions(): InstalledExtension[] {
    return this.getInstalledExtensions().filter(ext => ext.enabled);
  }

  private saveExtensionConfig(): void {
    const config: Record<string, any> = {};
    
    this.installedExtensions.forEach((ext, id) => {
      config[id] = {
        enabled: ext.enabled,
        installedAt: ext.installedAt
      };
    });
    
    this.store.set('extensions.installed', config);
  }

  // 获取扩展的主题定义
  async getExtensionThemes(extensionId: string): Promise<any[]> {
    const extension = this.installedExtensions.get(extensionId);
    if (!extension || !extension.manifest.contributes?.themes) {
      return [];
    }
    
    const themes: any[] = [];
    
    for (const themeContribution of extension.manifest.contributes.themes) {
      try {
        const themePath = path.join(
          extension.extensionPath,
          'extension',
          themeContribution.path
        );
        const themeContent = await fs.readFile(themePath, 'utf-8');
        const themeData = JSON.parse(themeContent);
        
        themes.push({
          id: `${extensionId}.${themeContribution.label}`,
          label: themeContribution.label,
          uiTheme: themeContribution.uiTheme,
          colors: themeData.colors || {},
          tokenColors: themeData.tokenColors || []
        });
      } catch (error) {
        console.error(`[ExtensionService] Failed to load theme ${themeContribution.label}:`, error);
      }
    }
    
    return themes;
  }

  // 获取扩展的语言定义
  async getExtensionLanguages(extensionId: string): Promise<any[]> {
    const extension = this.installedExtensions.get(extensionId);
    if (!extension || !extension.manifest.contributes?.languages) {
      return [];
    }
    
    return extension.manifest.contributes.languages.map(lang => ({
      id: lang.id,
      extensions: lang.extensions || [],
      aliases: lang.aliases || []
    }));
  }

  // 获取扩展的语法定义
  async getExtensionGrammars(extensionId: string): Promise<any[]> {
    const extension = this.installedExtensions.get(extensionId);
    if (!extension || !extension.manifest.contributes?.grammars) {
      return [];
    }
    
    const grammars: any[] = [];
    
    for (const grammarContribution of extension.manifest.contributes.grammars) {
      try {
        const grammarPath = path.join(
          extension.extensionPath,
          'extension',
          grammarContribution.path
        );
        const grammarContent = await fs.readFile(grammarPath, 'utf-8');
        const grammarData = JSON.parse(grammarContent);
        
        grammars.push({
          language: grammarContribution.language,
          scopeName: grammarContribution.scopeName,
          grammar: grammarData
        });
      } catch (error) {
        console.error(`[ExtensionService] Failed to load grammar:`, error);
      }
    }
    
    return grammars;
  }
}
