const { app, BrowserWindow, ipcMain } = require("electron");
let win = null;
function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    },
    icon: `${__dirname}/Icon/vidycoin.png`,
  });
  win.loadFile(`${__dirname}/build/generic/web/viewer.html`);
  // win.webContents.openDevTools();
  ipcMain.on("electron:reload", event => {
    win.reload();
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  win.webContents.postMessage("pdf:url", {});
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
