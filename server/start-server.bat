@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo === 启动后端服务器 ===
echo 当前目录：%cd%
echo Node 路径：%~f1
node "%~f1"
pause
