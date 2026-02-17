import { useRef } from 'react'
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
  const tileRef = useRef<HTMLDivElement>(null)

  const handleClick = () => {
    const el = tileRef.current
    if (el) {
      const rect = el.getBoundingClientRect()
      setView('terminal', channel.id, {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        w: rect.width,
        h: rect.height,
      })
    } else {
      setView('terminal', channel.id)
    }
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    openEditor(channel)
  }

  return (
    <motion.div
      ref={tileRef}
      className="flex flex-col items-center gap-1.5 cursor-pointer group select-none"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, ...SPRING.bouncy }}
      onClick={handleClick}
    >
      {/* Tile body */}
      <motion.div
        className="relative w-full rounded-2xl overflow-hidden"
        style={{ aspectRatio: '1' }}
        whileHover={{
          scale: 1.08,
          rotateZ: WOBBLE_KEYFRAMES,
          transition: {
            scale: SPRING.stiff,
            rotateZ: { duration: 0.5, ease: 'easeInOut' },
          }
        }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Background gradient — Wii channel style */}
        <div
          className="absolute inset-0 rounded-2xl"
          style={{
            background: `linear-gradient(145deg, ${channel.color}22 0%, ${channel.color}08 100%)`,
            border: '1px solid rgba(255,255,255,0.8)',
            boxShadow: `0 2px 12px ${channel.color}18, 0 1px 3px rgba(0,0,0,0.06)`,
          }}
        />

        {/* Inner white card with shine */}
        <div className="absolute inset-[3px] rounded-[14px] bg-white overflow-hidden">
          {/* Shine gradient — top highlight like real Wii tiles */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.3) 40%, rgba(240,240,240,0.2) 100%)',
            }}
          />

          {/* Status dot */}
          {session && (
            <div className="absolute top-3 right-3 z-10">
              <div className={`w-3 h-3 rounded-full shadow-sm ${
                isAlive
                  ? 'bg-wii-green shadow-wii-green/40'
                  : 'bg-gray-300'
              }`} />
            </div>
          )}

          {/* Edit button */}
          <button
            onClick={handleEdit}
            className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-black/5"
          >
            <Settings size={14} className="text-gray-400" />
          </button>

          {/* Icon — big and centered */}
          <div className="relative flex items-center justify-center h-full">
            <span className="text-5xl drop-shadow-sm">{channel.icon}</span>
          </div>
        </div>

        {/* Colored bottom accent — like Wii channel color strip */}
        <div
          className="absolute bottom-0 left-[3px] right-[3px] h-[6px] rounded-b-[14px]"
          style={{ backgroundColor: channel.color, opacity: 0.7 }}
        />
      </motion.div>

      {/* Label below tile — Wii style */}
      <span className="text-[11px] font-sans font-bold text-gray-600 text-center leading-tight truncate w-full px-1">
        {channel.name}
      </span>
    </motion.div>
  )
}
