import type Store from 'electron-store';
import { spawn, ChildProcess } from 'child_process';

interface MCPServer {
  id: string;
  name: string;
  command: string;
  args: string[];
  enabled: boolean;
  process?: ChildProcess;
}

export class MCPService {
  private store: Store;
  private servers: Map<string, MCPServer> = new Map();
  private processCleanupHandlers: Map<string, () => void> = new Map();

  constructor(store: Store) {
    this.store = store;
    this.loadServers();
  }

  private loadServers() {
    try {
      const servers = this.store.get('mcp.servers', []) as MCPServer[];
      servers.forEach(server => {
        if (this.validateServerConfig(server)) {
          this.servers.set(server.id, server);
          if (server.enabled) {
            this.startServer(server.id);
          }
        } else {
          console.warn(`[MCPService] Invalid server configuration: ${server.id}`);
        }
      });
    } catch (error: any) {
      console.error('[MCPService] Failed to load servers:', error);
    }
  }

  private validateServerConfig(server: any): boolean {
    return (
      typeof server.id === 'string' &&
      typeof server.name === 'string' &&
      typeof server.command === 'string' &&
      Array.isArray(server.args) &&
      typeof server.enabled === 'boolean'
    );
  }

  private saveServers() {
    try {
      const servers = Array.from(this.servers.values()).map(({ process, ...rest }) => rest);
      this.store.set('mcp.servers', servers);
    } catch (error: any) {
      console.error('[MCPService] Failed to save servers:', error);
    }
  }

  listServers(): MCPServer[] {
    return Array.from(this.servers.values()).map(({ process, ...rest }) => rest);
  }

  addServer(config: Omit<MCPServer, 'id'>): string {
    const id = `mcp-${Date.now()}`;
    const server: MCPServer = { ...config, id };
    
    if (!this.validateServerConfig(server)) {
      throw new Error('Invalid server configuration');
    }

    this.servers.set(id, server);
    this.saveServers();

    if (server.enabled) {
      this.startServer(id);
    }

    console.log(`[MCPService] Server added: ${id} (${server.name})`);
    return id;
  }

  removeServer(serverId: string): boolean {
    const server = this.servers.get(serverId);
    if (!server) {
      console.warn(`[MCPService] Server not found: ${serverId}`);
      return false;
    }

    this.stopServer(serverId);
    this.servers.delete(serverId);
    this.saveServers();
    
    console.log(`[MCPService] Server removed: ${serverId} (${server.name})`);
    return true;
  }

  private startServer(serverId: string) {
    const server = this.servers.get(serverId);
    if (!server) {
      console.error(`[MCPService] Cannot start: server ${serverId} not found`);
      return;
    }

    if (server.process) {
      console.warn(`[MCPService] Server ${server.name} is already running`);
      return;
    }

    try {
      console.log(`[MCPService] Starting server: ${server.name} (${server.command} ${server.args.join(' ')})`);
      
      const process = spawn(server.command, server.args, {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      process.on('error', (error) => {
        console.error(`[MCPService] Server ${server.name} error:`, error);
        this.cleanupProcess(serverId);
      });

      process.on('exit', (code, signal) => {
        console.log(`[MCPService] Server ${server.name} exited (code: ${code}, signal: ${signal})`);
        this.cleanupProcess(serverId);
      });

      process.stderr?.on('data', (data) => {
        console.error(`[MCPService] ${server.name} stderr:`, data.toString());
      });

      server.process = process;
      this.servers.set(serverId, server);
      
      console.log(`[MCPService] Server ${server.name} started successfully`);
    } catch (error: any) {
      console.error(`[MCPService] Failed to start server ${server.name}:`, error);
    }
  }

  private cleanupProcess(serverId: string) {
    const server = this.servers.get(serverId);
    if (server?.process) {
      delete server.process;
      this.servers.set(serverId, server);
    }
    this.processCleanupHandlers.delete(serverId);
  }

  private stopServer(serverId: string) {
    const server = this.servers.get(serverId);
    if (!server) {
      console.warn(`[MCPService] Cannot stop: server ${serverId} not found`);
      return;
    }

    if (server.process) {
      console.log(`[MCPService] Stopping server: ${server.name}`);
      try {
        server.process.kill('SIGTERM');
        
        setTimeout(() => {
          if (server.process && !server.process.killed) {
            console.warn(`[MCPService] Force killing server: ${server.name}`);
            server.process.kill('SIGKILL');
          }
        }, 5000);
      } catch (error: any) {
        console.error(`[MCPService] Error stopping server ${server.name}:`, error);
      }
      
      this.cleanupProcess(serverId);
    }
  }

  async callTool(serverId: string, toolName: string, params: any): Promise<any> {
    const server = this.servers.get(serverId);
    if (!server) {
      throw new Error(`Server ${serverId} not found`);
    }

    if (!server.process) {
      throw new Error(`Server ${server.name} is not running`);
    }

    if (!toolName || typeof toolName !== 'string') {
      throw new Error('Invalid tool name');
    }

    console.log(`[MCPService] Calling tool: ${toolName} on server ${server.name}`);

    return new Promise((resolve, reject) => {
      const request = {
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'tools/call',
        params: {
          name: toolName,
          arguments: params
        }
      };

      let responseData = '';

      const timeout = setTimeout(() => {
        cleanup();
        reject(new Error(`MCP tool call timeout (${toolName})`));
      }, 30000);

      const cleanup = () => {
        clearTimeout(timeout);
        server.process?.stdout?.removeAllListeners('data');
        server.process?.stderr?.removeAllListeners('data');
      };

      server.process!.stdout?.on('data', (data) => {
        responseData += data.toString();
        try {
          const response = JSON.parse(responseData);
          cleanup();
          
          if (response.error) {
            console.error(`[MCPService] Tool call error:`, response.error);
            reject(new Error(response.error.message || 'MCP tool call failed'));
          } else {
            console.log(`[MCPService] Tool call successful: ${toolName}`);
            resolve(response.result);
          }
        } catch {
          // Incomplete JSON, wait for more data
        }
      });

      server.process!.stderr?.on('data', (data) => {
        console.error(`[MCPService] Tool call stderr:`, data.toString());
      });

      try {
        server.process!.stdin?.write(JSON.stringify(request) + '\n');
      } catch (error: any) {
        cleanup();
        reject(new Error(`Failed to send request: ${error.message}`));
      }
    });
  }

  shutdown() {
    console.log('[MCPService] Shutting down all servers');
    for (const [serverId, server] of this.servers.entries()) {
      if (server.process) {
        this.stopServer(serverId);
      }
    }
  }
}
