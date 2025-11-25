import * as prettier from 'prettier';
import * as path from 'path';

export interface FormatResult {
  success: boolean;
  formatted?: string;
  error?: string;
}

export class FormatterService {
  async formatCode(code: string, filePath: string): Promise<FormatResult> {
    try {
      // 检测文件类型
      const parser = this.getParser(filePath);
      
      if (!parser) {
        return {
          success: false,
          error: 'Unsupported file type for formatting'
        };
      }

      // 格式化代码
      const formatted = await prettier.format(code, {
        parser,
        semi: true,
        singleQuote: true,
        tabWidth: 2,
        useTabs: false,
        trailingComma: 'es5',
        printWidth: 100,
        arrowParens: 'always',
        endOfLine: 'lf'
      });

      return {
        success: true,
        formatted
      };
    } catch (error: any) {
      console.error('[FormatterService] Format error:', error);
      return {
        success: false,
        error: error.message || 'Unknown formatting error'
      };
    }
  }

  private getParser(filePath: string): string | null {
    const ext = path.extname(filePath).toLowerCase();
    
    const parserMap: Record<string, string> = {
      '.js': 'babel',
      '.jsx': 'babel',
      '.ts': 'typescript',
      '.tsx': 'typescript',
      '.json': 'json',
      '.css': 'css',
      '.scss': 'scss',
      '.less': 'less',
      '.html': 'html',
      '.md': 'markdown',
      '.yaml': 'yaml',
      '.yml': 'yaml'
    };

    return parserMap[ext] || null;
  }

  isSupported(filePath: string): boolean {
    return this.getParser(filePath) !== null;
  }
}
