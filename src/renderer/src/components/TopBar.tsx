import { useClock } from '@/hooks/useClock'

export function TopBar() {
  const clock = useClock()

  return (
    <div className="h-12 flex items-center justify-between pl-20 pr-5 bg-wii-bg select-none"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      {/* Center: logo */}
      <div className="flex-1" />
      <div className="flex items-center gap-1">
        <span className="text-lg font-extrabold text-wii-accent font-sans tracking-tight">
          Wii
        </span>
        <span className="text-lg font-extrabold text-wii-text font-sans tracking-tight">
          Term
        </span>
      </div>

      {/* Right: clock */}
      <div className="flex-1 flex justify-end">
        <span className="text-sm text-wii-muted font-sans tabular-nums">
          {clock}
        </span>
      </div>
    </div>
  )
}
