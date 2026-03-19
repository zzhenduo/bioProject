const { app, BrowserWindow, ipcMain, session } = require('electron');
const path = require('path');
const fs = require('fs');

// 请求单实例锁定
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  console.log('应用已经在运行中，退出当前实例');
  app.quit();
  process.exit(0);
}

let mainWindow;
let inlineServer = null;

// 检查是否为生产模式
const isDev = !app.isPackaged;
console.log('========================================');
console.log('应用启动信息：');
console.log('Is Dev:', isDev);
console.log('App is packaged:', app.isPackaged);
console.log('App path:', app.getAppPath());
console.log('Resources Path:', process.resourcesPath || 'undefined');
console.log('__dirname:', __dirname);
console.log('========================================');

function createWindow() {
  console.log('========================================');
  console.log('开始创建窗口...');
  
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false, // 允许本地请求
      allowRunningInsecureContent: true,
      preload: path.join(__dirname, 'preload.cjs')
    },
    icon: path.join(__dirname, '../public/favicon.ico'),
    title: '深究·生命 - 高中生物 AI 教学辅助系统'
  });

  if (isDev) {
    console.log('开发模式：加载 http://localhost:5173');
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // 生产模式：加载本地 dist/index.html
    const indexPath = path.join(__dirname, '../dist/index.html');
    console.log('生产模式：准备加载文件:', indexPath);
    console.log('文件是否存在:', fs.existsSync(indexPath));
    
    if (fs.existsSync(indexPath)) {
      mainWindow.loadFile(indexPath);
      console.log('✅ 文件加载成功');
    } else {
      console.error('❌ 文件不存在，尝试列出目录内容');
      try {
        const distPath = path.join(__dirname, '../dist');
        console.log('dist 目录内容:', fs.readdirSync(distPath));
      } catch (e) {
        console.error('❌ 无法读取 dist 目录:', e);
      }
    }
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    console.log('窗口已关闭');
    mainWindow = null;
  });
  
  // 监听渲染进程错误
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('❌ 页面加载失败:');
    console.error('  错误码:', errorCode);
    console.error('  描述:', errorDescription);
  });
  
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('✅ 页面加载完成');
  });
  
  mainWindow.webContents.on('render-process-gone', (event, details) => {
    console.error('❌ 渲染进程崩溃:', details);
  });
  
  console.log('✅ 窗口创建完成');
  console.log('========================================');
}

function startServer() {
  console.log('========================================');
  console.log('开始启动内嵌后端服务器...');
  console.log('========================================');
  
  try {
    // 导入内嵌服务器
    const inlineServerPath = path.join(__dirname, 'server-inline.cjs');
    console.log('加载内嵌服务器:', inlineServerPath);
    console.log('文件是否存在:', fs.existsSync(inlineServerPath));
    
    inlineServer = require(inlineServerPath);
    
    console.log('✅ 内嵌服务器加载成功');
    console.log('  服务器:', inlineServer);
    console.log('  服务器实例:', inlineServer.server);
    console.log('  数据库:', inlineServer.db);
    
  } catch (error) {
    console.error('❌ 启动内嵌服务器时发生异常:');
    console.error('  错误类型:', error.name);
    console.error('  错误信息:', error.message);
    console.error('  堆栈:', error.stack);
  }
  console.log('========================================');
}

app.whenReady().then(() => {
  console.log('========================================');
  console.log('Electron 应用已就绪');
  console.log('========================================');
  
  // 始终启动后端服务器
  startServer();
  
  // 等待服务器启动后再创建窗口
  console.log('等待 3 秒后创建窗口...');
  setTimeout(() => {
    createWindow();
  }, 3000);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  console.log('所有窗口已关闭');
  if (inlineServer && inlineServer.server) {
    console.log('正在关闭内嵌服务器...');
    inlineServer.server.close(() => {
      console.log('✅ 内嵌服务器已关闭');
    });
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('quit', () => {
  console.log('应用即将退出');
  if (inlineServer && inlineServer.server) {
    inlineServer.server.close();
  }
});

ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});
