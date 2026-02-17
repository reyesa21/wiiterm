import { motion } from 'framer-motion'
import { Settings } from 'lucide-react'
import { Channel } from '@/lib/types'
import { WOBBLE_KEYFRAMES, SPRING } from '@/lib/constants'
import { useStore } from '@/stores/useStore'

interface ChannelTileProps {
  channel: Channel
  index: number
}

export function ChannelTile({ channel, index }: ChannelTileProps) {
  const { setView, sessions, openEditor } = useStore()
  const session = sessions.get(channel.id)
  const isAlive = session?.alive ?? false

  const handleClick = () => {
    setView('terminal', channel.id)
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    openEditor(channel)
  }

  return (
    <motion.div
      className="relative bg-wii-surface rounded-wii shadow-wii cursor-pointer group select-none overflow-hidden"
      style={{ aspectRatio: '1' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, ...SPRING.bouncy }}
      whileHover={{
        scale: 1.08,
        rotateZ: WOBBLE_KEYFRAMES,
        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
        transition: {
          scale: SPRING.stiff,
          rotateZ: { duration: 0.5, ease: 'easeInOut' },
        }
      }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
    >
      {/* Color accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1 rounded-t-wii"
        style={{ backgroundColor: channel.color }}
      />

      {/* Status dot */}
      {session && (
        <div className="absolute top-2.5 right-2.5">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              isAlive ? 'bg-wii-green' : 'bg-wii-muted'
            }`}
          />
        </div>
      )}

      {/* Edit button */}
      <button
        onClick={handleEdit}
        className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-black/5"
      >
        <Settings size={14} className="text-wii-muted" />
      </button>

      {/* Content */}
      <div className="flex flex-col items-center justify-center h-full p-3 pt-4">
        <span className="text-3xl mb-2">{channel.icon}</span>
        <span className="text-xs font-sans font-semibold text-wii-text text-center leading-tight truncate w-full">
          {channel.name}
        </span>
        {channel.config.cwd && (
          <span className="text-[10px] text-wii-muted font-mono mt-1 truncate w-full text-center">
            {channel.config.cwd.replace(/^\/Users\/[^/]+/, '~')}
          </span>
        )}
      </div>
    </motion.div>
  )
}
