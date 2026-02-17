import { app, BrowserWindow, ipcMain, shell, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { homedir } from 'os'
import { PtyManager } from './pty-manager'
import { loadChannels, saveChannels } from './channel-store'

let mainWindow: BrowserWindow | null = null
const ptyManager = new PtyManager()

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 16, y: 16 },
    backgroundColor: '#F8F8F8',
    show: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  ptyManager.setWindow(mainWindow)

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.wiiterm.app')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // ── PTY IPC ─────────────────────────────────────────────────
  ipcMain.handle('pty-create', (_event, opts: {
    id: string
    shell?: string
    cwd?: string
    env?: Record<string, string>
    cols?: number
    rows?: number
  }) => {
    const shellPath = opts.shell || process.env.SHELL || '/bin/zsh'
    const cwd = opts.cwd || homedir()
    return ptyManager.create(opts.id, shellPath, cwd, opts.env, opts.cols, opts.rows)
  })

  ipcMain.on('pty-write', (_event, id: string, data: string) => {
    ptyManager.write(id, data)
  })

  ipcMain.on('pty-resize', (_event, id: string, cols: number, rows: number) => {
    ptyManager.resize(id, cols, rows)
  })

  ipcMain.handle('pty-kill', (_event, id: string) => {
    ptyManager.kill(id)
  })

  ipcMain.handle('pty-get-buffer', (_event, id: string) => {
    return ptyManager.getBuffer(id)
  })

  // ── Channel IPC ─────────────────────────────────────────────
  ipcMain.handle('get-channels', async () => {
    return loadChannels()
  })

  ipcMain.handle('save-channels', async (_event, channels) => {
    return saveChannels(channels)
  })

  // ── Utility IPC ─────────────────────────────────────────────
  ipcMain.handle('get-default-shell', () => {
    return process.env.SHELL || '/bin/zsh'
  })

  ipcMain.handle('get-homedir', () => {
    return homedir()
  })

  ipcMain.handle('select-directory', async () => {
    if (!mainWindow) return null
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory']
    })
    if (result.canceled || result.filePaths.length === 0) return null
    return result.filePaths[0]
  })

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('before-quit', () => {
  ptyManager.killAll()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
