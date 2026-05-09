import { useEffect, useState } from 'react'
import { getTotalUnread } from '../api/chat'
import { authStore } from '../store/authStore'

export function useChatUnread() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!authStore.isAuthenticated()) return

    const fetch = () => getTotalUnread().then(r => setCount(r.data)).catch(() => {})
    fetch()
    const id = setInterval(fetch, 30_000)
    return () => clearInterval(id)
  }, [])

  return count
}
