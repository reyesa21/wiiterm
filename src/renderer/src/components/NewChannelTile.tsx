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
      className="flex flex-col items-center gap-1.5 cursor-pointer select-none"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, ...SPRING.bouncy }}
      onClick={() => openEditor()}
    >
      <motion.div
        className="relative w-full rounded-2xl overflow-hidden"
        style={{ aspectRatio: '1' }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Border */}
        <div className="absolute inset-0 rounded-2xl border-2 border-dashed border-gray-200 bg-white/40" />

        {/* Content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Plus size={36} className="text-gray-300" strokeWidth={2.5} />
        </div>
      </motion.div>

      <span className="text-[11px] font-sans font-bold text-gray-400 text-center">
        New Channel
      </span>
    </motion.div>
  )
}
