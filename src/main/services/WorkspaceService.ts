import type Store from 'electron-store';

export interface Workspace {
  name: string;
  path: string;
  lastOpened: number;
  openFiles: string[];
  activeFile?: string;
}

export class WorkspaceService {
  private store: Store;

  constructor(store: Store) {
    this.store = store;
  }

  getWorkspaces(): Workspace[] {
    return (this.store.get('workspaces', []) as Workspace[]).sort(
      (a, b) => b.lastOpened - a.lastOpened
    );
  }

  getWorkspace(path: string): Workspace | undefined {
    const workspaces = this.getWorkspaces();
    return workspaces.find(w => w.path === path);
  }

  saveWorkspace(workspace: Workspace): void {
    const workspaces = this.getWorkspaces();
    const index = workspaces.findIndex(w => w.path === workspace.path);
    
    if (index >= 0) {
      workspaces[index] = workspace;
    } else {
      workspaces.push(workspace);
    }
    
    this.store.set('workspaces', workspaces);
  }

  updateWorkspace(path: string, updates: Partial<Workspace>): void {
    const workspace = this.getWorkspace(path);
    if (workspace) {
      this.saveWorkspace({ ...workspace, ...updates, lastOpened: Date.now() });
    }
  }

  deleteWorkspace(path: string): void {
    const workspaces = this.getWorkspaces();
    this.store.set('workspaces', workspaces.filter(w => w.path !== path));
  }

  getRecentWorkspaces(limit: number = 10): Workspace[] {
    return this.getWorkspaces().slice(0, limit);
  }
}
