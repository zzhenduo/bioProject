# 深究·生命 - Electron 打包说明

## ✅ 已完成的配置工作

所有 Electron 打包配置已经完成，包括：
- Electron 主进程文件：`electron/main.cjs`
- 预加载脚本：`electron/preload.cjs`
- Vite 配置更新（支持相对路径）
- electron-builder 配置（Windows NSIS 安装包）
- 所有后端文件已转换为 CJS 格式
- package.json 已配置 electronDownload 镜像

## 🔧 空白页面问题已修复

**问题原因**：
1. HTML 模板中使用了绝对路径（`/vite.svg` 和 `/src/main.jsx`）
2. Electron 的 `loadFile()` 方法需要相对路径
3. 缺少 favicon 文件

**解决方案**：
1. ✅ 将 `index.html` 中的路径改为相对路径（`./vite.svg` 和 `./src/main.jsx`）
2. ✅ 创建 `public/vite.svg` 文件
3. ✅ 配置 Vite 的 `copyPublicDir: true` 确保公共资源被复制
4. ✅ 添加日志输出以便调试

## 📦 打包方法

### 重要提示

**必须在没有沙盒限制的环境中执行！** 当前 IDE 的沙盒环境会阻止访问 Electron 缓存目录。

请在你的**本地 PowerShell 终端**中执行以下步骤。

### 方法一：自动打包（推荐）

```powershell
# 1. 打开 PowerShell，切换到项目目录
cd E:\bioProject

# 2. 设置环境变量（使用国内镜像）
$env:ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/"

# 3. 执行打包
npm run electron:build
```

打包完成后，安装包会在 `release/` 目录：
- `release/深究·生命 - 生物 AI 教学系统 Setup 1.0.0.exe`
- `release/win-unpacked/` - 绿色版（可直接运行）

### 方法二：清理缓存后打包（如果方法一失败）

```powershell
# 1. 关闭所有终端和 Electron 进程
Get-Process electron -ErrorAction SilentlyContinue | Stop-Process -Force

# 2. 清理 Electron 缓存
Remove-Item -Path "$env:LOCALAPPDATA\electron\Cache" -Recurse -Force
Remove-Item -Path "$env:LOCALAPPDATA\electron-builder\Cache" -Recurse -Force

# 3. 重新执行打包
$env:ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/"
npm run electron:build
```

### 方法三：手动下载 Electron（终极方案）

#### 步骤 1：下载 Electron
访问：https://npmmirror.com/mirrors/electron/30.5.1/
下载：`electron-v30.5.1-win32-x64.zip` (约 109MB)

#### 步骤 2：解压到项目目录
将下载的 zip 文件解压到：
```
E:\bioProject\electron-dist\
```

解压后应该包含：
- electron.exe
- resources.pak
- icudtl.dat
- d3dcompiler_47.dll
- 等其他文件

#### 步骤 3：执行打包
```powershell
cd E:\bioProject
$env:ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/"
npm run electron:build
```

electron-builder 会自动检测并使用本地的 Electron。

## 🎯 打包产物说明

打包完成后，`release/` 目录会包含：

1. **安装包**（推荐分发）：
   - `深究·生命 - 生物 AI 教学系统 Setup 1.0.0.exe`
   - NSIS 安装程序，支持自定义安装路径
   - 自动创建桌面和开始菜单快捷方式

2. **绿色版**（免安装）：
   - `win-unpacked/` 目录
   - 可直接运行 `深究·生命 - 生物 AI 教学系统.exe`

## 📝 注意事项

1. **文件大小**：安装包约 150-200MB（包含 Electron 运行时）
2. **系统要求**：Windows 7 及以上（64 位）
3. **数据库**：SQLite 数据库会随应用一起打包
4. **端口占用**：应用会启动本地服务器（端口 3001）
5. **空白页面问题**：已修复，确保所有路径使用相对路径

## 🐛 常见问题

### 问题 1：Electron 下载失败
**原因**：GitHub 连接超时或被墙
**解决**：使用方法二或三，使用国内镜像或手动下载

### 问题 2：缓存文件被锁定
**原因**：之前的下载进程未完全退出
**解决**：
1. 关闭所有终端
2. 删除 `C:\Users\Administrator\AppData\Local\electron\Cache\`
3. 重新执行打包

### 问题 3：原生模块编译失败
**原因**：缺少构建工具
**解决**：配置中已设置 `"npmRebuild": false`，跳过重建

### 问题 4：运行应用显示空白页面
**原因**：HTML 路径配置错误
**解决**：
1. 确保 `index.html` 使用相对路径（`./vite.svg` 和 `./src/main.jsx`）
2. 确保 `public/vite.svg` 文件存在
3. 重新执行 `npm run build`
4. 重新打包

## 📞 技术支持

如遇其他问题，请检查：
- Node.js 版本：建议 18.x 或 20.x
- npm 版本：建议 9.x 或更高
- 磁盘空间：确保至少 1GB 可用空间
- 查看控制台日志：开发模式下会打开 DevTools
