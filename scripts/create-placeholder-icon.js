const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, '../assets');

if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

const size = 256;
const canvas = `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="40" fill="url(#grad)"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="120" font-weight="bold" 
        fill="white" text-anchor="middle" dominant-baseline="central">AI</text>
  <circle cx="${size - 40}" cy="40" r="20" fill="#4ade80"/>
</svg>
`;

fs.writeFileSync(path.join(assetsDir, 'icon.svg'), canvas);
console.log('✓ 已创建占位符图标: assets/icon.svg');

const readmePath = path.join(assetsDir, 'ICON-NOTICE.txt');
fs.writeFileSync(readmePath, `
临时占位符图标已创建！

当前使用的是 SVG 格式的占位符图标。

要正式打包，你需要：
1. 准备一张 1024x1024 的 PNG 图片
2. 访问 https://www.icoconverter.com/
3. 转换为 .ico（Windows）、.icns（macOS）、.png（Linux）
4. 将文件放入此目录

或者使用命令行工具：
npm install -g electron-icon-builder
electron-icon-builder --input=./your-icon.png --output=./assets --flatten

如果你想立即打包测试，请临时注释掉 package.json 中的 icon 配置项。
`);

console.log('✓ 已创建图标说明: assets/ICON-NOTICE.txt');
console.log('\n提示：SVG 图标不能直接用于打包。');
console.log('      请按照 assets/图标说明.md 准备正确格式的图标。');
console.log('      或临时禁用 package.json 中的 icon 配置来快速测试打包。');
