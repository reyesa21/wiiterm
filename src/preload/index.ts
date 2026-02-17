import { contextBridge, ipcRenderer } from 'electron'

export interface PtyCreateOpts {
  id: string
  shell?: string
  cwd?: string
  env?: Record<string, string>
  cols?: number
  rows?: number
}

export interface ChannelData {
  id: string
  name: string
  icon: string
  color: string
  type: 'shell' | 'project' | 'ssh'
  order: number
  config: {
    cwd?: string
    shell?: string
    startupCommand?: string
    env?: Record<string, string>
  }
  createdAt: number
}

const api = {
  // PTY operations
  ptyCreate: (opts: PtyCreateOpts): Promise<string> =>
    ipcRenderer.invoke('pty-create', opts),
  ptyWrite: (id: string, data: string): void =>
    ipcRenderer.send('pty-write', id, data),
  ptyResize: (id: string, cols: number, rows: number): void =>
    ipcRenderer.send('pty-resize', id, cols, rows),
  ptyKill: (id: string): Promise<void> =>
    ipcRenderer.invoke('pty-kill', id),
  ptyGetBuffer: (id: string): Promise<string> =>
    ipcRenderer.invoke('pty-get-buffer', id),

  // PTY events (main → renderer)
  onPtyData: (callback: (id: string, data: string) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, id: string, data: string): void => callback(id, data)
    ipcRenderer.on('pty-data', handler)
    return () => ipcRenderer.removeListener('pty-data', handler)
  },
  onPtyExit: (callback: (id: string, exitCode: number) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, id: string, exitCode: number): void => callback(id, exitCode)
    ipcRenderer.on('pty-exit', handler)
    return () => ipcRenderer.removeListener('pty-exit', handler)
  },

  // Channel operations
  getChannels: (): Promise<ChannelData[]> =>
    ipcRenderer.invoke('get-channels'),
  saveChannels: (channels: ChannelData[]): Promise<boolean> =>
    ipcRenderer.invoke('save-channels', channels),

  // Utility
  getDefaultShell: (): Promise<string> =>
    ipcRenderer.invoke('get-default-shell'),
  getHomedir: (): Promise<string> =>
    ipcRenderer.invoke('get-homedir'),
  selectDirectory: (): Promise<string | null> =>
    ipcRenderer.invoke('select-directory'),
}

contextBridge.exposeInMainWorld('api', api)
