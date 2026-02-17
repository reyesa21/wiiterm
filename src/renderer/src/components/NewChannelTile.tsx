import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { useStore } from '@/stores/useStore'
import { SPRING } from '@/lib/constants'

interface NewChannelTileProps {
  index: number
}

export function NewChannelTile({ index }: NewChannelTileProps) {
  const openEditor = useStore(s => s.openEditor)

  return (
    <motion.div
      className="bg-wii-surface/50 rounded-wii border-2 border-dashed border-wii-border cursor-pointer
        flex items-center justify-center hover:border-wii-accent hover:bg-wii-accent/5 transition-colors"
      style={{ aspectRatio: '1' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, ...SPRING.bouncy }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => openEditor()}
    >
      <Plus size={32} className="text-wii-muted" />
    </motion.div>
  )
}
