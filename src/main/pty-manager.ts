import * as pty from 'node-pty'
import { BrowserWindow } from 'electron'

interface PtySession {
  process: pty.IPty
  buffer: string[]
  bufferSize: number
  alive: boolean
}

const MAX_BUFFER_SIZE = 100 * 1024 // ~100KB ring buffer per session

export class PtyManager {
  private sessions = new Map<string, PtySession>()
  private window: BrowserWindow | null = null

  setWindow(win: BrowserWindow): void {
    this.window = win
  }

  create(
    id: string,
    shell: string,
    cwd: string,
    env?: Record<string, string>,
    cols = 80,
    rows = 24
  ): string {
    // Kill existing session with same id if any
    if (this.sessions.has(id)) {
      this.kill(id)
    }

    const proc = pty.spawn(shell, [], {
      name: 'xterm-256color',
      cols,
      rows,
      cwd,
      env: { ...process.env, ...env } as Record<string, string>
    })

    const session: PtySession = {
      process: proc,
      buffer: [],
      bufferSize: 0,
      alive: true
    }

    proc.onData((data: string) => {
      // Append to ring buffer
      session.buffer.push(data)
      session.bufferSize += data.length

      // Trim buffer if it exceeds max size
      while (session.bufferSize > MAX_BUFFER_SIZE && session.buffer.length > 1) {
        const removed = session.buffer.shift()!
        session.bufferSize -= removed.length
      }

      // Forward to renderer
      if (this.window && !this.window.isDestroyed()) {
        this.window.webContents.send('pty-data', id, data)
      }
    })

    proc.onExit(({ exitCode }) => {
      session.alive = false
      if (this.window && !this.window.isDestroyed()) {
        this.window.webContents.send('pty-exit', id, exitCode)
      }
    })

    this.sessions.set(id, session)
    return id
  }

  write(id: string, data: string): void {
    const session = this.sessions.get(id)
    if (session?.alive) {
      session.process.write(data)
    }
  }

  resize(id: string, cols: number, rows: number): void {
    const session = this.sessions.get(id)
    if (session?.alive) {
      try {
        session.process.resize(cols, rows)
      } catch {
        // Process may have exited between check and resize
      }
    }
  }

  kill(id: string): void {
    const session = this.sessions.get(id)
    if (session) {
      session.alive = false
      try {
        session.process.kill()
      } catch {
        // Already dead
      }
      this.sessions.delete(id)
    }
  }

  getBuffer(id: string): string {
    const session = this.sessions.get(id)
    if (!session) return ''
    return session.buffer.join('')
  }

  isAlive(id: string): boolean {
    return this.sessions.get(id)?.alive ?? false
  }

  killAll(): void {
    for (const [id] of this.sessions) {
      this.kill(id)
    }
  }
}
