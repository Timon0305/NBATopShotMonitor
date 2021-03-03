/* eslint global-require: off, no-console: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 */
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import path from 'path';
import { app, BrowserWindow, ipcMain, Notification } from 'electron';
// import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { add } from './utils/Activity';
// import Settings from './utils/Settings';

const NbaWorker = require('./workers/nbatopshot');
const CHANNELS = require('./constants/channels.json');
// const axios = require('axios');

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    // autoUpdater.logger = log;
    // autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;
let loginWindow: BrowserWindow | null = null;


if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];

  return Promise.all(
    extensions.map((name) => installer.default(installer[name], forceDownload))
  ).catch(console.log);
};

const createMainWindow = async () => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }

  mainWindow = new BrowserWindow({
    show: false,
    width: 1280,
    height: 840,
    minHeight: 760,
    minWidth: 1280,
    frame: true,
    resizable: true,
    maximizable: true,
    movable: true,
    autoHideMenuBar: true,
    webPreferences:
      (process.env.NODE_ENV === 'development' ||
        process.env.E2E_BUILD === 'true') &&
      process.env.ERB_SECURE !== 'true'
        ? {
          nodeIntegration: true,
          enableRemoteModule: true
        }
        : {
          preload: path.join(__dirname, 'dist/renderer.prod.js'),
          enableRemoteModule: true
        }
  });

  mainWindow.loadURL(`file://${__dirname}/app.html`);

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }

    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  // new AppUpdater();
};


/**
 * Add event listeners...
 */
// add({
//   at: new Date(),
//   type: 'APP',
//   result: 'STARTED',
//   data: ''
// });

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

if (process.env.E2E_BUILD === 'true') {
  // eslint-disable-next-line promise/catch-or-return
  app.whenReady().then(createMainWindow);
} else {
  app.on('ready', async () => {
    await auth();
  });
}

const auth = async () => {
  await createMainWindow();
};

ipcMain.on('activated', async () => {
  await createMainWindow();
  if (loginWindow) {
    loginWindow.close();
    loginWindow = null;
  }

});

ipcMain.on('quit-app', async () => {
  await add({
    at: new Date(),
    type: 'APP',
    result: 'QUITED',
    data: ''
  });
  console.log('app quit--background');
  app.quit();
});


ipcMain.on('hide-app', () => {
  if (mainWindow) {
    mainWindow.hide();
  }
  if (loginWindow) {
    loginWindow.minimize();
  }
});


app.on('activate', async () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    await createMainWindow();
  }
  // if (mainWindow === null) createMainWindow();
});


// worker process

const notifyUpdated = async (data: any, playSound: boolean = true) => {
  const {
    title,
    content
  } = data;
  if (mainWindow) {
    mainWindow.webContents.send(CHANNELS.NOTIFY_UPDATED, {});
    if (playSound) {
      mainWindow.webContents.send(CHANNELS.PLAY_SOUND, {});
    }

    if (Notification.isSupported()) {
      const notification = {
        title: title,
        body: content,
        silent: false
      };
      new Notification(notification).show();
    }

  }
};

ipcMain.on(CHANNELS.START_MONITOR, async (event, args) => {
  // console.log(event, args);
  console.log('START_MONITOR__ON:', args);
  let res = await NbaWorker.start();
  NbaWorker.setNotifyUpdated(notifyUpdated);
  console.log('START_MONITOR_RES:', res);
  event.returnValue = res;
});

ipcMain.on(CHANNELS.STOP__MONITOR, async (event, args) => {
  // console.log(event, args);
  console.log('STOP__MONITOR__ON:', args);
  let res = await NbaWorker.stop();
  console.log('STOP__MONITOR_RES:', res);
  event.returnValue = res; // { success: true, message: 'Successfully requested' };
});

ipcMain.on(CHANNELS.CHECK_MONITOR, async (event, args) => {
  // console.log(event, args);
  console.log('CHECK_MONITOR__ON:', args);
  let res = NbaWorker.checkIfRunning();
  console.log('CHECK_MONITOR_RES:', res);
  event.returnValue = res; // { success: true, message: 'Successfully requested' };
});

ipcMain.on(CHANNELS.FETCH__MOMENT, async (event, args) => {
  const { url } = args;
  console.log('FETCH__MOMENT__ON:', url);
  const res = await NbaWorker.fetchMomentFromUrl(url);
  console.log('FETCH__MOMENT_RES:', res);
  event.returnValue = res;
});
