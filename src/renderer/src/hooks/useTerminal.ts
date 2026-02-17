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
        background: '#1E1E2E',
        foreground: '#CDD6F4',
        cursor: '#F5E0DC',
        selectionBackground: '#585B7066',
        black: '#45475A',
        red: '#F38BA8',
        green: '#A6E3A1',
        yellow: '#F9E2AF',
        blue: '#89B4FA',
        magenta: '#F5C2E7',
        cyan: '#94E2D5',
        white: '#BAC2DE',
        brightBlack: '#585B70',
        brightRed: '#F38BA8',
        brightGreen: '#A6E3A1',
        brightYellow: '#F9E2AF',
        brightBlue: '#89B4FA',
        brightMagenta: '#F5C2E7',
        brightCyan: '#94E2D5',
        brightWhite: '#A6ADC8',
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
