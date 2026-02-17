import { useStore } from '@/stores/useStore'
import { ChannelTile } from './ChannelTile'
import { NewChannelTile } from './NewChannelTile'
import { PageDots } from './PageDots'
import { CHANNELS_PER_PAGE } from '@/lib/constants'

export function ChannelGrid() {
  const { channels, currentPage, setPage } = useStore()

  // Add one slot for the "+" tile
  const totalSlots = channels.length + 1
  const totalPages = Math.max(1, Math.ceil(totalSlots / CHANNELS_PER_PAGE))
  const startIdx = currentPage * CHANNELS_PER_PAGE
  const pageChannels = channels.slice(startIdx, startIdx + CHANNELS_PER_PAGE)

  // Show "+" tile if there's room on this page
  const showNewTile = pageChannels.length < CHANNELS_PER_PAGE

  return (
    <div className="flex-1 flex flex-col justify-center px-8 py-6">
      <div className="grid grid-cols-4 gap-4 max-w-[720px] mx-auto w-full">
        {pageChannels.map((channel, i) => (
          <ChannelTile key={channel.id} channel={channel} index={i} />
        ))}
        {showNewTile && (
          <NewChannelTile index={pageChannels.length} />
        )}
      </div>

      <PageDots total={totalPages} current={currentPage} onChange={setPage} />
    </div>
  )
}
