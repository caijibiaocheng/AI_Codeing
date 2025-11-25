import { ipcMain } from 'electron';
import type { AIAssistantService } from '../services/AIAssistantService';

export function registerAIAssistantHandlers(aiAssistantService: AIAssistantService) {
  ipcMain.handle('ai:review-code', async (_event, code: string, language: string, filePath?: string) => {
    try {
      const results = await aiAssistantService.reviewCode(code, language, filePath);
      return { success: true, data: results };
    } catch (error: any) {
      console.error('[AI Assistant] Review code error:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('ai:generate-tests', async (_event, code: string, language: string, filePath?: string) => {
    try {
      const result = await aiAssistantService.generateTests(code, language, filePath);
      return { success: true, data: result };
    } catch (error: any) {
      console.error('[AI Assistant] Generate tests error:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('ai:generate-docs', async (_event, code: string, language: string) => {
    try {
      const result = await aiAssistantService.generateDocumentation(code, language);
      return { success: true, data: result };
    } catch (error: any) {
      console.error('[AI Assistant] Generate documentation error:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('ai:explain-code', async (_event, code: string, language: string) => {
    try {
      const result = await aiAssistantService.explainCode(code, language);
      return { success: true, data: result };
    } catch (error: any) {
      console.error('[AI Assistant] Explain code error:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('ai:suggest-refactoring', async (_event, code: string, language: string) => {
    try {
      const results = await aiAssistantService.suggestRefactoring(code, language);
      return { success: true, data: results };
    } catch (error: any) {
      console.error('[AI Assistant] Refactoring suggestion error:', error);
      return { success: false, error: error.message };
    }
  });
}
