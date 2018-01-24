const Rocket = require('./rocket');
const Altimeter = require('./altimeter');
const io = require('socket.io')(3000);

const rocket = new Rocket();
const altimeter = new Altimeter(rocket);


const clients = [];
let time = 0;

io.on('connection', function (client) {
    console.log('Client connected!');
    clients.push(client);
});

const step = 10;
setInterval(() => {
    clients.forEach(client => {
        client.emit('rocket_state', rocket.getState());
        
        const altitude = altimeter.sample();        
        client.emit('altimeter', altitude);
        
    });
    // if (time == 30 * 1000) return;
    time += step;
    rocket.simulate(time / 1000, step / 1000);
}, step);

const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 800, height: 600})

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

