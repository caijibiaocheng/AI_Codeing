import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import type Store from 'electron-store';

interface CompletionContext {
  code: string;
  cursorPosition: number;
  language: string;
  filename?: string;
  prefix?: string;
  suffix?: string;
}

export class AICompletionService {
  private store: Store;
  private openai: OpenAI | null = null;
  private anthropic: Anthropic | null = null;

  constructor(store: Store) {
    this.store = store;
    this.initializeClients();
  }

  private initializeClients() {
    this.openai = null;
    this.anthropic = null;

    const provider = this.store.get('ai.provider', 'openai') as string;
    const apiKey = this.store.get('ai.apiKey') as string;
    const enabled = this.store.get('completion.enabled', true) as boolean;

    if (!apiKey || !enabled) {
      return;
    }

    if (provider === 'openai') {
      this.openai = new OpenAI({ apiKey });
      return;
    }

    if (provider === 'azure') {
      const endpoint = (this.store.get('ai.azureEndpoint') as string)?.replace(/\/$/, '');
      const apiVersion = this.store.get('ai.azureApiVersion', '2024-02-15-preview') as string;
      const deployment = this.store.get('ai.model', 'gpt-4') as string;

      if (!endpoint || !deployment) {
        return;
      }

      this.openai = new OpenAI({
        apiKey,
        baseURL: `${endpoint}/openai/deployments/${deployment}`,
        defaultHeaders: { 'api-key': apiKey },
        defaultQuery: { 'api-version': apiVersion }
      });
      return;
    }

    if (provider === 'anthropic') {
      this.anthropic = new Anthropic({ apiKey });
    }
  }

  private buildPrompt(context: CompletionContext): string {
    const { prefix, suffix, language, filename } = context;
    
    let prompt = `You are an AI code completion assistant. Complete the code based on the context provided.\n\n`;
    
    if (filename) {
      prompt += `File: ${filename}\n`;
    }
    
    if (language) {
      prompt += `Language: ${language}\n\n`;
    }
    
    prompt += `Code before cursor:\n\`\`\`${language}\n${prefix}\n\`\`\`\n\n`;
    
    if (suffix && suffix.trim()) {
      prompt += `Code after cursor:\n\`\`\`${language}\n${suffix}\n\`\`\`\n\n`;
    }
    
    prompt += `Complete the code at the cursor position. Only return the completion code without any explanation or markdown. Keep it concise and contextually appropriate.`;
    
    return prompt;
  }

  async getCompletion(context: CompletionContext): Promise<string | null> {
    const enabled = this.store.get('completion.enabled', true) as boolean;
    if (!enabled) {
      return null;
    }

    const provider = this.store.get('ai.provider', 'openai') as string;
    const model = this.store.get('ai.model', 'gpt-4') as string;
    const temperature = this.store.get('completion.temperature', 0.2) as number;
    const maxTokens = this.store.get('completion.maxTokens', 150) as number;

    if (!this.openai && !this.anthropic) {
      return null;
    }

    try {
      if ((provider === 'openai' || provider === 'azure') && this.openai) {
        const response = await this.openai.chat.completions.create({
          model,
          messages: [
            {
              role: 'system',
              content: 'You are an expert code completion assistant. Provide concise, accurate code completions.'
            },
            {
              role: 'user',
              content: this.buildPrompt(context)
            }
          ],
          temperature,
          max_tokens: maxTokens,
          stream: false
        });

        const completion = response.choices[0]?.message?.content;
        return completion ? this.cleanCompletion(completion) : null;
      } else if (provider === 'anthropic' && this.anthropic) {
        const response = await (this.anthropic as any).messages.create({
          model: model || 'claude-3-5-sonnet-20241022',
          max_tokens: maxTokens,
          temperature,
          messages: [
            {
              role: 'user',
              content: this.buildPrompt(context)
            }
          ]
        });

        const textContent = response.content.find((block: any) => block.type === 'text');
        if (!textContent || textContent.type !== 'text') {
          return null;
        }
        return this.cleanCompletion(textContent.text);
      }

      return null;
    } catch (error: any) {
      console.error('[AICompletionService] Error:', error);
      return null;
    }
  }

  private cleanCompletion(completion: string): string {
    // Remove markdown code blocks if present
    let cleaned = completion.replace(/^```[\w]*\n?/gm, '').replace(/```$/gm, '');
    
    // Remove leading/trailing whitespace
    cleaned = cleaned.trim();
    
    // If the completion starts with common prefixes, remove them
    const prefixesToRemove = [
      'Here is the completion:',
      'Here\'s the completion:',
      'Completion:',
      'The completion is:'
    ];
    
    for (const prefix of prefixesToRemove) {
      if (cleaned.toLowerCase().startsWith(prefix.toLowerCase())) {
        cleaned = cleaned.substring(prefix.length).trim();
      }
    }
    
    return cleaned;
  }

  updateConfig() {
    this.initializeClients();
  }
}
