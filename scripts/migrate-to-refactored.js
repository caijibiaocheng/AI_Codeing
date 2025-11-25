/**
 * 迁移脚本：将项目迁移到重构后的代码结构
 * 
 * 使用方法：
 *   node scripts/migrate-to-refactored.js
 * 
 * 此脚本会：
 * 1. 备份原始文件
 * 2. 用重构后的版本替换
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const backupDir = path.join(rootDir, 'backup');

const filesToMigrate = [
  {
    original: 'src/main/main.ts',
    refactored: 'src/main/main.refactored.ts',
    backup: 'src/main/main.backup.ts'
  },
  {
    original: 'src/renderer/App.tsx',
    refactored: 'src/renderer/App.refactored.tsx',
    backup: 'src/renderer/App.backup.tsx'
  }
];

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function migrate() {
  console.log('🚀 开始迁移到重构后的代码结构...\n');
  
  ensureDir(backupDir);
  
  for (const file of filesToMigrate) {
    const originalPath = path.join(rootDir, file.original);
    const refactoredPath = path.join(rootDir, file.refactored);
    const backupPath = path.join(rootDir, file.backup);
    
    // 检查重构文件是否存在
    if (!fs.existsSync(refactoredPath)) {
      console.log(`⚠️  跳过 ${file.original}: 重构文件不存在`);
      continue;
    }
    
    // 备份原始文件
    if (fs.existsSync(originalPath)) {
      fs.copyFileSync(originalPath, backupPath);
      console.log(`📦 备份: ${file.original} -> ${file.backup}`);
    }
    
    // 替换为重构版本
    fs.copyFileSync(refactoredPath, originalPath);
    console.log(`✅ 迁移: ${file.refactored} -> ${file.original}`);
  }
  
  console.log('\n✨ 迁移完成！');
  console.log('\n注意事项：');
  console.log('1. 原始文件已备份为 .backup.ts/.tsx');
  console.log('2. 如果出现问题，可以将备份文件恢复');
  console.log('3. 运行 npm run dev 测试更改');
}

function rollback() {
  console.log('🔄 开始回滚到原始代码...\n');
  
  for (const file of filesToMigrate) {
    const originalPath = path.join(rootDir, file.original);
    const backupPath = path.join(rootDir, file.backup);
    
    if (fs.existsSync(backupPath)) {
      fs.copyFileSync(backupPath, originalPath);
      console.log(`✅ 回滚: ${file.backup} -> ${file.original}`);
    } else {
      console.log(`⚠️  跳过 ${file.original}: 备份文件不存在`);
    }
  }
  
  console.log('\n✨ 回滚完成！');
}

// 命令行参数处理
const args = process.argv.slice(2);
if (args.includes('--rollback') || args.includes('-r')) {
  rollback();
} else {
  migrate();
}
