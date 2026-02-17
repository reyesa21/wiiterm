import { useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react'
import { useStore } from '@/stores/useStore'
import { XTermWrapper } from './XTermWrapper'

export function TerminalView() {
  const { activeChannelId, channels, sessions, setView, createSession, showToast } = useStore()
  const channel = channels.find(c => c.id === activeChannelId)
  const session = activeChannelId ? sessions.get(activeChannelId) : undefined

  // Find prev/next channels for navigation
  const currentIndex = channels.findIndex(c => c.id === activeChannelId)
  const prevChannel = currentIndex > 0 ? channels[currentIndex - 1] : null
  const nextChannel = currentIndex < channels.length - 1 ? channels[currentIndex + 1] : null

  const spawnSession = useCallback(async () => {
    if (!channel) return

    const newSession = createSession(channel.id)

    await window.api.ptyCreate({
      id: newSession.id,
      shell: channel.config.shell,
      cwd: channel.config.cwd,
      env: channel.config.env,
    })

    // Send startup command if configured
    if (channel.config.startupCommand) {
      setTimeout(() => {
        window.api.ptyWrite(newSession.id, channel.config.startupCommand + '\n')
      }, 300)
    }
  }, [channel, createSession])

  // Auto-spawn session on first view if none exists
  useEffect(() => {
    if (channel && !session) {
      spawnSession()
    }
  }, [channel, session, spawnSession])

  // Keyboard navigation: Cmd+[ / Cmd+] to switch channels
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === '[' && prevChannel) {
        e.preventDefault()
        setView('terminal', prevChannel.id)
      } else if (e.metaKey && e.key === ']' && nextChannel) {
        e.preventDefault()
        setView('terminal', nextChannel.id)
      } else if (e.key === 'Escape') {
        e.preventDefault()
        setView('grid', null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [prevChannel, nextChannel, setView])

  const handleBack = () => {
    // Keep tileRect so exit animation zooms back to the tile
    setView('grid', null)
  }

  const handleRestart = async () => {
    if (!session || !channel) return
    await window.api.ptyKill(session.id)
    await spawnSession()
    showToast('Session restarted', 'info')
  }

  const handleSwitchChannel = (channelId: string) => {
    setView('terminal', channelId)
  }

  if (!channel) return null

  return (
    <div className="flex-1 flex flex-col h-full bg-[#1E1E2E]">
      {/* Terminal top bar — pl-20 clears macOS traffic lights */}
      <div className="flex items-center gap-2 pl-20 pr-3 py-1.5 bg-[#181825] border-b border-[#313244]"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      >
        {/* Back button */}
        <motion.button
          onClick={handleBack}
          className="flex items-center gap-1 text-[#CDD6F4]/60 hover:text-[#CDD6F4] transition-colors text-sm font-sans px-1.5 py-1 rounded hover:bg-[#CDD6F4]/10"
          whileTap={{ scale: 0.95 }}
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          <ArrowLeft size={14} />
        </motion.button>

        {/* Prev channel */}
        <motion.button
          onClick={() => prevChannel && handleSwitchChannel(prevChannel.id)}
          className={`text-[#CDD6F4]/40 transition-colors px-0.5 py-1 rounded ${
            prevChannel ? 'hover:text-[#CDD6F4] hover:bg-[#CDD6F4]/10 cursor-pointer' : 'opacity-30 cursor-default'
          }`}
          whileTap={prevChannel ? { scale: 0.9 } : {}}
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          disabled={!prevChannel}
        >
          <ChevronLeft size={16} />
        </motion.button>

        {/* Channel tabs */}
        <div className="flex-1 flex items-center justify-center gap-1 overflow-x-auto"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          {channels.map(ch => {
            const chSession = sessions.get(ch.id)
            const isActive = ch.id === activeChannelId
            return (
              <button
                key={ch.id}
                onClick={() => handleSwitchChannel(ch.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-sans transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[#CDD6F4]/15 text-[#CDD6F4] font-semibold'
                    : 'text-[#CDD6F4]/40 hover:text-[#CDD6F4]/70 hover:bg-[#CDD6F4]/5'
                }`}
              >
                <span className="text-sm">{ch.icon}</span>
                <span>{ch.name}</span>
                {chSession && (
                  <div className={`w-1.5 h-1.5 rounded-full ${chSession.alive ? 'bg-wii-green' : 'bg-wii-muted'}`} />
                )}
              </button>
            )
          })}
        </div>

        {/* Next channel */}
        <motion.button
          onClick={() => nextChannel && handleSwitchChannel(nextChannel.id)}
          className={`text-[#CDD6F4]/40 transition-colors px-0.5 py-1 rounded ${
            nextChannel ? 'hover:text-[#CDD6F4] hover:bg-[#CDD6F4]/10 cursor-pointer' : 'opacity-30 cursor-default'
          }`}
          whileTap={nextChannel ? { scale: 0.9 } : {}}
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          disabled={!nextChannel}
        >
          <ChevronRight size={16} />
        </motion.button>

        {/* Restart */}
        <motion.button
          onClick={handleRestart}
          className="text-[#CDD6F4]/40 hover:text-[#CDD6F4] transition-colors px-1.5 py-1 rounded hover:bg-[#CDD6F4]/10"
          whileHover={{ rotate: -180 }}
          whileTap={{ scale: 0.9 }}
          transition={{ duration: 0.3 }}
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          <RotateCcw size={14} />
        </motion.button>
      </div>

      {/* Terminal */}
      <div className="flex-1 overflow-hidden">
        {session && (
          <XTermWrapper
            key={session.id}
            sessionId={session.id}
            channelId={channel.id}
          />
        )}
      </div>
    </div>
  )
}
