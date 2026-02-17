import { useClock } from '@/hooks/useClock'
import { useStore } from '@/stores/useStore'

export function TopBar() {
  const clock = useClock()
  const view = useStore(s => s.view)

  return (
    <div className="h-12 flex items-center justify-between px-5 bg-wii-bg border-b border-wii-border select-none"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      {/* Left: spacer for traffic lights */}
      <div className="w-20" />

      {/* Center: logo */}
      <div className="flex items-center gap-2">
        <span className="text-lg font-bold text-wii-accent font-sans tracking-tight">
          Wii
        </span>
        <span className="text-lg font-bold text-wii-text font-sans tracking-tight">
          Term
        </span>
        {view === 'terminal' && (
          <span className="text-xs text-wii-muted font-mono ml-2">
            terminal
          </span>
        )}
      </div>

      {/* Right: clock */}
      <div className="text-sm text-wii-muted font-sans tabular-nums">
        {clock}
      </div>
    </div>
  )
}
