// Import required modules.
const { app, BrowserWindow, nativeImage, globalShortcut } = require('electron')
const path = require('path')
const url = require('url')

// Declare a function to create the main window.
const createWindow = () => {
    // Load the window icon.
    const icon = nativeImage.createFromPath(path.join(__dirname, './interface/icon.png'))
    // Create the browser window.
    const mainWindow = new BrowserWindow({ width: 1280, height: 850, title: 'SIAS', icon: icon, show: false })
    // Load the index.html of the app.
    mainWindow.loadURL(url.format({ pathname: path.join(__dirname, './interface/index.html'), protocol: 'file:', slashes: true }))
    // Add a callback for when the window has finished loading.
    mainWindow.on('ready-to-show', () => {
        // Show the window.
        mainWindow.show()
        // Focus the window.
        mainWindow.focus()
        // Disable the default menu.
        mainWindow.setMenu(null)
        // Add a reload shortcut.
        globalShortcut.register('CommandOrControl+R', () => {
            // Reload the window.
            mainWindow.reload()
        })
        // Add a fullscreen shortcut.
        globalShortcut.register('F11', () => {
            // Toggle fullscreen.
            mainWindow.setFullScreen(!mainWindow.isFullScreen())
        })
        // Open developer tools.
        mainWindow.webContents.openDevTools()       
    })
    // Add a callback for when the window is closed.
    mainWindow.on('closed', () => {
        // Quit the application.
        app.quit()
    })
}

// Add a callback for when the app is ready.
app.on('ready', createWindow)