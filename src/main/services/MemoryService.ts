import Store from 'electron-store';

interface Memory {
  id: string;
  type: 'code_style' | 'project_rule' | 'preference' | 'pattern';
  content: string;
  context: string;
  frequency: number;
  lastUsed: Date;
  tags: string[];
}

interface CodePattern {
  pattern: string;
  usage: number;
  examples: string[];
}

export class MemoryService {
  private store: Store;
  private memories: Map<string, Memory>;
  private codePatterns: Map<string, CodePattern>;

  constructor(store: Store) {
    this.store = store;
    this.memories = new Map();
    this.codePatterns = new Map();
    this.loadMemories();
  }

  private loadMemories() {
    const saved = this.store.get('memories', []) as Memory[];
    saved.forEach(memory => {
      this.memories.set(memory.id, memory);
    });

    const patterns = this.store.get('codePatterns', []) as CodePattern[];
    patterns.forEach(pattern => {
      this.codePatterns.set(pattern.pattern, pattern);
    });
  }

  private saveMemories() {
    this.store.set('memories', Array.from(this.memories.values()));
    this.store.set('codePatterns', Array.from(this.codePatterns.values()));
  }

  // 学习代码风格
  learnFromCode(code: string, language: string) {
    // 分析缩进风格
    const indentStyle = this.detectIndentStyle(code);
    this.addMemory({
      type: 'code_style',
      content: `Indentation: ${indentStyle}`,
      context: language,
      tags: ['indentation', language]
    });

    // 分析命名风格
    const namingStyle = this.detectNamingStyle(code);
    if (namingStyle) {
      this.addMemory({
        type: 'code_style',
        content: `Naming convention: ${namingStyle}`,
        context: language,
        tags: ['naming', language]
      });
    }

    // 分析常用模式
    this.detectCodePatterns(code, language);
  }

  private detectIndentStyle(code: string): string {
    const lines = code.split('\n');
    let spaceCount = 0;
    let tabCount = 0;

    for (const line of lines) {
      if (line.startsWith('  ')) spaceCount++;
      if (line.startsWith('\t')) tabCount++;
    }

    if (spaceCount > tabCount) {
      // 检测空格数量
      const twoSpaces = lines.filter(l => l.match(/^  [^\s]/)).length;
      const fourSpaces = lines.filter(l => l.match(/^    [^\s]/)).length;
      return fourSpaces > twoSpaces ? '4 spaces' : '2 spaces';
    }
    return 'tabs';
  }

  private detectNamingStyle(code: string): string | null {
    const camelCase = (code.match(/\b[a-z][a-zA-Z0-9]+\b/g) || []).length;
    const snake_case = (code.match(/\b[a-z]+_[a-z_]+\b/g) || []).length;
    const PascalCase = (code.match(/\b[A-Z][a-zA-Z0-9]+\b/g) || []).length;

    if (camelCase > snake_case && camelCase > PascalCase) return 'camelCase';
    if (snake_case > camelCase) return 'snake_case';
    if (PascalCase > camelCase) return 'PascalCase';
    return null;
  }

  private detectCodePatterns(code: string, language: string) {
    // 检测常用导入
    const imports = code.match(/^import .+ from .+$/gm) || [];
    imports.forEach(imp => {
      this.recordPattern(imp, language);
    });

    // 检测函数定义模式
    const functions = code.match(/function \w+\([^)]*\)|const \w+ = \([^)]*\) =>/g) || [];
    functions.forEach(func => {
      this.recordPattern(func, language);
    });
  }

  private recordPattern(pattern: string, context: string) {
    const existing = this.codePatterns.get(pattern);
    if (existing) {
      existing.usage++;
      if (existing.examples.length < 5) {
        existing.examples.push(context);
      }
    } else {
      this.codePatterns.set(pattern, {
        pattern,
        usage: 1,
        examples: [context]
      });
    }
    this.saveMemories();
  }

  // 添加记忆
  addMemory(data: {
    type: Memory['type'];
    content: string;
    context: string;
    tags: string[];
  }) {
    const id = `${data.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const memory: Memory = {
      id,
      ...data,
      frequency: 1,
      lastUsed: new Date()
    };

    // 检查是否已存在相似记忆
    const existing = Array.from(this.memories.values()).find(
      m => m.type === data.type && m.content === data.content && m.context === data.context
    );

    if (existing) {
      existing.frequency++;
      existing.lastUsed = new Date();
    } else {
      this.memories.set(id, memory);
    }

    this.saveMemories();
    return id;
  }

  // 获取相关记忆
  getRelevantMemories(context: string, tags: string[] = [], limit: number = 10): Memory[] {
    const memories = Array.from(this.memories.values());

    // 按相关性排序
    const scored = memories.map(memory => {
      let score = 0;

      // 上下文匹配
      if (memory.context.includes(context) || context.includes(memory.context)) {
        score += 10;
      }

      // 标签匹配
      const matchingTags = memory.tags.filter(tag => tags.includes(tag)).length;
      score += matchingTags * 5;

      // 使用频率
      score += Math.log(memory.frequency + 1);

      // 最近使用
      const daysSinceUse = (Date.now() - new Date(memory.lastUsed).getTime()) / (1000 * 60 * 60 * 24);
      score += Math.max(0, 5 - daysSinceUse);

      return { memory, score };
    });

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.memory);
  }

  // 获取代码风格建议
  getCodeStyleGuidance(language: string): string {
    const styleMemories = Array.from(this.memories.values()).filter(
      m => m.type === 'code_style' && m.context === language
    );

    if (styleMemories.length === 0) {
      return 'No specific code style preferences recorded yet.';
    }

    const guidance = styleMemories
      .sort((a, b) => b.frequency - a.frequency)
      .map(m => m.content)
      .join('\n');

    return `Code style preferences for ${language}:\n${guidance}`;
  }

  // 获取常用模式
  getFrequentPatterns(limit: number = 10): CodePattern[] {
    return Array.from(this.codePatterns.values())
      .sort((a, b) => b.usage - a.usage)
      .slice(0, limit);
  }

  // 清除旧记忆
  cleanOldMemories(daysOld: number = 90) {
    const cutoff = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
    let removed = 0;

    for (const [id, memory] of this.memories.entries()) {
      if (new Date(memory.lastUsed).getTime() < cutoff && memory.frequency < 3) {
        this.memories.delete(id);
        removed++;
      }
    }

    this.saveMemories();
    return removed;
  }

  // 导出记忆用于 AI 上下文
  exportForAI(language: string): string {
    const relevant = this.getRelevantMemories(language, [language], 20);
    const patterns = this.getFrequentPatterns(10);

    let context = '# Project Memory Context\n\n';
    
    if (relevant.length > 0) {
      context += '## Code Style & Preferences:\n';
      relevant.forEach(m => {
        context += `- ${m.content}\n`;
      });
      context += '\n';
    }

    if (patterns.length > 0) {
      context += '## Frequent Patterns:\n';
      patterns.forEach(p => {
        context += `- ${p.pattern} (used ${p.usage} times)\n`;
      });
    }

    return context;
  }
}
