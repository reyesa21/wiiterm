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

  // Compute transform origin from the tile that was clicked
  const origin = useMemo(() => {
    if (!tileRect) return '50% 50%'
    return `${tileRect.x}px ${tileRect.y}px`
  }, [tileRect])

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-wii-bg">
      {/* Top bar — only visible in grid view */}
      <AnimatePresence>
        {view === 'grid' && (
          <motion.div
            key="topbar"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
          >
            <TopBar />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {view === 'grid' ? (
            <motion.div
              key="grid"
              className="h-full"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{
                duration: 0.35,
                ease: [0.16, 1, 0.3, 1],
              }}
              style={{ transformOrigin: origin }}
            >
              <ChannelGrid />
            </motion.div>
          ) : (
            <motion.div
              key="terminal"
              className="absolute inset-0"
              initial={{
                opacity: 0,
                scale: tileRect ? 0.15 : 0.9,
                borderRadius: '12px',
              }}
              animate={{
                opacity: 1,
                scale: 1,
                borderRadius: '0px',
              }}
              exit={{
                opacity: 0,
                scale: tileRect ? 0.15 : 0.9,
                borderRadius: '12px',
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
