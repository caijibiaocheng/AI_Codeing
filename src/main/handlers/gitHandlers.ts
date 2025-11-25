/**
 * Git 操作相关的 IPC handlers
 */
import { ipcMain } from 'electron';
import { exec } from 'child_process';
import { promisify } from 'util';
import { GitService } from '../services/GitService';

const execAsync = promisify(exec);

export function registerGitHandlers(gitService: GitService) {
  // Git 状态
  ipcMain.handle('git-status', async (_, rootPath: string) => {
    try {
      const status = await gitService.getStatus(rootPath);
      return { success: true, data: status };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // 暂存文件
  ipcMain.handle('git-stage-file', async (_, rootPath: string, filePath: string) => {
    try {
      await gitService.stageFile(rootPath, filePath);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // 取消暂存文件
  ipcMain.handle('git-unstage-file', async (_, rootPath: string, filePath: string) => {
    try {
      await gitService.unstageFile(rootPath, filePath);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // 暂存所有文件
  ipcMain.handle('git-stage-all', async (_, rootPath: string) => {
    try {
      await gitService.stageAll(rootPath);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // 提交
  ipcMain.handle('git-commit', async (_, rootPath: string, message: string) => {
    try {
      await gitService.commit(rootPath, message);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // 推送
  ipcMain.handle('git-push', async (_, rootPath: string, remote?: string, branch?: string) => {
    try {
      await gitService.push(rootPath, remote, branch);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // 拉取
  ipcMain.handle('git-pull', async (_, rootPath: string, remote?: string, branch?: string) => {
    try {
      await gitService.pull(rootPath, remote, branch);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // 获取分支列表
  ipcMain.handle('git-branches', async (_, rootPath: string) => {
    try {
      const branches = await gitService.getBranches(rootPath);
      return { success: true, data: branches };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // 创建分支
  ipcMain.handle('git-create-branch', async (_, rootPath: string, branchName: string) => {
    try {
      await gitService.createBranch(rootPath, branchName);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // 切换分支
  ipcMain.handle('git-checkout-branch', async (_, rootPath: string, branchName: string) => {
    try {
      await gitService.checkoutBranch(rootPath, branchName);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // 删除分支
  ipcMain.handle('git-delete-branch', async (_, rootPath: string, branchName: string, force: boolean) => {
    try {
      await gitService.deleteBranch(rootPath, branchName, force);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // 获取提交历史
  ipcMain.handle('git-log', async (_, rootPath: string, limit?: number) => {
    try {
      const log = await gitService.getLog(rootPath, limit);
      return { success: true, data: log };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // 获取差异
  ipcMain.handle('git-diff', async (_, rootPath: string, filePath?: string) => {
    try {
      const diff = await gitService.getDiff(rootPath, filePath);
      return { success: true, data: diff };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // 获取 Git Diff (旧版兼容)
  ipcMain.handle('get-git-diff', async (_, rootPath: string, filePath: string) => {
    try {
      const { stdout } = await execAsync(`git diff HEAD "${filePath}"`, { cwd: rootPath });
      return { success: true, diff: stdout };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // Git Blame
  ipcMain.handle('git-blame', async (_, rootPath: string, filePath: string) => {
    try {
      const blame = await gitService.getBlame(rootPath, filePath);
      return { success: true, data: blame };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // Git Stash - Save
  ipcMain.handle('git-stash-save', async (_, rootPath: string, message?: string) => {
    try {
      await gitService.stashSave(rootPath, message);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // Git Stash - List
  ipcMain.handle('git-stash-list', async (_, rootPath: string) => {
    try {
      const stashes = await gitService.stashList(rootPath);
      return { success: true, data: stashes };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // Git Stash - Apply
  ipcMain.handle('git-stash-apply', async (_, rootPath: string, index: number) => {
    try {
      await gitService.stashApply(rootPath, index);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // Git Stash - Pop
  ipcMain.handle('git-stash-pop', async (_, rootPath: string, index?: number) => {
    try {
      await gitService.stashPop(rootPath, index);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // Git Stash - Drop
  ipcMain.handle('git-stash-drop', async (_, rootPath: string, index: number) => {
    try {
      await gitService.stashDrop(rootPath, index);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // Git Stash - Clear
  ipcMain.handle('git-stash-clear', async (_, rootPath: string) => {
    try {
      await gitService.stashClear(rootPath);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // Git Show Stash
  ipcMain.handle('git-show-stash', async (_, rootPath: string, index: number) => {
    try {
      const content = await gitService.showStash(rootPath, index);
      return { success: true, data: content };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // Git Show Commit
  ipcMain.handle('git-show-commit', async (_, rootPath: string, hash: string) => {
    try {
      const content = await gitService.showCommit(rootPath, hash);
      return { success: true, data: content };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });
}
