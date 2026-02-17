import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/stores/useStore'

export function Toast() {
  const toast = useStore(s => s.toast)

  const colors = {
    success: 'bg-wii-green text-white',
    error: 'bg-wii-red text-white',
    info: 'bg-wii-surface text-wii-text border border-wii-border',
  }

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-wii font-sans text-sm shadow-wii-hover ${colors[toast.type]}`}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          {toast.message}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
