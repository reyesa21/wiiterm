import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from './stores/useStore'
import { TopBar } from './components/TopBar'
import { ChannelGrid } from './components/ChannelGrid'
import { TerminalView } from './components/TerminalView'
import { ChannelEditor } from './components/ChannelEditor'
import { Toast } from './components/Toast'

function App() {
  const { view, loadChannels } = useStore()

  useEffect(() => {
    loadChannels()
  }, [loadChannels])

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
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {view === 'grid' ? (
            <motion.div
              key="grid"
              className="h-full"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <ChannelGrid />
            </motion.div>
          ) : (
            <motion.div
              key="terminal"
              className="h-full"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
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
