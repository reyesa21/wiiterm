import { useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, RotateCcw } from 'lucide-react'
import { useStore } from '@/stores/useStore'
import { XTermWrapper } from './XTermWrapper'

export function TerminalView() {
  const { activeChannelId, channels, sessions, setView, createSession, showToast } = useStore()
  const channel = channels.find(c => c.id === activeChannelId)
  const session = activeChannelId ? sessions.get(activeChannelId) : undefined

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
      // Small delay to let shell init
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

  const handleBack = () => {
    setView('grid', null)
  }

  const handleRestart = async () => {
    if (!session || !channel) return
    await window.api.ptyKill(session.id)
    // createSession will override the map entry for this channelId
    await spawnSession()
    showToast('Session restarted', 'info')
  }

  if (!channel) return null

  return (
    <div className="flex-1 flex flex-col h-full bg-[#1E1E2E]">
      {/* Terminal top bar */}
      <div className="flex items-center gap-3 px-4 py-2 bg-[#181825] border-b border-[#313244]"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      >
        <motion.button
          onClick={handleBack}
          className="flex items-center gap-1.5 text-[#CDD6F4]/60 hover:text-[#CDD6F4] transition-colors text-sm font-sans"
          whileHover={{ x: -2 }}
          whileTap={{ scale: 0.95 }}
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          <ArrowLeft size={16} />
          Back
        </motion.button>

        <div className="flex-1 flex items-center justify-center gap-2">
          <span className="text-base">{channel.icon}</span>
          <span className="text-sm font-sans font-semibold text-[#CDD6F4]">
            {channel.name}
          </span>
          {session && (
            <div className={`w-2 h-2 rounded-full ${session.alive ? 'bg-wii-green' : 'bg-wii-muted'}`} />
          )}
        </div>

        <motion.button
          onClick={handleRestart}
          className="text-[#CDD6F4]/40 hover:text-[#CDD6F4] transition-colors"
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
