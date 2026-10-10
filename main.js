const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
function open() {
  const w = new BrowserWindow({ width: 1180, height: 800, minWidth: 380, autoHideMenuBar: true, icon: path.join(__dirname, 'app/icon-512.png'), title: 'MAH' });
  w.loadFile(path.join(__dirname, 'app/index.html'));
  // Mở liên kết ngoài (Zalo, web) bằng trình duyệt hệ thống
  w.webContents.setWindowOpenHandler(({ url }) => { if (/^(https?|sms|tel):/.test(url)) shell.openExternal(url); return { action: 'deny' }; });
}
app.whenReady().then(() => { open(); app.on('activate', () => { if (!BrowserWindow.getAllWindows().length) open(); }); });
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
