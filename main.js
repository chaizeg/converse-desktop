// Modules to control application life and create native browser window
const { app, BrowserWindow, shell } = require('electron')

const electronSettings = require('electron-settings')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

// Require other app modules
const trayService = require(__dirname+'/modules/tray-service')
const menuService = require(__dirname+'/modules/menu-service')

function initApp() {
    createWindow()
}

function createWindow () {
    // Main window options
    let mainWindowOptions = {
        width: 800,
        height: 600,
        minWidth: 780,
        minHeight: 560,
        webPreferences: {
            nodeIntegration: true
        }
    }

    // Load app settings
    let runMinimized = electronSettings.get('runMinimized')
    if (typeof runMinimized !== 'undefined') {
        mainWindowOptions.show = !runMinimized
    }
    let minimizeOnClose = electronSettings.get('minimizeOnClose')
    let preserveWindowSize = electronSettings.get('preserveWindowSize')
    if (preserveWindowSize) {
        let width = electronSettings.get('windowWidth')
        let height = electronSettings.get('windowHeight')
        if (typeof width !== 'undefined') mainWindowOptions.width = width
        if (typeof height !== 'undefined') mainWindowOptions.height = height
    }

    let preserveWindowPosition = electronSettings.get('preserveWindowPosition')
    if (preserveWindowPosition !== 'undefined') {
        let windowX = electronSettings.get('windowX')
        let windowY = electronSettings.get('windowY')
        if (typeof windowX !== 'undefined') mainWindowOptions.x = windowX
        if (typeof windowY !== 'undefined') mainWindowOptions.y = windowY
    }

    // Create the browser window.
    mainWindow = new BrowserWindow(mainWindowOptions)

    // and load the index.html of the app.
    mainWindow.loadFile('index.html')

    // Init tray
    trayService.initTray(mainWindow)

    // Init menu
    menuService.createMenu()

    // Open the DevTools.
    mainWindow.webContents.openDevTools()

    // Before close
    if (minimizeOnClose !== 'undefined') {
        mainWindow.on('close', (e) => {
            if (!app.isQuitting) {
                e.preventDefault()
                mainWindow.hide()
            }
        })
    }

    // Save window size
    if (preserveWindowSize !== 'undefined') {
        mainWindow.on('resize', (e) => {
            let newSize = mainWindow.getSize()
            let width = newSize[0]
            let height = newSize[1]
            electronSettings.set('windowWidth', width)
            electronSettings.set('windowHeight', height)
        })
    }

    // Save window position
    if (preserveWindowPosition !== 'undefined') {
        mainWindow.on('move', (e) => {
            let newPosition = mainWindow.getPosition()
            let windowX = newPosition[0]
            let windowY = newPosition[1]
            electronSettings.set('windowX', windowX)
            electronSettings.set('windowY', windowY)
        })
    }


    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    })

    // Open links on system default browser
    mainWindow.webContents.on('new-window', function(e, url) {
        e.preventDefault()
        shell.openExternal(url)
    })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', initApp)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    // if (process.platform !== 'darwin')
    // ^^^^ NOPE ;)
    // Quit ANYWAY
    app.quit()
})

app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) createWindow()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// Allow to play audio automatically
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required')

/**
 * Export functions
 */

exports.trayService = trayService
