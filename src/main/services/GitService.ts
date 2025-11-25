import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface GitStatus {
  branch: string;
  ahead: number;
  behind: number;
  staged: GitFileStatus[];
  unstaged: GitFileStatus[];
  untracked: string[];
}

export interface GitFileStatus {
  path: string;
  status: 'modified' | 'added' | 'deleted' | 'renamed';
  oldPath?: string;
}

export interface GitCommit {
  hash: string;
  author: string;
  date: string;
  message: string;
}

export interface GitBranch {
  name: string;
  current: boolean;
  remote?: boolean;
}

export interface GitBlame {
  line: number;
  hash: string;
  author: string;
  date: string;
  content: string;
}

export interface GitStash {
  index: number;
  name: string;
  branch: string;
  message: string;
}

export class GitService {
  async getStatus(rootPath: string): Promise<GitStatus> {
    try {
      const { stdout } = await execAsync('git status --porcelain -b', { cwd: rootPath });
      return this.parseStatus(stdout);
    } catch (error: any) {
      throw new Error(`Failed to get git status: ${error.message}`);
    }
  }

  async stageFile(rootPath: string, filePath: string): Promise<void> {
    try {
      await execAsync(`git add "${filePath}"`, { cwd: rootPath });
    } catch (error: any) {
      throw new Error(`Failed to stage file: ${error.message}`);
    }
  }

  async unstageFile(rootPath: string, filePath: string): Promise<void> {
    try {
      await execAsync(`git reset HEAD "${filePath}"`, { cwd: rootPath });
    } catch (error: any) {
      throw new Error(`Failed to unstage file: ${error.message}`);
    }
  }

  async stageAll(rootPath: string): Promise<void> {
    try {
      await execAsync('git add -A', { cwd: rootPath });
    } catch (error: any) {
      throw new Error(`Failed to stage all files: ${error.message}`);
    }
  }

  async commit(rootPath: string, message: string): Promise<void> {
    if (!message || message.trim() === '') {
      throw new Error('Commit message cannot be empty');
    }

    try {
      const escapedMessage = message.replace(/"/g, '\\"');
      await execAsync(`git commit -m "${escapedMessage}"`, { cwd: rootPath });
    } catch (error: any) {
      throw new Error(`Failed to commit: ${error.message}`);
    }
  }

  async push(rootPath: string, remote: string = 'origin', branch?: string): Promise<void> {
    try {
      const cmd = branch ? `git push ${remote} ${branch}` : `git push`;
      await execAsync(cmd, { cwd: rootPath });
    } catch (error: any) {
      throw new Error(`Failed to push: ${error.message}`);
    }
  }

  async pull(rootPath: string, remote: string = 'origin', branch?: string): Promise<void> {
    try {
      const cmd = branch ? `git pull ${remote} ${branch}` : `git pull`;
      await execAsync(cmd, { cwd: rootPath });
    } catch (error: any) {
      throw new Error(`Failed to pull: ${error.message}`);
    }
  }

  async getBranches(rootPath: string): Promise<GitBranch[]> {
    try {
      const { stdout } = await execAsync('git branch -a', { cwd: rootPath });
      return this.parseBranches(stdout);
    } catch (error: any) {
      throw new Error(`Failed to get branches: ${error.message}`);
    }
  }

  async createBranch(rootPath: string, branchName: string): Promise<void> {
    try {
      await execAsync(`git branch "${branchName}"`, { cwd: rootPath });
    } catch (error: any) {
      throw new Error(`Failed to create branch: ${error.message}`);
    }
  }

  async checkoutBranch(rootPath: string, branchName: string): Promise<void> {
    try {
      await execAsync(`git checkout "${branchName}"`, { cwd: rootPath });
    } catch (error: any) {
      throw new Error(`Failed to checkout branch: ${error.message}`);
    }
  }

  async deleteBranch(rootPath: string, branchName: string, force: boolean = false): Promise<void> {
    try {
      const flag = force ? '-D' : '-d';
      await execAsync(`git branch ${flag} "${branchName}"`, { cwd: rootPath });
    } catch (error: any) {
      throw new Error(`Failed to delete branch: ${error.message}`);
    }
  }

  async getLog(rootPath: string, limit: number = 50): Promise<GitCommit[]> {
    try {
      const { stdout } = await execAsync(
        `git log --pretty=format:"%H|%an|%ad|%s" --date=iso -${limit}`,
        { cwd: rootPath }
      );
      return this.parseLog(stdout);
    } catch (error: any) {
      throw new Error(`Failed to get log: ${error.message}`);
    }
  }

  async getDiff(rootPath: string, filePath?: string): Promise<string> {
    try {
      const cmd = filePath
        ? `git diff HEAD "${filePath}"`
        : 'git diff HEAD';
      const { stdout } = await execAsync(cmd, { cwd: rootPath });
      return stdout;
    } catch (error: any) {
      throw new Error(`Failed to get diff: ${error.message}`);
    }
  }

  private parseStatus(output: string): GitStatus {
    const lines = output.split('\n').filter(line => line.trim());
    const branchLine = lines[0];
    const fileLines = lines.slice(1);

    // Parse branch info
    let branch = 'unknown';
    let ahead = 0;
    let behind = 0;

    if (branchLine.startsWith('##')) {
      const branchInfo = branchLine.substring(3);
      const match = branchInfo.match(/^([^\s.]+)(?:\.\.\.([^\s]+))?(?: \[(ahead (\d+))?(, )?(behind (\d+))?\])?/);
      if (match) {
        branch = match[1];
        if (match[3]) ahead = parseInt(match[3], 10);
        if (match[6]) behind = parseInt(match[6], 10);
      }
    }

    // Parse file statuses
    const staged: GitFileStatus[] = [];
    const unstaged: GitFileStatus[] = [];
    const untracked: string[] = [];

    for (const line of fileLines) {
      if (line.length < 4) continue;

      const indexStatus = line[0];
      const workingStatus = line[1];
      const filePath = line.substring(3);

      if (indexStatus === '?' && workingStatus === '?') {
        untracked.push(filePath);
        continue;
      }

      if (indexStatus !== ' ' && indexStatus !== '?') {
        staged.push({
          path: filePath,
          status: this.getFileStatus(indexStatus)
        });
      }

      if (workingStatus !== ' ' && workingStatus !== '?') {
        unstaged.push({
          path: filePath,
          status: this.getFileStatus(workingStatus)
        });
      }
    }

    return { branch, ahead, behind, staged, unstaged, untracked };
  }

  private getFileStatus(statusCode: string): 'modified' | 'added' | 'deleted' | 'renamed' {
    switch (statusCode) {
      case 'M':
        return 'modified';
      case 'A':
        return 'added';
      case 'D':
        return 'deleted';
      case 'R':
        return 'renamed';
      default:
        return 'modified';
    }
  }

  private parseBranches(output: string): GitBranch[] {
    const lines = output.split('\n').filter(line => line.trim());
    return lines.map(line => {
      const trimmed = line.trim();
      const current = trimmed.startsWith('*');
      const remote = trimmed.includes('remotes/');
      const name = trimmed.replace(/^\*\s+/, '').replace('remotes/', '');
      return { name, current, remote };
    });
  }

  private parseLog(output: string): GitCommit[] {
    const lines = output.split('\n').filter(line => line.trim());
    return lines.map(line => {
      const [hash, author, date, ...messageParts] = line.split('|');
      return {
        hash: hash.substring(0, 8),
        author,
        date,
        message: messageParts.join('|')
      };
    });
  }

  // Git Blame
  async getBlame(rootPath: string, filePath: string): Promise<GitBlame[]> {
    try {
      const { stdout } = await execAsync(
        `git blame --line-porcelain "${filePath}"`,
        { cwd: rootPath }
      );
      return this.parseBlame(stdout);
    } catch (error: any) {
      throw new Error(`Failed to get blame: ${error.message}`);
    }
  }

  private parseBlame(output: string): GitBlame[] {
    const lines = output.split('\n');
    const blameData: GitBlame[] = [];
    let currentCommit: any = {};
    let lineNumber = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.match(/^[0-9a-f]{40}/)) {
        const parts = line.split(' ');
        currentCommit.hash = parts[0].substring(0, 8);
        lineNumber = parseInt(parts[2], 10);
      } else if (line.startsWith('author ')) {
        currentCommit.author = line.substring(7);
      } else if (line.startsWith('author-time ')) {
        const timestamp = parseInt(line.substring(12), 10);
        currentCommit.date = new Date(timestamp * 1000).toISOString();
      } else if (line.startsWith('\t')) {
        blameData.push({
          line: lineNumber,
          hash: currentCommit.hash,
          author: currentCommit.author,
          date: currentCommit.date,
          content: line.substring(1)
        });
        currentCommit = {};
      }
    }

    return blameData;
  }

  // Git Stash
  async stashSave(rootPath: string, message?: string): Promise<void> {
    try {
      const cmd = message 
        ? `git stash save "${message.replace(/"/g, '\\"')}"`
        : 'git stash save';
      await execAsync(cmd, { cwd: rootPath });
    } catch (error: any) {
      throw new Error(`Failed to save stash: ${error.message}`);
    }
  }

  async stashList(rootPath: string): Promise<GitStash[]> {
    try {
      const { stdout } = await execAsync('git stash list', { cwd: rootPath });
      return this.parseStashList(stdout);
    } catch (error: any) {
      throw new Error(`Failed to list stashes: ${error.message}`);
    }
  }

  async stashApply(rootPath: string, index: number): Promise<void> {
    try {
      await execAsync(`git stash apply stash@{${index}}`, { cwd: rootPath });
    } catch (error: any) {
      throw new Error(`Failed to apply stash: ${error.message}`);
    }
  }

  async stashPop(rootPath: string, index?: number): Promise<void> {
    try {
      const cmd = index !== undefined 
        ? `git stash pop stash@{${index}}`
        : 'git stash pop';
      await execAsync(cmd, { cwd: rootPath });
    } catch (error: any) {
      throw new Error(`Failed to pop stash: ${error.message}`);
    }
  }

  async stashDrop(rootPath: string, index: number): Promise<void> {
    try {
      await execAsync(`git stash drop stash@{${index}}`, { cwd: rootPath });
    } catch (error: any) {
      throw new Error(`Failed to drop stash: ${error.message}`);
    }
  }

  async stashClear(rootPath: string): Promise<void> {
    try {
      await execAsync('git stash clear', { cwd: rootPath });
    } catch (error: any) {
      throw new Error(`Failed to clear stash: ${error.message}`);
    }
  }

  private parseStashList(output: string): GitStash[] {
    const lines = output.split('\n').filter(line => line.trim());
    return lines.map((line, idx) => {
      // 匹配格式: stash@{0}: WIP on branch: message
      // 或: stash@{0}: On branch: message
      // 或: stash@{0}: branch: message (自定义消息)
      const match = line.match(/^stash@\{(\d+)\}:\s+(?:(?:WIP on|On)\s+)?([^:]+):\s*(.*)$/);
      if (match) {
        return {
          index: parseInt(match[1], 10),
          name: `stash@{${match[1]}}`,
          branch: match[2].trim(),
          message: match[3].trim() || 'No message'
        };
      }
      // 备用解析：简单格式
      const simpleMatch = line.match(/^stash@\{(\d+)\}:\s*(.*)$/);
      if (simpleMatch) {
        return {
          index: parseInt(simpleMatch[1], 10),
          name: `stash@{${simpleMatch[1]}}`,
          branch: 'unknown',
          message: simpleMatch[2].trim() || 'No message'
        };
      }
      return {
        index: idx,
        name: `stash@{${idx}}`,
        branch: 'unknown',
        message: line.trim() || 'No message'
      };
    });
  }

  // Git Show (for viewing stash or commit content)
  async showStash(rootPath: string, index: number): Promise<string> {
    try {
      const { stdout } = await execAsync(`git stash show -p stash@{${index}}`, { cwd: rootPath });
      return stdout;
    } catch (error: any) {
      throw new Error(`Failed to show stash: ${error.message}`);
    }
  }

  async showCommit(rootPath: string, hash: string): Promise<string> {
    try {
      const { stdout } = await execAsync(`git show ${hash}`, { cwd: rootPath });
      return stdout;
    } catch (error: any) {
      throw new Error(`Failed to show commit: ${error.message}`);
    }
  }
}
