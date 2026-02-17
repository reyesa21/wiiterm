interface PtyCreateOpts {
  id: string
  shell?: string
  cwd?: string
  env?: Record<string, string>
  cols?: number
  rows?: number
}

interface ChannelData {
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

interface WiiTermApi {
  // PTY
  ptyCreate(opts: PtyCreateOpts): Promise<string>
  ptyWrite(id: string, data: string): void
  ptyResize(id: string, cols: number, rows: number): void
  ptyKill(id: string): Promise<void>
  ptyGetBuffer(id: string): Promise<string>
  onPtyData(callback: (id: string, data: string) => void): () => void
  onPtyExit(callback: (id: string, exitCode: number) => void): () => void

  // Channels
  getChannels(): Promise<ChannelData[]>
  saveChannels(channels: ChannelData[]): Promise<boolean>

  // Utility
  getDefaultShell(): Promise<string>
  getHomedir(): Promise<string>
  selectDirectory(): Promise<string | null>
}

declare global {
  interface Window {
    api: WiiTermApi
  }
}
