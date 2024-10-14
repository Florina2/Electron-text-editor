const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const fs = require('fs');
const path = require('path');

let mainWindow;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  mainWindow.webContents.openDevTools();
  mainWindow.loadFile(path.join(__dirname, 'public', 'index.html'));
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};
// Create a custom menu
const createMenu = () => {
    const menuTemplate = [
      {
        label: 'File',
        submenu: [
          {
            label: 'Open',
            click: async () => {
              const result = await dialog.showOpenDialog(mainWindow, {
                properties: ['openFile'],
                filters: [{ name: 'Text Files', extensions: ['txt'] }],
              });
              if (result.canceled) return;
              const filePath = result.filePaths[0];
              const content = fs.readFileSync(filePath, 'utf-8');
              mainWindow.webContents.send('file-opened', { filePath, content });
            },
          },
          {
            label: 'Save As',
            click: async () => {
              const result = await dialog.showSaveDialog(mainWindow, {
                filters: [{ name: 'Text Files', extensions: ['txt'] }],
              });
              if (result.canceled) return;
              const filePath = result.filePath;
              mainWindow.webContents.send('file-save', filePath);
            },
          },
          { type: 'separator' },
          { role: 'quit' },
        ],
      },
      {
        label: 'Custom',
        submenu: [
          {
            label: 'Custom Action',
            click: () => {
              console.log('Custom Action triggered');
            },
          },
        ],
      },
      // You can remove or customize existing items here
      {
        label: 'Help',
        submenu: [
          {
            label: 'About',
            click: () => {
              // Handle about action here
            },
          },
        ],
      },
    ];
  
    const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);
  };
app.on('ready', () => {
    createMenu();
    createWindow();
  });

app.on('window-all-closed', () => {
  app.quit();
});

// IPC to open file dialog
ipcMain.handle('dialog:openFile', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [{ name: 'Text Files', extensions: ['txt'] }],
  });
  if (result.canceled) {
    return;
  }
  const filePath = result.filePaths[0];
  const content = fs.readFileSync(filePath, 'utf-8');
  return { filePath, content };
});

// IPC to save file
ipcMain.handle('file:save', async (event, { filePath, content }) => {
  fs.writeFileSync(filePath, content, 'utf-8');
});
