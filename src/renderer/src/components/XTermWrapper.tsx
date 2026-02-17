import { useRef } from 'react'
import { useTerminal } from '@/hooks/useTerminal'

interface XTermWrapperProps {
  sessionId: string
  channelId: string
}

export function XTermWrapper({ sessionId, channelId }: XTermWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useTerminal(containerRef, { channelId, sessionId })

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ padding: '8px 8px 8px 12px' }}
    />
  )
}
