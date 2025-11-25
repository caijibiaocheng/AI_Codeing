@echo off
echo ========================================
echo    AI Code Editor - 无签名打包
echo ========================================
echo.

echo 设置环境变量禁用代码签名...
set CSC_IDENTITY_AUTO_DISCOVERY=false
set WIN_CSC_LINK=
set WIN_CSC_KEY_PASSWORD=

echo.
echo [1/2] 构建项目...
call npm run build
if errorlevel 1 (
    echo 构建失败！
    pause
    exit /b 1
)
echo 构建完成 √

echo.
echo [2/2] 打包应用（无签名）...
call electron-builder --win --x64
if errorlevel 1 (
    echo 打包失败！
    pause
    exit /b 1
)

echo.
echo ========================================
echo    打包完成！
echo ========================================
echo.
echo 安装包位置：release 目录
echo.
dir /b release\*.exe 2>nul
echo.
pause
