import type Store from 'electron-store';
import { AIService } from './AIService';

export interface CodeReviewResult {
  severity: 'error' | 'warning' | 'info' | 'suggestion';
  line?: number;
  message: string;
  suggestion?: string;
}

export interface TestGenerationResult {
  testCode: string;
  framework: string;
  coverage: string[];
}

export interface DocumentationResult {
  documentation: string;
  format: 'jsdoc' | 'python-docstring' | 'xml-doc' | 'markdown';
}

export interface CodeExplanationResult {
  explanation: string;
  complexity: 'low' | 'medium' | 'high';
  keyPoints: string[];
}

export interface RefactoringSuggestion {
  type: 'extract-method' | 'rename' | 'simplify' | 'optimize' | 'pattern';
  title: string;
  description: string;
  before: string;
  after: string;
  impact: 'low' | 'medium' | 'high';
}

export class AIAssistantService {
  private aiService: AIService;
  private store: Store;

  constructor(aiService: AIService, store: Store) {
    this.aiService = aiService;
    this.store = store;
  }

  async reviewCode(code: string, language: string, filePath?: string): Promise<CodeReviewResult[]> {
    const prompt = `You are a code review expert. Review the following ${language} code and identify:
1. Potential bugs or errors
2. Code quality issues
3. Performance problems
4. Security vulnerabilities
5. Best practice violations

Respond ONLY with a JSON array of issues in this exact format:
[
  {
    "severity": "error|warning|info|suggestion",
    "line": <line_number or null>,
    "message": "<brief description>",
    "suggestion": "<how to fix it>"
  }
]

Code to review:
\`\`\`${language}
${code}
\`\`\`

IMPORTANT: Return ONLY the JSON array, no explanation text.`;

    try {
      const response = await this.aiService.chat(prompt, {
        code,
        language,
        systemPrompt: 'You are a professional code reviewer. Always respond with valid JSON only.'
      });

      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return [];
    } catch (error: any) {
      console.error('[AIAssistantService] Code review error:', error);
      throw new Error(`Code review failed: ${error.message}`);
    }
  }

  async generateTests(code: string, language: string, filePath?: string): Promise<TestGenerationResult> {
    const frameworkMap: Record<string, string> = {
      javascript: 'Jest',
      typescript: 'Jest',
      python: 'pytest',
      java: 'JUnit',
      csharp: 'NUnit',
      go: 'testing',
      ruby: 'RSpec'
    };

    const framework = frameworkMap[language] || 'generic';

    const prompt = `Generate comprehensive unit tests for the following ${language} code using ${framework}.

Code:
\`\`\`${language}
${code}
\`\`\`

Respond with a JSON object in this exact format:
{
  "testCode": "<complete test code>",
  "framework": "${framework}",
  "coverage": ["<function1>", "<function2>", ...]
}

IMPORTANT: Return ONLY valid JSON, no explanation.`;

    try {
      const response = await this.aiService.chat(prompt, {
        code,
        language,
        systemPrompt: 'You are an expert test engineer. Always respond with valid JSON only.'
      });

      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return {
        testCode: response,
        framework,
        coverage: []
      };
    } catch (error: any) {
      console.error('[AIAssistantService] Test generation error:', error);
      throw new Error(`Test generation failed: ${error.message}`);
    }
  }

  async generateDocumentation(code: string, language: string): Promise<DocumentationResult> {
    const formatMap: Record<string, string> = {
      javascript: 'jsdoc',
      typescript: 'jsdoc',
      python: 'python-docstring',
      csharp: 'xml-doc',
      java: 'javadoc'
    };

    const format = formatMap[language] || 'markdown';

    const prompt = `Generate comprehensive documentation for the following ${language} code in ${format} format.

Code:
\`\`\`${language}
${code}
\`\`\`

Respond with a JSON object:
{
  "documentation": "<formatted documentation>",
  "format": "${format}"
}

IMPORTANT: Return ONLY valid JSON.`;

    try {
      const response = await this.aiService.chat(prompt, {
        code,
        language,
        systemPrompt: 'You are a technical documentation expert. Always respond with valid JSON only.'
      });

      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return {
        documentation: response,
        format: format as any
      };
    } catch (error: any) {
      console.error('[AIAssistantService] Documentation generation error:', error);
      throw new Error(`Documentation generation failed: ${error.message}`);
    }
  }

  async explainCode(code: string, language: string): Promise<CodeExplanationResult> {
    const prompt = `Explain the following ${language} code in detail. Analyze its purpose, logic, and complexity.

Code:
\`\`\`${language}
${code}
\`\`\`

Respond with a JSON object:
{
  "explanation": "<detailed explanation>",
  "complexity": "low|medium|high",
  "keyPoints": ["<point1>", "<point2>", ...]
}

IMPORTANT: Return ONLY valid JSON.`;

    try {
      const response = await this.aiService.chat(prompt, {
        code,
        language,
        systemPrompt: 'You are a code educator. Always respond with valid JSON only.'
      });

      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return {
        explanation: response,
        complexity: 'medium',
        keyPoints: []
      };
    } catch (error: any) {
      console.error('[AIAssistantService] Code explanation error:', error);
      throw new Error(`Code explanation failed: ${error.message}`);
    }
  }

  async suggestRefactoring(code: string, language: string): Promise<RefactoringSuggestion[]> {
    const prompt = `Analyze the following ${language} code and suggest refactoring improvements.

Code:
\`\`\`${language}
${code}
\`\`\`

Respond with a JSON array of suggestions:
[
  {
    "type": "extract-method|rename|simplify|optimize|pattern",
    "title": "<brief title>",
    "description": "<detailed description>",
    "before": "<code snippet before>",
    "after": "<code snippet after>",
    "impact": "low|medium|high"
  }
]

IMPORTANT: Return ONLY valid JSON array.`;

    try {
      const response = await this.aiService.chat(prompt, {
        code,
        language,
        systemPrompt: 'You are a refactoring expert. Always respond with valid JSON only.'
      });

      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return [];
    } catch (error: any) {
      console.error('[AIAssistantService] Refactoring suggestion error:', error);
      throw new Error(`Refactoring suggestion failed: ${error.message}`);
    }
  }
}
