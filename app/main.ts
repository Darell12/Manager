import { app, BrowserWindow, globalShortcut, screen } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as express from 'express';
import {
  buscarSCORM,
  buscarUsuarios,
  contarUsuarios,
  obtenerDominios,
  obtenerEsquemas,
  verificarSsl,
} from './server/controllers/mainController';

const port = process.env['PORT'] || 3000;

const backendApp = express();

backendApp.use(express.json());

backendApp.get('/dominios', obtenerDominios);

backendApp.get('/contar', contarUsuarios);

backendApp.get('/esquemas', obtenerEsquemas);

backendApp.get('/checkssl/:domain_name', verificarSsl);

backendApp.get('/recurso/:valor_buscar', buscarSCORM);

backendApp.get('/users', buscarUsuarios);

backendApp.listen(port, () => {
  console.log(`Servidor Express escuchando en el puerto ${port}`);
});

let win: BrowserWindow | null = null;
const args = process.argv.slice(1),
  serve = args.some((val) => val === '--serve');

function createWindow(): BrowserWindow {
  const size = screen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  win = new BrowserWindow({
    x: 0,
    y: 0,
    width: size.width,
    height: size.height,
    webPreferences: {
      nodeIntegration: true,
      allowRunningInsecureContent: serve,
      contextIsolation: false,
    },
  });

  if (serve) {
    const debug = require('electron-debug');
    debug();

    require('electron-reloader')(module);
    win.loadURL('http://localhost:4200');
  } else {
    // Path when running electron executable
    let pathIndex = './index.html';

    if (fs.existsSync(path.join(__dirname, '../dist/browser/index.html'))) {
      // Path when running electron in local folder
      pathIndex = '../dist/browser/index.html';
    }

    const url = new URL(path.join('file:', __dirname, pathIndex));
    win.loadURL(url.href);
  }

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

  return win;
}

try {
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  app.on('ready', () => setTimeout(createWindow, 400));

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('browser-window-focus', function () {
    globalShortcut.register('CommandOrControl+R', () => {
      console.log('CommandOrControl+R is pressed: Shortcut Disabled');
    });
    globalShortcut.register('F5', () => {
      console.log('F5 is pressed: Shortcut Disabled');
    });
  });

  app.on('browser-window-blur', function () {
    globalShortcut.unregister('CommandOrControl+R');
    globalShortcut.unregister('F5');
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });
} catch (e) {
  // Catch Error
  // throw e;
}