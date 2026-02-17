import { useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react'
import { useStore } from '@/stores/useStore'
import { XTermWrapper } from './XTermWrapper'

export function TerminalView() {
  const { activeChannelId, channels, sessions, setView, createSession, showToast } = useStore()
  const channel = channels.find(c => c.id === activeChannelId)
  const session = activeChannelId ? sessions.get(activeChannelId) : undefined

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

    if (channel.config.startupCommand) {
      setTimeout(() => {
        window.api.ptyWrite(newSession.id, channel.config.startupCommand + '\n')
      }, 300)
    }
  }, [channel, createSession])

  useEffect(() => {
    if (channel && !session) {
      spawnSession()
    }
  }, [channel, session, spawnSession])

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
      {/* Terminal top bar — big touch targets for Wiimote */}
      <div className="flex items-center gap-1 pl-20 pr-3 py-1 bg-[#181825] border-b border-[#313244]"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      >
        {/* Back button — large */}
        <motion.button
          onClick={handleBack}
          className="flex items-center gap-1.5 text-[#CDD6F4]/70 hover:text-[#CDD6F4] transition-colors
            text-sm font-sans font-semibold px-3 py-2 rounded-lg hover:bg-[#CDD6F4]/10"
          whileTap={{ scale: 0.9 }}
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          <ArrowLeft size={18} />
        </motion.button>

        {/* Prev */}
        <motion.button
          onClick={() => prevChannel && handleSwitchChannel(prevChannel.id)}
          className={`p-2 rounded-lg transition-colors ${
            prevChannel ? 'text-[#CDD6F4]/50 hover:text-[#CDD6F4] hover:bg-[#CDD6F4]/10' : 'text-[#CDD6F4]/15'
          }`}
          whileTap={prevChannel ? { scale: 0.85 } : {}}
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          disabled={!prevChannel}
        >
          <ChevronLeft size={20} />
        </motion.button>

        {/* Channel tabs — big icons */}
        <div className="flex-1 flex items-center justify-center gap-0.5 overflow-x-auto"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          {channels.map(ch => {
            const chSession = sessions.get(ch.id)
            const isActive = ch.id === activeChannelId
            return (
              <motion.button
                key={ch.id}
                onClick={() => handleSwitchChannel(ch.id)}
                className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-sans transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[#CDD6F4]/15 text-[#CDD6F4] font-bold'
                    : 'text-[#CDD6F4]/40 hover:text-[#CDD6F4]/80 hover:bg-[#CDD6F4]/5'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-xl">{ch.icon}</span>
                <span className="text-xs">{ch.name}</span>
                {chSession && (
                  <div className={`w-2 h-2 rounded-full ${chSession.alive ? 'bg-wii-green' : 'bg-gray-500'}`} />
                )}
                {/* Active underline */}
                {isActive && (
                  <motion.div
                    className="absolute bottom-0 left-2 right-2 h-[2px] bg-wii-accent rounded-full"
                    layoutId="activeTab"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </motion.button>
            )
          })}
        </div>

        {/* Next */}
        <motion.button
          onClick={() => nextChannel && handleSwitchChannel(nextChannel.id)}
          className={`p-2 rounded-lg transition-colors ${
            nextChannel ? 'text-[#CDD6F4]/50 hover:text-[#CDD6F4] hover:bg-[#CDD6F4]/10' : 'text-[#CDD6F4]/15'
          }`}
          whileTap={nextChannel ? { scale: 0.85 } : {}}
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          disabled={!nextChannel}
        >
          <ChevronRight size={20} />
        </motion.button>

        {/* Restart — large */}
        <motion.button
          onClick={handleRestart}
          className="text-[#CDD6F4]/40 hover:text-[#CDD6F4] transition-colors p-2 rounded-lg hover:bg-[#CDD6F4]/10"
          whileHover={{ rotate: -180 }}
          whileTap={{ scale: 0.85 }}
          transition={{ duration: 0.3 }}
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          <RotateCcw size={18} />
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
