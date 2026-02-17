import { useStore } from '@/stores/useStore'
import { ChannelTile } from './ChannelTile'
import { NewChannelTile } from './NewChannelTile'
import { PageDots } from './PageDots'
import { CHANNELS_PER_PAGE } from '@/lib/constants'

export function ChannelGrid() {
  const { channels, currentPage, setPage } = useStore()

  const totalSlots = channels.length + 1
  const totalPages = Math.max(1, Math.ceil(totalSlots / CHANNELS_PER_PAGE))
  const startIdx = currentPage * CHANNELS_PER_PAGE
  const pageChannels = channels.slice(startIdx, startIdx + CHANNELS_PER_PAGE)
  const showNewTile = pageChannels.length < CHANNELS_PER_PAGE

  return (
    <div
      className="h-full flex flex-col px-10 pt-8 pb-6"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      {/* Grid — no-drag so tiles are clickable */}
      <div
        className="grid grid-cols-4 gap-5 max-w-[800px] mx-auto w-full"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        {pageChannels.map((channel, i) => (
          <ChannelTile key={channel.id} channel={channel} index={i} />
        ))}
        {showNewTile && (
          <NewChannelTile index={pageChannels.length} />
        )}
      </div>

      <div style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        <PageDots total={totalPages} current={currentPage} onChange={setPage} />
      </div>
    </div>
  )
}
