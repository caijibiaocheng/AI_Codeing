import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import type Store from 'electron-store';

export class AIService {
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

    if (!apiKey) {
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

  private buildSystemPrompt(context?: any): string {
    let systemPrompt = 'You are an AI coding assistant. Help users with programming tasks.';
    
    if (context?.memory) {
      systemPrompt += `\n\n${context.memory}`;
    }
    
    return systemPrompt;
  }

  private buildOpenAIMessages(message: string, context?: any) {
    const messages: any[] = [
      { role: 'system', content: this.buildSystemPrompt(context) }
    ];

    if (context?.code) {
      messages.push({
        role: 'user',
        content: `Here's the code context:\n\`\`\`\n${context.code}\n\`\`\``
      });
    }

    messages.push({ role: 'user', content: message });
    return messages;
  }

  private buildAnthropicMessages(message: string, context?: any) {
    const messages: any[] = [];
    
    let userContent = message;
    if (context?.code) {
      userContent = `Here's the code context:\n\`\`\`\n${context.code}\n\`\`\`\n\n${message}`;
    }
    
    messages.push({
      role: 'user',
      content: userContent
    });

    return messages;
  }

  private ensureClientAvailable() {
    if (!this.openai && !this.anthropic) {
      throw new Error('AI provider not configured. Please set API key and model before chatting.');
    }
  }

  async chat(message: string, context?: any): Promise<string> {
    const provider = this.store.get('ai.provider', 'openai') as string;
    const model = this.store.get('ai.model', 'gpt-4') as string;
    const temperature = this.store.get('ai.temperature', 0.7) as number;
    const maxTokens = this.store.get('ai.maxTokens', 2048) as number;

    this.ensureClientAvailable();

    try {
      if ((provider === 'openai' || provider === 'azure') && this.openai) {
        const messages = this.buildOpenAIMessages(message, context);

        const response = await this.openai.chat.completions.create({
          model,
          messages,
          temperature,
          max_tokens: maxTokens || undefined
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
          throw new Error('Empty response from OpenAI');
        }
        return content;
      } else if (provider === 'anthropic' && this.anthropic) {
        const messages = this.buildAnthropicMessages(message, context);
        // Type assertion needed due to incomplete type definitions in @anthropic-ai/sdk@0.9.0
        const response = await (this.anthropic as any).messages.create({
          model: model || 'claude-3-5-sonnet-20241022',
          max_tokens: maxTokens || 4096,
          temperature: temperature ?? 0.7,
          system: this.buildSystemPrompt(context),
          messages
        });

        const textContent = response.content.find(block => block.type === 'text');
        if (!textContent || textContent.type !== 'text') {
          throw new Error('No text content in Anthropic response');
        }
        return textContent.text;
      }

      throw new Error('AI provider not configured. Please set API key and model before chatting.');
    } catch (error: any) {
      console.error('[AIService] Chat error:', error);
      throw new Error(`AI request failed: ${error.message || 'Unknown error'}`);
    }
  }

  async streamChat(
    message: string,
    context: any,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    const provider = this.store.get('ai.provider', 'openai') as string;
    const model = this.store.get('ai.model', 'gpt-4') as string;
    const temperature = this.store.get('ai.temperature', 0.7) as number;
    const maxTokens = this.store.get('ai.maxTokens', 2048) as number;

    this.ensureClientAvailable();

    try {
      if ((provider === 'openai' || provider === 'azure') && this.openai) {
        const messages = this.buildOpenAIMessages(message, context);

        const stream = await this.openai.chat.completions.create({
          model,
          messages,
          stream: true,
          temperature,
          max_tokens: maxTokens || undefined
        });

        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content;
          if (content) {
            onChunk(content);
          }
        }
      } else if (provider === 'anthropic' && this.anthropic) {
        const messages = this.buildAnthropicMessages(message, context);
        // Type assertion needed due to incomplete type definitions in @anthropic-ai/sdk@0.9.0
        const stream = await (this.anthropic as any).messages.create({
          model: model || 'claude-3-5-sonnet-20241022',
          max_tokens: maxTokens || 4096,
          temperature: temperature ?? 0.7,
          system: this.buildSystemPrompt(context),
          messages,
          stream: true
        });

        for await (const event of stream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            onChunk(event.delta.text);
          }
        }
      } else {
        throw new Error('AI provider not configured. Please set API key and model before chatting.');
      }
    } catch (error: any) {
      console.error('[AIService] Stream chat error:', error);
      throw new Error(`AI streaming failed: ${error.message || 'Unknown error'}`);
    }
  }

  updateConfig() {
    this.initializeClients();
  }
}
