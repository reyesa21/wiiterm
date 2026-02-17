import { useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from './stores/useStore'
import { TopBar } from './components/TopBar'
import { ChannelGrid } from './components/ChannelGrid'
import { TerminalView } from './components/TerminalView'
import { ChannelEditor } from './components/ChannelEditor'
import { Toast } from './components/Toast'

function App() {
  const { view, loadChannels, tileRect } = useStore()

  useEffect(() => {
    loadChannels()
  }, [loadChannels])

  const origin = useMemo(() => {
    if (!tileRect) return '50% 50%'
    return `${tileRect.x}px ${tileRect.y}px`
  }, [tileRect])

  const isTerminal = view === 'terminal'

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-wii-bg">
      {/* Top bar */}
      <motion.div
        initial={false}
        animate={{
          height: isTerminal ? 0 : 48,
          opacity: isTerminal ? 0 : 1,
        }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="overflow-hidden flex-shrink-0"
      >
        <TopBar />
      </motion.div>

      {/* Main content — grid is always mounted, terminal overlays it */}
      <div className="flex-1 overflow-hidden relative">
        {/* Grid — always rendered, fades when terminal is open */}
        <motion.div
          className="absolute inset-0"
          initial={false}
          animate={{
            opacity: isTerminal ? 0 : 1,
            scale: isTerminal ? 0.92 : 1,
            filter: isTerminal ? 'blur(8px)' : 'blur(0px)',
          }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          style={{
            pointerEvents: isTerminal ? 'none' : 'auto',
          }}
        >
          <ChannelGrid />
        </motion.div>

        {/* Terminal — overlays grid with zoom-in from tile */}
        <AnimatePresence>
          {isTerminal && (
            <motion.div
              key="terminal"
              className="absolute inset-0 z-10"
              initial={{
                opacity: 0,
                scale: tileRect ? 0.12 : 0.9,
                borderRadius: '16px',
              }}
              animate={{
                opacity: 1,
                scale: 1,
                borderRadius: '0px',
              }}
              exit={{
                opacity: 0,
                scale: tileRect ? 0.12 : 0.9,
                borderRadius: '16px',
              }}
              transition={{
                duration: 0.4,
                ease: [0.16, 1, 0.3, 1],
              }}
              style={{
                transformOrigin: origin,
                overflow: 'hidden',
              }}
            >
              <TerminalView />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Overlays */}
      <ChannelEditor />
      <Toast />
    </div>
  )
}

export default App
