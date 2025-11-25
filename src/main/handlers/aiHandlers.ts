/**
 * AI 相关的 IPC handlers
 */
import { ipcMain, IpcMainInvokeEvent } from 'electron';
import { AIService } from '../services/AIService';
import { AICompletionService } from '../services/AICompletionService';
import { MemoryService } from '../services/MemoryService';

export function registerAIHandlers(
  aiService: AIService,
  completionService: AICompletionService,
  memoryService: MemoryService
) {
  // AI 聊天 (非流式)
  ipcMain.handle('ai-chat', async (_, message: string, context?: any) => {
    try {
      // 学习代码风格
      if (context?.code && context?.language) {
        memoryService.learnFromCode(context.code, context.language);
      }
      
      // 获取记忆上下文
      const language = context?.language || 'javascript';
      const memoryContext = memoryService.exportForAI(language);
      
      // 合并上下文
      const enhancedContext = {
        ...context,
        memory: memoryContext
      };
      
      const response = await aiService.chat(message, enhancedContext);
      return { success: true, data: response };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // AI 流式聊天
  ipcMain.handle('ai-stream-chat', async (event: IpcMainInvokeEvent, message: string, context?: any) => {
    try {
      // 学习代码风格
      if (context?.code && context?.language) {
        memoryService.learnFromCode(context.code, context.language);
      }
      
      // 获取记忆上下文
      const language = context?.language || 'javascript';
      const memoryContext = memoryService.exportForAI(language);
      
      // 合并上下文
      const enhancedContext = {
        ...context,
        memory: memoryContext
      };
      
      await aiService.streamChat(message, enhancedContext, (chunk) => {
        event.sender.send('ai-stream-chunk', chunk);
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // AI 代码补全
  ipcMain.handle('ai-get-completion', async (_, context: any) => {
    try {
      const completion = await completionService.getCompletion(context);
      return { success: true, completion };
    } catch (error: any) {
      console.error('[AI Completion] Error:', error);
      return { success: false, error: error.message };
    }
  });
}
