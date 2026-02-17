import { useEffect, useRef, useCallback } from 'react'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { useStore } from '@/stores/useStore'

interface UseTerminalOpts {
  channelId: string
  sessionId: string
}

export function useTerminal(containerRef: React.RefObject<HTMLDivElement | null>, opts: UseTerminalOpts) {
  const termRef = useRef<Terminal | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)
  const { markSessionDead } = useStore()

  const fit = useCallback(() => {
    if (fitAddonRef.current && termRef.current) {
      try {
        fitAddonRef.current.fit()
        const { cols, rows } = termRef.current
        window.api.ptyResize(opts.sessionId, cols, rows)
      } catch {
        // Container may not be visible yet
      }
    }
  }, [opts.sessionId])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const term = new Terminal({
      fontFamily: '"SF Mono", "Fira Code", "JetBrains Mono", Menlo, monospace',
      fontSize: 14,
      lineHeight: 1.4,
      cursorBlink: true,
      cursorStyle: 'block',
      theme: {
        background: '#F2F4F8',
        foreground: '#2C3E50',
        cursor: '#4EBCFF',
        cursorAccent: '#F2F4F8',
        selectionBackground: '#4EBCFF33',
        selectionForeground: '#2C3E50',
        black: '#546E7A',
        red: '#E53935',
        green: '#43A047',
        yellow: '#F9A825',
        blue: '#1E88E5',
        magenta: '#8E24AA',
        cyan: '#00ACC1',
        white: '#CFD8DC',
        brightBlack: '#78909C',
        brightRed: '#FF5252',
        brightGreen: '#69F0AE',
        brightYellow: '#FFD740',
        brightBlue: '#448AFF',
        brightMagenta: '#E040FB',
        brightCyan: '#18FFFF',
        brightWhite: '#FFFFFF',
      },
      allowProposedApi: true,
    })

    const fitAddon = new FitAddon()
    term.loadAddon(fitAddon)
    term.open(container)

    termRef.current = term
    fitAddonRef.current = fitAddon

    // Fit after a frame so the container has dimensions
    requestAnimationFrame(() => {
      fit()
    })

    // Pipe terminal input to PTY
    term.onData((data) => {
      window.api.ptyWrite(opts.sessionId, data)
    })

    // Receive PTY output
    const cleanupData = window.api.onPtyData((id, data) => {
      if (id === opts.sessionId) {
        term.write(data)
      }
    })

    // Handle PTY exit
    const cleanupExit = window.api.onPtyExit((id) => {
      if (id === opts.sessionId) {
        markSessionDead(opts.sessionId)
        term.write('\r\n\x1b[90m[Process exited]\x1b[0m\r\n')
      }
    })

    // Replay buffer (for reconnecting to running session)
    window.api.ptyGetBuffer(opts.sessionId).then((buffer) => {
      if (buffer) {
        term.write(buffer)
      }
    })

    // ResizeObserver for auto-fit
    const resizeObserver = new ResizeObserver(() => {
      fit()
    })
    resizeObserver.observe(container)

    return () => {
      cleanupData()
      cleanupExit()
      resizeObserver.disconnect()
      term.dispose()
      termRef.current = null
      fitAddonRef.current = null
    }
  }, [opts.sessionId, opts.channelId, containerRef, fit, markSessionDead])

  return { fit }
}
