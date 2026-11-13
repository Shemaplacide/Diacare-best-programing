import { useEffect, useState } from 'react'
import { API_SLOW_EVENT } from '../../api/axios'

// Shown while a request is slow, usually because the free-tier API is waking from sleep.
export default function ServerWakeNotice() {
  const [slow, setSlow] = useState(false)

  useEffect(() => {
    const onSlow = (e) => setSlow(Boolean(e.detail?.slow))
    window.addEventListener(API_SLOW_EVENT, onSlow)
    return () => window.removeEventListener(API_SLOW_EVENT, onSlow)
  }, [])

  if (!slow) return null

  return (
    <div role="status" aria-live="polite"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[10000] w-[calc(100%-2rem)] max-w-md flex items-start gap-3 rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] px-4 py-3 shadow-lg">
      <span className="mt-1 h-3 w-3 shrink-0 rounded-full border-2 border-[#0A4174] border-t-transparent animate-spin" aria-hidden="true" />
      <p className="m-0 text-sm text-[#1E293B]">
        <span className="font-semibold">Connecting to the DiaCare server…</span>{' '}
        After a quiet period it can take up to a minute to start. Your entries are kept.
      </p>
    </div>
  )
}
