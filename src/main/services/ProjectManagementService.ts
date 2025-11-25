import { promises as fs } from 'fs';
import * as path from 'path';

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  filePath?: string;
  line?: number;
  createdAt: number;
  updatedAt: number;
}

export interface CodeSnippet {
  id: string;
  name: string;
  description?: string;
  language: string;
  code: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

export interface Bookmark {
  id: string;
  filePath: string;
  line: number;
  label?: string;
  createdAt: number;
}

export class ProjectManagementService {
  private todosFile: string;
  private snippetsFile: string;
  private bookmarksFile: string;

  constructor(private dataDir: string) {
    this.todosFile = path.join(dataDir, 'todos.json');
    this.snippetsFile = path.join(dataDir, 'snippets.json');
    this.bookmarksFile = path.join(dataDir, 'bookmarks.json');
    this.ensureDataDir();
  }

  private async ensureDataDir() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }
  }

  // ==================== TODO管理 ====================
  async getTodos(): Promise<TodoItem[]> {
    try {
      const data = await fs.readFile(this.todosFile, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  async saveTodos(todos: TodoItem[]): Promise<void> {
    await fs.writeFile(this.todosFile, JSON.stringify(todos, null, 2), 'utf-8');
  }

  async addTodo(text: string, priority: 'low' | 'medium' | 'high' = 'medium', filePath?: string, line?: number): Promise<TodoItem> {
    const todos = await this.getTodos();
    const now = Date.now();
    const newTodo: TodoItem = {
      id: `todo-${now}-${Math.random().toString(36).substring(7)}`,
      text,
      completed: false,
      priority,
      filePath,
      line,
      createdAt: now,
      updatedAt: now
    };
    todos.push(newTodo);
    await this.saveTodos(todos);
    return newTodo;
  }

  async updateTodo(id: string, updates: Partial<TodoItem>): Promise<void> {
    const todos = await this.getTodos();
    const index = todos.findIndex(t => t.id === id);
    if (index !== -1) {
      todos[index] = { ...todos[index], ...updates, updatedAt: Date.now() };
      await this.saveTodos(todos);
    }
  }

  async deleteTodo(id: string): Promise<void> {
    const todos = await this.getTodos();
    const filtered = todos.filter(t => t.id !== id);
    await this.saveTodos(filtered);
  }

  async scanFileTodos(rootPath: string): Promise<TodoItem[]> {
    const patterns = [/TODO:/gi, /FIXME:/gi, /HACK:/gi, /XXX:/gi];
    const foundTodos: TodoItem[]= [];
    
    try {
      await this.scanDirectory(rootPath, async (filePath) => {
        try {
          const content = await fs.readFile(filePath, 'utf-8');
          const lines = content.split('\n');
          
          lines.forEach((line, index) => {
            for (const pattern of patterns) {
              if (pattern.test(line)) {
                const match = line.match(/(?:TODO|FIXME|HACK|XXX):\s*(.+)/i);
                if (match) {
                  foundTodos.push({
                    id: `scan-${Date.now()}-${Math.random().toString(36).substring(7)}`,
                    text: match[1].trim(),
                    completed: false,
                    priority: line.toLowerCase().includes('fixme') ? 'high' : 'medium',
                    filePath,
                    line: index + 1,
                    createdAt: Date.now(),
                    updatedAt: Date.now()
                  });
                }
                break;
              }
            }
          });
        } catch (error) {
          // Skip files that can't be read
        }
      });
    } catch (error) {
      console.error('Error scanning for todos:', error);
    }

    return foundTodos;
  }

  private async scanDirectory(dir: string, callback: (filePath: string) => Promise<void>) {
    const excludeDirs = ['node_modules', '.git', 'dist', 'build', '.next', 'coverage'];
    
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          if (!excludeDirs.includes(entry.name)) {
            await this.scanDirectory(fullPath, callback);
          }
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name);
          if (['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.c', '.cpp', '.go', '.rs'].includes(ext)) {
            await callback(fullPath);
          }
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }
  }

  // ==================== 代码片段管理 ====================
  async getSnippets(): Promise<CodeSnippet[]> {
    try {
      const data = await fs.readFile(this.snippetsFile, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  async saveSnippets(snippets: CodeSnippet[]): Promise<void> {
    await fs.writeFile(this.snippetsFile, JSON.stringify(snippets, null, 2), 'utf-8');
  }

  async addSnippet(name: string, code: string, language: string, description?: string, tags: string[] = []): Promise<CodeSnippet> {
    const snippets = await this.getSnippets();
    const now = Date.now();
    const newSnippet: CodeSnippet = {
      id: `snippet-${now}-${Math.random().toString(36).substring(7)}`,
      name,
      description,
      language,
      code,
      tags,
      createdAt: now,
      updatedAt: now
    };
    snippets.push(newSnippet);
    await this.saveSnippets(snippets);
    return newSnippet;
  }

  async updateSnippet(id: string, updates: Partial<CodeSnippet>): Promise<void> {
    const snippets = await this.getSnippets();
    const index = snippets.findIndex(s => s.id === id);
    if (index !== -1) {
      snippets[index] = { ...snippets[index], ...updates, updatedAt: Date.now() };
      await this.saveSnippets(snippets);
    }
  }

  async deleteSnippet(id: string): Promise<void> {
    const snippets = await this.getSnippets();
    const filtered = snippets.filter(s => s.id !== id);
    await this.saveSnippets(filtered);
  }

  async searchSnippets(query: string): Promise<CodeSnippet[]> {
    const snippets = await this.getSnippets();
    const lowerQuery = query.toLowerCase();
    return snippets.filter(s =>
      s.name.toLowerCase().includes(lowerQuery) ||
      s.description?.toLowerCase().includes(lowerQuery) ||
      s.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
      s.code.toLowerCase().includes(lowerQuery)
    );
  }

  // ==================== 书签管理 ====================
  async getBookmarks(): Promise<Bookmark[]> {
    try {
      const data = await fs.readFile(this.bookmarksFile, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  async saveBookmarks(bookmarks: Bookmark[]): Promise<void> {
    await fs.writeFile(this.bookmarksFile, JSON.stringify(bookmarks, null, 2), 'utf-8');
  }

  async addBookmark(filePath: string, line: number, label?: string): Promise<Bookmark> {
    const bookmarks = await this.getBookmarks();
    const newBookmark: Bookmark = {
      id: `bookmark-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      filePath,
      line,
      label,
      createdAt: Date.now()
    };
    bookmarks.push(newBookmark);
    await this.saveBookmarks(bookmarks);
    return newBookmark;
  }

  async deleteBookmark(id: string): Promise<void> {
    const bookmarks = await this.getBookmarks();
    const filtered = bookmarks.filter(b => b.id !== id);
    await this.saveBookmarks(filtered);
  }

  async getBookmarksForFile(filePath: string): Promise<Bookmark[]> {
    const bookmarks = await this.getBookmarks();
    return bookmarks.filter(b => b.filePath === filePath);
  }
}
